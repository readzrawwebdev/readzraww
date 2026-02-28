import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { ServicePlan } from "./ServiceCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const orderSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().trim().min(10, "Phone number too short").max(20, "Phone number too long"),
  businessName: z.string().max(200, "Business name too long").optional(),
  details: z.string().max(2000, "Details too long (max 2000 chars)").optional(),
});

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface Props {
  plan: ServicePlan | null;
  onClose: () => void;
}

type Step = "form" | "payment" | "upload" | "success";

const withTimeout = async <T,>(promiseLike: PromiseLike<T>, ms = 12000): Promise<T> => {
  return await Promise.race([
    Promise.resolve(promiseLike),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), ms)),
  ]);
};

const OrderForm = ({ plan, onClose }: Props) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    details: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (!plan) return null;

  const advancePayment = (plan.price * 0.5).toFixed(0);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const validation = orderSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Validation error",
        description: validation.error.issues[0]?.message ?? "Please check your input and try again.",
        variant: "destructive",
      });
      return;
    }

    const newOrderId = crypto.randomUUID();
    setSubmitting(true);

    try {
      const { error } = await withTimeout(
        supabase.from("orders").insert({
          id: newOrderId,
          customer_name: validation.data.name,
          customer_email: validation.data.email,
          customer_phone: validation.data.phone,
          business_name: validation.data.businessName || null,
          project_details: validation.data.details || null,
          plan_title: plan.title,
          plan_price: plan.price,
          advance_amount: Number(advancePayment),
        })
      );

      if (error) {
        console.error("Order submit error:", error);
        toast({ title: "Unable to submit order", description: "Please check your information and try again.", variant: "destructive" });
        return;
      }

      setOrderId(newOrderId);
      setStep("payment");
    } catch (error) {
      console.error("Unexpected order submit error:", error);
      toast({ title: "Unable to submit order", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async () => {
    if (!receiptFile || !orderId) {
      toast({ title: "Please select your receipt image", variant: "destructive" });
      return;
    }

    if (receiptFile.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 5MB.", variant: "destructive" });
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(receiptFile.type)) {
      toast({ title: "Invalid file type", description: "Only JPEG, PNG, and WebP images are allowed.", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const ext = receiptFile.type.split("/")[1] || "jpg";
      const filePath = `${orderId}.${ext}`;

      const { error: uploadError } = await withTimeout(
        supabase.storage
          .from("receipts")
          .upload(filePath, receiptFile, { upsert: true })
      );

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({ title: "Upload failed", description: "Unable to upload receipt. Please try a different file or contact support.", variant: "destructive" });
        return;
      }

      const { error: updateError } = await withTimeout(supabase.from("orders").update({ receipt_url: filePath }).eq("id", orderId));
      if (updateError) {
        console.error("Order update error:", updateError);
        toast({ title: "Upload saved but order update failed", description: "Please contact support.", variant: "destructive" });
        return;
      }

      setStep("success");
    } catch (error) {
      console.error("Unexpected upload error:", error);
      toast({ title: "Upload failed", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-card max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>

          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              {step === "success" ? "Order Confirmed!" : `Order: ${plan.title}`}
            </h2>
            {step !== "success" && (
              <p className="text-sm text-muted-foreground mt-1">
                Total: ${plan.price} — Advance (50%): ${advancePayment}
              </p>
            )}
          </div>

          {step !== "success" && (
            <div className="flex gap-2 mb-8">
              {(["form", "payment", "upload"] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full ${
                    (["form", "payment", "upload"] as Step[]).indexOf(step) >= i ? "bg-gradient-primary" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input type="text" required maxLength={100} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your full name" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email *</label>
                <input type="email" required maxLength={255} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone *</label>
                <input type="tel" required maxLength={20} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="+92 xxx xxxxxxx" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Business Name</label>
              <input type="text" maxLength={200} value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your business name" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Project Details</label>
              <textarea maxLength={2000} value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} rows={3}
                  className="mt-1 w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Describe what you need..." />
              </div>
              <button type="submit" disabled={submitting} className="w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60">
                {submitting ? "Submitting..." : "Continue to Payment"}
              </button>
            </form>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <div className="rounded-xl bg-secondary p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Send <span className="font-bold text-foreground">${advancePayment}</span> (50% advance) via EasyPaisa to:
                </p>
                <p className="text-2xl font-heading font-bold text-gradient">0334 1275358</p>
                <p className="text-xs text-muted-foreground mt-2">Account: EasyPaisa — ReadzRaw</p>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                After sending the payment, take a screenshot of the receipt and continue to upload it.
              </p>
              <button onClick={() => setStep("upload")} className="w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
                I've Sent Payment — Upload Receipt
              </button>
              <button onClick={() => setStep("form")} className="w-full rounded-lg border border-border py-3 font-semibold text-secondary-foreground transition-colors hover:bg-surface-hover">
                Go Back
              </button>
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-6">
              <div className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${receiptFile ? "border-accent bg-accent/5" : "border-border"}`}>
                {receiptFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="text-accent" size={32} />
                    <p className="text-sm text-foreground font-medium">{receiptFile.name}</p>
                    <button onClick={() => setReceiptFile(null)} className="text-xs text-muted-foreground hover:text-foreground">Remove</button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-3">
                    <Upload className="text-muted-foreground" size={32} />
                    <p className="text-sm text-muted-foreground">Click to upload your payment receipt</p>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
              <button onClick={handleUpload} disabled={uploading} className="w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60">
                {uploading ? <span className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Uploading...</span> : "Submit Receipt"}
              </button>
              <button onClick={() => setStep("payment")} className="w-full rounded-lg border border-border py-3 font-semibold text-secondary-foreground transition-colors hover:bg-surface-hover">
                Go Back
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
                <CheckCircle2 className="text-accent" size={36} />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">Payment Received!</h3>
              <p className="text-muted-foreground text-sm">
                Your website will be ready in <span className="font-bold text-foreground">5 days</span>. We'll review your receipt and get started right away.
              </p>
              <div className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
                For more info, contact us at{" "}
                <a href="mailto:readzraw@gmail.com" className="text-primary font-medium">readzraw@gmail.com</a>
              </div>
              <button onClick={onClose} className="w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
                Done
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderForm;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { ServicePlan } from "./ServiceCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import ConfirmAction from "@/components/ConfirmAction";
import { withRequestTimeout, requestErrorMessage } from "@/lib/orders";

const orderSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().trim().min(10, "Phone number too short").max(20, "Phone number too long"),
  businessName: z.string().max(200, "Business name too long").optional(),
  details: z.string().max(2000, "Details too long (max 2000 chars)").optional(),
});

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface Props {
  plan: ServicePlan | null;
  onClose: () => void;
}

type Step = "form" | "payment" | "upload" | "success";

const withTimeout = withRequestTimeout;

const OrderForm = ({ plan, onClose }: Props) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", businessName: "", details: "" });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [trxId, setTrxId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [uploadedReceipt, setUploadedReceipt] = useState<{ file: File; path: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const requestClose = () => {
    if (uploading || submitting) return;
    if (step !== "success" && (orderId || Object.values(formData).some(Boolean) || receiptFile || trxId)) setConfirmClose(true);
    else onClose();
  };

  if (!plan) return null;

  const advancePayment = (plan.price * 0.5).toFixed(0);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);
    const validation = orderSchema.safeParse(formData);
    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message ?? "Please check your input.");
      toast({ title: "Validation error", description: validation.error.issues[0]?.message ?? "Please check your input.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in with Google before placing an order.", variant: "destructive" });
      onClose();
      navigate("/login");
      return;
    }
    const newOrderId = orderId || crypto.randomUUID();
    setSubmitting(true);
    try {
      const values = {
          id: newOrderId,
          customer_name: validation.data.name,
          customer_email: validation.data.email,
          customer_phone: validation.data.phone,
          business_name: validation.data.businessName || null,
          project_details: validation.data.details || null,
          plan_title: plan.title,
          plan_price: plan.price,
          advance_amount: Number(advancePayment),
          user_id: user.id,
        };
      const { data, error } = await withTimeout(orderId
        ? supabase.from("orders").update(values).eq("id", orderId).eq("user_id", user.id).eq("status", "pending_review").select("id").maybeSingle()
        : supabase.from("orders").insert(values).select("id").single());
      if (error) {
        setFormError(requestErrorMessage(error));
        toast({ title: "Unable to submit order", description: "Please check your information and try again.", variant: "destructive" });
        return;
      }
      if (!data) { setFormError("This order has changed. Check My Orders before continuing."); return; }
      setOrderId(newOrderId);
      setStep("payment");
    } catch (error) {
      setFormError(requestErrorMessage(error));
      toast({ title: "Unable to submit order", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async () => {
    if (uploading) return;
    setFormError(null);
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in before uploading a receipt.", variant: "destructive" });
      onClose();
      navigate("/login");
      return;
    }
    if (!receiptFile || !orderId) {
      toast({ title: "Please select your receipt image", variant: "destructive" });
      return;
    }
    const cleanTrx = trxId.trim();
    if (cleanTrx.length < 6 || cleanTrx.length > 40) {
      setFormError("Enter the transaction ID from your EasyPaisa payment confirmation (6–40 characters).");
      toast({ title: "Invalid transaction ID", description: "Please enter the EasyPaisa transaction (TRX) ID from your payment SMS.", variant: "destructive" });
      return;
    }
    if (receiptFile.size > MAX_FILE_SIZE) {
      setFormError("Receipt must be 5MB or smaller.");
      toast({ title: "File too large", description: "Maximum file size is 5MB.", variant: "destructive" });
      return;
    }
    if (!ALLOWED_FILE_TYPES.includes(receiptFile.type)) {
      setFormError("Choose a JPEG, PNG or WebP receipt image.");
      toast({ title: "Invalid file type", description: "Only JPEG, PNG, and WebP images are allowed.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = receiptFile.type.split("/")[1] || "jpg";
      const filePath = uploadedReceipt?.file === receiptFile ? uploadedReceipt.path : `${user.id}/${orderId}-${crypto.randomUUID()}.${ext}`;
      if (uploadedReceipt?.file !== receiptFile) {
        const { error: uploadError } = await withTimeout(supabase.storage.from("receipts").upload(filePath, receiptFile, { upsert: false }));
        if (uploadError) throw uploadError;
        setUploadedReceipt({ file: receiptFile, path: filePath });
      }
      const { data, error: updateError } = await withTimeout(supabase.from("orders").update({ receipt_url: filePath, trx_id: cleanTrx }).eq("id", orderId).eq("user_id", user.id).eq("status", "pending_review").select("id").maybeSingle());
      if (updateError) {
        setFormError("Receipt uploaded, but the transaction wasn't saved. Retry Submit Receipt; the same uploaded file will be reused.");
        toast({ title: "Upload saved but order update failed", description: "Please contact support.", variant: "destructive" });
        return;
      }
      if (!data) { setFormError("Order status changed. Check My Orders or contact support before uploading again."); return; }
      setStep("success");
    } catch (error) {
      setFormError(requestErrorMessage(error));
      toast({ title: "Upload failed", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const inputClass = "mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
        onClick={requestClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-lg max-h-[90vh] overflow-y-auto"
        >
          <Button variant="ghost" size="icon" aria-label="Close order form" disabled={uploading || submitting} onClick={requestClose} className="absolute top-3 right-3 text-muted-foreground">
            <X size={20} />
          </Button>

          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              {step === "success" ? "Payment Submitted" : `Order: ${plan.title}`}
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
                <div key={s} className={`h-1.5 flex-1 rounded-full ${(["form", "payment", "upload"] as Step[]).indexOf(step) >= i ? "bg-gradient-primary" : "bg-muted"}`} />
              ))}
            </div>
          )}

          {formError && <p role="alert" className="mb-4 rounded-md border border-destructive/30 p-3 text-sm text-destructive">{formError}</p>}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input type="text" required maxLength={100} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email *</label>
                <input type="email" required maxLength={255} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone *</label>
                <input type="tel" required maxLength={20} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="+92 xxx xxxxxxx" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Business Name</label>
                <input type="text" maxLength={200} value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className={inputClass} placeholder="Your business name" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Project Details</label>
                <textarea maxLength={2000} value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="Describe what you need..." />
              </div>
              <Button type="submit" disabled={submitting} className="w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60">
                {submitting ? "Submitting..." : "Continue to Payment"}
              </Button>
            </form>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <div className="rounded-xl bg-muted p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Send <span className="font-bold text-foreground">${advancePayment}</span> (50% advance) via EasyPaisa to:
                </p>
                <p className="text-2xl font-heading font-bold text-gradient">0334 1275358</p>
                <p className="text-xs text-muted-foreground mt-2">Account: EasyPaisa — ReadzRaw</p>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                After sending the payment, take a screenshot of the receipt and continue to upload it.
              </p>
              <Button onClick={() => { setFormError(null); setStep("upload"); }} className="w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
                I've Sent Payment — Upload Receipt
              </Button>
              <Button onClick={() => { setFormError(null); setStep("form"); }} className="w-full rounded-lg border border-border py-3 font-semibold text-foreground transition-colors hover:bg-muted">
                Go Back
              </Button>
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">Transaction ID (TRX) *</label>
                <input
                  type="text"
                  required
                  maxLength={40}
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 12345678901 from your EasyPaisa SMS"
                />
                <p className="mt-1 text-xs text-muted-foreground">You'll find this in the confirmation SMS from EasyPaisa after sending payment.</p>
              </div>
              <div className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${receiptFile ? "border-accent bg-accent/5" : "border-border"}`}>
                {receiptFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="text-accent" size={32} />
                    <p className="text-sm text-foreground font-medium">{receiptFile.name}</p>
                    <Button onClick={() => setReceiptFile(null)} className="text-xs text-muted-foreground hover:text-foreground">Remove</Button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-3">
                    <Upload className="text-muted-foreground" size={32} />
                    <p className="text-sm text-muted-foreground">Click to upload your payment receipt</p>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
              <Button onClick={handleUpload} disabled={uploading} className="w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60">
                {uploading ? <span className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Uploading...</span> : "Submit Receipt"}
              </Button>
              <Button onClick={() => { setFormError(null); setStep("payment"); }} className="w-full rounded-lg border border-border py-3 font-semibold text-foreground transition-colors hover:bg-muted">
                Go Back
              </Button>
            </div>
          )}

          {step === "success" && orderId && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10">
                  <CheckCircle2 className="text-accent" size={26} />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground">Payment Submitted!</h3>
                   <p className="text-xs text-muted-foreground">Receipt and TRX ID saved. Payment is awaiting manual review.</p>
                </div>
              </div>

              {/* Official Invoice */}
              <div className="rounded-xl border border-border bg-muted/40 overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-muted px-5 py-3">
                  <span className="font-heading text-sm font-bold tracking-wide text-foreground">READZRAW — INVOICE</span>
                  <span className="text-xs font-mono text-muted-foreground">INV-RDZ-{orderId.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="px-5 py-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Billed to</span>
                    <span className="text-right font-medium text-foreground">{formData.name}<br /><span className="text-xs text-muted-foreground">{formData.email}</span></span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Package</span>
                    <span className="font-medium text-foreground">{plan.title}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Delivery window</span>
                    <span className="font-medium text-foreground">15 days</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-xs font-medium text-foreground">{trxId.trim()}</span>
                  </div>
                  <div className="border-t border-dashed border-border pt-3 space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium text-foreground">${plan.price}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Advance paid (50%)</span><span className="font-medium text-accent">${advancePayment}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Balance on delivery</span><span className="font-bold text-foreground">${plan.price - Number(advancePayment)}</span></div>
                  </div>
                </div>
                <div className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
                  Save this invoice — you'll need the invoice number for any support query.
                </div>
              </div>

              <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground text-center">
                Questions? Contact us at{" "}
                <a href="mailto:readzraw@gmail.com" className="text-primary font-medium">readzraw@gmail.com</a>
              </div>
              <Button onClick={onClose} className="w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
                Done
              </Button>
            </div>
          )}
        </motion.div>
        <ConfirmAction open={confirmClose} onOpenChange={setConfirmClose} title="Leave this order?" description={orderId ? "Your order is saved in My Orders. Unsaved payment details and selected files will be lost." : "Your entered details will be lost. No order has been placed yet."} confirmLabel="Leave order" destructive onConfirm={async () => { onClose(); return true; }} />
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderForm;

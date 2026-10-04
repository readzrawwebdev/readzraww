import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(5, "Invalid phone").max(30),
  details: z.string().trim().min(1, "Tell us about your project").max(2000),
});

const CustomProject = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", details: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast({ title: r.error.errors[0].message, variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("inquiries").insert(r.data as any);
    setBusy(false);
    if (error) {
      toast({ title: "Could not send, please try again.", variant: "destructive" });
      return;
    }
    setSent(true);
  };

  const input = "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <section id="custom" className="py-24">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Custom Work</p>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Custom Project? Let's Talk</h2>
          <p className="mt-3 text-muted-foreground">Need something beyond our packages? Share your idea and we'll get back within 24 hours.</p>
        </div>
        {sent ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h3 className="text-xl font-semibold text-foreground">Thank you!</h3>
            <p className="mt-2 text-muted-foreground">We received your request and will contact you soon.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <input className={input} placeholder="Full Name" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={input} type="email" placeholder="Email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <input className={input} placeholder="Phone / WhatsApp" maxLength={30} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea className={input} rows={5} placeholder="Project details (type of website, features, budget...)" maxLength={2000} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
            <button disabled={busy} className="w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60">
              {busy ? "Sending..." : "Send Request"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default CustomProject;

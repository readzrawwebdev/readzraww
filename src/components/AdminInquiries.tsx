import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Inquiry = { id: string; name: string; email: string; phone: string; details: string; created_at: string };

const AdminInquiries = () => {
  const [items, setItems] = useState<Inquiry[]>([]);

  const load = async () => {
    const { data } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    setItems((data as Inquiry[]) || []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await supabase.from("inquiries").delete().eq("id", id);
    load();
  };

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-bold text-foreground">Custom Project Requests ({items.length})</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No requests yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((i) => (
            <div key={i.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => remove(i.id)} className="text-xs text-destructive hover:underline">Delete</button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{i.email} · {i.phone}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{i.details}</p>
              <a
                href={`https://wa.me/${i.phone.replace(/\D/g, "").replace(/^0/, "92")}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-block text-xs font-semibold text-accent hover:underline"
              >Reply on WhatsApp →</a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminInquiries;

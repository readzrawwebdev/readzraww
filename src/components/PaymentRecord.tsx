import { Copy, Check, FileCheck2, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { invoiceReference } from "@/lib/orders";

export default function PaymentRecord({ id, trxId, receiptPath }: { id: string; trxId: string | null; receiptPath: string | null }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Couldn't copy", description: "Please select and copy the reference manually.", variant: "destructive" });
    }
  };
  return (
    <div className="space-y-2 text-xs">
      {[["Invoice", invoiceReference(id)], ["TRX ID", trxId]].map(([label, value]) => (
        <div key={label} className="flex items-center gap-2 min-w-0">
          <span className="text-muted-foreground shrink-0">{label}</span>
          <span className="font-mono text-foreground break-all select-text">{value || "Not submitted"}</span>
          {value && <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" title={`Copy ${label}`} aria-label={`Copy ${label}`} onClick={() => copy(value)}>
            {copied === value ? <Check /> : <Copy />}
          </Button>}
        </div>
      ))}
      <p className="flex items-center gap-1.5 text-muted-foreground">
        {receiptPath ? <FileCheck2 size={14} className="text-accent" /> : <Clock size={14} />}
        {receiptPath ? "Receipt on file · reviewed manually" : "Receipt not submitted"}
      </p>
    </div>
  );
}
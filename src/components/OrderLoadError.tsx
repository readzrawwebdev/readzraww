import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestErrorMessage } from "@/lib/orders";

export default function OrderLoadError({ error, retry, busy }: { error: unknown; retry: () => void; busy?: boolean }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 border border-destructive/30 rounded-lg p-4 mb-4">
    <AlertCircle className="text-destructive shrink-0" size={20} />
    <div className="flex-1 min-w-0"><p className="font-medium text-foreground">Unable to load current records</p><p className="text-sm text-muted-foreground">{requestErrorMessage(error)}</p></div>
    <Button variant="outline" size="sm" onClick={retry} disabled={busy}><RefreshCw className={busy ? "animate-spin" : ""} /> Retry</Button>
  </div>;
}
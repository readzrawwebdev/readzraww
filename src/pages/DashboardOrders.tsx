import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Loader2, Package, AlertCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import ConfirmAction from "@/components/ConfirmAction";
import PaymentRecord from "@/components/PaymentRecord";
import OrderLoadError from "@/components/OrderLoadError";
import { useOrders } from "@/hooks/useOrders";
import { statusColors, statusLabels, matchesOrderSearch, canCancelOrder, withRequestTimeout, requestErrorMessage, invoiceReference } from "@/lib/orders";

const DashboardOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: orders = [], isLoading: fetching, isFetching, error, refetch } = useOrders();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filteredOrders = orders.filter(order => (filter === "all" || order.status === filter) && matchesOrderSearch(order, search));
  const cancelOrder = async () => {
    if (!user || !cancelId) return false;
    try {
      const { data, error } = await withRequestTimeout(supabase.from("orders")
        .update({ status: "cancelled" }).eq("id", cancelId).eq("user_id", user.id)
        .in("status", ["pending_review", "approved"]).select("id").maybeSingle());
      if (error) throw error;
      if (!data) {
        toast({ title: "Order changed", description: "Refresh and check the latest status. This order may no longer be cancellable.", variant: "destructive" });
        refetch();
        return false;
      }
      toast({ title: "Order cancelled", description: "Contact ReadzRaw about any payment already sent." });
      await refetch();
      return true;
    } catch (error) {
      toast({ title: "Unable to cancel order", description: requestErrorMessage(error), variant: "destructive" });
      return false;
    }
  };

  return (
    <DashboardLayout title="My Orders">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
        <a href="/#services" className="text-sm font-medium text-primary hover:text-primary/80">
          + Place New Order
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input aria-label="Search orders" placeholder="Search invoice, TRX ID or package" value={search} onChange={e => setSearch(e.target.value)} className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <select aria-label="Filter order status" value={filter} onChange={e => setFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <Button variant="outline" disabled={isFetching} onClick={() => refetch()}>Refresh</Button>
      </div>
      {error && <OrderLoadError error={error} retry={() => refetch()} busy={isFetching} />}
      {fetching ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : error && orders.length === 0 ? null : orders.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border bg-card shadow-card">
          <Package size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No orders yet</p>
          <a href="/#services" className="inline-block rounded-lg bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
            Browse Services
          </a>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 text-center"><p className="text-muted-foreground mb-3">No matching orders</p><Button variant="outline" onClick={() => { setSearch(""); setFilter("all"); }}>Clear filters</Button></div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-heading font-bold text-foreground">{order.plan_title}</h3>
                    <span className={`shrink-0 rounded-full border px-3 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-muted"}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                    <span>Ordered {new Date(order.created_at).toLocaleDateString()}</span>
                    <span>Total: ${order.plan_price}</span>
                    <span>Advance: ${order.advance_amount}</span>

                  </div>

                  <PaymentRecord id={order.id} trxId={order.trx_id} receiptPath={order.receipt_url} />
                  {order.project_details && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{order.project_details}</p>
                  )}

                  {order.admin_notes && (
                    <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 p-3 mt-2">
                      <MessageSquare size={14} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-primary mb-0.5">Admin Note</p>
                        <p className="text-sm text-foreground">{order.admin_notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  {canCancelOrder(order.status) && (
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => setCancelId(order.id)}><AlertCircle size={14} /> Cancel order</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmAction open={Boolean(cancelId)} onOpenChange={open => { if (!open) setCancelId(null); }} title="Cancel this order?" description={`This will cancel ${cancelId ? invoiceReference(cancelId) : "this order"}. Payments are not automatically refunded; contact ReadzRaw if you already paid.`} confirmLabel="Cancel order" destructive onConfirm={cancelOrder} />
    </DashboardLayout>
  );
};

export default DashboardOrders;

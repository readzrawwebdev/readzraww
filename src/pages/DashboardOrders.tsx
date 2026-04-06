import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Loader2, Package, AlertCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  plan_title: string;
  plan_price: number;
  advance_amount: number;
  status: string;
  created_at: string;
  receipt_url: string | null;
  admin_notes: string | null;
  project_details: string | null;
}

const statusColors: Record<string, string> = {
  pending_review: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const DashboardOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    setFetching(true);
    const { data } = await supabase
      .from("orders")
      .select("id, plan_title, plan_price, advance_amount, status, created_at, receipt_url, admin_notes, project_details")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
    setFetching(false);
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const cancelOrder = async (orderId: string) => {
    setCancelling(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Failed to cancel", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Order cancelled" });
      fetchOrders();
    }
    setCancelling(null);
  };

  return (
    <DashboardLayout title="My Orders">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
        <a href="/#services" className="text-sm font-medium text-primary hover:text-primary/80">
          + Place New Order
        </a>
      </div>

      {fetching ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border bg-card shadow-card">
          <Package size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No orders yet</p>
          <a href="/#services" className="inline-block rounded-lg bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
            Browse Services
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading font-bold text-foreground">{order.plan_title}</h3>
                    <span className={`shrink-0 rounded-full border px-3 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-muted"}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                    <span>Ordered {new Date(order.created_at).toLocaleDateString()}</span>
                    <span>Total: ${order.plan_price}</span>
                    <span>Advance: ${order.advance_amount}</span>
                    <span>{order.receipt_url ? "✅ Receipt uploaded" : "⏳ Receipt pending"}</span>
                  </div>

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
                  {["pending_review", "approved"].includes(order.status) && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      disabled={cancelling === order.id}
                      className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                      {cancelling === order.id ? <Loader2 size={12} className="animate-spin" /> : <AlertCircle size={12} />}
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardOrders;

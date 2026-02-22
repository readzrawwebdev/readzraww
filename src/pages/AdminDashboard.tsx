import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, CheckCircle2, XCircle, Eye, Clock, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  business_name: string | null;
  project_details: string | null;
  plan_title: string;
  plan_price: number;
  advance_amount: number;
  receipt_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  pending_review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-accent/10 text-accent border-accent/20",
};

const statusLabels: Record<string, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  in_progress: "In Progress",
  completed: "Completed",
};

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchOrders = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data as Order[]);
    setFetching(false);
  };

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  // Realtime subscription
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("orders")
      .update({ status, admin_notes: adminNotes || null })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Order ${statusLabels[status] || status}` });
      setSelectedOrder(null);
      setAdminNotes("");
      fetchOrders();
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAdmin) return null;

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending_review").length,
    approved: orders.filter((o) => o.status === "approved" || o.status === "in_progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="font-heading text-xl font-bold text-gradient">ReadzRaw Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <button
              onClick={() => { signOut(); navigate("/"); }}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: stats.total, icon: Clock },
            { label: "Pending", value: stats.pending, icon: Clock },
            { label: "Active", value: stats.approved, icon: CheckCircle2 },
            { label: "Completed", value: stats.completed, icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold font-heading text-foreground mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">Orders</h2>
          <button onClick={fetchOrders} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Orders table */}
        {fetching ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No orders yet. They'll appear here when customers place orders.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground">{order.plan_title}</td>
                    <td className="px-4 py-3 text-foreground">${order.advance_amount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-secondary text-secondary-foreground"}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSelectedOrder(order); setAdminNotes(order.admin_notes || ""); }}
                        className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 shadow-card max-h-[90vh] overflow-y-auto">
            <h3 className="font-heading text-xl font-bold text-foreground mb-4">Order Details</h3>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-muted-foreground">Name</p><p className="text-foreground font-medium">{selectedOrder.customer_name}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="text-foreground font-medium">{selectedOrder.customer_email}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="text-foreground font-medium">{selectedOrder.customer_phone}</p></div>
                <div><p className="text-muted-foreground">Business</p><p className="text-foreground font-medium">{selectedOrder.business_name || "—"}</p></div>
                <div><p className="text-muted-foreground">Plan</p><p className="text-foreground font-medium">{selectedOrder.plan_title}</p></div>
                <div><p className="text-muted-foreground">Total / Advance</p><p className="text-foreground font-medium">${selectedOrder.plan_price} / ${selectedOrder.advance_amount}</p></div>
              </div>

              {selectedOrder.project_details && (
                <div><p className="text-muted-foreground">Project Details</p><p className="text-foreground mt-1">{selectedOrder.project_details}</p></div>
              )}

              {selectedOrder.receipt_url && (
                <div>
                  <p className="text-muted-foreground mb-2">Payment Receipt</p>
                  <img src={selectedOrder.receipt_url} alt="Receipt" className="rounded-lg border border-border max-h-64 object-contain" />
                </div>
              )}

              <div>
                <label className="text-muted-foreground">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Add notes about this order..."
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <button
                disabled={updating}
                onClick={() => updateOrderStatus(selectedOrder.id, "approved")}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button
                disabled={updating}
                onClick={() => updateOrderStatus(selectedOrder.id, "in_progress")}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Clock size={16} /> In Progress
              </button>
              <button
                disabled={updating}
                onClick={() => updateOrderStatus(selectedOrder.id, "completed")}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/80 disabled:opacity-50"
              >
                <CheckCircle2 size={16} /> Complete
              </button>
              <button
                disabled={updating}
                onClick={() => updateOrderStatus(selectedOrder.id, "rejected")}
                className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/80 disabled:opacity-50"
              >
                <XCircle size={16} /> Reject
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="ml-auto rounded-lg border border-border px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-surface-hover"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

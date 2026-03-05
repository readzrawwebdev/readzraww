import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut, CheckCircle2, XCircle, Eye, Clock, Loader2, RefreshCw,
  LayoutDashboard, Package, BarChart3, ChevronLeft, Menu,
  TrendingUp, Users, DollarSign, AlertCircle, Trash2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

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
  cancelled: "bg-red-500/10 text-red-300 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PIE_COLORS = ["#f59e0b", "#22c55e", "#ef4444", "#3b82f6", "#06b6d4", "#a855f7"];

const ReceiptImage = ({ filePath }: { filePath: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (filePath.startsWith("http")) {
      setUrl(filePath);
    } else {
      supabase.storage.from("receipts").createSignedUrl(filePath, 3600).then(({ data }) => {
        setUrl(data?.signedUrl ?? null);
      });
    }
  }, [filePath]);
  if (!url) return <p className="text-muted-foreground text-sm">Loading receipt...</p>;
  return <img src={url} alt="Receipt" className="rounded-lg border border-border max-h-64 object-contain" />;
};

type Tab = "overview" | "orders";

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/admin/login");
  }, [user, isAdmin, loading, navigate]);

  const fetchOrders = async () => {
    setFetching(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Unable to load orders", variant: "destructive" });
    } else {
      setOrders((data as Order[]) ?? []);
    }
    setFetching(false);
  };

  useEffect(() => { if (isAdmin) fetchOrders(); }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("orders-realtime-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    const { error } = await supabase.from("orders").update({ status, admin_notes: adminNotes || null }).eq("id", orderId);
    if (error) {
      toast({ title: "Update failed", variant: "destructive" });
    } else {
      toast({ title: `Order ${statusLabels[status] || status}` });
      setSelectedOrder(null);
      setAdminNotes("");
      fetchOrders();
    }
    setUpdating(false);
  };

  const deleteOrder = async (orderId: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    } else {
      toast({ title: "Order deleted" });
      setSelectedOrder(null);
      fetchOrders();
    }
  };

  // Analytics data
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending_review").length,
    active: orders.filter((o) => ["approved", "in_progress"].includes(o.status)).length,
    completed: orders.filter((o) => o.status === "completed").length,
    revenue: orders.filter((o) => o.status !== "cancelled" && o.status !== "rejected").reduce((a, o) => a + o.plan_price, 0),
    collected: orders.filter((o) => o.status !== "cancelled" && o.status !== "rejected").reduce((a, o) => a + o.advance_amount, 0),
    uniqueCustomers: new Set(orders.map((o) => o.customer_email)).size,
  }), [orders]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: statusLabels[name] || name, value }));
  }, [orders]);

  const planDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.plan_title] = (counts[o.plan_title] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const monthlyRevenue = useMemo(() => {
    const months: Record<string, number> = {};
    orders.filter((o) => o.status !== "cancelled" && o.status !== "rejected").forEach((o) => {
      const m = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      months[m] = (months[m] || 0) + o.plan_price;
    });
    return Object.entries(months).reverse().slice(0, 6).reverse().map(([month, revenue]) => ({ month, revenue }));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return o.customer_name.toLowerCase().includes(q) || o.customer_email.toLowerCase().includes(q) || o.plan_title.toLowerCase().includes(q);
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }
  if (!isAdmin) return null;

  const sidebarItems = [
    { label: "Overview", icon: LayoutDashboard, tab: "overview" as Tab },
    { label: "Orders", icon: Package, tab: "orders" as Tab },
  ];

  const Sidebar = () => (
    <aside className={`sticky top-0 h-screen border-r border-border bg-card flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && <span className="font-heading text-lg font-bold text-gradient">Admin</span>}
        <button onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }} className="text-muted-foreground hover:text-foreground p-1">
          <ChevronLeft size={18} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      )}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {sidebarItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => { setTab(item.tab); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              tab === item.tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className="p-2 border-t border-border">
        <button onClick={() => { signOut(); navigate("/"); }} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block"><Sidebar /></div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50"><Sidebar /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-4 lg:px-8 gap-4 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground"><Menu size={20} /></button>
          <h1 className="font-heading text-xl font-bold text-foreground">
            {tab === "overview" ? "Analytics Overview" : "Order Management"}
          </h1>
          <button onClick={fetchOrders} className="ml-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <RefreshCw size={14} /> Refresh
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {tab === "overview" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Orders", value: stats.total, icon: Package, color: "text-primary" },
                  { label: "Unique Customers", value: stats.uniqueCustomers, icon: Users, color: "text-blue-400" },
                  { label: "Total Revenue", value: `$${stats.revenue}`, icon: DollarSign, color: "text-green-400" },
                  { label: "Advance Collected", value: `$${stats.collected}`, icon: TrendingUp, color: "text-accent" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-2"><s.icon size={18} className={s.color} /></div>
                    <p className="text-2xl font-bold font-heading text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-center">
                  <p className="text-2xl font-bold text-accent">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-heading font-bold text-foreground mb-4">Revenue Over Time</h3>
                  {monthlyRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 18% 15%)" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(220 15% 50%)", fontSize: 12 }} />
                        <YAxis tick={{ fill: "hsl(220 15% 50%)", fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: "hsl(225 22% 9%)", border: "1px solid hsl(225 18% 15%)", borderRadius: 8, color: "hsl(210 30% 96%)" }} />
                        <Line type="monotone" dataKey="revenue" stroke="hsl(250 85% 65%)" strokeWidth={2} dot={{ fill: "hsl(250 85% 65%)" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-sm py-12 text-center">No data yet</p>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-heading font-bold text-foreground mb-4">Orders by Status</h3>
                  {statusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {statusDistribution.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(225 22% 9%)", border: "1px solid hsl(225 18% 15%)", borderRadius: 8, color: "hsl(210 30% 96%)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-sm py-12 text-center">No data yet</p>
                  )}
                </div>

                <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
                  <h3 className="font-heading font-bold text-foreground mb-4">Orders by Plan</h3>
                  {planDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={planDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 18% 15%)" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(220 15% 50%)", fontSize: 12 }} />
                        <YAxis tick={{ fill: "hsl(220 15% 50%)", fontSize: 12 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "hsl(225 22% 9%)", border: "1px solid hsl(225 18% 15%)", borderRadius: 8, color: "hsl(210 30% 96%)" }} />
                        <Bar dataKey="value" fill="hsl(170 75% 50%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-sm py-12 text-center">No data yet</p>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === "orders" && (
            <>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or plan..."
                  className="flex-1 rounded-lg border border-input bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-input bg-secondary px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Orders Table */}
              {fetching ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={24} /></div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">No orders found</div>
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
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                          </td>
                          <td className="px-4 py-3 text-foreground">{order.plan_title}</td>
                          <td className="px-4 py-3 text-foreground">${order.plan_price} / ${order.advance_amount}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-secondary"}`}>
                              {statusLabels[order.status] || order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => { setSelectedOrder(order); setAdminNotes(order.admin_notes || ""); }} className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium">
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>

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
                  <ReceiptImage filePath={selectedOrder.receipt_url} />
                </div>
              )}

              <div>
                <label className="text-muted-foreground">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Add notes (visible to customer)..."
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <button disabled={updating} onClick={() => updateOrderStatus(selectedOrder.id, "approved")} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                <CheckCircle2 size={16} /> Approve
              </button>
              <button disabled={updating} onClick={() => updateOrderStatus(selectedOrder.id, "in_progress")} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                <Clock size={16} /> In Progress
              </button>
              <button disabled={updating} onClick={() => updateOrderStatus(selectedOrder.id, "completed")} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/80 disabled:opacity-50">
                <CheckCircle2 size={16} /> Complete
              </button>
              <button disabled={updating} onClick={() => updateOrderStatus(selectedOrder.id, "rejected")} className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/80 disabled:opacity-50">
                <XCircle size={16} /> Reject
              </button>
              <button onClick={() => { if (confirm("Delete this order permanently?")) deleteOrder(selectedOrder.id); }} className="flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10">
                <Trash2 size={16} /> Delete
              </button>
              <button onClick={() => setSelectedOrder(null)} className="ml-auto rounded-lg border border-border px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-surface-hover">
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

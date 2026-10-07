import { useEffect, useState, useMemo } from "react";
import AdminInquiries from "@/components/AdminInquiries";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut, CheckCircle2, XCircle, Eye, Clock, Loader2, RefreshCw,
  LayoutDashboard, Package, ChevronLeft, Menu,
  TrendingUp, Users, DollarSign, Trash2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ConfirmAction from "@/components/ConfirmAction";
import PaymentRecord from "@/components/PaymentRecord";
import OrderLoadError from "@/components/OrderLoadError";
import { useOrders } from "@/hooks/useOrders";
import { statusLabels, statusColors, matchesOrderSearch, invoiceReference, withRequestTimeout, requestErrorMessage } from "@/lib/orders";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

const ReceiptImage = ({ filePath }: { filePath: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setUrl(null); setFailed(false);
    const load = async () => {
      try {
        // Legacy public URLs are converted back to private storage paths.
        const path = filePath.startsWith("http") ? decodeURIComponent(filePath.split("/receipts/")[1]?.split("?")[0] || "") : filePath;
        if (!path) throw new Error("Invalid receipt path");
        const { data, error } = await withRequestTimeout(supabase.storage.from("receipts").createSignedUrl(path, 3600));
        if (error || !data?.signedUrl) throw error || new Error("Receipt unavailable");
        if (alive) setUrl(data.signedUrl);
      } catch { if (alive) setFailed(true); }
    };
    load();
    return () => { alive = false; };
  }, [filePath, attempt]);
  if (failed) return <div role="alert"><p className="text-sm text-destructive mb-2">Receipt couldn't be loaded.</p><Button variant="outline" size="sm" onClick={() => setAttempt(value => value + 1)}>Retry receipt</Button></div>;
  if (!url) return <p role="status" className="text-muted-foreground text-sm">Loading receipt…</p>;
  return <img src={url} alt="Payment receipt" onError={() => setFailed(true)} className="rounded-lg border border-border max-h-64 object-contain" />;
};

type Tab = "overview" | "orders";

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: orders = [], isLoading: fetching, isFetching, error: loadError, refetch } = useOrders(true);
  const [pendingAction, setPendingAction] = useState<{ id: string; status: string } | null>(null);
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

  const fetchOrders = () => refetch();

  const performAction = async () => {
    if (!pendingAction || updating) return false;
    const { id, status } = pendingAction;
    const current = orders.find(order => order.id === id);
    if (!current) return false;
    if (status === "approved" && (!current.receipt_url || !current.trx_id)) {
      toast({ title: "Payment details incomplete", description: "A receipt and TRX ID are required before approving payment.", variant: "destructive" });
      return false;
    }
    setUpdating(true);
    try {
      const result = status === "delete"
        ? supabase.from("orders").delete().eq("id", id).eq("updated_at", current.updated_at).select("id").maybeSingle()
        : supabase.from("orders").update({ status, admin_notes: adminNotes.trim() || null }).eq("id", id).eq("updated_at", current.updated_at).select("id").maybeSingle();
      const { data, error } = await withRequestTimeout(result);
      if (error) throw error;
      if (!data) {
        toast({ title: "Order changed", description: "Another update occurred. Refresh and reopen the order before saving.", variant: "destructive" });
        refetch();
        return false;
      }
      toast({ title: status === "delete" ? "Order deleted" : status === current.status ? "Notes saved" : `Order ${statusLabels[status] || status}` });
      setSelectedOrder(null); setAdminNotes("");
      await refetch();
      return true;
    } catch (error) {
      toast({ title: "Unable to save changes", description: requestErrorMessage(error), variant: "destructive" });
      return false;
    } finally { setUpdating(false); }
  };

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending_review").length,
    active: orders.filter((o) => ["approved", "in_progress"].includes(o.status)).length,
    completed: orders.filter((o) => o.status === "completed").length,
    revenue: orders.filter((o) => o.status !== "cancelled" && o.status !== "rejected").reduce((a, o) => a + o.plan_price, 0),
    collected: orders.filter((o) => ["approved", "in_progress", "completed"].includes(o.status) && o.receipt_url && o.trx_id).reduce((a, o) => a + o.advance_amount, 0),
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
        return matchesOrderSearch(o, q);
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

  const chartTooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" };
  const axisTick = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };
  const gridStroke = "hsl(var(--border))";

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
              tab === item.tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50"><Sidebar /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-4 lg:px-8 gap-4 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground"><Menu size={20} /></button>
          <h1 className="font-heading text-xl font-bold text-foreground">
            {tab === "overview" ? "Analytics Overview" : "Order Management"}
          </h1>
          <Button variant="ghost" disabled={isFetching} onClick={() => fetchOrders()} className="ml-auto">
            <RefreshCw size={14} /> Refresh
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {loadError && <OrderLoadError error={loadError} retry={() => refetch()} busy={isFetching} />}
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Orders", value: stats.total, icon: Package, color: "text-primary" },
                  { label: "Unique Customers", value: stats.uniqueCustomers, icon: Users, color: "text-primary" },
                  { label: "Order Value", value: `$${stats.revenue}`, icon: DollarSign, color: "text-accent" },
                  { label: "Verified Advances", value: `$${stats.collected}`, icon: TrendingUp, color: "text-accent" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
                    <div className="flex items-center justify-between mb-2"><s.icon size={18} className={s.color} /></div>
                    <p className="text-2xl font-bold font-heading text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border border-border bg-muted p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-center">
                  <p className="text-2xl font-bold text-accent">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <h3 className="font-heading font-bold text-foreground mb-4">Order Value Over Time</h3>
                  {monthlyRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="month" tick={axisTick} />
                        <YAxis tick={axisTick} />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-sm py-12 text-center">No data yet</p>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <h3 className="font-heading font-bold text-foreground mb-4">Orders by Status</h3>
                  {statusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {statusDistribution.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={chartTooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-sm py-12 text-center">No data yet</p>
                  )}
                </div>

                <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
                  <h3 className="font-heading font-bold text-foreground mb-4">Orders by Plan</h3>
                  {planDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={planDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="name" tick={axisTick} />
                        <YAxis tick={axisTick} allowDecimals={false} />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
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
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search orders" placeholder="Search name, email, invoice, TRX ID or plan…"
                  className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {fetching ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={24} /></div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">No orders found</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border shadow-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
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
                        <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                          </td>
                          <td className="px-4 py-3 text-foreground"><p className="mb-2">{order.plan_title}</p><PaymentRecord id={order.id} trxId={order.trx_id} receiptPath={order.receipt_url} /></td>
                          <td className="px-4 py-3 text-foreground">${order.plan_price} / ${order.advance_amount}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-muted"}`}>
                              {statusLabels[order.status] || order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(order); setAdminNotes(order.admin_notes || ""); }} aria-label={`View order for ${order.customer_name}`}>
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
          <AdminInquiries />
        </main>
      </div>

      {selectedOrder && (
        <Dialog open onOpenChange={open => { if (!open && !updating && !pendingAction) setSelectedOrder(null); }}>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-xl rounded-lg bg-card max-h-[90vh] overflow-y-auto">
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>{invoiceReference(selectedOrder.id)} · {statusLabels[selectedOrder.status]}</DialogDescription>
            <PaymentRecord id={selectedOrder.id} trxId={selectedOrder.trx_id} receiptPath={selectedOrder.receipt_url} />

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 break-words">
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
                <label htmlFor="admin-order-notes" className="text-muted-foreground">Notes visible to customer</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Add notes (visible to customer)..."
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <Button disabled={updating} onClick={() => setPendingAction({ id: selectedOrder.id, status: selectedOrder.status })}>Save notes</Button>
              {selectedOrder.status === "pending_review" && <>
                <Button variant="secondary" disabled={updating || !selectedOrder.receipt_url || !selectedOrder.trx_id} title={!selectedOrder.receipt_url || !selectedOrder.trx_id ? "Receipt and TRX ID required" : "Verify payment"} onClick={() => setPendingAction({ id: selectedOrder.id, status: "approved" })}><CheckCircle2 /> Approve</Button>
                <Button variant="destructive" disabled={updating} onClick={() => setPendingAction({ id: selectedOrder.id, status: "rejected" })}><XCircle /> Reject</Button>
              </>}
              {selectedOrder.status === "approved" && <Button disabled={updating} onClick={() => setPendingAction({ id: selectedOrder.id, status: "in_progress" })}><Clock /> Start work</Button>}
              {selectedOrder.status === "in_progress" && <Button disabled={updating} onClick={() => setPendingAction({ id: selectedOrder.id, status: "completed" })}><CheckCircle2 /> Complete</Button>}
              <Button variant="outline" className="text-destructive" disabled={updating} onClick={() => setPendingAction({ id: selectedOrder.id, status: "delete" })}><Trash2 /> Delete</Button>
              <Button variant="outline" disabled={updating} onClick={() => {
                if (adminNotes !== (selectedOrder.admin_notes || "")) setPendingAction({ id: selectedOrder.id, status: "discard" });
                else setSelectedOrder(null);
              }}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <ConfirmAction open={Boolean(pendingAction)} onOpenChange={open => { if (!open) setPendingAction(null); }}
        title={pendingAction?.status === "delete" ? "Delete this order permanently?" : pendingAction?.status === "discard" ? "Discard unsaved notes?" : "Confirm order update?"}
        description={pendingAction?.status === "delete" ? "The customer will lose access to this order record. This cannot be undone and does not refund a payment." : pendingAction?.status === "discard" ? "Your unsaved notes will be lost." : pendingAction?.status === "approved" ? "Confirm you've checked the receipt, TRX ID and amount against your EasyPaisa records. This marks payment as approved." : "This change and your notes will be visible to the customer."}
        confirmLabel={pendingAction?.status === "delete" ? "Delete permanently" : pendingAction?.status === "discard" ? "Discard notes" : "Confirm update"}
        destructive={["delete", "rejected", "discard"].includes(pendingAction?.status || "")}
        onConfirm={async () => { if (pendingAction?.status === "discard") { setSelectedOrder(null); return true; } return performAction(); }} />
    </div>
  );
};

export default AdminDashboard;

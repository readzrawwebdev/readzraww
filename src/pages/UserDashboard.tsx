import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Package, Clock, CheckCircle2, Loader2, User, Mail, Calendar,
  TrendingUp, ArrowRight,
} from "lucide-react";

interface Order {
  id: string;
  plan_title: string;
  plan_price: number;
  advance_amount: number;
  status: string;
  created_at: string;
  admin_notes: string | null;
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

const UserDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setFetching(true);
      const { data } = await supabase
        .from("orders")
        .select("id, plan_title, plan_price, advance_amount, status, created_at, admin_notes")
        .order("created_at", { ascending: false });
      if (data) setOrders(data as Order[]);
      setFetching(false);
    };
    fetchOrders();
  }, [user]);

  const stats = useMemo(() => ({
    total: orders.length,
    active: orders.filter((o) => ["pending_review", "approved", "in_progress"].includes(o.status)).length,
    completed: orders.filter((o) => o.status === "completed").length,
    totalSpent: orders.reduce((acc, o) => acc + o.plan_price, 0),
  }), [orders]);

  const recentOrders = orders.slice(0, 5);

  return (
    <DashboardLayout title="Dashboard Overview">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-primary p-6 mb-6">
        <h2 className="font-heading text-2xl font-bold text-primary-foreground">
          Welcome back, {user?.user_metadata?.full_name || "Client"} 👋
        </h2>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Here's an overview of your projects and orders.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: stats.total, icon: Package, color: "text-primary" },
          { label: "Active Projects", value: stats.active, icon: Clock, color: "text-blue-400" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-accent" },
          { label: "Total Invested", value: `$${stats.totalSpent}`, icon: TrendingUp, color: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-2xl font-bold font-heading text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Profile + Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <User size={22} />
            </div>
            <div>
              <p className="font-medium text-foreground">{user?.user_metadata?.full_name || "Client"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={14} /> <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={14} />
              <span>Member since {new Date(user?.created_at ?? Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
          <a
            href="/dashboard/settings"
            className="mt-4 flex items-center gap-1 text-sm text-primary hover:text-primary/80"
          >
            Edit Profile <ArrowRight size={14} />
          </a>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-foreground">Recent Orders</h3>
            <a href="/dashboard/orders" className="text-sm text-primary hover:text-primary/80">View All</a>
          </div>

          {fetching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={36} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-3">No orders yet</p>
              <a href="/#services" className="text-sm text-primary hover:text-primary/80">Browse Services</a>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="rounded-lg border border-border bg-secondary/20 p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{order.plan_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} • ${order.plan_price}
                    </p>
                    {order.admin_notes && (
                      <p className="text-xs text-primary mt-1 truncate">📝 {order.admin_notes}</p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${statusColors[order.status] || "bg-secondary text-secondary-foreground"}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;

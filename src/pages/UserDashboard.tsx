import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut,
  Package,
  Clock,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Calendar,
  ShieldCheck,
} from "lucide-react";

interface Order {
  id: string;
  plan_title: string;
  plan_price: number;
  advance_amount: number;
  status: string;
  created_at: string;
  receipt_url: string | null;
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

const UserDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, plan_title, plan_price, advance_amount, status, created_at, receipt_url")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOrders(data as Order[]);
        }
      } finally {
        setFetching(false);
      }
    };

    fetchOrders();
  }, [user]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      inProgress: orders.filter((o) => o.status === "pending_review" || o.status === "in_progress").length,
      completed: orders.filter((o) => o.status === "completed").length,
    }),
    [orders]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a href="/" className="font-heading text-xl font-bold text-gradient">ReadzRaw</a>
          <button
            onClick={() => {
              signOut();
              navigate("/");
            }}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6">Account Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="lg:col-span-1 space-y-4">
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Profile</p>
                  <h2 className="font-heading text-xl font-bold text-foreground mt-1">{user.user_metadata?.full_name || "ReadzRaw Client"}</h2>
                </div>
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <User size={20} />
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground"><Mail size={14} /> {user.email}</p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} /> Member since {new Date(user.created_at ?? Date.now()).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground"><ShieldCheck size={14} /> Secure Google account access</p>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Overview</p>
              <div className="space-y-3">
                <div className="rounded-xl bg-secondary/50 p-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <span className="font-heading text-lg font-bold text-foreground">{stats.total}</span>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="font-heading text-lg font-bold text-foreground">{stats.inProgress}</span>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-heading text-lg font-bold text-foreground">{stats.completed}</span>
                </div>
              </div>
            </section>
          </aside>

          <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-foreground">My Orders</h2>
              <a href="/#services" className="text-sm text-primary hover:text-primary/80">Place new order</a>
            </div>

            {fetching ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-border bg-secondary/20">
                <Package size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                <a
                  href="/#services"
                  className="inline-block rounded-lg bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
                >
                  Browse Services
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-xl border border-border bg-secondary/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{order.plan_title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ordered {new Date(order.created_at).toLocaleDateString()} • Total: ${order.plan_price}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${
                          statusColors[order.status] || "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                      {order.receipt_url ? (
                        <span className="text-xs text-accent">Receipt uploaded</span>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={12} /> Receipt pending
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;

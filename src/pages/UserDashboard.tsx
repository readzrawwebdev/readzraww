import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Package, Clock, CheckCircle2, Loader2, User } from "lucide-react";

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
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a href="/" className="font-heading text-xl font-bold text-gradient">ReadzRaw</a>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User size={16} />
              <span className="hidden sm:inline">{user.email}</span>
            </div>
            <button
              onClick={() => { signOut(); navigate("/"); }}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your orders and project progress.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <Package size={20} className="mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold font-heading text-foreground">{orders.length}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <Clock size={20} className="mx-auto text-yellow-400 mb-1" />
            <p className="text-2xl font-bold font-heading text-foreground">
              {orders.filter(o => o.status === "pending_review" || o.status === "in_progress").length}
            </p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <CheckCircle2 size={20} className="mx-auto text-accent mb-1" />
            <p className="text-2xl font-bold font-heading text-foreground">
              {orders.filter(o => o.status === "completed").length}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* Orders */}
        <h2 className="font-heading text-lg font-bold text-foreground mb-4">My Orders</h2>

        {fetching ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border bg-card">
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
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{order.plan_title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ordered {new Date(order.created_at).toLocaleDateString()} • Total: ${order.plan_price}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-secondary text-secondary-foreground"}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                  {order.receipt_url && (
                    <span className="text-xs text-accent">Receipt uploaded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;

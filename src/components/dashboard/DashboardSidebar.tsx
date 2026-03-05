import { LayoutDashboard, Package, Heart, Settings, LogOut, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "My Orders", icon: Package, path: "/dashboard/orders" },
  { label: "Wishlist", icon: Heart, path: "/dashboard/wishlist" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ collapsed, onToggle }: Props) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`sticky top-0 h-screen border-r border-border bg-card flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && (
          <a href="/" className="font-heading text-lg font-bold text-gradient">
            ReadzRaw
          </a>
        )}
        <button onClick={onToggle} className="text-muted-foreground hover:text-foreground p-1">
          <ChevronLeft size={18} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-4 border-b border-border">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.user_metadata?.full_name || "Client"}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      )}

      <nav className="flex-1 py-4 space-y-1 px-2">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => { signOut(); navigate("/"); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

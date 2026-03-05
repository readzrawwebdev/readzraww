import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { User, Mail, Calendar, Shield, ExternalLink } from "lucide-react";

const DashboardSettings = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Account Settings">
      <div className="max-w-2xl space-y-6">
        {/* Profile Info */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading text-lg font-bold text-foreground mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <User size={28} />
                )}
              </div>
              <div>
                <p className="font-heading font-bold text-foreground text-lg">
                  {user?.user_metadata?.full_name || "ReadzRaw Client"}
                </p>
                <p className="text-sm text-muted-foreground">Google Account</p>
              </div>
            </div>

            <div className="grid gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm text-foreground">
                    {new Date(user?.created_at ?? Date.now()).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Authentication</p>
                  <p className="text-sm text-foreground">Secured via Google OAuth</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading text-lg font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href="/#services"
              className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-secondary transition-colors"
            >
              <ExternalLink size={16} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Browse Services</p>
                <p className="text-xs text-muted-foreground">View available packages</p>
              </div>
            </a>
            <a
              href="mailto:readzraw@gmail.com"
              className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-secondary transition-colors"
            >
              <Mail size={16} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Contact Support</p>
                <p className="text-xs text-muted-foreground">readzraw@gmail.com</p>
              </div>
            </a>
          </div>
        </section>

        {/* Legal */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading text-lg font-bold text-foreground mb-4">Legal</h3>
          <div className="flex gap-4 text-sm">
            <a href="/terms" className="text-primary hover:text-primary/80">Terms & Conditions</a>
            <a href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</a>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;

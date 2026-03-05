import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ListTodo, FileCheck, Users, Wallet, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/tasks", label: "Tasks", icon: ListTodo },
  { path: "/admin/submissions", label: "Submissions", icon: FileCheck },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/referrals", label: "Referrals", icon: Settings },
  { path: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col glass border-r border-border/30 p-4">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <span className="text-sm font-bold text-primary-foreground font-display">W</span>
          </div>
          <span className="font-display text-lg font-bold gradient-text">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="md:hidden glass border-b border-border/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold gradient-text">Admin</span>
            <div className="flex gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "rounded-lg p-2 transition-colors",
                      isActive ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ListTodo, FileCheck, Users, Wallet, Settings, LogOut, Bell, ArrowLeft, Tag, Package, RotateCcw, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/tasks", label: "Tasks", icon: ListTodo },
  { path: "/admin/submissions", label: "Submissions", icon: FileCheck },
  { path: "/admin/deals", label: "Deals", icon: Tag },
  { path: "/admin/orders", label: "Orders", icon: Package },
  { path: "/admin/refunds", label: "Refunds", icon: RotateCcw },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/referrals", label: "Referrals", icon: Settings },
  { path: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { path: "/admin/notifications", label: "Notifications", icon: Bell },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = navItems.find(n => n.path === location.pathname)?.label || "Admin";

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 space-y-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); onNavigate?.(); }}
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
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col glass border-r border-border/30 p-4">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <span className="text-sm font-bold text-primary-foreground font-display">W</span>
          </div>
          <span className="font-display text-lg font-bold gradient-text">Admin Panel</span>
        </div>
        <NavList />
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      {/* Mobile header + drawer */}
      <div className="flex flex-1 flex-col">
        <header className="md:hidden glass border-b border-border/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1.5">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="glass border-border/30 w-64 p-4">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary">
                      <span className="text-sm font-bold text-primary-foreground font-display">W</span>
                    </div>
                    <span className="font-display text-base font-bold gradient-text">Admin Panel</span>
                  </div>
                  <NavList onNavigate={() => setMobileOpen(false)} />
                  <button
                    onClick={() => { navigate("/login"); setMobileOpen(false); }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-4"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </SheetContent>
              </Sheet>
              <span className="font-display text-lg font-bold gradient-text">{currentPage}</span>
            </div>
            <Button variant="ghost" size="sm" className="p-1.5" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-3 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

import { useLocation, useNavigate } from "react-router-dom";
import { ListTodo, Users, User, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "./NotificationBell";

const tabs = [
  { path: "/", label: "Tasks", icon: ListTodo },
  { path: "/my-submissions", label: "My Tasks", icon: FileCheck },
  { path: "/refer", label: "Refer", icon: Users },
  { path: "/profile", label: "Profile", icon: User },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (location.pathname.startsWith("/admin") || location.pathname === "/login" || location.pathname === "/signup" || !user) return null;

  return (
    <>
      {/* Top notification bar */}
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30 px-4 py-2">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <span className="font-display text-sm font-bold gradient-text">WorkFromHome</span>
          <NotificationBell />
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="glass border-t border-border/30 px-2 pt-2 pb-1">
          <div className="mx-auto flex max-w-md justify-around">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full gradient-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNav;

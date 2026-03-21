import { useLocation, useNavigate } from "react-router-dom";
import { ListTodo, Users, User, FileCheck, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSettings } from "@/hooks/useAppSettings";
import NotificationBell from "./NotificationBell";

const tabs = [
  { path: "/", label: "Tasks", icon: ListTodo },
  { path: "/deals", label: "Deals", icon: Tag },
  { path: "/my-submissions", label: "My Tasks", icon: FileCheck },
  { path: "/refer", label: "Refer", icon: Users },
  { path: "/profile", label: "Profile", icon: User },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { branding, announcement } = useAppSettings();

  if (location.pathname.startsWith("/admin") || location.pathname === "/login" || location.pathname === "/signup" || !user) return null;

  const displayName = branding.app_name || "WorkFromHome";

  return (
    <>
      {/* Top notification bar */}
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30 px-4 py-2">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            {branding.logo_url && (
              <img src={branding.logo_url} alt="Logo" className="h-7 w-7 rounded-lg object-cover" />
            )}
            <span className="font-display text-sm font-bold gradient-text">{displayName}</span>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Announcement ticker */}
      {announcement.active && announcement.text && (
        <div className="fixed top-[41px] left-0 right-0 z-40 bg-primary/10 border-b border-primary/20 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap py-1.5 px-4">
            <span className="text-xs font-medium text-primary">{announcement.text}</span>
          </div>
        </div>
      )}

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
                    "relative flex flex-col items-center gap-0.5 px-2 py-2 text-xs transition-colors",
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

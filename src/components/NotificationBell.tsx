import { useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const NotificationBell = () => {
  const [lastSeen, setLastSeen] = useState(() => localStorage.getItem("notif_last_seen") || "");

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const unreadCount = notifications.filter(
    (n: any) => !lastSeen || new Date(n.created_at) > new Date(lastSeen)
  ).length;

  const handleOpen = (open: boolean) => {
    if (open && notifications.length > 0) {
      const latest = notifications[0]?.created_at;
      if (latest) {
        localStorage.setItem("notif_last_seen", latest);
        setLastSeen(latest);
      }
    }
  };

  return (
    <Popover onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-muted/50 transition-colors">
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0 max-h-80 overflow-y-auto">
        <div className="p-3 border-b border-border/30">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
        </div>
        {notifications.length === 0 ? (
          <p className="p-4 text-xs text-muted-foreground text-center">No notifications yet</p>
        ) : (
          <div className="divide-y divide-border/20">
            {notifications.map((n: any) => (
              <div key={n.id} className="p-3">
                <p className="text-xs font-semibold text-foreground">{n.title}</p>
                {n.message && <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;

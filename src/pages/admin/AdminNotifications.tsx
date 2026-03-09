import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/GlassCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminNotifications = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const { data: notifications = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required");
      const { error } = await supabase.from("notifications").insert({ title: title.trim(), message: message.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setTitle("");
      setMessage("");
      toast.success("Notification sent!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Notification deleted");
    },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">
        <Bell className="inline h-6 w-6 mr-2" /> Notifications
      </motion.h1>

      <GlassCard className="space-y-3">
        <h3 className="font-display font-bold text-foreground text-sm">Send New Notification</h3>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" className="bg-muted/50 border-border/30" />
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message (optional)" className="bg-muted/50 border-border/30" rows={2} />
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Send Notification
        </Button>
      </GlassCard>

      <div className="space-y-2">
        {notifications.map((n: any, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <GlassCard className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(n.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminNotifications;

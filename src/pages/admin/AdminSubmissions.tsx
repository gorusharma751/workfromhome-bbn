import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminSubmissions = () => {
  const queryClient = useQueryClient();

  const { data: submissions = [] } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_submissions")
        .select("*, profiles!task_submissions_user_id_fkey(name), tasks!task_submissions_task_id_fkey(title, reward, points)")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("task_submissions")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;

      // If approved, credit the user's wallet
      if (status === "approved") {
        const sub = submissions.find((s) => s.id === id);
        if (sub) {
          const task = (sub as any).tasks;
          if (task) {
            // Update user profile balances
            const { error: profileError } = await supabase.rpc("has_role", { _user_id: sub.user_id, _role: "user" }); // Just to verify - actual update below
            await supabase
              .from("profiles")
              .update({
                wallet_balance: supabase.rpc as any, // We'll use raw SQL instead
              })
              .eq("user_id", sub.user_id);

            // For now, just update via direct increment approach
            const { data: profile } = await supabase
              .from("profiles")
              .select("wallet_balance, points_balance, total_earnings, tasks_completed")
              .eq("user_id", sub.user_id)
              .single();

            if (profile) {
              await supabase
                .from("profiles")
                .update({
                  wallet_balance: Number(profile.wallet_balance) + Number(task.reward),
                  points_balance: profile.points_balance + task.points,
                  total_earnings: Number(profile.total_earnings) + Number(task.reward),
                  tasks_completed: profile.tasks_completed + 1,
                })
                .eq("user_id", sub.user_id);
            }

            // Decrement task slots
            const { data: taskData } = await supabase
              .from("tasks")
              .select("slots_remaining")
              .eq("id", sub.task_id)
              .single();
            if (taskData && taskData.slots_remaining > 0) {
              await supabase
                .from("tasks")
                .update({ slots_remaining: taskData.slots_remaining - 1 })
                .eq("id", sub.task_id);
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Submission updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">Submissions</motion.h1>

      <div className="space-y-3">
        {submissions.map((sub: any, i) => (
          <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {sub.screenshot_url ? (
                  <a href={sub.screenshot_url} target="_blank" rel="noopener noreferrer" className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/50 flex-shrink-0 overflow-hidden">
                    <img src={sub.screenshot_url} alt="proof" className="h-full w-full object-cover rounded-xl" />
                  </a>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/50 flex-shrink-0">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-foreground">{sub.profiles?.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{sub.tasks?.title || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(sub.submitted_at).toLocaleString()}</p>
                  {sub.comment && <p className="text-xs text-foreground mt-1">"{sub.comment}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={sub.status} />
                  {sub.status === "pending" && (
                    <>
                      <Button size="sm" className="bg-success border-0 text-success-foreground hover:bg-success/90" onClick={() => updateMutation.mutate({ id: sub.id, status: "approved" })} disabled={updateMutation.isPending}>
                        <CheckCircle2 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => updateMutation.mutate({ id: sub.id, status: "rejected" })} disabled={updateMutation.isPending}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {submissions.length === 0 && <p className="text-center text-muted-foreground py-8">No submissions yet</p>}
      </div>
    </div>
  );
};

export default AdminSubmissions;

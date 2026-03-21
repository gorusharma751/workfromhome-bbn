import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Image, Eye, Play, FileText, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminSubmissions = () => {
  const queryClient = useQueryClient();
  const [detailSub, setDetailSub] = useState<any>(null);

  const { data: submissions = [] } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: async () => {
      const { data: subs, error } = await supabase
        .from("task_submissions")
        .select("*, tasks(title, reward, points, second_form_fields)")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      if (!subs || subs.length === 0) return [];
      const userIds = [...new Set(subs.map((s: any) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.name]));
      return subs.map((s: any) => ({ ...s, user_name: profileMap.get(s.user_id) || "Unknown" }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("task_submissions")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;

      if (status === "approved") {
        const sub = submissions.find((s) => s.id === id);
        if (sub) {
          const task = (sub as any).tasks;
          if (task) {
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

  const activate2ndFormMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("task_submissions")
        .update({ second_form_status: "active" } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast.success("2nd form activated for user!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const approve2ndFormMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("task_submissions")
        .update({ second_form_status: status } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast.success("2nd form status updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const renderFormData = (formData: any, label: string) => {
    if (!formData || (typeof formData === "object" && Object.keys(formData).length === 0)) return null;
    return (
      <div className="mt-2">
        <p className="text-[10px] font-semibold text-muted-foreground mb-1">{label}</p>
        <div className="space-y-1 rounded-lg bg-muted/30 p-2">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="flex gap-2 text-xs">
              <span className="text-muted-foreground font-medium min-w-[80px]">{key}:</span>
              {typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://")) ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1">
                  {value.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                    <img src={value} alt={key} className="h-12 w-12 object-cover rounded" />
                  ) : (
                    "View"
                  )}
                </a>
              ) : (
                <span className="text-foreground break-all">{String(value)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const get2ndFormBadge = (sub: any) => {
    const hasSecondForm = ((sub as any).tasks?.second_form_fields as any[])?.length > 0;
    if (!hasSecondForm) return null;
    const status = (sub as any).second_form_status;
    if (!status) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">2nd: Inactive</span>;
    if (status === "active") return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning font-medium">2nd: Waiting</span>;
    if (status === "submitted") return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary font-medium">2nd: Submitted</span>;
    if (status === "approved") return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-medium">2nd: Approved</span>;
    if (status === "rejected") return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">2nd: Rejected</span>;
    return null;
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">Submissions</motion.h1>

      <div className="space-y-3">
        {submissions.map((sub: any, i) => (
          <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard>
              <div className="flex flex-col md:flex-row md:items-start gap-3">
                {sub.screenshot_url ? (
                  <a href={sub.screenshot_url} target="_blank" rel="noopener noreferrer" className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/50 flex-shrink-0 overflow-hidden">
                    <img src={sub.screenshot_url} alt="proof" className="h-full w-full object-cover rounded-xl" />
                  </a>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/50 flex-shrink-0">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{sub.user_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{sub.tasks?.title || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(sub.submitted_at).toLocaleString()}</p>
                  {sub.comment && <p className="text-xs text-foreground mt-1">"{sub.comment}"</p>}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {get2ndFormBadge(sub)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <StatusBadge status={sub.status} />
                  <Button size="sm" variant="outline" className="border-border/30" onClick={() => setDetailSub(sub)}>
                    <Eye className="h-3 w-3" />
                  </Button>
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
                  {/* Activate 2nd form button */}
                  {sub.status === "approved" && ((sub as any).tasks?.second_form_fields as any[])?.length > 0 && !(sub as any).second_form_status && (
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10" onClick={() => activate2ndFormMutation.mutate(sub.id)} disabled={activate2ndFormMutation.isPending}>
                      <Play className="h-3 w-3 mr-1" /> 2nd Form
                    </Button>
                  )}
                  {/* Approve/reject 2nd form */}
                  {(sub as any).second_form_status === "submitted" && (
                    <>
                      <Button size="sm" className="bg-success border-0 text-success-foreground hover:bg-success/90" onClick={() => approve2ndFormMutation.mutate({ id: sub.id, status: "approved" })} disabled={approve2ndFormMutation.isPending}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> 2nd ✓
                      </Button>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => approve2ndFormMutation.mutate({ id: sub.id, status: "rejected" })} disabled={approve2ndFormMutation.isPending}>
                        <XCircle className="h-3 w-3 mr-1" /> 2nd ✗
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

      {/* Detail Dialog */}
      <Dialog open={!!detailSub} onOpenChange={() => setDetailSub(null)}>
        <DialogContent className="glass-card border-border/30 sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display gradient-text">Submission Details</DialogTitle>
          </DialogHeader>
          {detailSub && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">User:</span> <span className="text-foreground font-medium">{detailSub.user_name}</span></div>
                <div><span className="text-muted-foreground">Task:</span> <span className="text-foreground font-medium">{detailSub.tasks?.title}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailSub.status} /></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="text-foreground">{new Date(detailSub.submitted_at).toLocaleString()}</span></div>
              </div>

              {detailSub.screenshot_url && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">Screenshot</p>
                  <a href={detailSub.screenshot_url} target="_blank" rel="noopener noreferrer">
                    <img src={detailSub.screenshot_url} alt="proof" className="w-full max-h-48 object-contain rounded-lg border border-border/30" />
                  </a>
                </div>
              )}

              {detailSub.comment && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">Comment</p>
                  <p className="text-xs text-foreground bg-muted/30 rounded-lg p-2">{detailSub.comment}</p>
                </div>
              )}

              {renderFormData(detailSub.form_data, "📋 1st Form Data")}
              {renderFormData(detailSub.second_form_data, "📋 2nd Form Data")}

              {detailSub.second_form_status && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">2nd Form Status</p>
                  {get2ndFormBadge(detailSub)}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubmissions;

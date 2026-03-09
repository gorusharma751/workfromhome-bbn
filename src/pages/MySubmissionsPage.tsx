import { motion } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const MySubmissionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["my-all-submissions"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("task_submissions")
        .select("*, tasks!task_submissions_task_id_fkey(title, reward, points)")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "rejected") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-warning" />;
  };

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mx-auto max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="font-display text-2xl font-bold gradient-text">My Submissions</h1>
          <p className="text-sm text-muted-foreground">Track your task submissions</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-display">No submissions yet</p>
            <p className="text-sm">Complete tasks to see your submissions here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub: any, i) => (
              <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getStatusIcon(sub.status)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{sub.tasks?.title || "Unknown Task"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={sub.status} />
                        {sub.second_form_status && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            sub.second_form_status === "active" ? "bg-warning/20 text-warning" :
                            sub.second_form_status === "submitted" ? "bg-secondary/20 text-secondary" :
                            sub.second_form_status === "approved" ? "bg-success/20 text-success" :
                            "bg-destructive/20 text-destructive"
                          }`}>
                            2nd: {sub.second_form_status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>₹{sub.tasks?.reward || 0}</span>
                        <span>{sub.tasks?.points || 0} pts</span>
                        <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubmissionsPage;

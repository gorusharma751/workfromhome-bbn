import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { mockSubmissions, type TaskSubmission } from "@/data/mockData";
import { toast } from "sonner";

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState(mockSubmissions);

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    setSubmissions(submissions.map((s) => s.id === id ? { ...s, status } : s));
    toast.success(`Submission ${status}`);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">
        Submissions
      </motion.h1>

      <div className="space-y-3">
        {submissions.map((sub, i) => (
          <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/50 flex-shrink-0">
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{sub.userName}</p>
                  <p className="text-xs text-muted-foreground">{sub.taskTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(sub.submittedAt).toLocaleString()}</p>
                  {sub.comment && <p className="text-xs text-foreground mt-1">"{sub.comment}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={sub.status} />
                  {sub.status === "pending" && (
                    <>
                      <Button size="sm" className="bg-success border-0 text-success-foreground hover:bg-success/90" onClick={() => updateStatus(sub.id, "approved")}>
                        <CheckCircle2 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => updateStatus(sub.id, "rejected")}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminSubmissions;

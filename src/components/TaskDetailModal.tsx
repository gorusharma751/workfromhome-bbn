import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink, Upload, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

interface TaskDetailModalProps {
  task: Tables<"tasks"> | null;
  open: boolean;
  onClose: () => void;
}

const TaskDetailModal = ({ task, open, onClose }: TaskDetailModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!task) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(task.review_text || "");
    setCopied(true);
    toast.success("Review text copied to clipboard!");
    setTimeout(() => setStep(2), 600);
  };

  const handleOpenLink = () => {
    window.open(task.task_link || "", "_blank");
    setTimeout(() => setStep(3), 500);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      let screenshotUrl = "";
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${task.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("screenshots")
          .upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("screenshots")
          .getPublicUrl(path);
        screenshotUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("task_submissions").insert({
        user_id: user.id,
        task_id: task.id,
        screenshot_url: screenshotUrl || null,
        comment: comment || null,
      });
      if (error) throw error;

      toast.success("Proof submitted! Waiting for admin approval.");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      handleClose();
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setCopied(false);
    setComment("");
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border/30 sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl gradient-text">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${step >= s ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                {s < 3 && <div className={`h-0.5 w-8 rounded-full transition-all ${step > s ? "gradient-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Review Text to Copy:</p>
                  <p className="text-sm leading-relaxed text-foreground">{task.review_text}</p>
                </div>
                <Button onClick={handleCopy} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground" disabled={copied}>
                  {copied ? <><CheckCircle2 className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy Review Text</>}
                </Button>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <ExternalLink className="mx-auto mb-2 h-8 w-8 text-secondary" />
                  <p className="text-sm text-muted-foreground">Open the task link, paste the copied review, and submit it.</p>
                </div>
                <Button onClick={handleOpenLink} className="w-full bg-secondary border-0 font-display font-semibold text-secondary-foreground hover:bg-secondary/90">
                  <ExternalLink className="h-4 w-4" /> Open Task Link
                </Button>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="rounded-xl border-2 border-dashed border-border/50 p-8 text-center">
                  <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Upload Screenshot</p>
                  <p className="text-xs text-muted-foreground">Tap to select proof of completion</p>
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-2 w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:gradient-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" /><span>Comment (optional)</span>
                  </div>
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." className="bg-muted/50 border-border/30 resize-none" rows={3} />
                </div>
                <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-success border-0 font-display font-semibold text-success-foreground hover:bg-success/90">
                  <CheckCircle2 className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Proof"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;

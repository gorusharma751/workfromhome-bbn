import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink, Upload, CheckCircle2, MessageSquare, Clock, FileText, Camera, CalendarIcon, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "tel" | "textarea" | "select" | "image" | "date";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface TaskDetailModalProps {
  task: Tables<"tasks"> | null;
  open: boolean;
  onClose: () => void;
}

const TaskDetailModal = ({ task, open, onClose }: TaskDetailModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("task");
  const [step, setStep] = useState(0); // 0 = booking, 1+ = task steps
  const [copied, setCopied] = useState(false);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formImageFiles, setFormImageFiles] = useState<Record<string, File>>({});
  const [formDates, setFormDates] = useState<Record<string, Date | undefined>>({});
  const [bookedSlot, setBookedSlot] = useState<any>(null);
  const [booking, setBooking] = useState(false);

  // Check if user already has a slot booked for this task
  useEffect(() => {
    if (!task || !user || !open) return;
    const checkSlot = async () => {
      const { data } = await supabase
        .from("task_slots")
        .select("*")
        .eq("task_id", task.id)
        .eq("assigned_user_id", user.id)
        .in("status", ["booked", "completed"])
        .limit(1);
      if (data && data.length > 0) {
        setBookedSlot(data[0]);
        setStep(1);
      } else {
        setBookedSlot(null);
        setStep(0);
      }
    };
    checkSlot();
  }, [task?.id, user?.id, open]);

  if (!task) return null;

  const formFields: FormField[] = Array.isArray(task.form_fields) ? (task.form_fields as any) : [];
  const hasFormFields = formFields.length > 0;
  const approvalDays = task.approval_days || 1;
  const hasRefund = task.has_refund || false;
  const guideVideo = (task as any).guide_video_url;
  const guideText = (task as any).guide_text;
  const hasGuide = guideVideo || guideText;

  // Steps: 1=review, 2=link, 3=form(optional), 4=upload
  const totalSteps = hasFormFields ? 4 : 3;
  const formStep = hasFormFields ? 3 : -1;
  const uploadStep = hasFormFields ? 4 : 3;

  const bookSlot = async () => {
    if (!user) return;
    setBooking(true);
    try {
      // Find first available slot
      const { data: slots, error: fetchErr } = await supabase
        .from("task_slots")
        .select("*")
        .eq("task_id", task.id)
        .eq("status", "available")
        .order("slot_number", { ascending: true })
        .limit(1);

      if (fetchErr) throw fetchErr;
      if (!slots || slots.length === 0) {
        toast.error("No slots available!");
        return;
      }

      const slot = slots[0];
      const { error: updateErr } = await supabase
        .from("task_slots")
        .update({
          assigned_user_id: user.id,
          status: "booked" as any,
          assigned_at: new Date().toISOString(),
        })
        .eq("id", slot.id)
        .eq("status", "available"); // ensure race condition safety

      if (updateErr) throw updateErr;

      // Update slots_remaining on tasks table
      const { data: taskData } = await supabase
        .from("tasks")
        .select("slots_remaining")
        .eq("id", task.id)
        .single();
      if (taskData && taskData.slots_remaining > 0) {
        await supabase.from("tasks").update({ slots_remaining: taskData.slots_remaining - 1 }).eq("id", task.id);
      }

      // Refetch the booked slot to get review_text
      const { data: booked } = await supabase
        .from("task_slots")
        .select("*")
        .eq("id", slot.id)
        .single();

      setBookedSlot(booked);
      setStep(1);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Slot booked! Complete the task now.");
    } catch (err: any) {
      toast.error(err.message || "Failed to book slot");
    } finally {
      setBooking(false);
    }
  };

  const uploadFormImage = async (fieldId: string, imageFile: File): Promise<string> => {
    if (!user) throw new Error("Not logged in");
    const ext = imageFile.name.split(".").pop();
    const path = `${user.id}/form_${task.id}_${fieldId}.${ext}`;
    const { error } = await supabase.storage.from("screenshots").upload(path, imageFile, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCopy = async () => {
    const textToCopy = bookedSlot?.review_text || task.review_text || "";
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Review text copied to clipboard!");
    setTimeout(() => setStep(2), 600);
  };

  const handleOpenLink = () => {
    window.open(task.task_link || "", "_blank");
    setTimeout(() => setStep(3), 500);
  };

  const handleFormNext = async () => {
    for (const field of formFields) {
      if (field.required) {
        if (field.type === "image") {
          if (!formImageFiles[field.id]) { toast.error(`Please fill "${field.label}"`); return; }
        } else if (field.type === "date") {
          if (!formDates[field.id]) { toast.error(`Please fill "${field.label}"`); return; }
        } else {
          if (!formData[field.id]?.trim()) { toast.error(`Please fill "${field.label}"`); return; }
        }
      }
    }
    setStep(uploadStep);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!file) { toast.error("Please upload screenshot proof"); return; }
    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${task.id}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(path);

      const finalFormData: Record<string, string> = { ...formData };
      for (const [fieldId, date] of Object.entries(formDates)) {
        if (date) finalFormData[fieldId] = format(date, "yyyy-MM-dd");
      }
      for (const [fieldId, imageFile] of Object.entries(formImageFiles)) {
        finalFormData[fieldId] = await uploadFormImage(fieldId, imageFile);
      }

      const insertPayload: any = {
        user_id: user.id,
        task_id: task.id,
        screenshot_url: urlData.publicUrl,
        comment: comment || null,
      };
      if (hasFormFields) insertPayload.form_data = finalFormData;

      const { error } = await supabase.from("task_submissions").insert(insertPayload);
      if (error) throw error;

      // Update slot to completed
      if (bookedSlot) {
        await supabase.from("task_slots").update({ status: "completed" as any }).eq("id", bookedSlot.id);
      }

      toast.success(`Proof submitted! Approval may take up to ${approvalDays} days.`);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["my-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["my-all-submissions"] });
      handleClose();
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep(0); setCopied(false); setComment(""); setFile(null);
    setFormData({}); setFormImageFiles({}); setFormDates({});
    setActiveTab("task"); setBookedSlot(null);
  };

  const renderFormField = (field: FormField) => {
    if (field.type === "date") {
      const selectedDate = formDates[field.id];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-muted/50 border-border/30 text-sm", !selectedDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[9999]" align="start">
            <Calendar mode="single" selected={selectedDate} onSelect={(d) => setFormDates({ ...formDates, [field.id]: d })} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
      );
    }
    if (field.type === "image") {
      const imageFile = formImageFiles[field.id];
      return (
        <div className="rounded-lg border-2 border-dashed border-border/50 p-3 text-center">
          <Camera className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-1">{imageFile ? imageFile.name : "Upload image"}</p>
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFormImageFiles({ ...formImageFiles, [field.id]: f }); }} className="w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:gradient-primary file:px-2 file:py-1 file:text-xs file:font-medium file:text-primary-foreground" />
        </div>
      );
    }
    const value = formData[field.id] || "";
    const onChange = (v: string) => setFormData({ ...formData, [field.id]: v });
    if (field.type === "textarea") return <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || field.label} className="bg-muted/50 border-border/30 resize-none text-sm" rows={2} />;
    if (field.type === "select" && field.options?.length) {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="bg-muted/50 border-border/30 text-sm"><SelectValue placeholder={field.placeholder || "Select..."} /></SelectTrigger>
          <SelectContent className="z-[9999]">{field.options.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent>
        </Select>
      );
    }
    return <Input type={field.type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || field.label} className="bg-muted/50 border-border/30 text-sm" />;
  };

  // The review text to show: from booked slot or fallback to task.review_text
  const reviewText = bookedSlot?.review_text || task.review_text || "";

  const renderTaskContent = () => (
    <div className="space-y-4 py-2">
      {(approvalDays > 1 || hasRefund) && (
        <div className="flex flex-wrap gap-2">
          {approvalDays > 1 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5">
              <Clock className="h-3 w-3" /><span>Approval: {approvalDays} days</span>
            </div>
          )}
          {hasRefund && (
            <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/10 rounded-lg px-2.5 py-1.5">
              <FileText className="h-3 w-3" /><span>Refund form available after 7 days</span>
            </div>
          )}
        </div>
      )}

      {task.description && (
        <div className="rounded-xl bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground whitespace-pre-wrap">{task.description}</p>
        </div>
      )}

      {/* Step 0: Book Slot */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-sm font-medium text-foreground mb-1">Book a Slot to Start</p>
            <p className="text-xs text-muted-foreground">Available: {task.slots_remaining}/{task.slots_total}</p>
          </div>
          <Button onClick={bookSlot} disabled={booking || task.slots_remaining <= 0} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
            {booking ? "Booking..." : task.slots_remaining <= 0 ? "Slots Full" : "Book Slot & Start"}
          </Button>
        </motion.div>
      )}

      {/* Task steps after booking */}
      {step >= 1 && (
        <>
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${step >= s ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                {s < totalSteps && <div className={`h-0.5 w-6 rounded-full transition-all ${step > s ? "gradient-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Review Text to Copy:</p>
                  <p className="text-sm leading-relaxed text-foreground">{reviewText}</p>
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
            {step === formStep && hasFormFields && (
              <motion.div key="stepForm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">📋 Additional Details Required</p>
                </div>
                <div className="space-y-3">
                  {formFields.map((field) => (
                    <div key={field.id}>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        {field.label} {field.required && <span className="text-destructive">*</span>}
                      </label>
                      {renderFormField(field)}
                    </div>
                  ))}
                </div>
                <Button onClick={handleFormNext} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">Continue →</Button>
              </motion.div>
            )}
            {step === uploadStep && (
              <motion.div key="stepUpload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
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
                  <Textarea value={comment} onChange={(e: any) => setComment(e.target.value)} placeholder="Add a comment..." className="bg-muted/50 border-border/30 resize-none" rows={3} />
                </div>
                <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-success border-0 font-display font-semibold text-success-foreground hover:bg-success/90">
                  <CheckCircle2 className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Proof"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border/30 sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl gradient-text">{task.title}</DialogTitle>
        </DialogHeader>

        {hasGuide ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="task">Start Task</TabsTrigger>
              <TabsTrigger value="guide"><BookOpen className="h-3 w-3 mr-1" /> How To</TabsTrigger>
            </TabsList>
            <TabsContent value="guide">
              <div className="space-y-3 py-2">
                {guideVideo && <div className="rounded-xl overflow-hidden"><video src={guideVideo} controls className="w-full rounded-xl" /></div>}
                {guideText && <div className="rounded-xl bg-muted/50 p-4"><p className="text-sm text-foreground whitespace-pre-wrap">{guideText}</p></div>}
              </div>
            </TabsContent>
            <TabsContent value="task">{renderTaskContent()}</TabsContent>
          </Tabs>
        ) : renderTaskContent()}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;

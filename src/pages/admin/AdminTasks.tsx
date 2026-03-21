import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Pause, Play, X, Copy, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "tel" | "textarea" | "select" | "image" | "date";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

const FormFieldBuilder = ({ fields, onChange, label }: { fields: FormField[]; onChange: (fields: FormField[]) => void; label: string }) => {
  const addField = () => onChange([...fields, { id: crypto.randomUUID(), label: "", type: "text", required: false, placeholder: "" }]);
  const updateField = (id: string, updates: Partial<FormField>) => onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  const removeField = (id: string) => onChange(fields.filter((f) => f.id !== id));

  return (
    <div className="border border-border/30 rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground">{label}</label>
        <Button type="button" size="sm" variant="outline" className="text-xs border-border/30" onClick={addField}><Plus className="h-3 w-3" /> Add Field</Button>
      </div>
      {fields.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No custom fields added.</p>}
      {fields.map((field, idx) => (
        <div key={field.id} className="rounded-lg bg-muted/30 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">Field {idx + 1}</span>
            <button onClick={() => removeField(field.id)} className="text-destructive hover:bg-destructive/10 rounded p-0.5"><X className="h-3 w-3" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} placeholder="Field label" className="bg-background/50 border-border/30 text-xs h-8" />
            <Select value={field.type} onValueChange={(v) => updateField(field.id, { type: v as FormField["type"] })}>
              <SelectTrigger className="bg-background/50 border-border/30 text-xs h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="tel">Phone</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="select">Dropdown</SelectItem>
                <SelectItem value="image">📷 Image Upload</SelectItem>
                <SelectItem value="date">📅 Date Picker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            {field.type !== "image" && field.type !== "date" && (
              <Input value={field.placeholder || ""} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} placeholder="Placeholder text" className="bg-background/50 border-border/30 text-xs h-8 flex-1" />
            )}
            {field.type === "image" && <span className="text-[10px] text-muted-foreground flex-1">User will upload an image</span>}
            {field.type === "date" && <span className="text-[10px] text-muted-foreground flex-1">User will pick a date</span>}
            <div className="flex items-center gap-1">
              <Switch checked={field.required} onCheckedChange={(v) => updateField(field.id, { required: v })} className="scale-75" />
              <span className="text-[10px] text-muted-foreground">Required</span>
            </div>
          </div>
          {field.type === "select" && (
            <Input value={(field.options || []).join(", ")} onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Option 1, Option 2, Option 3" className="bg-background/50 border-border/30 text-xs h-8" />
          )}
        </div>
      ))}
    </div>
  );
};

const AdminTasks = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [slotsDialogOpen, setSlotsDialogOpen] = useState(false);
  const [slotsTask, setSlotsTask] = useState<Tables<"tasks"> | null>(null);
  const [editing, setEditing] = useState<Tables<"tasks"> | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskLink, setTaskLink] = useState("");
  const [reward, setReward] = useState("");
  const [points, setPoints] = useState("");
  const [slots, setSlots] = useState("");
  const [category, setCategory] = useState("");
  const [approvalDays, setApprovalDays] = useState("1");
  const [hasRefund, setHasRefund] = useState(false);
  const [enableSecondForm, setEnableSecondForm] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [secondFormFields, setSecondFormFields] = useState<FormField[]>([]);
  const [guideVideoUrl, setGuideVideoUrl] = useState("");
  const [guideText, setGuideText] = useState("");
  const [slotReviews, setSlotReviews] = useState<string[]>([]);

  const { data: tasks = [] } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: taskSlots = [] } = useQuery({
    queryKey: ["admin-task-slots", slotsTask?.id],
    queryFn: async () => {
      if (!slotsTask) return [];
      const { data, error } = await supabase.from("task_slots").select("*").eq("task_id", slotsTask.id).order("slot_number", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!slotsTask,
  });

  const resetForm = () => {
    setTitle(""); setDescription(""); setTaskLink("");
    setReward(""); setPoints(""); setSlots(""); setCategory("");
    setApprovalDays("1"); setHasRefund(false); setEnableSecondForm(false);
    setFormFields([]); setSecondFormFields([]);
    setGuideVideoUrl(""); setGuideText(""); setSlotReviews([]);
  };

  const openDialog = (task?: Tables<"tasks">) => {
    if (task) {
      setEditing(task);
      setTitle(task.title); setDescription(task.description || "");
      setTaskLink(task.task_link || "");
      setReward(String(task.reward)); setPoints(String(task.points));
      setSlots(String(task.slots_total)); setCategory(task.category || "");
      setApprovalDays(String(task.approval_days || 1)); setHasRefund(task.has_refund || false);
      const sf = Array.isArray(task.second_form_fields) ? task.second_form_fields as any : [];
      setEnableSecondForm(sf.length > 0);
      setFormFields(Array.isArray(task.form_fields) ? task.form_fields as any : []);
      setSecondFormFields(sf);
      setGuideVideoUrl((task as any).guide_video_url || "");
      setGuideText((task as any).guide_text || "");
    } else {
      setEditing(null); resetForm();
    }
    setDialogOpen(true);
  };

  const handleGuideVideoUpload = async (file: File) => {
    try {
      const ext = file.name.split(".").pop();
      const path = `guides/guide_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
      setGuideVideoUrl(data.publicUrl);
      toast.success("Video uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slotCount = parseInt(slots) || 100;
      const payload: any = {
        title, description, task_link: taskLink,
        reward: parseFloat(reward) || 0, points: parseInt(points) || 0,
        slots_total: slotCount, slots_remaining: slotCount,
        category, approval_days: parseInt(approvalDays) || 1, has_refund: hasRefund,
        form_fields: formFields.filter((f) => f.label.trim()),
        second_form_fields: enableSecondForm ? secondFormFields.filter((f) => f.label.trim()) : [],
        guide_video_url: guideVideoUrl || null, guide_text: guideText || null,
      };

      let taskId: string;
      if (editing) {
        delete payload.slots_remaining;
        const { error } = await supabase.from("tasks").update(payload).eq("id", editing.id);
        if (error) throw error;
        taskId = editing.id;
      } else {
        const { data, error } = await supabase.from("tasks").insert(payload).select("id").single();
        if (error) throw error;
        taskId = data.id;

        // Create slot rows for new tasks
        if (slotReviews.length > 0) {
          const slotRows = slotReviews.filter(t => t.trim()).map((text, i) => ({
            task_id: taskId,
            slot_number: i + 1,
            review_text: text,
            status: "available",
          }));
          if (slotRows.length > 0) {
            const { error: slotErr } = await supabase.from("task_slots").insert(slotRows);
            if (slotErr) throw slotErr;
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      setDialogOpen(false);
      toast.success(editing ? "Task updated" : "Task created");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-tasks"] }); toast.success("Task deleted"); },
  });

  const toggleMutation = useMutation({
    mutationFn: async (task: Tables<"tasks">) => {
      const newStatus = task.status === "active" ? "paused" : "active";
      const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-tasks"] }),
  });

  const resetSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase.from("task_slots").update({
        assigned_user_id: null,
        status: "available" as any,
        assigned_at: null,
      }).eq("id", slotId);
      if (error) throw error;
      if (slotsTask) {
        const { data: taskData } = await supabase.from("tasks").select("slots_remaining").eq("id", slotsTask.id).single();
        if (taskData) {
          await supabase.from("tasks").update({ slots_remaining: taskData.slots_remaining + 1 }).eq("id", slotsTask.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-task-slots", slotsTask?.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("Slot reset to available");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const saveSlotsMutation = useMutation({
    mutationFn: async ({ taskId, reviews }: { taskId: string; reviews: string[] }) => {
      const { data: existing } = await supabase.from("task_slots").select("slot_number").eq("task_id", taskId);
      const existingNums = (existing || []).map((s: any) => s.slot_number);
      const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;

      const newSlots = reviews.filter(t => t.trim()).map((text, i) => ({
        task_id: taskId,
        slot_number: maxNum + i + 1,
        review_text: text,
        status: "available",
      }));
      if (newSlots.length > 0) {
        const { error } = await supabase.from("task_slots").insert(newSlots);
        if (error) throw error;
        // Update slots_total and slots_remaining
        const { data: task } = await supabase.from("tasks").select("slots_total, slots_remaining").eq("id", taskId).single();
        if (task) {
          await supabase.from("tasks").update({
            slots_total: task.slots_total + newSlots.length,
            slots_remaining: task.slots_remaining + newSlots.length,
          }).eq("id", taskId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-task-slots", slotsTask?.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("Slots saved!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const [newSlotReviews, setNewSlotReviews] = useState<string[]>([""]);

  const openSlotsDialog = (task: Tables<"tasks">) => {
    setSlotsTask(task);
    setNewSlotReviews([""]);
    setSlotsDialogOpen(true);
  };

  const slotCount = parseInt(slots) || 0;
  const handleSlotCountChange = (val: string) => {
    setSlots(val);
    const count = parseInt(val) || 0;
    setSlotReviews(prev => {
      const arr = [...prev];
      while (arr.length < count) arr.push("");
      return arr.slice(0, count);
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="font-display text-xl md:text-2xl font-bold gradient-text">Manage Tasks</h1>
        <Button onClick={() => openDialog()} className="gradient-primary border-0 text-primary-foreground font-display text-sm">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </motion.div>

      <div className="space-y-3">
        {tasks.map((task, i) => {
          const booked = task.slots_total - task.slots_remaining;
          return (
            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display font-bold text-foreground text-sm">{task.title}</h3>
                      <StatusBadge status={task.status} />
                      {task.has_refund && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning font-medium">Refund</span>}
                      {((task.second_form_fields as any[])?.length > 0) && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary font-medium">2nd Form</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ₹{task.reward} · {task.points} pts · {booked} booked / {task.slots_total} total
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <Button size="sm" variant="outline" className="border-border/30 text-xs h-8" onClick={() => openSlotsDialog(task)}>
                    Slots
                  </Button>
                  <Button size="sm" variant="outline" className="border-border/30 h-8" onClick={() => toggleMutation.mutate(task)}>
                    {task.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="outline" className="border-border/30 h-8" onClick={() => openDialog(task)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 h-8" onClick={() => deleteMutation.mutate(task.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
        {tasks.length === 0 && <p className="text-center text-muted-foreground py-8">No tasks yet. Create one!</p>}
      </div>

      {/* Task Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-border/30 sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display gradient-text">{editing ? "Edit Task" : "Create Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div><label className="text-xs font-medium text-foreground mb-1 block">Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="bg-muted/50 border-border/30" /></div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Category</label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Google Review" className="bg-muted/50 border-border/30" /></div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Task Link</label><Input value={taskLink} onChange={(e) => setTaskLink(e.target.value)} placeholder="https://..." className="bg-muted/50 border-border/30" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-xs font-medium text-foreground mb-1 block">Reward (₹)</label><Input type="number" value={reward} onChange={(e) => setReward(e.target.value)} placeholder="20" className="bg-muted/50 border-border/30" /></div>
              <div><label className="text-xs font-medium text-foreground mb-1 block">Points</label><Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="200" className="bg-muted/50 border-border/30" /></div>
              <div><label className="text-xs font-medium text-foreground mb-1 block">Slots</label>
                <Input type="number" value={slots} onChange={(e) => editing ? setSlots(e.target.value) : handleSlotCountChange(e.target.value)} placeholder="10" className="bg-muted/50 border-border/30" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium text-foreground mb-1 block">Approval Days</label><Input type="number" value={approvalDays} onChange={(e) => setApprovalDays(e.target.value)} placeholder="7" className="bg-muted/50 border-border/30" /></div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={hasRefund} onCheckedChange={setHasRefund} />
                <label className="text-xs font-medium text-foreground">Refund Form</label>
              </div>
            </div>

            {/* 2nd Form Toggle */}
            <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
              <Switch checked={enableSecondForm} onCheckedChange={setEnableSecondForm} />
              <div>
                <label className="text-xs font-medium text-foreground">Enable 2nd Form</label>
                <p className="text-[10px] text-muted-foreground">Admin se activate hoga, user ko 3 din baad dikhega</p>
              </div>
            </div>

            <div><label className="text-xs font-medium text-foreground mb-1 block">Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Task description..." className="bg-muted/50 border-border/30" rows={3} /></div>

            {/* Slot Review Texts (for new tasks) */}
            {!editing && slotCount > 0 && (
              <div className="border border-border/30 rounded-xl p-3 space-y-2">
                <label className="text-xs font-semibold text-foreground block">📝 Review Text per Slot ({slotCount} slots)</label>
                <p className="text-[10px] text-muted-foreground">Each slot gets a unique review text shown only to the assigned user.</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {slotReviews.map((text, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="text-[10px] text-muted-foreground font-medium mt-2 w-6 flex-shrink-0">#{idx + 1}</span>
                      <Textarea value={text} onChange={(e) => { const arr = [...slotReviews]; arr[idx] = e.target.value; setSlotReviews(arr); }} placeholder={`Review text for slot ${idx + 1}`} className="bg-background/50 border-border/30 text-xs flex-1" rows={2} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How-To Guide */}
            <div className="border border-border/30 rounded-xl p-3 space-y-2">
              <label className="text-xs font-semibold text-foreground block">📖 How-To Guide</label>
              <Input value={guideVideoUrl} onChange={(e) => setGuideVideoUrl(e.target.value)} placeholder="Video URL or upload" className="bg-muted/50 border-border/30 text-xs" />
              <label className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/50 py-2 px-3 text-xs text-muted-foreground hover:border-primary/50 transition-colors">Upload video</div>
                <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGuideVideoUpload(f); }} />
              </label>
              <Textarea value={guideText} onChange={(e) => setGuideText(e.target.value)} placeholder="Step by step instructions..." className="bg-muted/50 border-border/30 text-xs" rows={3} />
            </div>

            {/* Copy form template */}
            {tasks.length > 0 && !editing && (
              <div className="border border-border/30 rounded-xl p-3">
                <label className="text-xs font-semibold text-foreground mb-2 block flex items-center gap-1">
                  <Copy className="h-3 w-3" /> Copy Form Template
                </label>
                <Select onValueChange={(taskId) => {
                  const srcTask = tasks.find(t => t.id === taskId);
                  if (srcTask) {
                    const f1 = srcTask.form_fields;
                    const f2 = srcTask.second_form_fields;
                    if (Array.isArray(f1) && f1.length > 0) setFormFields((f1 as any).map((f: any) => ({ ...f, id: crypto.randomUUID() })));
                    if (Array.isArray(f2) && f2.length > 0) {
                      setSecondFormFields((f2 as any).map((f: any) => ({ ...f, id: crypto.randomUUID() })));
                      setEnableSecondForm(true);
                    }
                    toast.success("Form fields copied!");
                  }
                }}>
                  <SelectTrigger className="bg-muted/50 border-border/30 text-xs"><SelectValue placeholder="Select task..." /></SelectTrigger>
                  <SelectContent>
                    {tasks.filter(t => (Array.isArray(t.form_fields) && (t.form_fields as any[]).length > 0)).map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Form Fields */}
            <FormFieldBuilder fields={formFields} onChange={setFormFields} label="1st Form - Custom Fields" />

            {/* 2nd Form Fields - only when enabled */}
            {enableSecondForm && (
              <div>
                <FormFieldBuilder fields={secondFormFields} onChange={setSecondFormFields} label="2nd Form - Custom Fields" />
                <p className="text-[10px] text-muted-foreground mt-2">⚡ 2nd form sirf admin activate karega submissions page se. User ko 3 din baad dikhega.</p>
              </div>
            )}

            <Button className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editing ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Slots Management Dialog */}
      <Dialog open={slotsDialogOpen} onOpenChange={setSlotsDialogOpen}>
        <DialogContent className="glass-card border-border/30 sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display gradient-text text-base">Slots - {slotsTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-success/10 p-2">
                <p className="text-lg font-bold text-success">{taskSlots.filter((s: any) => s.status === "available").length}</p>
                <p className="text-[10px] text-muted-foreground">Available</p>
              </div>
              <div className="rounded-lg bg-warning/10 p-2">
                <p className="text-lg font-bold text-warning">{taskSlots.filter((s: any) => s.status === "booked").length}</p>
                <p className="text-[10px] text-muted-foreground">Booked</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2">
                <p className="text-lg font-bold text-primary">{taskSlots.filter((s: any) => s.status === "completed").length}</p>
                <p className="text-[10px] text-muted-foreground">Completed</p>
              </div>
            </div>

            {/* Existing slots */}
            <p className="text-xs font-semibold text-foreground">All Slots ({taskSlots.length})</p>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {taskSlots.map((slot: any) => (
                <div key={slot.id} className="rounded-lg bg-muted/30 p-2 flex items-start gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground w-6 flex-shrink-0 mt-0.5">#{slot.slot_number}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground break-words">{slot.review_text || "(no text)"}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        slot.status === "available" ? "bg-success/20 text-success" :
                        slot.status === "booked" ? "bg-warning/20 text-warning" :
                        "bg-primary/20 text-primary"
                      }`}>{slot.status}</span>
                      {slot.assigned_user_id && <span className="text-[10px] text-muted-foreground">User: {slot.assigned_user_id.slice(0, 8)}...</span>}
                    </div>
                  </div>
                  {slot.status !== "available" && (
                    <Button size="sm" variant="outline" className="border-border/30 text-xs h-7 flex-shrink-0" onClick={() => resetSlotMutation.mutate(slot.id)} disabled={resetSlotMutation.isPending}>
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {taskSlots.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No slots created yet</p>}
            </div>

            {/* Add new slots */}
            <div className="border-t border-border/30 pt-3">
              <p className="text-xs font-semibold text-foreground mb-2">Add New Slots</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {newSlotReviews.map((text, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <span className="text-[10px] text-muted-foreground font-medium mt-2 w-6 flex-shrink-0">New</span>
                    <Textarea value={text} onChange={(e) => { const arr = [...newSlotReviews]; arr[idx] = e.target.value; setNewSlotReviews(arr); }} placeholder="Review text..." className="bg-background/50 border-border/30 text-xs flex-1" rows={2} />
                    <button onClick={() => setNewSlotReviews(newSlotReviews.filter((_, i) => i !== idx))} className="text-destructive mt-1"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-2 text-xs border-border/30" onClick={() => setNewSlotReviews([...newSlotReviews, ""])}>
                <Plus className="h-3 w-3" /> Add Slot
              </Button>
            </div>

            <Button className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground"
              onClick={() => slotsTask && saveSlotsMutation.mutate({ taskId: slotsTask.id, reviews: newSlotReviews })}
              disabled={saveSlotsMutation.isPending}>
              {saveSlotsMutation.isPending ? "Saving..." : "Save New Slots"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTasks;

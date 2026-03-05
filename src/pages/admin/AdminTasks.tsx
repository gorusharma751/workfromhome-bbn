import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const AdminTasks = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tables<"tasks"> | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [taskLink, setTaskLink] = useState("");
  const [reward, setReward] = useState("");
  const [points, setPoints] = useState("");
  const [slots, setSlots] = useState("");
  const [category, setCategory] = useState("");

  const { data: tasks = [] } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const openDialog = (task?: Tables<"tasks">) => {
    if (task) {
      setEditing(task);
      setTitle(task.title);
      setDescription(task.description || "");
      setReviewText(task.review_text || "");
      setTaskLink(task.task_link || "");
      setReward(String(task.reward));
      setPoints(String(task.points));
      setSlots(String(task.slots_total));
      setCategory(task.category || "");
    } else {
      setEditing(null);
      setTitle(""); setDescription(""); setReviewText(""); setTaskLink("");
      setReward(""); setPoints(""); setSlots(""); setCategory("");
    }
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title, description, review_text: reviewText, task_link: taskLink,
        reward: parseFloat(reward) || 0, points: parseInt(points) || 0,
        slots_total: parseInt(slots) || 100, slots_remaining: parseInt(slots) || 100,
        category,
      };
      if (editing) {
        const { error } = await supabase.from("tasks").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert(payload);
        if (error) throw error;
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

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold gradient-text">Manage Tasks</h1>
        <Button onClick={() => openDialog()} className="gradient-primary border-0 text-primary-foreground font-display text-sm">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </motion.div>

      <div className="space-y-3">
        {tasks.map((task, i) => (
          <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-foreground">{task.title}</h3>
                  <StatusBadge status={task.status} />
                </div>
                <p className="text-xs text-muted-foreground">₹{task.reward} · {task.points} pts · {task.slots_remaining}/{task.slots_total} slots</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-border/30" onClick={() => toggleMutation.mutate(task)}>
                  {task.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="outline" className="border-border/30" onClick={() => openDialog(task)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(task.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {tasks.length === 0 && <p className="text-center text-muted-foreground py-8">No tasks yet. Create one!</p>}
      </div>

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
              <div><label className="text-xs font-medium text-foreground mb-1 block">Slots</label><Input type="number" value={slots} onChange={(e) => setSlots(e.target.value)} placeholder="100" className="bg-muted/50 border-border/30" /></div>
            </div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Task description..." className="bg-muted/50 border-border/30" rows={2} /></div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Review Text</label><Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Text users will copy..." className="bg-muted/50 border-border/30" rows={3} /></div>
            <Button className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editing ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTasks;

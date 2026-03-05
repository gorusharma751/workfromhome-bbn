import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { mockTasks, type Task } from "@/data/mockData";
import { toast } from "sonner";

const AdminTasks = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const handleDelete = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    toast.success("Task deleted");
  };

  const handleToggle = (id: string) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, status: t.status === "active" ? "paused" as const : "active" as const } : t));
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold gradient-text">Manage Tasks</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gradient-primary border-0 text-primary-foreground font-display text-sm">
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
                <p className="text-xs text-muted-foreground">₹{task.reward} · {task.points} pts · {task.slotsRemaining}/{task.slotsTotal} slots</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-border/30" onClick={() => handleToggle(task.id)}>
                  {task.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="outline" className="border-border/30" onClick={() => { setEditing(task); setDialogOpen(true); }}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(task.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-border/30 sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display gradient-text">{editing ? "Edit Task" : "Create Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { label: "Title", placeholder: "Task title", defaultValue: editing?.title },
              { label: "Task Link", placeholder: "https://...", defaultValue: editing?.taskLink },
              { label: "Reward (₹)", placeholder: "20", type: "number", defaultValue: editing?.reward?.toString() },
              { label: "Points", placeholder: "200", type: "number", defaultValue: editing?.points?.toString() },
              { label: "Max Slots", placeholder: "100", type: "number", defaultValue: editing?.slotsTotal?.toString() },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-medium text-foreground mb-1 block">{f.label}</label>
                <Input placeholder={f.placeholder} type={f.type || "text"} defaultValue={f.defaultValue} className="bg-muted/50 border-border/30" />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
              <Textarea placeholder="Task description..." defaultValue={editing?.description} className="bg-muted/50 border-border/30" rows={2} />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Review Text</label>
              <Textarea placeholder="Text users will copy..." defaultValue={editing?.reviewText} className="bg-muted/50 border-border/30" rows={3} />
            </div>
            <Button className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground" onClick={() => { setDialogOpen(false); toast.success(editing ? "Task updated" : "Task created"); }}>
              {editing ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTasks;

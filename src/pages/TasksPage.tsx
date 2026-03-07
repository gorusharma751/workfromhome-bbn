import { useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/TaskCard";
import TaskDetailModal from "@/components/TaskDetailModal";
import SecondFormModal from "@/components/SecondFormModal";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

const TasksPage = () => {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Tables<"tasks"> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [secondFormSub, setSecondFormSub] = useState<any>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's submissions that have 2nd form active
  const { data: mySubmissions = [] } = useQuery({
    queryKey: ["my-submissions"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("task_submissions")
        .select("*, tasks!task_submissions_task_id_fkey(title, second_form_fields)")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const pending2ndForms = mySubmissions.filter(
    (s: any) => s.second_form_status === "active"
  );

  const filteredTasks = tasks.filter(
    (t) => t.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleStart = (task: Tables<"tasks">) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mx-auto max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-2xl font-bold gradient-text">Available Tasks</h1>
          <p className="text-sm text-muted-foreground">Complete tasks & earn rewards</p>
        </motion.div>

        {/* Pending 2nd Forms */}
        {pending2ndForms.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 space-y-2">
            <p className="text-xs font-semibold text-warning flex items-center gap-1">
              <Clock className="h-3 w-3" /> 2nd Form Pending
            </p>
            {pending2ndForms.map((sub: any) => (
              <GlassCard key={sub.id} className="border-warning/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{sub.tasks?.title}</p>
                    <p className="text-xs text-muted-foreground">2nd form is ready to fill</p>
                  </div>
                  <Button size="sm" className="gradient-primary border-0 text-primary-foreground" onClick={() => setSecondFormSub(sub)}>
                    <FileText className="h-3 w-3 mr-1" /> Fill Form
                  </Button>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="pl-10 bg-muted/50 border-border/30" />
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} onStart={handleStart} />
            ))}
            {filteredTasks.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-lg font-display">No tasks found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <TaskDetailModal task={selectedTask} open={modalOpen} onClose={() => setModalOpen(false)} />
      <SecondFormModal submission={secondFormSub} open={!!secondFormSub} onClose={() => setSecondFormSub(null)} />
    </div>
  );
};

export default TasksPage;

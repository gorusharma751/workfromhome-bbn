import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import TaskCard from "@/components/TaskCard";
import TaskDetailModal from "@/components/TaskDetailModal";
import { mockTasks, type Task } from "@/data/mockData";

const TasksPage = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTasks = mockTasks.filter(
    (t) => t.status === "active" && t.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleStart = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mx-auto max-w-md px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold gradient-text">Available Tasks</h1>
          <p className="text-sm text-muted-foreground">Complete tasks & earn rewards</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-10 bg-muted/50 border-border/30"
          />
        </motion.div>

        {/* Task list */}
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
      </div>

      <TaskDetailModal task={selectedTask} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default TasksPage;

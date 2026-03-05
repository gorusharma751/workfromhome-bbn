import { motion } from "framer-motion";
import { Star, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "./GlassCard";
import type { Task } from "@/data/mockData";

interface TaskCardProps {
  task: Task;
  index: number;
  onStart: (task: Task) => void;
}

const TaskCard = ({ task, index, onStart }: TaskCardProps) => {
  const slotsPercentage = ((task.slotsTotal - task.slotsRemaining) / task.slotsTotal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <GlassCard tilt className="relative overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full gradient-primary opacity-20" />

        {/* Category badge */}
        <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Star className="h-3 w-3" />
          {task.category}
        </div>

        <h3 className="mb-1 font-display text-lg font-bold text-foreground">{task.title}</h3>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{task.description}</p>

        {/* Stats row */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-xs font-bold text-primary-foreground">₹</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reward</p>
              <p className="font-display font-bold text-foreground">₹{task.reward}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
              <Zap className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Points</p>
              <p className="font-display font-bold text-foreground">{task.points}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20">
              <Users className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Slots</p>
              <p className="font-display font-bold text-foreground">{task.slotsRemaining}/{task.slotsTotal}</p>
            </div>
          </div>
        </div>

        {/* Slots progress bar */}
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${slotsPercentage}%` }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
          />
        </div>

        <Button
          onClick={() => onStart(task)}
          className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
        >
          Start Task
        </Button>
      </GlassCard>
    </motion.div>
  );
};

export default TaskCard;

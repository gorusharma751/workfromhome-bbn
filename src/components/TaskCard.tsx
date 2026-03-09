import { motion } from "framer-motion";
import { Star, Zap, Users, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "./GlassCard";
import type { Tables } from "@/integrations/supabase/types";

interface TaskCardProps {
  task: Tables<"tasks">;
  index: number;
  onStart: (task: Tables<"tasks">) => void;
}

const TaskCard = ({ task, index, onStart }: TaskCardProps) => {
  const booked = task.slots_total - task.slots_remaining;
  const slotsPercentage = (booked / task.slots_total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <GlassCard tilt className="relative overflow-hidden">
        <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full gradient-primary opacity-20" />

        <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Star className="h-3 w-3" />
          {task.category || "Task"}
        </div>

        <h3 className="mb-1 font-display text-lg font-bold text-foreground">{task.title}</h3>
        {task.description && (
          <p className="mb-4 text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
        )}

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
              <p className="font-display font-bold text-foreground">{booked}/{task.slots_total}</p>
            </div>
          </div>
        </div>

        <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{booked} booked</span>
          <span>{task.slots_remaining} remaining</span>
        </div>
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${slotsPercentage}%` }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
          />
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {(task.approval_days || 1) > 1 && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              <Clock className="h-2.5 w-2.5" /> {task.approval_days} days approval
            </span>
          )}
          {task.has_refund && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning">
              <FileText className="h-2.5 w-2.5" /> Refund available
            </span>
          )}
          {((task.form_fields as any[])?.length > 0) && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
              <FileText className="h-2.5 w-2.5" /> Details required
            </span>
          )}
        </div>

        <Button
          onClick={() => onStart(task)}
          disabled={task.slots_remaining <= 0}
          className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
        >
          {task.slots_remaining <= 0 ? "Slots Full" : "Start Task"}
        </Button>
      </GlassCard>
    </motion.div>
  );
};

export default TaskCard;

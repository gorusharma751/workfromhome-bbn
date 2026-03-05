import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  tilt?: boolean;
}

const GlassCard = ({ children, className, glow = false, tilt = false, ...props }: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-5",
        glow && "animate-pulse-glow",
        tilt && "card-3d",
        className
      )}
      whileHover={tilt ? { rotateY: -2, rotateX: 2, scale: 1.02 } : { scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

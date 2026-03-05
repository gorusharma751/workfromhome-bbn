import { motion } from "framer-motion";
import { Wallet, Zap, Users, Award, LogOut, Download, CreditCard, Bitcoin, ChevronRight, ListChecks, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { mockUser } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mx-auto max-w-md px-4">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-3xl font-bold text-primary-foreground font-display">
            {mockUser.name.charAt(0)}
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">{mockUser.name}</h1>
          <p className="text-sm text-muted-foreground">{mockUser.mobile}</p>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Code: {mockUser.referralCode}
          </div>
        </motion.div>

        {/* Wallet Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4 grid grid-cols-3 gap-3">
          <GlassCard className="text-center py-4 px-2">
            <Wallet className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="font-display text-lg font-bold text-foreground">₹{mockUser.walletBalance}</p>
            <p className="text-[10px] text-muted-foreground">Balance</p>
          </GlassCard>
          <GlassCard className="text-center py-4 px-2">
            <Zap className="mx-auto h-5 w-5 text-accent mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{mockUser.pointsBalance}</p>
            <p className="text-[10px] text-muted-foreground">Points</p>
          </GlassCard>
          <GlassCard className="text-center py-4 px-2">
            <Users className="mx-auto h-5 w-5 text-success mb-1" />
            <p className="font-display text-lg font-bold text-foreground">₹{mockUser.referralEarnings}</p>
            <p className="text-[10px] text-muted-foreground">Referrals</p>
          </GlassCard>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                  <Award className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Total Earnings</p>
                  <p className="text-xs text-muted-foreground">{mockUser.tasksCompleted} tasks completed</p>
                </div>
              </div>
              <p className="font-display text-xl font-bold gradient-text">₹{mockUser.totalEarnings}</p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="mb-4 p-0 overflow-hidden">
            {[
              { icon: Wallet, label: "Withdraw Funds", sub: "Transfer to UPI or Binance", action: () => navigate("/withdraw") },
              { icon: CreditCard, label: "UPI ID", sub: mockUser.upiId || "Not added", action: () => toast.info("Coming soon!") },
              { icon: Bitcoin, label: "Binance Wallet", sub: mockUser.binanceAddress || "Not added", action: () => toast.info("Coming soon!") },
              { icon: ListChecks, label: "My Submissions", sub: "View task history", action: () => toast.info("Coming soon!") },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="flex w-full items-center gap-3 border-b border-border/20 px-5 py-4 text-left transition-colors hover:bg-muted/30 last:border-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </GlassCard>
        </motion.div>

        {/* Install & Logout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <Button className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground" onClick={() => toast.info("PWA install coming soon!")}>
            <Download className="h-4 w-4" /> Install App
          </Button>
          <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 font-display" onClick={() => navigate("/login")}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;

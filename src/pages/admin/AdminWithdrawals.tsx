import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { mockWithdrawals, type WithdrawRequest } from "@/data/mockData";
import { toast } from "sonner";

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);

  const update = (id: string, status: WithdrawRequest["status"]) => {
    setWithdrawals(withdrawals.map((w) => w.id === id ? { ...w, status } : w));
    toast.success(`Withdrawal ${status}`);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">
        Withdrawal Requests
      </motion.h1>

      <div className="space-y-3">
        {withdrawals.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{w.userName}</p>
                  <p className="text-xs text-muted-foreground">{w.method.toUpperCase()} · {w.address}</p>
                  <p className="text-xs text-muted-foreground">{new Date(w.requestedAt).toLocaleString()}</p>
                </div>
                <p className="font-display text-lg font-bold text-foreground">₹{w.amount}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={w.status} />
                  {w.status === "pending" && (
                    <>
                      <Button size="sm" className="bg-success border-0 text-success-foreground hover:bg-success/90" onClick={() => update(w.id, "approved")}>
                        <CheckCircle2 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => update(w.id, "rejected")}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  {w.status === "approved" && (
                    <Button size="sm" className="bg-secondary border-0 text-secondary-foreground hover:bg-secondary/90" onClick={() => update(w.id, "paid")}>
                      <Banknote className="h-3 w-3" /> Paid
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminWithdrawals;

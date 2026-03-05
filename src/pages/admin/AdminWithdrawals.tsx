import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminWithdrawals = () => {
  const queryClient = useQueryClient();

  const { data: withdrawals = [] } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdraw_requests")
        .select("*, profiles!withdraw_requests_user_id_fkey(name)")
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("withdraw_requests")
        .update({ status: status as any, processed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      toast.success("Withdrawal updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">Withdrawal Requests</motion.h1>

      <div className="space-y-3">
        {withdrawals.map((w: any, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{w.profiles?.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{w.method.toUpperCase()} · {w.address}</p>
                  <p className="text-xs text-muted-foreground">{new Date(w.requested_at).toLocaleString()}</p>
                </div>
                <p className="font-display text-lg font-bold text-foreground">₹{w.amount}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={w.status} />
                  {w.status === "pending" && (
                    <>
                      <Button size="sm" className="bg-success border-0 text-success-foreground hover:bg-success/90" onClick={() => updateMutation.mutate({ id: w.id, status: "approved" })}>
                        <CheckCircle2 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => updateMutation.mutate({ id: w.id, status: "rejected" })}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  {w.status === "approved" && (
                    <Button size="sm" className="bg-secondary border-0 text-secondary-foreground hover:bg-secondary/90" onClick={() => updateMutation.mutate({ id: w.id, status: "paid" })}>
                      <Banknote className="h-3 w-3" /> Paid
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {withdrawals.length === 0 && <p className="text-center text-muted-foreground py-8">No withdrawal requests yet</p>}
      </div>
    </div>
  );
};

export default AdminWithdrawals;

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminRefunds = () => {
  const queryClient = useQueryClient();

  const { data: refunds = [] } = useQuery({
    queryKey: ["admin-refunds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("refunds")
        .select("*, orders(full_name, deal_id, deals(title))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("refunds").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
      toast.success("Refund status updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const statusColors: Record<string, string> = {
    pending: "bg-warning/20 text-warning",
    approved: "bg-success/20 text-success",
    rejected: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">Refund Requests</motion.h1>

      <div className="space-y-3">
        {refunds.map((refund: any, i: number) => (
          <motion.div key={refund.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground text-sm">{(refund as any).orders?.full_name || "Unknown"}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[refund.status]}`}>
                      {refund.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{(refund as any).orders?.deals?.title || "Unknown Deal"}</p>
                  <p className="text-xs text-foreground mt-1"><strong>Reason:</strong> {refund.reason}</p>
                  {refund.details && <p className="text-xs text-muted-foreground">{refund.details}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(refund.created_at).toLocaleString()}</p>
                </div>
                {refund.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-success border-0 text-success-foreground hover:bg-success/90" onClick={() => updateMutation.mutate({ id: refund.id, status: "approved" })} disabled={updateMutation.isPending}>
                      <CheckCircle2 className="h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => updateMutation.mutate({ id: refund.id, status: "rejected" })} disabled={updateMutation.isPending}>
                      <XCircle className="h-3 w-3" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {refunds.length === 0 && <p className="text-center text-muted-foreground py-8">No refund requests</p>}
      </div>
    </div>
  );
};

export default AdminRefunds;

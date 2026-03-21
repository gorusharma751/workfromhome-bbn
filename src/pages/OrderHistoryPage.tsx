import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-all-orders"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*, deals(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: refunds = [] } = useQuery({
    queryKey: ["my-refunds"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("refunds")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getRefundForOrder = (orderId: string) => refunds.find((r: any) => r.order_id === orderId);

  const statusColors: Record<string, string> = {
    confirmed: "bg-primary/20 text-primary",
    processing: "bg-warning/20 text-warning",
    shipped: "bg-secondary/20 text-secondary",
    delivered: "bg-success/20 text-success",
    cancelled: "bg-destructive/20 text-destructive",
    pending: "bg-warning/20 text-warning",
    approved: "bg-success/20 text-success",
    rejected: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mx-auto max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="font-display text-2xl font-bold gradient-text">My Orders</h1>
          <p className="text-sm text-muted-foreground">Track your orders & refunds</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted/30 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-display">No orders yet</p>
            <p className="text-sm">Check out our deals to place your first order!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any, i: number) => {
              const refund = getRefundForOrder(order.id);
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{(order as any).deals?.title || "Unknown Deal"}</p>
                        <p className="text-[10px] text-muted-foreground">ID: {order.id.slice(0, 8).toUpperCase()}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                          {refund && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[refund.status]} flex items-center gap-0.5`}>
                              <RotateCcw className="h-2 w-2" /> Refund: {refund.status}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;

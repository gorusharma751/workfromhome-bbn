import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Search, CheckCircle2, XCircle, Truck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "@/components/GlassCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [filterDeal, setFilterDeal] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, deals(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["admin-deals-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deals").select("id, title");
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filtered = orders.filter((o: any) => {
    if (filterDeal !== "all" && o.deal_id !== filterDeal) return false;
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    confirmed: "bg-primary/20 text-primary",
    processing: "bg-warning/20 text-warning",
    shipped: "bg-secondary/20 text-secondary",
    delivered: "bg-success/20 text-success",
    cancelled: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-4">Orders</motion.h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Select value={filterDeal} onValueChange={setFilterDeal}>
          <SelectTrigger className="w-40 bg-muted/50 border-border/30 text-xs">
            <SelectValue placeholder="Filter by deal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Deals</SelectItem>
            {deals.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 bg-muted/50 border-border/30 text-xs">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((order: any, i: number) => (
          <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <GlassCard>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground text-sm">{order.full_name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{(order as any).deals?.title || "Unknown Deal"}</p>
                  <p className="text-xs text-muted-foreground">📱 {order.phone} · Qty: {order.quantity}</p>
                  <p className="text-xs text-muted-foreground truncate">📍 {order.address}</p>
                  {order.note && <p className="text-xs text-foreground mt-1">"{order.note}"</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {["confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                    <Button key={s} size="sm" variant={order.status === s ? "default" : "outline"}
                      className={`text-[10px] h-7 px-2 ${order.status === s ? "gradient-primary border-0 text-primary-foreground" : "border-border/30"}`}
                      onClick={() => updateMutation.mutate({ id: order.id, status: s })}
                      disabled={updateMutation.isPending}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No orders found</p>}
      </div>
    </div>
  );
};

export default AdminOrders;

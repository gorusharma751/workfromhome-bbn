import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, ShoppingCart, RotateCcw, ListOrdered, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "@/components/GlassCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface DealDetailModalProps {
  deal: any;
  open: boolean;
  onClose: () => void;
}

const DealDetailModal = ({ deal, open, onClose }: DealDetailModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("order");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const [refundReason, setRefundReason] = useState("");
  const [refundDetails, setRefundDetails] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  const { data: myOrders = [] } = useQuery({
    queryKey: ["my-orders", deal?.id],
    queryFn: async () => {
      if (!user || !deal) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .eq("deal_id", deal.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!deal,
  });

  if (!deal) return null;

  const handleOrder = async () => {
    if (!user) return;
    if (!fullName.trim()) { toast.error("Please enter your full name"); return; }
    if (!phone.trim()) { toast.error("Please enter your phone number"); return; }
    if (!address.trim()) { toast.error("Please enter your address"); return; }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.from("orders").insert({
        user_id: user.id,
        deal_id: deal.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        quantity: parseInt(quantity) || 1,
        note: note.trim() || null,
      }).select("id").single();
      if (error) throw error;
      setOrderSuccess(data.id);
      queryClient.invalidateQueries({ queryKey: ["my-orders", deal.id] });
      queryClient.invalidateQueries({ queryKey: ["my-all-orders"] });
      toast.success("Order placed successfully!");
      setFullName(""); setPhone(""); setAddress(""); setQuantity("1"); setNote("");
    } catch (err: any) {
      toast.error(err.message || "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefund = async () => {
    if (!user || myOrders.length === 0) return;
    if (!refundReason.trim()) { toast.error("Please enter refund reason"); return; }

    setRefundSubmitting(true);
    try {
      const { error } = await supabase.from("refunds").insert({
        order_id: myOrders[0].id,
        user_id: user.id,
        reason: refundReason.trim(),
        details: refundDetails.trim() || null,
      });
      if (error) throw error;
      toast.success("Refund request submitted!");
      setRefundReason(""); setRefundDetails("");
    } catch (err: any) {
      toast.error(err.message || "Refund request failed");
    } finally {
      setRefundSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setOrderSuccess(null);
    setTab("order");
  };

  const rules = deal.rules ? deal.rules.split("\n").filter((r: string) => r.trim()) : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border/30 sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl gradient-text">{deal.title}</DialogTitle>
        </DialogHeader>

        {deal.photo_url && (
          <img src={deal.photo_url} alt={deal.title} className="w-full h-40 object-cover rounded-xl" />
        )}

        <p className="text-sm text-muted-foreground">{deal.description}</p>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-display font-bold text-foreground">₹{deal.price}</span>
          {deal.deal_link && (
            <a href={deal.deal_link} target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1 text-xs">
              <ExternalLink className="h-3 w-3" /> View Product
            </a>
          )}
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="order"><ShoppingCart className="h-3 w-3 mr-1" /> Order</TabsTrigger>
            <TabsTrigger value="refund"><RotateCcw className="h-3 w-3 mr-1" /> Refund</TabsTrigger>
            <TabsTrigger value="rules"><ListOrdered className="h-3 w-3 mr-1" /> Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="order">
            {orderSuccess ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
                <p className="font-display font-bold text-foreground">Order Confirmed!</p>
                <p className="text-xs text-muted-foreground">Order ID: {orderSuccess.slice(0, 8).toUpperCase()}</p>
                <Button variant="outline" onClick={() => setOrderSuccess(null)} className="border-border/30">
                  Place Another Order
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3 py-2">
                <div><label className="text-xs font-medium text-foreground mb-1 block">Full Name *</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="bg-muted/50 border-border/30" /></div>
                <div><label className="text-xs font-medium text-foreground mb-1 block">Phone *</label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="bg-muted/50 border-border/30" /></div>
                <div><label className="text-xs font-medium text-foreground mb-1 block">Address *</label>
                  <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address" className="bg-muted/50 border-border/30 resize-none" rows={2} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium text-foreground mb-1 block">Quantity</label>
                    <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" className="bg-muted/50 border-border/30" /></div>
                </div>
                <div><label className="text-xs font-medium text-foreground mb-1 block">Note (optional)</label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any special instructions..." className="bg-muted/50 border-border/30 resize-none" rows={2} /></div>
                <Button onClick={handleOrder} disabled={submitting} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
                  {submitting ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="refund">
            {myOrders.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <RotateCcw className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Place an order first to request a refund</p>
              </div>
            ) : (
              <div className="space-y-3 py-2">
                <div className="rounded-lg bg-muted/30 p-2 text-xs">
                  <span className="text-muted-foreground">Order ID: </span>
                  <span className="text-foreground font-medium">{myOrders[0].id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div><label className="text-xs font-medium text-foreground mb-1 block">Reason *</label>
                  <Input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Why do you need a refund?" className="bg-muted/50 border-border/30" /></div>
                <div><label className="text-xs font-medium text-foreground mb-1 block">Details (optional)</label>
                  <Textarea value={refundDetails} onChange={(e) => setRefundDetails(e.target.value)} placeholder="Additional details..." className="bg-muted/50 border-border/30 resize-none" rows={2} /></div>
                <Button onClick={handleRefund} disabled={refundSubmitting} className="w-full bg-destructive border-0 font-display font-semibold text-destructive-foreground hover:bg-destructive/90">
                  {refundSubmitting ? "Submitting..." : "Request Refund"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules">
            {rules.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">No rules specified for this deal</p>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                {rules.map((rule: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/30 p-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-foreground">{rule}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DealDetailModal;

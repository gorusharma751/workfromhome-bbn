import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import DealDetailPage from "@/components/DealDetailPage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DealsPage = () => {
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (selectedDeal) {
    return <DealDetailPage deal={selectedDeal} onBack={() => setSelectedDeal(null)} />;
  }

  return (
    <div className="min-h-screen pb-24 pt-14">
      <div className="mx-auto max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-2xl font-bold gradient-text">Deals</h1>
          <p className="text-sm text-muted-foreground">Exclusive deals & offers for you</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-display">No deals available</p>
            <p className="text-sm">Check back soon for new offers!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal: any, i: number) => {
              const slotsLeft = (deal.total_slots || 0) - (deal.slots_booked || 0);
              return (
                <motion.div key={deal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <GlassCard tilt className="relative overflow-hidden p-0">
                    {deal.photos?.[0] && (
                      <img src={deal.photos[0]} alt={deal.title} className="w-full h-44 object-cover rounded-t-2xl" />
                    )}
                    <div className="p-4">
                      <h3 className="font-display text-lg font-bold text-foreground uppercase mb-1">{deal.title}</h3>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-muted-foreground line-through">₹{deal.pp_price}</span>
                        <span className="font-display font-bold text-success text-lg">₹{deal.deal_price}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                          {slotsLeft > 0 ? `${slotsLeft}/${deal.total_slots} slots` : "Full"}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">{deal.review_type} deal</span>
                      </div>
                      <Button
                        onClick={() => setSelectedDeal(deal)}
                        className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground"
                        disabled={slotsLeft <= 0}
                      >
                        <ExternalLink className="h-4 w-4" /> {slotsLeft > 0 ? "View Deal" : "Slots Full"}
                      </Button>
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

export default DealsPage;

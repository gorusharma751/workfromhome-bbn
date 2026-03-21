import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import DealDetailModal from "@/components/DealDetailModal";
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
            {deals.map((deal: any, i: number) => (
              <motion.div key={deal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <GlassCard tilt className="relative overflow-hidden p-0">
                  {deal.photo_url && (
                    <img src={deal.photo_url} alt={deal.title} className="w-full h-40 object-cover rounded-t-2xl" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg font-bold text-foreground">{deal.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">Active</span>
                    </div>
                    {deal.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{deal.description}</p>
                    )}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                          <span className="text-xs font-bold text-primary-foreground">₹</span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="font-display font-bold text-foreground">₹{deal.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20">
                          <Users className="h-4 w-4 text-secondary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Slots</p>
                          <p className="font-display font-bold text-foreground">{deal.total_slots}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedDeal(deal)}
                      className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground"
                    >
                      <ExternalLink className="h-4 w-4" /> View Deal
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <DealDetailModal deal={selectedDeal} open={!!selectedDeal} onClose={() => setSelectedDeal(null)} />
    </div>
  );
};

export default DealsPage;

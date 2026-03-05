import { motion } from "framer-motion";
import { Copy, Share2, MessageCircle, Users, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ReferEarnPage = () => {
  const { profile } = useAuth();

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals"],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("referrals")
        .select("*, referred:profiles!referrals_referred_id_fkey(name)")
        .eq("referrer_id", profile.id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const { data: settings } = useQuery({
    queryKey: ["admin_settings", "referral"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "referral")
        .single();
      return data?.value as { enabled: boolean; l1_percentage: number; l2_percentage: number; l3_percentage: number } | null;
    },
  });

  if (!profile) return null;

  const referralLink = `${window.location.origin}/signup?ref=${profile.referral_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Join Work From Home and earn money! Use my referral link: ${referralLink}`)}`, "_blank");
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join Work From Home and earn money!")}`, "_blank");
  };

  const l1Refs = referrals.filter((r) => r.level === 1);
  const l2Refs = referrals.filter((r) => r.level === 2);
  const l3Refs = referrals.filter((r) => r.level === 3);
  const totalEarnings = referrals.reduce((s, r) => s + Number(r.earnings), 0);

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mx-auto max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-2xl font-bold gradient-text">Refer & Earn</h1>
          <p className="text-sm text-muted-foreground">Invite friends & earn commissions</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="mb-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full gradient-primary opacity-10" />
            <p className="text-xs text-muted-foreground mb-1">Your Referral Code</p>
            <p className="font-display text-2xl font-bold text-foreground mb-1">{profile.referral_code}</p>
            <p className="text-xs text-muted-foreground mb-4 break-all">{referralLink}</p>
            <div className="flex gap-2">
              <Button onClick={handleCopyLink} size="sm" className="flex-1 gradient-primary border-0 text-primary-foreground font-semibold">
                <Copy className="h-4 w-4" /> Copy Link
              </Button>
              <Button onClick={handleShareWhatsApp} size="sm" variant="outline" className="border-success/30 text-success hover:bg-success/10">
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button onClick={handleShareTelegram} size="sm" variant="outline" className="border-secondary/30 text-secondary hover:bg-secondary/10">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4 grid grid-cols-3 gap-3">
          <GlassCard className="text-center py-4">
            <Users className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{referrals.length}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </GlassCard>
          <GlassCard className="text-center py-4">
            <TrendingUp className="mx-auto h-5 w-5 text-success mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{referrals.length}</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </GlassCard>
          <GlassCard className="text-center py-4">
            <Award className="mx-auto h-5 w-5 text-warning mb-1" />
            <p className="font-display text-lg font-bold text-foreground">₹{totalEarnings}</p>
            <p className="text-[10px] text-muted-foreground">Earned</p>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="mb-4">
            <h3 className="font-display font-bold text-foreground mb-3">Commission Levels</h3>
            <div className="space-y-2">
              {[
                { level: 1, pct: settings?.l1_percentage ?? 15 },
                { level: 2, pct: settings?.l2_percentage ?? 10 },
                { level: 3, pct: settings?.l3_percentage ?? 5 },
              ].map((l) => (
                <div key={l.level} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">Level {l.level}</span>
                  <span className="font-display font-bold gradient-text">{l.pct}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard>
            <h3 className="font-display font-bold text-foreground mb-3">Referral Tree</h3>
            {[
              { label: "Level 1", refs: l1Refs },
              { label: "Level 2", refs: l2Refs },
              { label: "Level 3", refs: l3Refs },
            ].map(({ label, refs }) => (
              <div key={label} className="mb-3 last:mb-0">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">{label}</p>
                {refs.length === 0 && <p className="text-xs text-muted-foreground/50 italic">No referrals yet</p>}
                {refs.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-sm text-foreground">{(r as any).referred?.name || "User"}</span>
                    </div>
                    <span className="text-xs font-semibold text-success">+₹{r.earnings}</span>
                  </div>
                ))}
              </div>
            ))}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default ReferEarnPage;

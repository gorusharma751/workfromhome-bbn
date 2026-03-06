import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Zap, Users, Award, LogOut, Download, CreditCard, Bitcoin, ChevronRight, ListChecks, Share2, MessageCircle, Headphones, Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useAppSettings } from "@/hooks/useAppSettings";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, user, signOut, isAdmin, refreshProfile } = useAuth();
  const { canInstall, isInstalled, install } = usePWAInstall();
  const { telegram } = useAppSettings();
  const [editingUpi, setEditingUpi] = useState(false);
  const [upiValue, setUpiValue] = useState(profile?.upi_id || "");
  const [savingUpi, setSavingUpi] = useState(false);

  if (!profile || !user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleInstall = async () => {
    if (canInstall) {
      const accepted = await install();
      if (accepted) toast.success("App installed successfully!");
    } else if (isInstalled) {
      toast.info("App is already installed!");
    } else {
      toast.info("Open in browser → Menu → Add to Home Screen");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Work From Home - Earn Money Online",
      text: `Join Work From Home and earn money! Use my referral code: ${profile.referral_code}`,
      url: `${window.location.origin}/signup?ref=${profile.referral_code}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      // User cancelled share
    }
  };

  const handleSaveUpi = async () => {
    if (!upiValue.trim()) { toast.error("Enter a valid UPI ID"); return; }
    setSavingUpi(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ upi_id: upiValue.trim() })
        .eq("user_id", user.id);
      if (error) throw error;
      await refreshProfile();
      setEditingUpi(false);
      toast.success("UPI ID saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSavingUpi(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mx-auto max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-3xl font-bold text-primary-foreground font-display">
            {profile.name.charAt(0)}
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Code: {profile.referral_code}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4 grid grid-cols-3 gap-3">
          <GlassCard className="text-center py-4 px-2">
            <Wallet className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="font-display text-lg font-bold text-foreground">₹{profile.wallet_balance}</p>
            <p className="text-[10px] text-muted-foreground">Balance</p>
          </GlassCard>
          <GlassCard className="text-center py-4 px-2">
            <Zap className="mx-auto h-5 w-5 text-accent mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{profile.points_balance}</p>
            <p className="text-[10px] text-muted-foreground">Points</p>
          </GlassCard>
          <GlassCard className="text-center py-4 px-2">
            <Users className="mx-auto h-5 w-5 text-success mb-1" />
            <p className="font-display text-lg font-bold text-foreground">₹{profile.referral_earnings}</p>
            <p className="text-[10px] text-muted-foreground">Referrals</p>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                  <Award className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Total Earnings</p>
                  <p className="text-xs text-muted-foreground">{profile.tasks_completed} tasks completed</p>
                </div>
              </div>
              <p className="font-display text-xl font-bold gradient-text">₹{profile.total_earnings}</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="mb-4 p-0 overflow-hidden">
            {/* UPI ID - Editable */}
            <div className="flex w-full items-center gap-3 border-b border-border/20 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              {editingUpi ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={upiValue}
                    onChange={(e) => setUpiValue(e.target.value)}
                    placeholder="name@upi"
                    className="h-8 bg-muted/50 border-border/30 text-sm"
                    autoFocus
                  />
                  <button onClick={handleSaveUpi} disabled={savingUpi} className="rounded-lg bg-success/20 p-1.5 text-success">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => { setEditingUpi(false); setUpiValue(profile.upi_id || ""); }} className="rounded-lg bg-destructive/20 p-1.5 text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditingUpi(true)} className="flex flex-1 items-center justify-between text-left">
                  <div>
                    <p className="text-sm font-medium text-foreground">UPI ID</p>
                    <p className="text-xs text-muted-foreground">{profile.upi_id || "Tap to add"}</p>
                  </div>
                  <Edit3 className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {[
              { icon: Wallet, label: "Withdraw Funds", sub: "Transfer to UPI or Binance", action: () => navigate("/withdraw") },
              { icon: Bitcoin, label: "Binance Wallet", sub: profile.binance_address || "Not added", action: () => toast.info("Coming soon!") },
              { icon: ListChecks, label: "My Submissions", sub: "View task history", action: () => toast.info("Coming soon!") },
              ...(isAdmin ? [{ icon: Award, label: "Admin Panel", sub: "Manage platform", action: () => navigate("/admin") }] : []),
            ].map((item, i) => (
              <button key={i} onClick={item.action} className="flex w-full items-center gap-3 border-b border-border/20 px-5 py-4 text-left transition-colors hover:bg-muted/30 last:border-0">
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

        {/* Telegram & Support */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard className="mb-4 p-0 overflow-hidden">
            <a href={telegram.group_link} target="_blank" rel="noopener noreferrer" className="flex w-full items-center gap-3 border-b border-border/20 px-5 py-4 text-left transition-colors hover:bg-muted/30">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(200,80%,50%)]/20">
                <MessageCircle className="h-4 w-4 text-[hsl(200,80%,50%)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Telegram Updates</p>
                <p className="text-xs text-muted-foreground">Join our channel for updates</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
            <a href={telegram.support_link} target="_blank" rel="noopener noreferrer" className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/20">
                <Headphones className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Support</p>
                <p className="text-xs text-muted-foreground">Contact us on Telegram</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground" onClick={handleInstall}>
              <Download className="h-4 w-4" /> {isInstalled ? "Installed ✓" : "Install App"}
            </Button>
            <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10 font-display font-semibold" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Share App
            </Button>
          </div>
          <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 font-display" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;

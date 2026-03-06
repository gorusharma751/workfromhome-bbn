import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, Send, Image, Type } from "lucide-react";

const AdminSettings = () => {
  const [telegram, setTelegram] = useState({ group_link: "", support_link: "" });
  const [branding, setBranding] = useState({ app_name: "WorkFromHome", logo_url: "" });
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [tgRes, brandRes] = await Promise.all([
        supabase.from("admin_settings").select("value").eq("key", "telegram").single(),
        supabase.from("admin_settings").select("value").eq("key", "app_branding").single(),
      ]);
      if (tgRes.data?.value) setTelegram(tgRes.data.value as any);
      if (brandRes.data?.value) setBranding(brandRes.data.value as any);
    };
    load();
  }, []);

  const saveTelegram = async () => {
    setSaving("telegram");
    const { error } = await supabase
      .from("admin_settings")
      .update({ value: telegram as any, updated_at: new Date().toISOString() })
      .eq("key", "telegram");
    if (error) toast.error(error.message);
    else toast.success("Telegram links updated!");
    setSaving(null);
  };

  const saveBranding = async () => {
    setSaving("branding");
    const { error } = await supabase
      .from("admin_settings")
      .update({ value: branding as any, updated_at: new Date().toISOString() })
      .eq("key", "app_branding");
    if (error) toast.error(error.message);
    else toast.success("App branding updated!");
    setSaving(null);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">
        <Settings className="inline h-6 w-6 mr-2" />
        App Settings
      </motion.h1>

      {/* Telegram Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Send className="h-5 w-5 text-primary" />
            <h3 className="font-display font-bold text-foreground">Telegram Links</h3>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Group Link</label>
            <Input
              placeholder="https://t.me/yourchannel"
              value={telegram.group_link}
              onChange={(e) => setTelegram({ ...telegram, group_link: e.target.value })}
              className="bg-muted/50 border-border/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Support Link</label>
            <Input
              placeholder="https://t.me/yoursupport"
              value={telegram.support_link}
              onChange={(e) => setTelegram({ ...telegram, support_link: e.target.value })}
              className="bg-muted/50 border-border/30"
            />
          </div>
          <Button onClick={saveTelegram} disabled={saving === "telegram"} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
            {saving === "telegram" ? "Saving..." : "Save Telegram Links"}
          </Button>
        </GlassCard>
      </motion.div>

      {/* App Branding */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Type className="h-5 w-5 text-primary" />
            <h3 className="font-display font-bold text-foreground">App Branding</h3>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">App Name</label>
            <Input
              placeholder="WorkFromHome"
              value={branding.app_name}
              onChange={(e) => setBranding({ ...branding, app_name: e.target.value })}
              className="bg-muted/50 border-border/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Logo URL</label>
            <Input
              placeholder="https://example.com/logo.png"
              value={branding.logo_url}
              onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
              className="bg-muted/50 border-border/30"
            />
            {branding.logo_url && (
              <div className="mt-3 flex justify-center">
                <img src={branding.logo_url} alt="App Logo Preview" className="h-16 w-16 rounded-xl object-cover border border-border/30" />
              </div>
            )}
          </div>
          <Button onClick={saveBranding} disabled={saving === "branding"} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
            {saving === "branding" ? "Saving..." : "Save Branding"}
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AdminSettings;

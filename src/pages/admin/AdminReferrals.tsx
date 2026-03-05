import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import GlassCard from "@/components/GlassCard";
import { referralSettings } from "@/data/mockData";
import { toast } from "sonner";

const AdminReferrals = () => {
  const [settings, setSettings] = useState(referralSettings);

  const handleSave = () => toast.success("Referral settings saved!");

  return (
    <div className="mx-auto max-w-xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">
        Referral Settings
      </motion.h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Referral System</p>
              <p className="text-xs text-muted-foreground">Toggle referral earnings on/off</p>
            </div>
            <Switch checked={settings.enabled} onCheckedChange={(v) => setSettings({ ...settings, enabled: v })} />
          </div>

          {[
            { label: "Level 1 Commission (%)", key: "l1Percentage" as const },
            { label: "Level 2 Commission (%)", key: "l2Percentage" as const },
            { label: "Level 3 Commission (%)", key: "l3Percentage" as const },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{f.label}</label>
              <Input
                type="number"
                value={settings[f.key]}
                onChange={(e) => setSettings({ ...settings, [f.key]: parseInt(e.target.value) || 0 })}
                className="bg-muted/50 border-border/30"
              />
            </div>
          ))}

          <Button onClick={handleSave} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
            Save Settings
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AdminReferrals;

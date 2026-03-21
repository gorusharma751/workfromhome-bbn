import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, Send, Type, Upload, Palette, Megaphone } from "lucide-react";

const AdminSettings = () => {
  const [telegram, setTelegram] = useState({ group_link: "", support_link: "" });
  const [branding, setBranding] = useState({ app_name: "WorkFromHome", logo_url: "", tagline: "", primary_color: "", accent_color: "" });
  const [announcement, setAnnouncement] = useState({ text: "", active: true });
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["telegram", "app_branding", "announcement"]);
      if (data) {
        for (const row of data) {
          if (row.key === "telegram" && row.value) setTelegram(row.value as any);
          if (row.key === "app_branding" && row.value) setBranding({ ...branding, ...(row.value as any) });
          if (row.key === "announcement" && row.value) setAnnouncement(row.value as any);
        }
      }
    };
    load();
  }, []);

  const saveSetting = async (key: string, value: any) => {
    setSaving(key);
    // Try update first, then insert if no rows affected
    const { data, error } = await supabase
      .from("admin_settings")
      .update({ value: value as any, updated_at: new Date().toISOString() })
      .eq("key", key)
      .select();
    if (error) { toast.error(error.message); setSaving(null); return; }
    if (!data || data.length === 0) {
      const { error: insertErr } = await supabase
        .from("admin_settings")
        .insert({ key, value: value as any });
      if (insertErr) { toast.error(insertErr.message); setSaving(null); return; }
    }
    toast.success(`${key} updated!`);
    setSaving(null);
  };

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `branding/logo.${ext}`;
      const { error: uploadError } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
      setBranding({ ...branding, logo_url: data.publicUrl });
      toast.success("Logo uploaded! Click Save to apply.");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
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
            <Input placeholder="https://t.me/yourchannel" value={telegram.group_link} onChange={(e) => setTelegram({ ...telegram, group_link: e.target.value })} className="bg-muted/50 border-border/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Support Link</label>
            <Input placeholder="https://t.me/yoursupport" value={telegram.support_link} onChange={(e) => setTelegram({ ...telegram, support_link: e.target.value })} className="bg-muted/50 border-border/30" />
          </div>
          <Button onClick={() => saveSetting("telegram", telegram)} disabled={saving === "telegram"} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
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
            <Input placeholder="WorkFromHome" value={branding.app_name} onChange={(e) => setBranding({ ...branding, app_name: e.target.value })} className="bg-muted/50 border-border/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Tagline / Subtitle</label>
            <Input placeholder="Earn money from home" value={branding.tagline || ""} onChange={(e) => setBranding({ ...branding, tagline: e.target.value })} className="bg-muted/50 border-border/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Logo</label>
            <div className="space-y-2">
              <Input placeholder="https://example.com/logo.png" value={branding.logo_url} onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })} className="bg-muted/50 border-border/30" />
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/50 py-2 px-3 text-xs text-muted-foreground hover:border-primary/50 transition-colors">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Or upload logo file"}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} disabled={uploading} />
                </label>
                {branding.logo_url && (
                  <img src={branding.logo_url} alt="Logo Preview" className="h-12 w-12 rounded-xl object-cover border border-border/30" />
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={branding.primary_color || "#8B5CF6"} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} className="h-10 w-10 rounded-lg border border-border/30 cursor-pointer" />
                <Input value={branding.primary_color || ""} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} placeholder="#8B5CF6" className="bg-muted/50 border-border/30 text-sm flex-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={branding.accent_color || "#06B6D4"} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} className="h-10 w-10 rounded-lg border border-border/30 cursor-pointer" />
                <Input value={branding.accent_color || ""} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} placeholder="#06B6D4" className="bg-muted/50 border-border/30 text-sm flex-1" />
              </div>
            </div>
          </div>
          <Button onClick={() => saveSetting("app_branding", branding)} disabled={saving === "app_branding"} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
            {saving === "app_branding" ? "Saving..." : "Save Branding"}
          </Button>
        </GlassCard>
      </motion.div>

      {/* Announcement */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h3 className="font-display font-bold text-foreground">Announcement Banner</h3>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Announcement Text</label>
            <Textarea placeholder="🎉 New deals available! Check them out..." value={announcement.text} onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })} className="bg-muted/50 border-border/30" rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={announcement.active} onChange={(e) => setAnnouncement({ ...announcement, active: e.target.checked })} className="rounded" />
            <label className="text-sm text-foreground">Show announcement</label>
          </div>
          <Button onClick={() => saveSetting("announcement", announcement)} disabled={saving === "announcement"} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
            {saving === "announcement" ? "Saving..." : "Save Announcement"}
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AdminSettings;

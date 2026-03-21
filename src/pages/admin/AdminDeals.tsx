import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GlassCard from "@/components/GlassCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDeals = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [dealLink, setDealLink] = useState("");
  const [price, setPrice] = useState("");
  const [totalSlots, setTotalSlots] = useState("10");
  const [rules, setRules] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: deals = [] } = useQuery({
    queryKey: ["admin-deals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setTitle(""); setDescription(""); setPhotoUrl(""); setDealLink("");
    setPrice(""); setTotalSlots("10"); setRules("");
  };

  const openDialog = (deal?: any) => {
    if (deal) {
      setEditing(deal);
      setTitle(deal.title); setDescription(deal.description || "");
      setPhotoUrl(deal.photo_url || ""); setDealLink(deal.deal_link || "");
      setPrice(String(deal.price)); setTotalSlots(String(deal.total_slots));
      setRules(deal.rules || "");
    } else {
      setEditing(null); resetForm();
    }
    setDialogOpen(true);
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `deals/deal_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
      toast.success("Photo uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title, description, photo_url: photoUrl || null, deal_link: dealLink || null,
        price: parseFloat(price) || 0, total_slots: parseInt(totalSlots) || 10,
        rules: rules || null,
      };
      if (editing) {
        const { error } = await supabase.from("deals").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("deals").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
      setDialogOpen(false);
      toast.success(editing ? "Deal updated" : "Deal created");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-deals"] }); toast.success("Deal deleted"); },
  });

  const toggleMutation = useMutation({
    mutationFn: async (deal: any) => {
      const { error } = await supabase.from("deals").update({ active: !deal.active }).eq("id", deal.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-deals"] }),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold gradient-text">Manage Deals</h1>
        <Button onClick={() => openDialog()} className="gradient-primary border-0 text-primary-foreground font-display text-sm">
          <Plus className="h-4 w-4" /> Add Deal
        </Button>
      </motion.div>

      <div className="space-y-3">
        {deals.map((deal: any, i: number) => (
          <motion.div key={deal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="flex flex-col md:flex-row md:items-center gap-3">
              {deal.photo_url && <img src={deal.photo_url} alt="" className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-foreground">{deal.title}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${deal.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                    {deal.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">₹{deal.price} · {deal.total_slots} slots</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-border/30" onClick={() => toggleMutation.mutate(deal)}>
                  {deal.active ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="outline" className="border-border/30" onClick={() => openDialog(deal)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(deal.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {deals.length === 0 && <p className="text-center text-muted-foreground py-8">No deals yet. Create one!</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-border/30 sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display gradient-text">{editing ? "Edit Deal" : "Create Deal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div><label className="text-xs font-medium text-foreground mb-1 block">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deal title" className="bg-muted/50 border-border/30" /></div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deal description..." className="bg-muted/50 border-border/30" rows={2} /></div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Deal Link</label>
              <Input value={dealLink} onChange={(e) => setDealLink(e.target.value)} placeholder="https://..." className="bg-muted/50 border-border/30" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium text-foreground mb-1 block">Price (₹)</label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="299" className="bg-muted/50 border-border/30" /></div>
              <div><label className="text-xs font-medium text-foreground mb-1 block">Total Slots</label>
                <Input type="number" value={totalSlots} onChange={(e) => setTotalSlots(e.target.value)} placeholder="10" className="bg-muted/50 border-border/30" /></div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Photo</label>
              <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Photo URL" className="bg-muted/50 border-border/30 mb-2" />
              <label className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/50 py-2 px-3 text-xs text-muted-foreground hover:border-primary/50 transition-colors">
                  {uploading ? "Uploading..." : "Or upload photo"}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} disabled={uploading} />
              </label>
              {photoUrl && <img src={photoUrl} alt="Preview" className="mt-2 h-20 rounded-xl object-cover" />}
            </div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Rules (one per line)</label>
              <Textarea value={rules} onChange={(e) => setRules(e.target.value)} placeholder="Rule 1&#10;Rule 2&#10;Rule 3" className="bg-muted/50 border-border/30" rows={4} /></div>
            <Button className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editing ? "Update Deal" : "Create Deal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDeals;

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, X, Upload, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import GlassCard from "@/components/GlassCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEFAULT_RULES = [
  "Review after X days of delivery",
  "Fill refund form within 25 days of order date",
  "No refund for voucher/coupon use",
  "Wrong mediator name = no refund",
  "No cancellation or return allowed",
  "Payment time 45-50 working days",
  "Saturday Sunday Govt Holiday not counted",
  "All details to be filled in desktop mode only",
  "Ignore at your own risk",
];

const DEFAULT_ORDER_DETAILS = ["Order Screenshot", "Order ID", "Reviewer Name"];

const AdminDeals = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  // Section 1
  const [title, setTitle] = useState("");
  const [productLink, setProductLink] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [ppPrice, setPpPrice] = useState("");
  const [dealPrice, setDealPrice] = useState("");

  // Section 2
  const [reviewType, setReviewType] = useState("original");
  const [reviewWordLimit, setReviewWordLimit] = useState("");
  const [ratingLimit, setRatingLimit] = useState("");
  const [reviewDays, setReviewDays] = useState("");
  const [mediatorName, setMediatorName] = useState("");
  const [colorInstruction, setColorInstruction] = useState("");

  // Section 3
  const [orderDetails, setOrderDetails] = useState<string[]>([...DEFAULT_ORDER_DETAILS]);
  const [customField, setCustomField] = useState("");

  // Section 4
  const [rules, setRules] = useState<string[]>([...DEFAULT_RULES]);
  const [newRule, setNewRule] = useState("");

  // Section 5
  const [orderFormLink, setOrderFormLink] = useState("");
  const [refundFormLink, setRefundFormLink] = useState("");
  const [refundFormName, setRefundFormName] = useState("");

  // Section 6
  const [totalSlots, setTotalSlots] = useState("10");
  const [active, setActive] = useState(false);
  const [refundAfterDays, setRefundAfterDays] = useState("25");

  const [uploading, setUploading] = useState(false);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["admin-deals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setTitle(""); setProductLink(""); setPhotos([]); setPpPrice(""); setDealPrice("");
    setReviewType("original"); setReviewWordLimit(""); setRatingLimit(""); setReviewDays("");
    setMediatorName(""); setColorInstruction("");
    setOrderDetails([...DEFAULT_ORDER_DETAILS]); setCustomField("");
    setRules([...DEFAULT_RULES]); setNewRule("");
    setOrderFormLink(""); setRefundFormLink(""); setRefundFormName("");
    setTotalSlots("10"); setActive(false); setRefundAfterDays("25");
  };

  const openDialog = (deal?: any) => {
    if (deal) {
      setEditing(deal);
      setTitle(deal.title || "");
      setProductLink(deal.product_link || "");
      setPhotos(deal.photos || []);
      setPpPrice(String(deal.pp_price || ""));
      setDealPrice(String(deal.deal_price || ""));
      setReviewType(deal.review_type || "original");
      setReviewWordLimit(deal.review_word_limit || "");
      setRatingLimit(deal.rating_limit || "");
      setReviewDays(deal.review_days || "");
      setMediatorName(deal.mediator_name || "");
      setColorInstruction(deal.color_instruction || "");
      setOrderDetails(Array.isArray(deal.order_details_required) ? deal.order_details_required : [...DEFAULT_ORDER_DETAILS]);
      setRules(Array.isArray(deal.rules) ? deal.rules : [...DEFAULT_RULES]);
      setOrderFormLink(deal.order_form_link || "");
      setRefundFormLink(deal.refund_form_link || "");
      setRefundFormName(deal.refund_form_name || "");
      setTotalSlots(String(deal.total_slots || 10));
      setActive(deal.active ?? false);
      setRefundAfterDays(String(deal.refund_available_after_days || 25));
    } else {
      setEditing(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    try {
      const newPhotos: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `deals/deal_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
        newPhotos.push(data.publicUrl);
      }
      setPhotos(prev => [...prev, ...newPhotos]);
      toast.success(`${newPhotos.length} photo(s) uploaded`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomField = () => {
    if (customField.trim() && !orderDetails.includes(customField.trim())) {
      setOrderDetails(prev => [...prev, customField.trim()]);
      setCustomField("");
    }
  };

  const removeOrderDetail = (index: number) => {
    setOrderDetails(prev => prev.filter((_, i) => i !== index));
  };

  const addRule = () => {
    if (newRule.trim()) {
      setRules(prev => [...prev, newRule.trim()]);
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, value: string) => {
    setRules(prev => prev.map((r, i) => i === index ? value : r));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required");
      const payload: any = {
        title: title.trim(),
        product_link: productLink.trim() || null,
        photos,
        pp_price: parseFloat(ppPrice) || 0,
        deal_price: parseFloat(dealPrice) || 0,
        review_type: reviewType,
        review_word_limit: reviewWordLimit.trim() || null,
        rating_limit: ratingLimit.trim() || null,
        review_days: reviewDays.trim() || null,
        mediator_name: mediatorName.trim() || null,
        color_instruction: colorInstruction.trim() || null,
        order_details_required: orderDetails,
        rules,
        order_form_link: orderFormLink.trim() || null,
        refund_form_link: refundFormLink.trim() || null,
        refund_form_name: refundFormName.trim() || null,
        total_slots: parseInt(totalSlots) || 10,
        active,
        refund_available_after_days: parseInt(refundAfterDays) || 25,
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
        <h1 className="font-display text-xl md:text-2xl font-bold gradient-text">Manage Deals</h1>
        <Button onClick={() => openDialog()} className="gradient-primary border-0 text-primary-foreground font-display text-sm">
          <Plus className="h-4 w-4" /> Add Deal
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : deals.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No deals yet. Create one!</p>
      ) : (
        <div className="space-y-3">
          {deals.map((deal: any, i: number) => (
            <motion.div key={deal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="flex flex-col sm:flex-row sm:items-center gap-3">
                {deal.photos?.[0] && <img src={deal.photos[0]} alt="" className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-display font-bold text-foreground truncate">{deal.title}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${deal.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                      {deal.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PP ₹{deal.pp_price} → Deal ₹{deal.deal_price} · {deal.slots_booked}/{deal.total_slots} booked · {deal.review_type}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" className="border-border/30" onClick={() => toggleMutation.mutate(deal)}>
                    {deal.active ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="outline" className="border-border/30" onClick={() => openDialog(deal)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card border-border/30">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Deal?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(deal.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Deal Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-border/30 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display gradient-text">{editing ? "Edit Deal" : "Create Deal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">

            {/* Section 1: Product Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-display font-bold text-foreground border-b border-border/30 pb-1">📦 Product Info</h3>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Photos</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {photos.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <button onClick={() => removePhoto(i)} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="cursor-pointer h-16 w-16 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center hover:border-primary/50 transition-colors">
                    {uploading ? <span className="text-[10px] text-muted-foreground">...</span> : <ImagePlus className="h-5 w-5 text-muted-foreground" />}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoUpload(e.target.files)} disabled={uploading} />
                  </label>
                </div>
              </div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product Title *" className="bg-muted/50 border-border/30" />
              <Input value={productLink} onChange={(e) => setProductLink(e.target.value)} placeholder="Product Link (Amazon URL etc.)" className="bg-muted/50 border-border/30" />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" value={ppPrice} onChange={(e) => setPpPrice(e.target.value)} placeholder="PP Price ₹" className="bg-muted/50 border-border/30" />
                <Input type="number" value={dealPrice} onChange={(e) => setDealPrice(e.target.value)} placeholder="Deal Price ₹" className="bg-muted/50 border-border/30" />
              </div>
            </div>

            {/* Section 2: Review Instructions */}
            <div className="space-y-3">
              <h3 className="text-sm font-display font-bold text-foreground border-b border-border/30 pb-1">📝 Review Instructions</h3>
              <Select value={reviewType} onValueChange={setReviewType}>
                <SelectTrigger className="bg-muted/50 border-border/30">
                  <SelectValue placeholder="Review Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Review Deal</SelectItem>
                  <SelectItem value="exchange">Exchange Deal</SelectItem>
                  <SelectItem value="rating">Rating Deal</SelectItem>
                  <SelectItem value="voucher">Voucher Deal</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input value={reviewWordLimit} onChange={(e) => setReviewWordLimit(e.target.value)} placeholder='Word limit (e.g. "less than 60")' className="bg-muted/50 border-border/30" />
                <Input value={ratingLimit} onChange={(e) => setRatingLimit(e.target.value)} placeholder='Rating limit (e.g. "less than 100")' className="bg-muted/50 border-border/30" />
              </div>
              <Input value={reviewDays} onChange={(e) => setReviewDays(e.target.value)} placeholder='Review deadline (e.g. "4-5 days after delivery")' className="bg-muted/50 border-border/30" />
              <Input value={mediatorName} onChange={(e) => setMediatorName(e.target.value)} placeholder="Mediator Name" className="bg-muted/50 border-border/30" />
              <Input value={colorInstruction} onChange={(e) => setColorInstruction(e.target.value)} placeholder="Color/Variant instruction (optional)" className="bg-muted/50 border-border/30" />
            </div>

            {/* Section 3: Order Details Required */}
            <div className="space-y-3">
              <h3 className="text-sm font-display font-bold text-foreground border-b border-border/30 pb-1">📋 Order Details Required</h3>
              <div className="space-y-2">
                {orderDetails.map((detail, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                    <Checkbox checked={true} className="pointer-events-none" />
                    <span className="text-sm text-foreground flex-1">{detail}</span>
                    <button onClick={() => removeOrderDetail(i)} className="text-destructive hover:text-destructive/80">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={customField} onChange={(e) => setCustomField(e.target.value)} placeholder="Add custom field" className="bg-muted/50 border-border/30 flex-1" onKeyDown={(e) => e.key === "Enter" && addCustomField()} />
                <Button size="sm" variant="outline" className="border-border/30" onClick={addCustomField}>Add</Button>
              </div>
            </div>

            {/* Section 4: Refund Rules */}
            <div className="space-y-3">
              <h3 className="text-sm font-display font-bold text-foreground border-b border-border/30 pb-1">🛑 Refund Rules</h3>
              <div className="space-y-2">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                    <span className="text-destructive text-xs">🛑</span>
                    <Input value={rule} onChange={(e) => updateRule(i, e.target.value)} className="bg-transparent border-0 p-0 h-auto text-sm text-foreground focus-visible:ring-0" />
                    <button onClick={() => removeRule(i)} className="text-destructive hover:text-destructive/80 flex-shrink-0">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newRule} onChange={(e) => setNewRule(e.target.value)} placeholder="Add new rule" className="bg-muted/50 border-border/30 flex-1" onKeyDown={(e) => e.key === "Enter" && addRule()} />
                <Button size="sm" variant="outline" className="border-border/30" onClick={addRule}>Add</Button>
              </div>
            </div>

            {/* Section 5: Form Links */}
            <div className="space-y-3">
              <h3 className="text-sm font-display font-bold text-foreground border-b border-border/30 pb-1">🔗 Form Links</h3>
              <Input value={orderFormLink} onChange={(e) => setOrderFormLink(e.target.value)} placeholder="Order Form Link (Google Form URL etc.)" className="bg-muted/50 border-border/30" />
              <Input value={refundFormLink} onChange={(e) => setRefundFormLink(e.target.value)} placeholder="Refund Form Link" className="bg-muted/50 border-border/30" />
              <Input value={refundFormName} onChange={(e) => setRefundFormName(e.target.value)} placeholder='Refund Form Name (e.g. "CHERILO")' className="bg-muted/50 border-border/30" />
            </div>

            {/* Section 6: Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-display font-bold text-foreground border-b border-border/30 pb-1">⚙️ Settings</h3>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" value={totalSlots} onChange={(e) => setTotalSlots(e.target.value)} placeholder="Total Slots" className="bg-muted/50 border-border/30" />
                <Input type="number" value={refundAfterDays} onChange={(e) => setRefundAfterDays(e.target.value)} placeholder="Refund after X days" className="bg-muted/50 border-border/30" />
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2">
                <Switch checked={active} onCheckedChange={setActive} />
                <span className="text-sm text-foreground">{active ? "Active (visible to users)" : "Inactive (hidden)"}</span>
              </div>
            </div>

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

import { useState } from "react";
import { Camera, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "tel" | "textarea" | "select" | "image";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface SecondFormModalProps {
  submission: any;
  open: boolean;
  onClose: () => void;
}

const SecondFormModal = ({ submission, open, onClose }: SecondFormModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formImageFiles, setFormImageFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!submission) return null;

  const formFields: FormField[] = Array.isArray(submission.tasks?.second_form_fields)
    ? submission.tasks.second_form_fields
    : [];

  const uploadImage = async (fieldId: string, imageFile: File): Promise<string> => {
    if (!user) throw new Error("Not logged in");
    const ext = imageFile.name.split(".").pop();
    const path = `${user.id}/2nd_${submission.id}_${fieldId}.${ext}`;
    const { error } = await supabase.storage.from("screenshots").upload(path, imageFile, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    for (const field of formFields) {
      if (field.required) {
        if (field.type === "image") {
          if (!formImageFiles[field.id]) { toast.error(`Please upload "${field.label}"`); return; }
        } else {
          if (!formData[field.id]?.trim()) { toast.error(`Please fill "${field.label}"`); return; }
        }
      }
    }

    setSubmitting(true);
    try {
      const finalData: Record<string, string> = { ...formData };
      for (const [fieldId, imageFile] of Object.entries(formImageFiles)) {
        finalData[fieldId] = await uploadImage(fieldId, imageFile);
      }

      const { error } = await supabase
        .from("task_submissions")
        .update({ second_form_data: finalData, second_form_status: "submitted" } as any)
        .eq("id", submission.id);
      if (error) throw error;

      toast.success("2nd form submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-submissions"] });
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    if (field.type === "image") {
      const imageFile = formImageFiles[field.id];
      return (
        <div className="rounded-lg border-2 border-dashed border-border/50 p-3 text-center">
          <Camera className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-1">{imageFile ? imageFile.name : "Upload image"}</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setFormImageFiles({ ...formImageFiles, [field.id]: f });
            }}
            className="w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:gradient-primary file:px-2 file:py-1 file:text-xs file:font-medium file:text-primary-foreground"
          />
        </div>
      );
    }

    const value = formData[field.id] || "";
    const onChange = (v: string) => setFormData({ ...formData, [field.id]: v });

    if (field.type === "textarea") {
      return <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || field.label} className="bg-muted/50 border-border/30 resize-none text-sm" rows={2} />;
    }
    if (field.type === "select" && field.options?.length) {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="bg-muted/50 border-border/30 text-sm"><SelectValue placeholder={field.placeholder || "Select..."} /></SelectTrigger>
          <SelectContent>{field.options.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent>
        </Select>
      );
    }
    return <Input type={field.type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || field.label} className="bg-muted/50 border-border/30 text-sm" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/30 sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl gradient-text">📋 2nd Form - {submission.tasks?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Admin ne 2nd form activate kiya hai. Please fill karein.</p>
          </div>
          <div className="space-y-3">
            {formFields.map((field) => (
              <div key={field.id}>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
            <CheckCircle2 className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit 2nd Form"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecondFormModal;

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DealDetailPageProps {
  deal: any;
  onBack: () => void;
}

const DealDetailPage = ({ deal, onBack }: DealDetailPageProps) => {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [copied, setCopied] = useState(false);
  const photos: string[] = deal.photos || [];
  const rules: string[] = Array.isArray(deal.rules) ? deal.rules : [];
  const orderDetails: string[] = Array.isArray(deal.order_details_required) ? deal.order_details_required : [];

  const copyLink = () => {
    if (deal.product_link) {
      navigator.clipboard.writeText(deal.product_link);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nextPhoto = () => setCurrentPhoto(p => (p + 1) % photos.length);
  const prevPhoto = () => setCurrentPhoto(p => (p - 1 + photos.length) % photos.length);

  return (
    <div className="min-h-screen pb-24 pt-14">
      <div className="mx-auto max-w-md px-0">
        {/* Back button */}
        <div className="px-4 mb-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Deals
          </Button>
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="relative w-full aspect-square bg-muted/20 overflow-hidden">
            <motion.img
              key={currentPhoto}
              src={photos[currentPhoto]}
              alt={deal.title}
              className="w-full h-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            {photos.length > 1 && (
              <>
                <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 flex items-center justify-center">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 flex items-center justify-center">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button key={i} onClick={() => setCurrentPhoto(i)}
                      className={`h-2 w-2 rounded-full transition-colors ${i === currentPhoto ? "bg-primary" : "bg-foreground/30"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-4 space-y-4">
          {/* Title */}
          <div className="text-center">
            <p className="font-display text-xl font-bold text-foreground uppercase">
              ❣️ {deal.title} ❣️
            </p>
          </div>

          {/* Color instruction */}
          {deal.color_instruction && (
            <p className="text-sm text-accent-foreground bg-accent/20 rounded-lg px-3 py-2 text-center">
              {deal.color_instruction}
            </p>
          )}

          {/* Product Link */}
          {deal.product_link && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">⚠️ Do not change link</p>
              <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                <a href={deal.product_link} target="_blank" rel="noopener noreferrer" className="text-primary text-sm underline flex-1 truncate">
                  {deal.product_link}
                </a>
                <button onClick={copyLink} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">PP <span className="text-foreground font-bold">₹{deal.pp_price}</span></p>
            <p className="text-sm text-muted-foreground">Deal @ <span className="text-success font-bold text-lg">₹{deal.deal_price}</span></p>
          </div>

          {/* Review info */}
          <div className="space-y-1 text-sm">
            {deal.review_word_limit && <p className="text-muted-foreground">Review: <span className="text-foreground font-medium">{deal.review_word_limit} words</span></p>}
            {deal.rating_limit && <p className="text-muted-foreground">Rating: <span className="text-foreground font-medium">{deal.rating_limit}</span></p>}
            {deal.review_days && <p className="text-muted-foreground">Review after: <span className="text-foreground font-medium">{deal.review_days}</span></p>}
          </div>

          {/* Order Details */}
          {orderDetails.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-display font-bold text-foreground">📋 Order and Share These Details:</p>
              <div className="space-y-1">
                {orderDetails.map((detail, i) => (
                  <p key={i} className="text-sm text-muted-foreground">• {detail}</p>
                ))}
              </div>
            </div>
          )}

          {/* Review reminder */}
          {deal.review_days && (
            <p className="text-sm font-bold text-destructive text-center py-1">
              🛑 REVIEW ONLY AFTER {deal.review_days.toUpperCase()} OF DELIVERY
            </p>
          )}

          {/* Divider */}
          <div className="border-t border-border/30" />

          {/* Order Form Button */}
          {deal.order_form_link && (
            <a href={deal.order_form_link} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full gradient-primary border-0 font-display font-bold text-primary-foreground h-12 text-base">
                ORDER FORM <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </a>
          )}

          {/* Refund Form Button */}
          {deal.refund_form_link && (
            <a href={deal.refund_form_link} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 font-display font-bold h-12 text-base">
                REFUND FORM {deal.refund_form_name && `(${deal.refund_form_name})`} <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </a>
          )}

          {/* Mediator Note */}
          {deal.mediator_name && (
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">After filling form, share screenshot with mediator</p>
              <p className="text-sm text-foreground font-medium">Note: Mediator name → <span className="text-primary font-bold">{deal.mediator_name}</span></p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border/30" />

          {/* Rules */}
          {rules.length > 0 && (
            <div className="space-y-2">
              {rules.map((rule, i) => (
                <p key={i} className="text-sm text-foreground">🛑 {rule}</p>
              ))}
              <p className="text-sm font-bold text-destructive text-center pt-1">Ignore at your own risk</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDetailPage;

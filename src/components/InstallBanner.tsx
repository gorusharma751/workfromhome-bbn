import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const InstallBanner = () => {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!canInstall || dismissed) return;
    // Show after 3 seconds
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [canInstall, dismissed]);

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) setShow(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  useEffect(() => {
    if (sessionStorage.getItem("pwa-banner-dismissed")) setDismissed(true);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl p-4 shadow-2xl shadow-primary/20"
        >
          <button onClick={handleDismiss} className="absolute right-3 top-3 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary">
              <Download className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-display text-sm font-bold text-foreground">App Install Karein</p>
              <p className="text-xs text-muted-foreground">Home screen pe add karein — fast & offline access</p>
            </div>
          </div>
          <button
            onClick={handleInstall}
            className="mt-3 w-full rounded-xl gradient-primary py-2.5 text-sm font-display font-bold text-primary-foreground"
          >
            Install Now
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallBanner;

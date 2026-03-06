import { useState, useEffect, useRef } from "react";
import { registerSW } from "virtual:pwa-register";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type UpdateSW = (reloadPage?: boolean) => Promise<void>;

const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);

  const updateSWRef = useRef<UpdateSW | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const pendingRefreshRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => setIsInstalled(true);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    updateSWRef.current = registerSW({
      immediate: true,
      onNeedRefresh() {
        pendingRefreshRef.current = true;
        setUpdateAvailable(true);
      },
      onRegisteredSW(_swUrl, registration) {
        registrationRef.current = registration ?? null;
        registration?.update();
      },
      onRegisterError(error) {
        console.error("PWA registration error", error);
      },
    });

    const interval = window.setInterval(() => {
      registrationRef.current?.update();
    }, UPDATE_CHECK_INTERVAL_MS);

    const handleFocus = () => {
      registrationRef.current?.update();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome === "accepted";
  };

  const checkForUpdate = async () => {
    setCheckingUpdate(true);
    try {
      pendingRefreshRef.current = updateAvailable;
      await registrationRef.current?.update();
      await new Promise((resolve) => setTimeout(resolve, 800));
      return pendingRefreshRef.current;
    } finally {
      setCheckingUpdate(false);
    }
  };

  const updateApp = async () => {
    setUpdating(true);
    try {
      if (updateSWRef.current) {
        await updateSWRef.current(true);
        return;
      }

      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ("caches" in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      window.location.reload();
    } finally {
      setUpdating(false);
    }
  };

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    install,
    updateAvailable,
    checkingUpdate,
    updating,
    checkForUpdate,
    updateApp,
  };
};

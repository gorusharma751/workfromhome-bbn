import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AppBranding {
  app_name: string;
  logo_url: string;
}

interface TelegramLinks {
  group_link: string;
  support_link: string;
}

interface AppSettings {
  branding: AppBranding;
  telegram: TelegramLinks;
  loading: boolean;
}

const DEFAULT_BRANDING: AppBranding = { app_name: "WorkFromHome", logo_url: "" };
const DEFAULT_TELEGRAM: TelegramLinks = { group_link: "https://t.me/+RhU9pH42KwYwOGE1", support_link: "https://t.me/workfromhome3349" };

const appendVersionToUrl = (url: string, version?: string) => {
  if (!url) return "";
  const stamp = version ?? Date.now().toString();

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("v", stamp);
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${encodeURIComponent(stamp)}`;
  }
};

export const useAppSettings = (): AppSettings => {
  const [branding, setBranding] = useState<AppBranding>(DEFAULT_BRANDING);
  const [telegram, setTelegram] = useState<TelegramLinks>(DEFAULT_TELEGRAM);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("admin_settings")
        .select("key, value, updated_at")
        .in("key", ["app_branding", "telegram"]);

      if (data) {
        for (const row of data) {
          if (row.key === "app_branding" && row.value) {
            const v = row.value as Record<string, string>;
            setBranding({
              app_name: v.app_name || DEFAULT_BRANDING.app_name,
              logo_url: v.logo_url ? appendVersionToUrl(v.logo_url, row.updated_at) : "",
            });
          }

          if (row.key === "telegram" && row.value) {
            const v = row.value as Record<string, string>;
            setTelegram({
              group_link: v.group_link || DEFAULT_TELEGRAM.group_link,
              support_link: v.support_link || DEFAULT_TELEGRAM.support_link,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load app settings", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const handleFocus = () => {
      load();
    };

    const interval = window.setInterval(load, 30000);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [load]);

  return { branding, telegram, loading };
};

import { useState, useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";
import { STRINGS, TranslationKey } from "@/lib/i18n/dictionaries";

export function useTranslation() {
  const { lang, setLang, toggleLang } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = (key: TranslationKey): string => {
    // Default to English for SSR to avoid hydration mismatch
    if (!mounted) {
      return STRINGS.en[key] || key;
    }
    
    // Use selected language, fallback to English, fallback to key
    return STRINGS[lang]?.[key] || STRINGS.en[key] || key;
  };

  return { t, lang, setLang, toggleLang, mounted };
}

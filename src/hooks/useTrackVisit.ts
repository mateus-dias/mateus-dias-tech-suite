import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTrackVisit = (page: string) => {
  useEffect(() => {
    const track = async () => {
      try {
        await supabase.from("site_visits").insert({
          page,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        } as any);
      } catch {
        // silently fail
      }
    };
    track();
  }, [page]);
};

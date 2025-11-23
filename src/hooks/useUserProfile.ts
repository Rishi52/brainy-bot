import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const response = await supabase.functions.invoke("user-profile", {
        method: "GET",
      });

      if (response.data?.profile) {
        setProfile(response.data.profile);
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    checkProfile();
  };

  return { profile, loading, hasProfile, refreshProfile };
}

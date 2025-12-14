import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useVisitorTracking = () => {
  const { user } = useAuth();
  const hasTracked = useRef(false);

  useEffect(() => {
    const trackVisitor = async () => {
      // Only track once per session and only if user is logged in
      if (!user || hasTracked.current) return;

      try {
        hasTracked.current = true;
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const response = await supabase.functions.invoke('track-visitor', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.error) {
          console.error('Failed to track visitor:', response.error);
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    trackVisitor();
  }, [user]);
};

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

function getDeviceLabel() {
  if (window.matchMedia('(max-width: 767px)').matches) return 'mobile';
  if (window.matchMedia('(max-width: 1100px)').matches) return 'tablet';
  return 'desktop';
}

export function useVisitTracker() {
  useEffect(() => {
    const track = async () => {
      try {
        await supabase.from('page_visits').insert({
          page: window.location.pathname,
          referrer: document.referrer || null,
          device: getDeviceLabel(),
        });
      } catch {
        // Never block the landing page when analytics fail.
      }
    };

    track();
  }, []);
}

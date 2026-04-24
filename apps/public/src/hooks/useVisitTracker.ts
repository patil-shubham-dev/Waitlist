import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useVisitTracker() {
  useEffect(() => {
    const track = async () => {
      try {
        await supabase.from('page_visits').insert({
          page: window.location.pathname,
          referrer: document.referrer || null,
        })
      } catch {
        // Silent fail — never interrupt UX for analytics
      }
    }
    track()
  }, [])
}

'use client';
import { useMemo, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/application/store';
import { setGMLoggedIn } from '@/application/store/slices/uiSlice';
import { supabase } from '@/infrastructure/supabase/supabaseClient';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useMemo(() => makeStore(), []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Hydrate local storage state first
      const stored = localStorage.getItem('isGMLoggedIn');
      if (stored === 'true') {
        store.dispatch(setGMLoggedIn(true));
      }

      // Check current active session on mount
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          store.dispatch(setGMLoggedIn(true));
        }
      });

      // Subscribe to live auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          store.dispatch(setGMLoggedIn(true));
        } else {
          // If session is null, we only log out if there isn't a manual "gm" session
          const isManual = localStorage.getItem('isGMLoggedIn') === 'true';
          if (event === 'SIGNED_OUT') {
            store.dispatch(setGMLoggedIn(false));
            localStorage.removeItem('isGMLoggedIn');
          } else if (!isManual) {
            store.dispatch(setGMLoggedIn(false));
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('[SW] Registrado, scope:', reg.scope))
          .catch((err) => console.error('[SW] Falha ao registrar:', err));
      });
    }
  }, []);

  return null;
}

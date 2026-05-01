'use client';

import { useEffect } from 'react';

// Static mode: token 'static_session' never expires.
// Only JWT tokens are checked for expiry.
const STATIC_TOKEN = 'static_session';

export default function LogoutListener() {
  useEffect(() => {
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'logout_event') {
        window.location.replace(window.location.origin);
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    // Skip expiry check for the static session token
    if (!token || token === STATIC_TOKEN) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const now = Date.now();
      const delay = expiryTime - now;

      if (delay <= 0) {
        triggerLogout();
        return;
      }

      const timeout = setTimeout(() => {
        triggerLogout();
      }, delay);

      return () => clearTimeout(timeout);
    } catch (err) {
      console.error('Failed to parse token', err);
      // Do not force logout on parse errors in static mode
    }
  }, []);

  const triggerLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('org_id');
    localStorage.setItem('logout_event', Date.now().toString());
    window.location.replace(window.location.origin);
  };

  return null;
}

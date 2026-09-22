'use client';

import { useEffect, useRef } from 'react';

export default function PushNotificationManager() {
  const isRegistered = useRef(false);

  useEffect(() => {
    // Only run on client and if Capacitor is available (not in standard browser)
    if (typeof window === 'undefined') return;

    const initPush = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const { PushNotifications } = await import('@capacitor/push-notifications');

        if (isRegistered.current) return;
        isRegistered.current = true;

        // Request permission
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }
        
        if (permStatus.receive !== 'granted') {
          console.warn('User denied push notification permissions');
          return;
        }

        // Register with Apple / Google
        await PushNotifications.register();

        const sendTokenToBackend = async (fcmToken) => {
          if (!fcmToken) return;
          const authToken = localStorage.getItem('davora_token') || sessionStorage.getItem('davora_token');
          if (!authToken) return;

          try {
            const baseUrl = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://api.davora.xyz';
            const res = await fetch(`${baseUrl}/api/notifications/subscribe`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ token: fcmToken })
            });
            if (res.ok) {
              console.log('[PushNotifications] Device token synced with Davora backend.');
              sessionStorage.setItem('davora_fcm_synced', 'true');
            }
          } catch (err) {
            console.error('[PushNotifications] Error syncing token with backend:', err);
          }
        };

        // Handle Registration
        PushNotifications.addListener('registration', async (token) => {
          console.log('[PushNotifications] Registration success. Token:', token.value);
          localStorage.setItem('davora_fcm_token', token.value);
          await sendTokenToBackend(token.value);
        });

        // Periodic/focus check to sync token as soon as user logs in
        const intervalId = setInterval(() => {
          const storedFcm = localStorage.getItem('davora_fcm_token');
          const isSynced = sessionStorage.getItem('davora_fcm_synced');
          const authToken = localStorage.getItem('davora_token') || sessionStorage.getItem('davora_token');
          if (storedFcm && authToken && !isSynced) {
            sendTokenToBackend(storedFcm);
          }
        }, 3000);

        PushNotifications.addListener('registrationError', (error) => {
          console.error('[PushNotifications] Registration Error:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('[PushNotifications] Notification Received:', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('[PushNotifications] Notification Tapped/Action:', action);
        });
      } catch (e) {
        console.error("[PushNotifications] Setup exception:", e);
      }
    };

    initPush();
  }, []);

  return null;
}

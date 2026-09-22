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

        // Handle Registration
        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ' + token.value);
          const authToken = localStorage.getItem('davora_token') || sessionStorage.getItem('davora_token');
          if (authToken) {
            try {
              // Get base URL logic similar to the rest of the app
              const baseUrl = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://api.davora.xyz';
              await fetch(`${baseUrl}/api/notifications/subscribe`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ token: token.value })
              });
              console.log('Successfully subscribed token to backend.');
            } catch (err) {
              console.error('Error sending token to backend:', err);
            }
          }
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ', notification);
        });
      } catch (e) {
        console.error("Push Notification Setup Failed: ", e);
      }
    };

    initPush();
  }, []);

  return null;
}

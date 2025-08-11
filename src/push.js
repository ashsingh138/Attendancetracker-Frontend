import apiClient from './api';

const VAPID_PUBLIC_KEY = 'BPgyH9wSZjIDBOd4XofwUHX0GZkbyx91EnVnZq0YG1YhrhZbQK14wSmfmMAqaQ2m2bd-P4DCV6o5We67-9MFOAk'; // You need to get this from your .env

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUser() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready; // Wait for the service worker to be active

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      
      // Send subscription to the backend
      await apiClient.post('/notifications/subscribe', subscription);
      console.log('User subscribed successfully.');

    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
    }
  }
}

export function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                subscribeUser();
            }
        });
    }
}
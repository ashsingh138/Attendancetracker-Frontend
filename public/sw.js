// This is the service worker file

self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: 'Frontend\client\public\IIT-Kharagpur-logo-01.png', // Make sure you have an icon in /public
    badge: 'Frontend\client\public\download.png', // And a badge
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
// sw.js (Corrected)
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    // Correct paths start with a slash '/'
    icon: '/IIT-Kharagpur-logo-01.png', 
    badge: '/download.png',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
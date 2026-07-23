const CACHE = "carforfar-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

self.addEventListener("push", (e) => {
  let data = { title: "CARFORFAR", body: "", url: "/admin/messages", icon: "/pwa-icon-192.png" };
  if (e.data) {
    try { data = { ...data, ...e.data.json() }; } catch { data.body = e.data.text(); }
  }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: "/pwa-icon-96.png",
      data: { url: data.url },
      vibrate: [100, 50, 100],
      tag: "carforfar-notification",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/admin/messages";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes("/admin") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener("notificationclose", (e) => {
  e.notification.close();
});

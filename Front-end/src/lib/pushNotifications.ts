import { API_BASE_URL } from "./config";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getVapidPublicKey(isAdmin = false): Promise<string> {
  const prefix = isAdmin ? "/admin" : "";
  const res = await fetch(`${API_BASE_URL}${prefix}/push/vapid-key`, {
    headers: {
      "Authorization": `Bearer ${getStoredToken()}`
    }
  });
  const json = await res.json();
  return json.data.key;
}

export async function subscribeToPush(isAdmin = false): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    await syncSubscription(existingSubscription, isAdmin);
    return true;
  }

  const vapidKey = await getVapidPublicKey(isAdmin);
  const applicationServerKey = urlBase64ToUint8Array(vapidKey) as BufferSource;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  await syncSubscription(subscription, isAdmin);
  return true;
}

async function syncSubscription(subscription: PushSubscription, isAdmin = false): Promise<void> {
  const token = getStoredToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const endpoint = subscription.endpoint;
  const keys = subscription.toJSON().keys as { p256dh: string; auth: string };

  const prefix = isAdmin ? "/admin" : "";
  await fetch(`${API_BASE_URL}${prefix}/push/subscribe`, {
    method: "POST",
    headers,
    body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth }),
  });
}

export async function unsubscribeFromPush(isAdmin = false): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const token = getStoredToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const prefix = isAdmin ? "/admin" : "";
  await fetch(`${API_BASE_URL}${prefix}/push/unsubscribe`, {
    method: "POST",
    headers,
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  await subscription.unsubscribe();
}

function getStoredToken(): string | null {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

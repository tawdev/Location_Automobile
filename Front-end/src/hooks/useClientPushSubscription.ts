"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { subscribeToPush } from "@/lib/pushNotifications";

export function useClientPushSubscription() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const isAdmin = user.role_id === 1;
      subscribeToPush(isAdmin).catch((err) => {
        console.error("Push subscription failed:", err);
      });
    }
  }, [user]);
}


"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { subscribeToPush } from "@/lib/pushNotifications";

export function useClientPushSubscription() {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role_id !== 1) {
      subscribeToPush().catch(() => {});
    }
  }, [user]);
}

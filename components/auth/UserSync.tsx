"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;

    const key = `user-sync-status:${user.id}`;

    const sync = async () => {
      try {
        sessionStorage.setItem(key, "syncing");

        const res = await fetch("/api/users/ensure", { method: "POST" });
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to sync user", res.status, text);
          sessionStorage.removeItem(key);
          return;
        }

        sessionStorage.setItem(key, "synced");
      } catch (error) {
        console.error("Failed to sync user", error);
        sessionStorage.removeItem(key);
      }
    };

    const status = sessionStorage.getItem(key);
    if (status !== "synced") {
      sync();
    }
  }, [isLoaded, isSignedIn, user?.id]);

  return null;
}

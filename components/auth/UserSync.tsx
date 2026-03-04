"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;

    const key = `user-synced:${user.id}`;
    const alreadySynced = sessionStorage.getItem(key);
    if (alreadySynced) return;

    const sync = async () => {
      try {
        const res = await fetch("/api/users/ensure", { method: "POST" });
        if (res.ok) {
          sessionStorage.setItem(key, "1");
        }
      } catch (error) {
        console.error("Failed to sync user", error);
      }
    };

    sync();
  }, [isLoaded, isSignedIn, user?.id]);

  return null;
}

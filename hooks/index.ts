"use client";
import { RefObject, useEffect } from "react";

type Event = MouseEvent | TouchEvent;

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current;
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("touchstart", listener);
    document.addEventListener("mousedown", listener);

    return () => {
      document.removeEventListener("touchstart", listener);
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
};

export function FetchUser() {
  try {
    const userDetails =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;
    return userDetails;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export function FetchToken(): string | null {
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error fetching session token:", error);
    return null;
  }
}

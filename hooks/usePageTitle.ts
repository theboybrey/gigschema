"use client";
import { configurations } from "@/configurations";
import { useEffect } from "react";

const usePageTitle = (title: string) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentTitle = document.title;
      const newTitle = `${title} · ${configurations.title.default}`;
      document.title = newTitle;

      return () => {
        document.title = currentTitle;
      };
    }
  }, [title]);
};

export default usePageTitle;

"use client";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const getMode = () => {
      if (typeof document === "undefined") return false;
      // check class, localStorage or prefers-color-scheme
      if (document.documentElement.classList.contains("dark")) return true;
      const stored = localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
      return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
    };

    setIsDark(getMode());

    // observe class changes on <html> so mode updates if theme toggled
    const observer = new MutationObserver(() => setIsDark(getMode()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const baseStyle = {
    borderRadius: 8,
    padding: "10px 14px",
    color: isDark ? "#e6edf3" : "#0b1220",
    background: isDark ? "#0b1220" : "#ffffff",
    boxShadow: isDark ? "0 6px 18px rgba(2,6,23,0.6)" : "0 6px 18px rgba(13,20,30,0.08)",
  };

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: baseStyle,
        success: {
          iconTheme: { primary: "#10B981", secondary: isDark ? "#0b1220" : "#fff" },
        },
        error: {
          iconTheme: { primary: "#EF4444", secondary: isDark ? "#0b1220" : "#fff" },
        },
      }}
    />
  );
}
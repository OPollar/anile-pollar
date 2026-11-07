"use client";
import { useEffect } from "react";

export function ThemeProvider({ theme, children }: { theme: Record<string,string>, children: React.ReactNode }) {
  useEffect(() => {
    const r = document.documentElement;
    Object.entries(theme).forEach(([k, v]) => r.style.setProperty(`--${k}`, v));
  }, [theme]);
  return <>{children}</>;
}

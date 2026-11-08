"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

/** Carrega preferências salvas (volume) depois da hidratação, sem erro de React. */
export function StoreHydrator() {
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);
  return null;
}

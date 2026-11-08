"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="btn"
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace("/");
        router.refresh();
      }}
    >
      <LogOut size={16} /> Sair
    </button>
  );
}

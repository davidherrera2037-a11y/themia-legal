"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-ink/20 px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
    >
      Cerrar sesión
    </button>
  );
}

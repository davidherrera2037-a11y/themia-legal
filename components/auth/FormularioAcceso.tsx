"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input, ErrorMsg } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function FormularioAcceso({ volver }: { volver?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const datos = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(datos.get("email") ?? ""),
      password: String(datos.get("password") ?? ""),
    });

    if (error) {
      setCargando(false);
      // El mismo mensaje para "no existe esa cuenta" y para "contraseña
      // incorrecta": distinguirlos le confirma a quien prueba correos al
      // azar cuáles están registrados en el despacho.
      setError("Correo o contraseña incorrectos.");
      return;
    }

    // Solo se acepta un destino interno. Sin esta comprobación, un enlace
    // con ?volver=https://otro-sitio convertiría la pantalla de entrada del
    // despacho en un trampolín hacia una copia falsa.
    const destino = volver?.startsWith("/") && !volver.startsWith("//")
      ? volver
      : "/portal";

    router.push(destino);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
      <Input
        name="email"
        label="Correo"
        type="email"
        autoComplete="email"
        required
        autoFocus
      />
      <Input
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        required
      />

      <ErrorMsg>{error}</ErrorMsg>

      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}

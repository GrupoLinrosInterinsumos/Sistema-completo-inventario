"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { eliminarUbicacionAction, type DatosUbicacion } from "../actions";
import { DESHACER_STORAGE_KEY } from "../deshacer-toast";

export function MarcarVacioBoton({ id, datos, volverHref }: { id: string; datos: DatosUbicacion; volverHref: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function marcarVacio() {
    setError(null);
    startTransition(async () => {
      const result = await eliminarUbicacionAction(id);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      // Al borrar, esta misma página deja de existir (notFound) — se guarda
      // lo necesario para deshacer y se navega a la lista, donde se avisa.
      try {
        sessionStorage.setItem(DESHACER_STORAGE_KEY, JSON.stringify(datos));
      } catch {
        // sessionStorage no disponible — no se podrá deshacer, pero el borrado ya se hizo.
      }
      router.push(volverHref);
    });
  }

  return (
    <>
      <Button type="button" variant="danger" loading={pending} onClick={marcarVacio}>
        Está Vacío
      </Button>
      {error ? <p className="w-full text-sm text-secondary">{error}</p> : null}
    </>
  );
}

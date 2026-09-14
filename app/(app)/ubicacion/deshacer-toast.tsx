"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { restaurarUbicacionAction, type DatosUbicacion } from "./actions";

export const DESHACER_STORAGE_KEY = "ubicacion_deshacer";

// Se lee una sola vez al montar: si "Está Vacío" acaba de guardar algo acá,
// se ofrece deshacerlo. Se borra del storage apenas se muestra para que no
// reaparezca en visitas futuras a la página.
export function DeshacerToast() {
  const router = useRouter();
  const [datos, setDatos] = useState<DatosUbicacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // En un callback (no directo en el cuerpo del efecto) para leer
    // sessionStorage una sola vez al montar sin re-renders en cascada.
    const id = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(DESHACER_STORAGE_KEY);
        if (raw) {
          sessionStorage.removeItem(DESHACER_STORAGE_KEY);
          setDatos(JSON.parse(raw));
        }
      } catch {
        // sessionStorage no disponible — sin banner de deshacer.
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (!datos) return null;

  function deshacer() {
    setError(null);
    startTransition(async () => {
      const result = await restaurarUbicacionAction(datos!);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setDatos(null);
      router.push(`/ubicacion/${result.id}`);
    });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-card border border-outline-variant bg-surface-container-low px-4 py-3">
      <p className="text-sm text-on-surface">
        Marcaste <span className="font-semibold">{datos.nombreProducto}</span> como vacía.
      </p>
      <Button variant="outline" size="sm" loading={pending} onClick={deshacer}>
        Deshacer
      </Button>
      <button
        type="button"
        onClick={() => setDatos(null)}
        className="ml-auto text-xs text-on-surface-variant hover:text-on-surface"
      >
        Cerrar
      </button>
      {error ? <p className="w-full text-sm text-secondary">{error}</p> : null}
    </div>
  );
}

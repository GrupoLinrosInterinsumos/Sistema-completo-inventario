"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { descontarProductoDanadoAction } from "./actions";

export function DescontarBoton({ id, disponible, unidad }: { id: string; disponible: number; unidad: string }) {
  const router = useRouter();
  const idPrefix = useId();
  const [abierto, setAbierto] = useState(false);
  const [cantidad, setCantidad] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmar() {
    const valor = Number(cantidad);
    if (!(valor > 0)) {
      setError("Ingresa una cantidad mayor a 0.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await descontarProductoDanadoAction(id, valor, nota);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setAbierto(false);
      setCantidad("");
      setNota("");
      router.refresh();
    });
  }

  if (!abierto) {
    return (
      <Button variant="outline" size="sm" onClick={() => setAbierto(true)}>
        Descontar
      </Button>
    );
  }

  return (
    <div className="w-56 space-y-2 text-left">
      <div>
        <label htmlFor={`${idPrefix}-cant`} className="block text-xs font-medium text-on-surface-variant">
          Cantidad a descontar (máx. {disponible} {unidad})
        </label>
        <input
          id={`${idPrefix}-cant`}
          type="number"
          min="0"
          max={disponible}
          step="0.01"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-nota`} className="block text-xs font-medium text-on-surface-variant">
          Nota (opcional)
        </label>
        <input
          id={`${idPrefix}-nota`}
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Ej. usado en producción"
          className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      {error ? <p className="rounded-md bg-error-container px-2 py-1.5 text-xs text-on-error-container">{error}</p> : null}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => setAbierto(false)}>
          Cancelar
        </Button>
        <Button size="sm" className="flex-1" loading={pending} onClick={confirmar}>
          Confirmar
        </Button>
      </div>
    </div>
  );
}

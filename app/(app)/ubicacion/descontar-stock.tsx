"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { retirarStockAction } from "../stock/actions";

// Descontar (retirar) stock de CRAMER/SACCO/FRACCIONAMIENTO sin salir del
// buscador de Ubicación. Es el mismo retiro de Buscar/Retirar stock.
export function DescontarStock({ id, disponible, unidad }: { id: string; disponible: number; unidad: string }) {
  const router = useRouter();
  const idPrefix = useId();
  const [abierto, setAbierto] = useState(false);
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmar() {
    const valor = Number(cantidad);
    if (!(valor > 0)) {
      setError("Ingresa una cantidad mayor a 0.");
      return;
    }
    if (!motivo) {
      setError("Selecciona un motivo de retiro.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await retirarStockAction(id, valor, motivo);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setAbierto(false);
      setCantidad("");
      setMotivo("");
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
    <div className="w-full space-y-2 rounded-md border border-outline-variant bg-surface-container-low p-3 sm:w-72">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`${idPrefix}-cant`} className="block text-xs font-medium text-on-surface-variant">
            Cantidad (máx. {disponible} {unidad})
          </label>
          <input
            id={`${idPrefix}-cant`}
            type="number"
            min="0"
            max={disponible}
            step="0.01"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-motivo`} className="block text-xs font-medium text-on-surface-variant">
            Motivo
          </label>
          <select
            id={`${idPrefix}-motivo`}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Selecciona...</option>
            <option value="Movimiento interno">Movimiento interno</option>
            <option value="Venta">Venta</option>
          </select>
        </div>
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

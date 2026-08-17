"use client";

import { useId, useMemo, useState } from "react";
import { useActionState } from "react";
import { Button } from "@/app/components/ui/button";
import { crearUbicacionStockAction, type UbicacionFormState } from "./actions";

type Rack = { id: string; numero: number; filaMin: string; filaMax: string; columnas: number };

export function UbicacionIngresoForm({ racks }: { racks: Rack[] }) {
  const idPrefix = useId();
  const [state, formAction, pending] = useActionState<UbicacionFormState, FormData>(
    crearUbicacionStockAction,
    undefined
  );
  const [rackId, setRackId] = useState(racks[0]?.id ?? "");

  const rackSeleccionado = useMemo(() => racks.find((r) => r.id === rackId), [racks, rackId]);

  const filas = useMemo(() => {
    if (!rackSeleccionado) return [];
    const min = rackSeleccionado.filaMin.charCodeAt(0);
    const max = rackSeleccionado.filaMax.charCodeAt(0);
    return Array.from({ length: max - min + 1 }, (_, i) => String.fromCharCode(min + i));
  }, [rackSeleccionado]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-nombre`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Nombre del producto
        </label>
        <input
          id={`${idPrefix}-nombre`}
          name="nombreProducto"
          type="text"
          required
          className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`${idPrefix}-rack`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Rack
          </label>
          <select
            id={`${idPrefix}-rack`}
            name="rackId"
            required
            value={rackId}
            onChange={(e) => setRackId(e.target.value)}
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {racks.map((r) => (
              <option key={r.id} value={r.id}>
                Rack {r.numero}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-fila`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Fila
          </label>
          <select
            id={`${idPrefix}-fila`}
            name="fila"
            required
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {filas.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-columna`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Columna
          </label>
          <input
            id={`${idPrefix}-columna`}
            name="columna"
            type="number"
            min={1}
            max={rackSeleccionado?.columnas}
            required
            placeholder={rackSeleccionado ? `1-${rackSeleccionado.columnas}` : ""}
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-orden`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          N° de ingreso
        </label>
        <input
          id={`${idPrefix}-orden`}
          name="ordenIngreso"
          type="number"
          min={1}
          required
          className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-on-surface-variant">
          Mientras más bajo el número, antes aparece en el buscador (el que llegó primero).
        </p>
      </div>

      {state?.error ? (
        <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{state.error}</p>
      ) : null}

      <Button type="submit" loading={pending}>
        {pending ? "Guardando..." : "Registrar ubicación"}
      </Button>
    </form>
  );
}

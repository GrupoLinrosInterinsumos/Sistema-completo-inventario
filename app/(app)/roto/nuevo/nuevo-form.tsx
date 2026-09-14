"use client";

import { useId, useState } from "react";
import { useActionState } from "react";
import { Button } from "@/app/components/ui/button";
import { NombreProductoInput } from "../../ubicacion/nombre-producto-input";
import { crearProductoDanadoAction, type RotoFormState } from "../actions";

export function NuevoDanadoForm({ nombresSugeridos }: { nombresSugeridos: string[] }) {
  const idPrefix = useId();
  const [state, formAction, pending] = useActionState<RotoFormState, FormData>(
    crearProductoDanadoAction,
    undefined
  );
  const [nombreProducto, setNombreProducto] = useState("");
  const [motivo, setMotivo] = useState<"ROTO" | "NC">("ROTO");

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-nombre`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Nombre del producto
        </label>
        <NombreProductoInput
          id={`${idPrefix}-nombre`}
          nombresSugeridos={nombresSugeridos}
          valor={nombreProducto}
          onChange={setNombreProducto}
        />
      </div>

      <div>
        <p className="block text-label-md uppercase tracking-wide text-on-surface-variant">Motivo</p>
        <div className="mt-1.5 flex gap-2">
          <button
            type="button"
            onClick={() => setMotivo("ROTO")}
            className={`rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
              motivo === "ROTO" ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            Roto
          </button>
          <button
            type="button"
            onClick={() => setMotivo("NC")}
            className={`rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
              motivo === "NC" ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            NC
          </button>
        </div>
        <input type="hidden" name="motivo" value={motivo} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex gap-2">
          <div className="w-2/3">
            <label htmlFor={`${idPrefix}-cantidad`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
              Cantidad
            </label>
            <input
              id={`${idPrefix}-cantidad`}
              name="cantidad"
              type="number"
              min="0"
              step="0.01"
              required
              className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="w-1/3">
            <label htmlFor={`${idPrefix}-unidad`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
              Unidad
            </label>
            <select
              id={`${idPrefix}-unidad`}
              name="unidad"
              defaultValue="kg"
              className="mt-1 w-full rounded-md border border-outline-variant px-2 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="kg">kg</option>
              <option value="cajas">cajas</option>
              <option value="und">und</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-ubicacion`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Ubicación
          </label>
          <input
            id={`${idPrefix}-ubicacion`}
            name="ubicacion"
            type="text"
            required
            placeholder="Ej. Rack 3 - C12, Piso, Anden..."
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-obs`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Observación (opcional)
        </label>
        <textarea
          id={`${idPrefix}-obs`}
          name="observacion"
          rows={2}
          className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {state?.error ? (
        <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{state.error}</p>
      ) : null}

      <Button type="submit" loading={pending}>
        {pending ? "Guardando..." : "Registrar"}
      </Button>
    </form>
  );
}

"use client";

import { useId, useState } from "react";
import { useActionState } from "react";
import { Button } from "@/app/components/ui/button";
import { MOTIVOS_DANO, MOTIVO_LABEL, type MotivoDanoValor } from "@/lib/roto";
import { ZONAS_FIJAS } from "@/lib/ubicaciones-fijas";
import { NombreProductoInput } from "../../ubicacion/nombre-producto-input";
import { crearProductoDanadoAction, type RotoFormState } from "../actions";

const INPUT_CLASS =
  "mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const LABEL_CLASS = "block text-label-md uppercase tracking-wide text-on-surface-variant";

export function NuevoDanadoForm({ nombresSugeridos, racks }: { nombresSugeridos: string[]; racks: number[] }) {
  const idPrefix = useId();
  const [state, formAction, pending] = useActionState<RotoFormState, FormData>(
    crearProductoDanadoAction,
    undefined
  );
  const [nombreProducto, setNombreProducto] = useState("");
  const [motivo, setMotivo] = useState<MotivoDanoValor>("ROTO");

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-nombre`} className={LABEL_CLASS}>
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
        <p className={LABEL_CLASS}>Motivo</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {MOTIVOS_DANO.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMotivo(m)}
              className={`rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
                motivo === m
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {MOTIVO_LABEL[m]}
            </button>
          ))}
        </div>
        <input type="hidden" name="motivo" value={motivo} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-lote`} className={LABEL_CLASS}>
            Lote (opcional)
          </label>
          <input id={`${idPrefix}-lote`} name="lote" type="text" className={INPUT_CLASS} />
        </div>

        <div className="flex gap-2">
          <div className="w-2/3">
            <label htmlFor={`${idPrefix}-cantidad`} className={LABEL_CLASS}>
              Cantidad
            </label>
            <input
              id={`${idPrefix}-cantidad`}
              name="cantidad"
              type="number"
              min="0"
              step="0.01"
              required
              className={INPUT_CLASS}
            />
          </div>
          <div className="w-1/3">
            <label htmlFor={`${idPrefix}-unidad`} className={LABEL_CLASS}>
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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-ubicacion`} className={LABEL_CLASS}>
            Ubicación
          </label>
          <select id={`${idPrefix}-ubicacion`} name="ubicacion" required defaultValue="" className={INPUT_CLASS}>
            <option value="" disabled>
              Elige una ubicación...
            </option>
            <optgroup label="Zonas">
              {ZONAS_FIJAS.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </optgroup>
            {racks.length > 0 ? (
              <optgroup label="Racks">
                {racks.map((n) => (
                  <option key={n} value={`Rack ${n}`}>
                    Rack {n}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-paleta`} className={LABEL_CLASS}>
            N° de paleta / posición (opcional)
          </label>
          <input
            id={`${idPrefix}-paleta`}
            name="paleta"
            type="text"
            placeholder="Ej. 14"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-obs`} className={LABEL_CLASS}>
          Observación (opcional)
        </label>
        <textarea id={`${idPrefix}-obs`} name="observacion" rows={2} className={INPUT_CLASS} />
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

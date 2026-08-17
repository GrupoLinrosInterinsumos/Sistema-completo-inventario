"use client";

import { useId, useMemo, useState } from "react";
import { useActionState } from "react";
import { Button } from "@/app/components/ui/button";
import { crearUbicacionStockAction, type UbicacionFormState } from "./actions";
import { RackPicker } from "./rack-picker";

type Rack = { id: string; numero: number; filaMin: string; filaMax: string; columnas: number };
type Ocupante = { rackId: string; fila: string; columna: number; nombreProducto: string };

export function UbicacionIngresoForm({ racks, ocupadas }: { racks: Rack[]; ocupadas: Ocupante[] }) {
  const idPrefix = useId();
  const [state, formAction, pending] = useActionState<UbicacionFormState, FormData>(
    crearUbicacionStockAction,
    undefined
  );
  const [rackId, setRackId] = useState(racks[0]?.id ?? "");
  const [fila, setFila] = useState<string | null>(null);
  const [columna, setColumna] = useState<number | null>(null);
  const [errorSeleccion, setErrorSeleccion] = useState<string | null>(null);

  const rackSeleccionado = useMemo(() => racks.find((r) => r.id === rackId), [racks, rackId]);

  const ocupadasDelRack = useMemo(
    () => ocupadas.filter((o) => o.rackId === rackId),
    [ocupadas, rackId]
  );

  function cambiarRack(nuevoRackId: string) {
    setRackId(nuevoRackId);
    setFila(null);
    setColumna(null);
  }

  function enviar(formData: FormData) {
    if (!fila || !columna) {
      setErrorSeleccion("Haz clic en una celda libre del rack para elegir la ubicación.");
      return;
    }
    setErrorSeleccion(null);
    formData.set("fila", fila);
    formData.set("columna", String(columna));
    formAction(formData);
  }

  return (
    <form action={enviar} className="space-y-4">
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

      <div>
        <label htmlFor={`${idPrefix}-rack`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Rack
        </label>
        <select
          id={`${idPrefix}-rack`}
          name="rackId"
          required
          value={rackId}
          onChange={(e) => cambiarRack(e.target.value)}
          className="mt-1 w-full max-w-xs rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {racks.map((r) => (
            <option key={r.id} value={r.id}>
              Rack {r.numero}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Ubicación — haz clic en una celda libre
        </p>
        {rackSeleccionado ? (
          <div className="mt-1">
            <RackPicker
              filaMin={rackSeleccionado.filaMin}
              filaMax={rackSeleccionado.filaMax}
              columnas={rackSeleccionado.columnas}
              ocupadas={ocupadasDelRack}
              filaSeleccionada={fila}
              columnaSeleccionada={columna}
              onSeleccionar={(f, c) => {
                setFila(f);
                setColumna(c);
                setErrorSeleccion(null);
              }}
            />
          </div>
        ) : null}
        <p className="mt-2 text-sm text-on-surface">
          {fila && columna ? (
            <>
              Seleccionaste: <span className="font-semibold">Rack {rackSeleccionado?.numero} — {fila}{columna}</span>
            </>
          ) : (
            "Aún no has seleccionado ninguna celda."
          )}
        </p>
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
          className="mt-1 w-full max-w-xs rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-on-surface-variant">
          Mientras más bajo el número, antes aparece en el buscador (el que llegó primero).
        </p>
      </div>

      {errorSeleccion ? (
        <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{errorSeleccion}</p>
      ) : null}
      {state?.error ? (
        <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{state.error}</p>
      ) : null}

      <Button type="submit" loading={pending}>
        {pending ? "Guardando..." : "Registrar ubicación"}
      </Button>
    </form>
  );
}

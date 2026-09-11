"use client";

import { useId, useMemo, useState } from "react";
import { useActionState } from "react";
import { Button } from "@/app/components/ui/button";
import { crearUbicacionStockAction, type UbicacionFormState } from "./actions";
import { RackPicker } from "./rack-picker";
import { NombreProductoInput } from "./nombre-producto-input";

type Rack = { id: string; numero: number; filaMin: string; filaMax: string; columnas: number };
type Ocupante = { rackId: string; fila: string; columna: number; nombreProducto: string };

export function UbicacionIngresoForm({
  racks,
  ocupadas,
  nombresSugeridos,
}: {
  racks: Rack[];
  ocupadas: Ocupante[];
  nombresSugeridos: string[];
}) {
  const idPrefix = useId();
  const [state, formAction, pending] = useActionState<UbicacionFormState, FormData>(
    crearUbicacionStockAction,
    undefined
  );
  const [nombreProducto, setNombreProducto] = useState("");
  const [modo, setModo] = useState<"rack" | "area">("rack");
  const [rackId, setRackId] = useState(racks[0]?.id ?? "");
  const [celdas, setCeldas] = useState<{ fila: string; columna: number }[]>([]);
  const [errorSeleccion, setErrorSeleccion] = useState<string | null>(null);

  const rackSeleccionado = useMemo(() => racks.find((r) => r.id === rackId), [racks, rackId]);

  const ocupadasDelRack = useMemo(
    () => ocupadas.filter((o) => o.rackId === rackId),
    [ocupadas, rackId]
  );

  function cambiarRack(nuevoRackId: string) {
    setRackId(nuevoRackId);
    setCeldas([]);
  }

  function alternarCelda(f: string, c: number) {
    setCeldas((prev) => {
      const existe = prev.some((cel) => cel.fila === f && cel.columna === c);
      if (existe) return prev.filter((cel) => !(cel.fila === f && cel.columna === c));
      return [...prev, { fila: f, columna: c }];
    });
    setErrorSeleccion(null);
  }

  function enviar(formData: FormData) {
    formData.set("modo", modo);
    if (modo === "rack") {
      if (celdas.length === 0) {
        setErrorSeleccion("Haz clic en al menos una celda del rack para elegir la ubicación.");
        return;
      }
      formData.set("rackId", rackId);
      formData.set("celdas", JSON.stringify(celdas));
    }
    setErrorSeleccion(null);
    formAction(formData);
  }

  return (
    <form action={enviar} className="space-y-4">
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
        <p className="block text-label-md uppercase tracking-wide text-on-surface-variant">Tipo de ubicación</p>
        <div className="mt-1.5 flex gap-2">
          <button
            type="button"
            onClick={() => setModo("rack")}
            className={`rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
              modo === "rack" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            Rack
          </button>
          <button
            type="button"
            onClick={() => setModo("area")}
            className={`rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
              modo === "area" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            Área libre (Piso, Gabinete...)
          </button>
        </div>
      </div>

      {modo === "rack" ? (
        <>
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
              Ubicación — haz clic en una o varias celdas
            </p>
            {rackSeleccionado ? (
              <div className="mt-1">
                <RackPicker
                  filaMin={rackSeleccionado.filaMin}
                  filaMax={rackSeleccionado.filaMax}
                  columnas={rackSeleccionado.columnas}
                  ocupadas={ocupadasDelRack}
                  seleccionadas={celdas}
                  onAlternar={alternarCelda}
                />
              </div>
            ) : null}
            <p className="mt-2 text-sm text-on-surface">
              {celdas.length > 0 ? (
                <>
                  Seleccionaste ({celdas.length}):{" "}
                  <span className="font-semibold">
                    Rack {rackSeleccionado?.numero} — {celdas.map((c) => `${c.fila}${c.columna}`).join(", ")}
                  </span>
                </>
              ) : (
                "Aún no has seleccionado ninguna celda."
              )}
            </p>
          </div>
        </>
      ) : (
        <div>
          <label htmlFor={`${idPrefix}-area`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Nombre de la zona
          </label>
          <input
            id={`${idPrefix}-area`}
            name="areaLibre"
            type="text"
            required
            placeholder="Ej. Piso, Gabinete, Saldo químico 3..."
            className="mt-1 w-full max-w-xs rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-lote`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Lote
          </label>
          <input
            id={`${idPrefix}-lote`}
            name="lote"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-vencimiento`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Fecha de vencimiento
          </label>
          <input
            id={`${idPrefix}-vencimiento`}
            name="fVencimiento"
            type="date"
            required
            className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <p className="text-xs text-on-surface-variant">
        Se ordena en el buscador por la fecha de vencimiento más próxima.
      </p>

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

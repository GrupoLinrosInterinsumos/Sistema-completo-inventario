"use client";

import { useId, useMemo, useState } from "react";
import { useActionState } from "react";
import { Button } from "@/app/components/ui/button";
import { NOMBRES_PRODUCTO_FIJOS, ZONAS_FIJAS } from "@/lib/ubicaciones-fijas";
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
  // Una sola lista con todas las ubicaciones: "rack:<id>" o "zona:<nombre>".
  const [destino, setDestino] = useState(racks[0] ? `rack:${racks[0].id}` : `zona:${ZONAS_FIJAS[0]}`);
  const [celdas, setCeldas] = useState<{ fila: string; columna: number }[]>([]);
  const [errorSeleccion, setErrorSeleccion] = useState<string | null>(null);

  const modo: "rack" | "area" = destino.startsWith("rack:") ? "rack" : "area";
  const rackId = modo === "rack" ? destino.slice("rack:".length) : "";
  const zona = modo === "area" ? destino.slice("zona:".length) : "";

  const rackSeleccionado = useMemo(() => racks.find((r) => r.id === rackId), [racks, rackId]);

  const ocupadasDelRack = useMemo(
    () => ocupadas.filter((o) => o.rackId === rackId),
    [ocupadas, rackId]
  );

  function cambiarDestino(nuevo: string) {
    setDestino(nuevo);
    setCeldas([]);
    setErrorSeleccion(null);
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
    } else {
      formData.set("areaLibre", zona);
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
          nombresFijos={NOMBRES_PRODUCTO_FIJOS}
          valor={nombreProducto}
          onChange={setNombreProducto}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-destino`} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Ubicación
        </label>
        <select
          id={`${idPrefix}-destino`}
          value={destino}
          onChange={(e) => cambiarDestino(e.target.value)}
          className="mt-1 w-full max-w-xs rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <optgroup label="Racks">
            {racks.map((r) => (
              <option key={r.id} value={`rack:${r.id}`}>
                Rack {r.numero}
              </option>
            ))}
          </optgroup>
          <optgroup label="Zonas">
            {ZONAS_FIJAS.map((z) => (
              <option key={z} value={`zona:${z}`}>
                {z}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {modo === "rack" ? (
        <>
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
        <p className="text-sm text-on-surface">
          El producto quedará en <span className="font-semibold">{zona}</span> (zona sin celdas).
        </p>
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

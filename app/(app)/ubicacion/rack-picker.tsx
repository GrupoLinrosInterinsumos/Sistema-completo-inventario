"use client";

import { Fragment } from "react";

type Ocupante = { fila: string; columna: number; nombreProducto: string };

type Props = {
  filaMin: string;
  filaMax: string;
  columnas: number;
  ocupadas: Ocupante[];
  filaSeleccionada: string | null;
  columnaSeleccionada: number | null;
  onSeleccionar: (fila: string, columna: number) => void;
};

export function RackPicker({
  filaMin,
  filaMax,
  columnas,
  ocupadas,
  filaSeleccionada,
  columnaSeleccionada,
  onSeleccionar,
}: Props) {
  const filaMinCode = filaMin.charCodeAt(0);
  const filaMaxCode = filaMax.charCodeAt(0);

  const filas: string[] = [];
  for (let c = filaMaxCode; c >= filaMinCode; c--) filas.push(String.fromCharCode(c));

  const columnasArr = Array.from({ length: columnas }, (_, i) => i + 1);
  const ocupadasMap = new Map(ocupadas.map((o) => [`${o.fila}${o.columna}`, o.nombreProducto]));

  return (
    <div>
      <div className="overflow-x-auto rounded-card border border-outline-variant bg-surface-container-lowest p-4">
        <div
          className="grid w-max gap-0.5"
          style={{ gridTemplateColumns: `2rem repeat(${columnas}, minmax(1.75rem, 1fr))` }}
        >
          <div />
          {columnasArr.map((c) => (
            <div
              key={`col-${c}`}
              className="flex items-center justify-center pb-1 text-[10px] font-medium text-on-surface-variant"
            >
              {c}
            </div>
          ))}

          {filas.map((fila) => (
            <Fragment key={fila}>
              <div className="flex items-center justify-center pr-1 text-xs font-semibold text-on-surface-variant">
                {fila}
              </div>
              {columnasArr.map((c) => {
                const key = `${fila}${c}`;
                const ocupante = ocupadasMap.get(key);
                const seleccionada = fila === filaSeleccionada && c === columnaSeleccionada;
                return (
                  <button
                    type="button"
                    key={key}
                    disabled={!!ocupante}
                    onClick={() => onSeleccionar(fila, c)}
                    title={ocupante ? `Ocupada: ${ocupante}` : `${key} — libre`}
                    aria-label={`${key}${ocupante ? `, ocupada por ${ocupante}` : ", libre"}`}
                    aria-pressed={seleccionada}
                    className={`m-0.5 flex aspect-square min-h-[1.5rem] items-center justify-center rounded text-[9px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      seleccionada
                        ? "bg-primary text-on-primary ring-2 ring-primary-container ring-offset-1"
                        : ocupante
                          ? "cursor-not-allowed bg-error-container/60 text-on-error-container"
                          : "bg-surface-container text-on-surface-variant hover:bg-primary-fixed"
                    }`}
                  >
                    {seleccionada ? key : ""}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-surface-container" /> Libre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-error-container/60" /> Ocupada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary" /> Seleccionada
        </span>
      </div>
    </div>
  );
}

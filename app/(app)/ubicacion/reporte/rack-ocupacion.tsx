"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { RackFrame } from "../rack-frame";

type Item = { id: string; nombreProducto: string };
type Celda = { fila: string; columna: number; items: Item[] };

type Props = {
  filaMin: string;
  filaMax: string;
  columnas: number;
  celdas: Celda[];
};

export function RackOcupacion({ filaMin, filaMax, columnas, celdas }: Props) {
  const [seleccionada, setSeleccionada] = useState<Celda | null>(null);
  const filaMinCode = filaMin.charCodeAt(0);
  const filaMaxCode = filaMax.charCodeAt(0);

  const filas: string[] = [];
  for (let c = filaMaxCode; c >= filaMinCode; c--) filas.push(String.fromCharCode(c));
  const columnasArr = Array.from({ length: columnas }, (_, i) => i + 1);

  const porCelda = new Map<string, Celda>();
  for (const c of celdas) porCelda.set(`${c.fila}${c.columna}`, c);

  return (
    <div>
      <RackFrame>
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
                  const celda = porCelda.get(`${fila}${c}`);
                  const ocupada = !!celda;
                  const activa = seleccionada?.fila === fila && seleccionada?.columna === c;
                  const divisor = c % 2 === 0 && c !== columnas;
                  return (
                    <button
                      type="button"
                      key={`${fila}-${c}`}
                      onClick={() => setSeleccionada(ocupada ? (celda as Celda) : null)}
                      title={ocupada ? celda!.items.map((i) => i.nombreProducto).join(", ") : `${fila}${c} — vacía`}
                      style={divisor && !activa ? { boxShadow: "inset -2px 0 0 0 var(--color-primary)" } : undefined}
                      className={`m-0.5 flex aspect-square min-h-[1.5rem] items-center justify-center rounded text-[9px] font-semibold transition-colors ${
                        activa
                          ? "bg-primary text-on-primary ring-2 ring-primary-container ring-offset-1"
                          : ocupada
                            ? "bg-error-container/60 text-on-error-container hover:bg-error-container"
                            : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {ocupada && celda!.items.length > 1 ? celda!.items.length : ""}
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </RackFrame>

      <div className="mt-2 flex flex-wrap gap-4 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-surface-container" /> Vacía
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-error-container/60" /> Ocupada
        </span>
      </div>

      {seleccionada ? (
        <div className="mt-3 rounded-card border border-outline-variant bg-surface-container-lowest p-4">
          <p className="text-sm font-semibold text-on-surface">
            {seleccionada.fila}
            {seleccionada.columna} — {seleccionada.items.length} producto{seleccionada.items.length === 1 ? "" : "s"}
          </p>
          <ul className="mt-2 space-y-1.5">
            {seleccionada.items.map((it) => (
              <li key={it.id}>
                <Link
                  href={`/ubicacion/${it.id}`}
                  className="block rounded-md bg-surface-container px-3 py-2 text-sm text-on-surface transition-colors hover:bg-primary-fixed"
                >
                  {it.nombreProducto}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

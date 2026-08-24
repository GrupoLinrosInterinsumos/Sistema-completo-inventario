"use client";

import { useState } from "react";

type Hermano = { nCaja: string; nombreSabor: string };

type Props = {
  label: string;
  nCajaActual: string;
  hermanos: Hermano[];
};

export function UbicacionChips({ label, nCajaActual, hermanos }: Props) {
  const [abierto, setAbierto] = useState(false);

  if (hermanos.length <= 1) return null;

  return (
    <div className="mt-3 border-t border-outline-variant pt-3">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="text-xs font-medium text-primary transition-colors hover:text-primary-container"
      >
        {abierto ? "Ocultar" : "Ver"} {label.toLowerCase()} completa ({hermanos.length} cajas)
      </button>

      {abierto ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {hermanos.map((h) => {
            const actual = h.nCaja === nCajaActual;
            return (
              <span
                key={h.nCaja}
                title={h.nombreSabor}
                className={`rounded-chip px-2 py-1 text-[11px] font-medium ${
                  actual
                    ? "bg-primary text-on-primary ring-2 ring-primary-container ring-offset-1"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {h.nCaja}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

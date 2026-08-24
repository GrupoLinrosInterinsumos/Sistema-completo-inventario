"use client";

import { useState } from "react";
import { RackFrame } from "../ubicacion/rack-frame";

type Hermano = { nCaja: string; nombreSabor: string };

type Props = {
  label: string;
  nCajaActual: string;
  hermanos: Hermano[];
};

// Orden natural: números antes que letras, números en orden numérico (no
// alfabético, para que "10" no quede antes que "2").
function compararNCaja(a: string, b: string) {
  const na = Number(a);
  const nb = Number(b);
  const aEsNum = a !== "" && !Number.isNaN(na);
  const bEsNum = b !== "" && !Number.isNaN(nb);
  if (aEsNum && bEsNum) return na - nb;
  if (aEsNum) return -1;
  if (bEsNum) return 1;
  return a.localeCompare(b);
}

export function UbicacionChips({ label, nCajaActual, hermanos }: Props) {
  const [abierto, setAbierto] = useState(false);

  if (hermanos.length <= 1) return null;

  const ordenados = [...hermanos].sort((a, b) => compararNCaja(a.nCaja, b.nCaja));

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
        <div className="mt-2">
          <RackFrame>
            <div className="rounded-card border border-outline-variant bg-surface-container-lowest p-3">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(2.25rem, 1fr))" }}
              >
                {ordenados.map((h, i) => {
                  const actual = h.nCaja === nCajaActual;
                  const divisor = (i + 1) % 5 === 0 && i !== ordenados.length - 1;
                  return (
                    <span
                      key={`${h.nCaja}-${i}`}
                      title={h.nombreSabor}
                      style={divisor ? { boxShadow: "inset -2px 0 0 0 var(--color-primary)" } : undefined}
                      className={`flex items-center justify-center rounded px-1.5 py-1.5 text-[11px] font-medium ${
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
            </div>
          </RackFrame>
        </div>
      ) : null}
    </div>
  );
}

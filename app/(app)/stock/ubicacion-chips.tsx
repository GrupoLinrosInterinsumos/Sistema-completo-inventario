"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RackFrame } from "../ubicacion/rack-frame";

type Hermano = { id: string; nCaja: string; nombreSabor: string };
type Posicion = { nCaja: string; items: Hermano[] };

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
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [seleccionada, setSeleccionada] = useState<Posicion | null>(null);

  if (hermanos.length <= 1) return null;

  // Una misma posición puede tener más de un producto (varios lotes) — se
  // agrupa para no repetir la celda, y al entrar se ve cuál es cuál.
  const porPosicion = new Map<string, Hermano[]>();
  for (const h of hermanos) {
    const lista = porPosicion.get(h.nCaja) ?? [];
    lista.push(h);
    porPosicion.set(h.nCaja, lista);
  }
  const posiciones: Posicion[] = [...porPosicion.entries()]
    .map(([nCaja, items]) => ({ nCaja, items }))
    .sort((a, b) => compararNCaja(a.nCaja, b.nCaja));

  function elegir(pos: Posicion) {
    if (pos.items.length === 1) {
      router.push(`/ubicacion/stock/${pos.items[0].id}`);
      return;
    }
    setSeleccionada(pos);
  }

  return (
    <div className="mt-3 border-t border-outline-variant pt-3">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="text-xs font-medium text-primary transition-colors hover:text-primary-container"
      >
        {abierto ? "Ocultar" : "Ver"} {label.toLowerCase()} completa ({posiciones.length} posiciones)
      </button>

      {abierto ? (
        <div className="mt-2">
          <RackFrame>
            <div className="rounded-card border border-outline-variant bg-surface-container-lowest p-3">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(2.25rem, 1fr))" }}
              >
                {posiciones.map((pos, i) => {
                  const actual = pos.nCaja === nCajaActual;
                  const divisor = (i + 1) % 5 === 0 && i !== posiciones.length - 1;
                  return (
                    <button
                      type="button"
                      key={pos.nCaja}
                      onClick={() => elegir(pos)}
                      title={pos.items.map((it) => it.nombreSabor).join(", ")}
                      style={divisor ? { boxShadow: "inset -2px 0 0 0 var(--color-primary)" } : undefined}
                      className={`flex items-center justify-center rounded px-1.5 py-1.5 text-[11px] font-medium transition-transform hover:scale-110 active:scale-95 ${
                        actual
                          ? "bg-primary text-on-primary ring-2 ring-primary-container ring-offset-1"
                          : "bg-surface-container text-on-surface-variant hover:bg-primary-fixed"
                      }`}
                    >
                      {pos.nCaja}
                      {pos.items.length > 1 ? <span className="ml-0.5 text-[9px]">×{pos.items.length}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </RackFrame>

          {seleccionada ? (
            <div className="mt-3 rounded-card border border-outline-variant bg-surface-container-lowest p-4">
              <p className="text-sm font-semibold text-on-surface">
                {label} {seleccionada.nCaja} — {seleccionada.items.length} producto
                {seleccionada.items.length === 1 ? "" : "s"}
              </p>
              <ul className="mt-2 space-y-1.5">
                {seleccionada.items.map((it) => (
                  <li key={it.id}>
                    <Link
                      href={`/ubicacion/stock/${it.id}`}
                      className="block rounded-md bg-surface-container px-3 py-2 text-sm text-on-surface transition-colors hover:bg-primary-fixed"
                    >
                      {it.nombreSabor}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

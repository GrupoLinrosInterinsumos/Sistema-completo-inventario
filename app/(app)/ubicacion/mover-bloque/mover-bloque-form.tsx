"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { rackInvertido } from "@/lib/racks";
import { ZONAS_FIJAS } from "@/lib/ubicaciones-fijas";
import { moverEnBloqueAction, type DestinoBloque } from "../actions";
import { RackPicker } from "../rack-picker";

type Rack = { id: string; numero: number; filaMin: string; filaMax: string; columnas: number };
type Ocupante = { rackId: string; fila: string; columna: number; nombreProducto: string };
type Celda = { fila: string; columna: number };

export type ItemBloque = {
  id: string;
  nombreProducto: string;
  ubicacionActual: string;
  lote: string | null;
  vencimiento: string | null;
};

export function MoverBloqueForm({
  items,
  racks,
  ocupadas,
  volverHref,
}: {
  items: ItemBloque[];
  racks: Rack[];
  ocupadas: Ocupante[];
  volverHref: string;
}) {
  const router = useRouter();
  // Una sola lista con todas las ubicaciones: "rack:<id>" o "zona:<nombre>".
  const [destino, setDestino] = useState(racks[0] ? `rack:${racks[0].id}` : `zona:${ZONAS_FIJAS[0]}`);
  const [celdas, setCeldas] = useState<Celda[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const modo: "rack" | "area" = destino.startsWith("rack:") ? "rack" : "area";
  const rackId = modo === "rack" ? destino.slice("rack:".length) : "";
  const zona = modo === "area" ? destino.slice("zona:".length) : "";
  const rackSeleccionado = useMemo(() => racks.find((r) => r.id === rackId), [racks, rackId]);
  const ocupadasDelRack = useMemo(() => ocupadas.filter((o) => o.rackId === rackId), [ocupadas, rackId]);

  const completo = modo === "area" || celdas.length === items.length;

  function cambiarDestino(nuevo: string) {
    setDestino(nuevo);
    setCeldas([]);
    setError(null);
  }

  function alternarCelda(fila: string, columna: number) {
    setError(null);
    const existe = celdas.some((c) => c.fila === fila && c.columna === columna);
    if (existe) {
      setCeldas((prev) => prev.filter((c) => !(c.fila === fila && c.columna === columna)));
      return;
    }
    if (celdas.length >= items.length) {
      setError(`Ya elegiste ${items.length} celda${items.length === 1 ? "" : "s"}, una por producto. Quita alguna para cambiarla.`);
      return;
    }
    setCeldas((prev) => [...prev, { fila, columna }]);
  }

  function destinoDe(i: number): string {
    if (modo === "area") return zona;
    const c = celdas[i];
    return c ? `Rack ${rackSeleccionado?.numero} — ${c.fila}${c.columna}` : "— falta elegir celda —";
  }

  function confirmar() {
    if (!completo) {
      setError(`Elige ${items.length} celda${items.length === 1 ? "" : "s"} (una por producto). Llevas ${celdas.length}.`);
      return;
    }
    setError(null);
    const destinos: DestinoBloque[] =
      modo === "area"
        ? items.map((it) => ({ id: it.id, areaLibre: zona }))
        : items.map((it, i) => ({ id: it.id, rackId, fila: celdas[i].fila, columna: celdas[i].columna }));
    startTransition(async () => {
      const result = await moverEnBloqueAction(destinos);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(volverHref);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="bloque-destino" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Nueva ubicación
        </label>
        <select
          id="bloque-destino"
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

      {modo === "rack" && rackSeleccionado ? (
        <div>
          <p className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Haz clic en {items.length} celda{items.length === 1 ? "" : "s"} de destino, una por producto
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Se asignan en el orden en que las eliges: la primera celda al primer producto de la lista, y así
            sucesivamente.
          </p>
          <div className="mt-2">
            <RackPicker
              filaMin={rackSeleccionado.filaMin}
              filaMax={rackSeleccionado.filaMax}
              columnas={rackSeleccionado.columnas}
              ocupadas={ocupadasDelRack}
              seleccionadas={celdas}
              onAlternar={alternarCelda}
              invertido={rackInvertido(rackSeleccionado.numero)}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-sm text-on-surface">
              Celdas elegidas:{" "}
              <span className={`font-semibold ${completo ? "text-on-surface" : "text-secondary"}`}>
                {celdas.length} de {items.length}
              </span>
            </p>
            {celdas.length > 0 ? (
              <button
                type="button"
                onClick={() => setCeldas([])}
                className="text-xs font-medium text-primary transition-colors hover:text-primary-container"
              >
                Limpiar celdas
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-sm text-on-surface">
          Los {items.length} productos quedarán en <span className="font-semibold">{zona}</span> (zona sin celdas).
        </p>
      )}

      <div className="overflow-hidden rounded-card border border-outline-variant">
        <div className="max-h-80 overflow-auto">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="sticky top-0 bg-surface-container">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Producto</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Lote</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">De</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {items.map((it, i) => (
                <tr key={it.id}>
                  <td className="px-3 py-2 text-sm text-on-surface">{it.nombreProducto}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-on-surface-variant">
                    {[it.lote, it.vencimiento ? `vence ${it.vencimiento}` : null].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-on-surface-variant">{it.ubicacionActual}</td>
                  <td
                    className={`whitespace-nowrap px-3 py-2 text-sm font-semibold ${
                      modo === "rack" && !celdas[i] ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {destinoDe(i)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>
      ) : null}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push(volverHref)}>
          Cancelar
        </Button>
        <Button type="button" loading={pending} disabled={!completo} onClick={confirmar}>
          {pending ? "Moviendo..." : `Mover ${items.length} producto${items.length === 1 ? "" : "s"}`}
        </Button>
      </div>
    </div>
  );
}

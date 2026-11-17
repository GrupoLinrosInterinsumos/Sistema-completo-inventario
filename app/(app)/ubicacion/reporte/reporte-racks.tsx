"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { rackInvertido } from "@/lib/racks";
import { RackOcupacion } from "./rack-ocupacion";

type Item = { id: string; nombreProducto: string };
type Celda = { fila: string; columna: number; items: Item[] };
export type RackData = {
  id: string;
  numero: number;
  filaMin: string;
  filaMax: string;
  columnas: number;
  celdas: Celda[];
  totalCeldas: number;
};
type FilaBusqueda = { id: string; nombreProducto: string; rackNumero: number; fila: string; columna: number };

export function ReporteRacks({ racks, filasBusqueda }: { racks: RackData[]; filasBusqueda: FilaBusqueda[] }) {
  const [rackId, setRackId] = useState(racks[0]?.id ?? "");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const router = useRouter();

  const rackActual = racks.find((r) => r.id === rackId) ?? racks[0];

  // Ordenadas por rack y celda para que el reparto al mover en bloque sea
  // predecible.
  const coincidencias = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    return filasBusqueda
      .filter((f) => f.nombreProducto.toLowerCase().includes(q))
      .sort((a, b) => a.rackNumero - b.rackNumero || a.fila.localeCompare(b.fila) || a.columna - b.columna);
  }, [busqueda, filasBusqueda]);

  const todasMarcadas = coincidencias.length > 0 && coincidencias.every((f) => seleccion.has(f.id));

  function alternarSeleccion(id: string) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function alternarTodas() {
    setSeleccion(todasMarcadas ? new Set() : new Set(coincidencias.map((f) => f.id)));
  }

  function moverSeleccionadas() {
    const ids = coincidencias.filter((f) => seleccion.has(f.id)).map((f) => f.id);
    router.push(`/ubicacion/mover-bloque?${new URLSearchParams({ ids: ids.join(","), desde: "reporte" }).toString()}`);
  }

  const seleccionadasVisibles = coincidencias.filter((f) => seleccion.has(f.id)).length;

  return (
    <div>
      <div>
        <label htmlFor="reporte-buscar" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Buscar producto en los racks
        </label>
        <input
          id="reporte-buscar"
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Nombre del producto..."
          className="mt-1 w-full max-w-md rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {busqueda.trim() ? (
        <div className="mt-4 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
          {coincidencias.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-low px-4 py-2.5">
              <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
                <input
                  type="checkbox"
                  checked={todasMarcadas}
                  onChange={alternarTodas}
                  className="h-5 w-5 shrink-0 rounded border-outline-variant text-primary focus:ring-primary"
                />
                {seleccionadasVisibles > 0
                  ? `${seleccionadasVisibles} de ${coincidencias.length} seleccionada${seleccionadasVisibles === 1 ? "" : "s"}`
                  : `Seleccionar todas (${coincidencias.length})`}
              </label>
              {seleccionadasVisibles > 0 ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSeleccion(new Set())}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={moverSeleccionadas}>
                    Mover seleccionadas
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container">
              <tr>
                <th className="w-10 px-4 py-2" />
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Rack</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Ubicación</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Producto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {coincidencias.map((f) => (
                <tr key={f.id} className="transition-colors hover:bg-surface-container">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={seleccion.has(f.id)}
                      onChange={() => alternarSeleccion(f.id)}
                      aria-label={`Seleccionar ${f.nombreProducto} en Rack ${f.rackNumero} ${f.fila}${f.columna}`}
                      className="h-5 w-5 shrink-0 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-on-surface">Rack {f.rackNumero}</td>
                  <td className="px-4 py-2 text-sm font-semibold text-on-surface">
                    {f.fila}
                    {f.columna}
                  </td>
                  <td className="px-4 py-2 text-sm text-on-surface-variant">
                    <Link href={`/ubicacion/${f.id}`} className="text-primary hover:underline">
                      {f.nombreProducto}
                    </Link>
                  </td>
                </tr>
              ))}
              {coincidencias.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-on-surface-variant">
                    No se encontró ese producto en ningún rack.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-surface-container">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Rack</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Ocupadas</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Vacías</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {racks.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => {
                      setRackId(r.id);
                      setMostrarTodos(false);
                    }}
                    className={`cursor-pointer transition-colors hover:bg-surface-container ${r.id === rackId ? "bg-primary-fixed" : ""}`}
                  >
                    <td className="px-4 py-2 text-sm font-semibold text-on-surface">Rack {r.numero}</td>
                    <td className="px-4 py-2 text-sm text-on-surface-variant">{r.celdas.length}</td>
                    <td className="px-4 py-2 text-sm text-on-surface-variant">{r.totalCeldas - r.celdas.length}</td>
                    <td className="px-4 py-2 text-sm text-on-surface-variant">{r.totalCeldas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {racks.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRackId(r.id);
                  setMostrarTodos(false);
                }}
                className={`rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
                  r.id === rackId
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                Rack {r.numero}
              </button>
            ))}
          </div>

          {rackActual ? (
            <div className="mt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-headline-sm text-on-surface">Rack {rackActual.numero}</h2>
                <div className="flex gap-2">
                  <Badge variant="neutral">{rackActual.celdas.length} ocupadas</Badge>
                  <Badge variant="success">{rackActual.totalCeldas - rackActual.celdas.length} vacías</Badge>
                  <Badge variant="info">{rackActual.totalCeldas} celdas</Badge>
                </div>
              </div>

              <p className="mt-1 text-xs text-on-surface-variant">
                Haz clic en una celda de la cuadrícula para ver qué producto hay ahí.
              </p>

              <div className="mt-3">
                <RackOcupacion
                  filaMin={rackActual.filaMin}
                  filaMax={rackActual.filaMax}
                  columnas={rackActual.columnas}
                  celdas={rackActual.celdas}
                  invertido={rackInvertido(rackActual.numero)}
                />
              </div>

              {rackActual.celdas.length > 0 ? (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setMostrarTodos((v) => !v)}
                    className="text-xs font-medium text-primary transition-colors hover:text-primary-container"
                  >
                    {mostrarTodos ? "Ocultar" : "Mostrar"} todos los productos del Rack {rackActual.numero} (
                    {rackActual.celdas.length})
                  </button>

                  {mostrarTodos ? (
                    <div className="mt-2 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
                      <table className="min-w-full divide-y divide-outline-variant">
                        <thead className="bg-surface-container">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                              Celda
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                              Productos
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {[...rackActual.celdas]
                            .sort((a, b) => a.fila.localeCompare(b.fila) || a.columna - b.columna)
                            .map((celda) => (
                              <tr key={`${celda.fila}${celda.columna}`} className="align-top transition-colors hover:bg-surface-container">
                                <td className="whitespace-nowrap px-4 py-2 text-sm font-semibold text-on-surface">
                                  {celda.fila}
                                  {celda.columna}
                                </td>
                                <td className="px-4 py-2 text-sm text-on-surface-variant">
                                  <div className="flex flex-wrap gap-1.5">
                                    {celda.items.map((it) => (
                                      <Link
                                        key={it.id}
                                        href={`/ubicacion/${it.id}`}
                                        className="rounded-chip bg-surface-container px-2 py-1 text-xs text-on-surface transition-colors hover:bg-primary-fixed"
                                      >
                                        {it.nombreProducto}
                                      </Link>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

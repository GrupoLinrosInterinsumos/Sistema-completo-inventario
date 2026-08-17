"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { KpiCard } from "@/app/components/ui/kpi-card";
import { ProgressBar } from "@/app/components/ui/progress-bar";
import { IconCheck, IconPackage, IconPlus, IconTrash } from "@/app/components/ui/icons";
import { guardarDesgloseAction, subirAStockAction, type FilaDesglose } from "./actions";

type DesgloseExistente = {
  id: string;
  ubicacionNumero: string;
  nCaja: string;
  cantidadKg: number;
  subidoAStock: boolean;
};

type Props = {
  ingresoDetalleId: string;
  productoLabel: string;
  lote: string;
  fProduccionLabel: string;
  fVencimientoLabel: string;
  cantidadTotal: number;
  unidad: string;
  estadoDesglose: "PENDIENTE" | "PARCIAL" | "COMPLETO";
  ubicacionLabel: string;
  desglosesExistentes: DesgloseExistente[];
};

const ESTADO_BADGE = {
  PENDIENTE: { variant: "neutral" as const, label: "Pendiente" },
  PARCIAL: { variant: "warning" as const, label: "Parcial" },
  COMPLETO: { variant: "success" as const, label: "Lote verificado" },
};

const FILA_VACIA = { ubicacionNumero: "", nCaja: "", cantidadKg: "" };

export function DesgloseLinea({
  ingresoDetalleId,
  productoLabel,
  lote,
  fProduccionLabel,
  fVencimientoLabel,
  cantidadTotal,
  unidad,
  estadoDesglose,
  ubicacionLabel,
  desglosesExistentes,
}: Props) {
  const router = useRouter();
  const idPrefix = useId();
  const [abierto, setAbierto] = useState(estadoDesglose !== "COMPLETO");
  const [filas, setFilas] = useState<FilaDesglose[]>([]);
  const [nuevaFila, setNuevaFila] = useState(FILA_VACIA);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const yaDistribuido = desglosesExistentes.reduce((acc, d) => acc + d.cantidadKg, 0);
  const enEdicion = filas.reduce((acc, f) => acc + f.cantidadKg, 0);
  const totalConEdicion = yaDistribuido + enEdicion;
  const restante = Math.max(0, cantidadTotal - totalConEdicion);
  const pctAsignado = cantidadTotal > 0 ? Math.min(100, (totalConEdicion / cantidadTotal) * 100) : 0;
  const badge = ESTADO_BADGE[estadoDesglose];

  function agregarFila() {
    if (!nuevaFila.ubicacionNumero.trim() || !nuevaFila.nCaja.trim() || !nuevaFila.cantidadKg) {
      setError(`Completa ${ubicacionLabel.toLowerCase()}, N° de caja y cantidad.`);
      return;
    }
    const cantidad = Number(nuevaFila.cantidadKg);
    if (!(cantidad > 0)) {
      setError("La cantidad debe ser mayor a 0.");
      return;
    }
    if (cantidad > restante + EPSILON_DISPLAY) {
      setError(
        `No puedes asignar más de lo recibido. Restante disponible: ${restante} ${unidad}.`
      );
      return;
    }
    setError(null);
    setFilas((prev) => [
      ...prev,
      {
        ubicacionNumero: nuevaFila.ubicacionNumero.trim(),
        nCaja: nuevaFila.nCaja.trim(),
        cantidadKg: cantidad,
      },
    ]);
    setNuevaFila(FILA_VACIA);
  }

  function quitarFila(index: number) {
    setFilas((prev) => prev.filter((_, i) => i !== index));
  }

  function guardar() {
    setError(null);
    startTransition(async () => {
      const result = await guardarDesgloseAction(ingresoDetalleId, filas);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setFilas([]);
      router.refresh();
    });
  }

  function subirAStock() {
    setError(null);
    startTransition(async () => {
      const result = await subirAStockAction(ingresoDetalleId, filas);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setFilas([]);
      router.refresh();
    });
  }

  return (
    <div className="border-b border-outline-variant last:border-b-0">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div>
          <p className="text-sm font-medium text-on-surface">{productoLabel}</p>
          <p className="text-xs text-on-surface-variant">
            Lote {lote} · F.Prod {fProduccionLabel} · F.Venc {fVencimientoLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-on-surface-variant">
            {yaDistribuido} / {cantidadTotal} {unidad}
          </span>
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <span className="text-on-surface-variant">{abierto ? "▲" : "▼"}</span>
        </div>
      </button>

      {abierto ? (
        <div className="grid grid-cols-1 gap-4 bg-surface-container-low p-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <KpiCard
              icon={<IconPackage size={18} />}
              label="Total recibido"
              value={`${cantidadTotal} ${unidad}`}
              chipLabel={badge.label}
              chipVariant={badge.variant}
            />

            <Card className="p-4">
              <p className="text-sm font-semibold text-on-surface">Estado de distribución</p>
              <div className="mt-2 flex items-center justify-between text-xs text-on-surface-variant">
                <span>Progreso de asignación</span>
                <span>{Math.round(pctAsignado)}%</span>
              </div>
              <div className="mt-1">
                <ProgressBar value={pctAsignado} max={100} tone="primary" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-surface-container-lowest p-2 text-center">
                  <p className="text-headline-sm text-on-surface">{totalConEdicion}</p>
                  <p className="text-xs text-on-surface-variant">Asignados</p>
                </div>
                <div className="rounded-md bg-error-container/40 p-2 text-center">
                  <p className="text-headline-sm text-secondary">{restante}</p>
                  <p className="text-xs text-on-surface-variant">Pendientes</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="flex flex-col">
            <div className="flex items-center justify-between border-b border-outline-variant p-4">
              <p className="text-sm font-semibold text-on-surface">
                Asignación de {ubicacionLabel.replace("N° ", "")}s y cajas
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant">
                <thead className="bg-surface-container">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                      {ubicacionLabel}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                      N° Caja
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                      Cantidad
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {desglosesExistentes.map((d) => (
                    <tr key={d.id}>
                      <td className="px-3 py-2 text-sm text-on-surface">{d.ubicacionNumero}</td>
                      <td className="px-3 py-2 text-sm text-on-surface">{d.nCaja}</td>
                      <td className="px-3 py-2 text-sm text-on-surface">
                        {d.cantidadKg} {unidad}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <Badge variant={d.subidoAStock ? "success" : "warning"} icon={d.subidoAStock ? <IconCheck size={12} /> : undefined}>
                          {d.subidoAStock ? "En stock" : "Listo"}
                        </Badge>
                      </td>
                    </tr>
                  ))}

                  {filas.map((fila, index) => (
                    <tr key={index} className="bg-primary-fixed/30">
                      <td className="px-3 py-2 text-sm text-on-surface">{fila.ubicacionNumero}</td>
                      <td className="px-3 py-2 text-sm text-on-surface">{fila.nCaja}</td>
                      <td className="px-3 py-2 text-sm text-on-surface">
                        {fila.cantidadKg} {unidad}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <button
                          type="button"
                          onClick={() => quitarFila(index)}
                          aria-label="Quitar caja"
                          className="rounded p-1 text-secondary transition-colors hover:bg-error-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <IconTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td className="px-3 py-2">
                      <label htmlFor={`${idPrefix}-ubicacion`} className="sr-only">
                        {ubicacionLabel}
                      </label>
                      <input
                        id={`${idPrefix}-ubicacion`}
                        type="text"
                        placeholder={`Ej. ${ubicacionLabel.includes("Slot") ? "A1" : "900"}`}
                        value={nuevaFila.ubicacionNumero}
                        onChange={(e) => setNuevaFila((p) => ({ ...p, ubicacionNumero: e.target.value }))}
                        className="w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <label htmlFor={`${idPrefix}-caja`} className="sr-only">
                        N° Caja
                      </label>
                      <input
                        id={`${idPrefix}-caja`}
                        type="text"
                        placeholder="Ej. 950"
                        value={nuevaFila.nCaja}
                        onChange={(e) => setNuevaFila((p) => ({ ...p, nCaja: e.target.value }))}
                        className="w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <label htmlFor={`${idPrefix}-cantidad`} className="sr-only">
                        Cantidad
                      </label>
                      <input
                        id={`${idPrefix}-cantidad`}
                        type="number"
                        min="0"
                        max={restante}
                        step="0.01"
                        placeholder={`Máx. ${restante} ${unidad}`}
                        value={nuevaFila.cantidadKg}
                        onChange={(e) => setNuevaFila((p) => ({ ...p, cantidadKg: e.target.value }))}
                        className="w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={agregarFila}
                        aria-label="Agregar caja a la lista"
                        className="flex min-h-9 min-w-9 items-center justify-center rounded-md border border-outline-variant text-primary transition-colors hover:bg-primary-fixed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <IconPlus size={16} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-auto border-t border-outline-variant p-4">
              <p className="text-xs text-on-surface-variant">
                Total distribuido: {totalConEdicion} / {cantidadTotal} {unidad}
                {restante > EPSILON_DISPLAY ? (
                  <span className="ml-2 font-medium text-secondary">⚠ Faltan {restante} {unidad}</span>
                ) : (
                  <span className="ml-2 font-medium text-green-700">Asegúrese de asignar el 100% antes de subir a stock.</span>
                )}
              </p>

              {error ? (
                <p className="mt-2 rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>
              ) : null}

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" size="sm" disabled={pending || filas.length === 0} onClick={guardar}>
                  Guardar desglose
                </Button>
                <Button size="sm" loading={pending} onClick={subirAStock}>
                  Subir a stock
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

const EPSILON_DISPLAY = 0.001;

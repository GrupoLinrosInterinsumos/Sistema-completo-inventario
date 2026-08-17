"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { IconPackage, IconPlus, IconTrash } from "@/app/components/ui/icons";
import {
  createIngresoAction,
  updateIngresoAction,
  type IngresoInput,
  type LineaInput,
} from "./actions";

type Almacen = { id: string; nombre: string; tipoUbicacion: string };
type Producto = { id: string; nombreSabor: string; codigo: string; presentacion: string; almacenId: string };

type Props = {
  almacenes: Almacen[];
  productos: Producto[];
  mode: "crear" | "editar";
  ingresoId?: string;
  initial?: {
    almacenId: string;
    guiaTraslado: string;
    lineas: LineaInput[];
  };
};

function formatFechaDMY(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const LINEA_VACIA = {
  productoId: "",
  lote: "",
  fProduccion: "",
  fVencimiento: "",
  cantidadTotal: "",
  unidad: "kg",
};

export function IngresoForm({ almacenes, productos, mode, ingresoId, initial }: Props) {
  const router = useRouter();
  const [almacenId, setAlmacenId] = useState(initial?.almacenId ?? almacenes[0]?.id ?? "");
  const [guiaTraslado, setGuiaTraslado] = useState(initial?.guiaTraslado ?? "");
  const [lineas, setLineas] = useState<LineaInput[]>(initial?.lineas ?? []);
  const [nuevaLinea, setNuevaLinea] = useState(LINEA_VACIA);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const productosPorId = useMemo(
    () => new Map(productos.map((p) => [p.id, p])),
    [productos]
  );

  const productosDelAlmacen = useMemo(
    () => productos.filter((p) => p.almacenId === almacenId),
    [productos, almacenId]
  );

  function cambiarAlmacen(nuevoAlmacenId: string) {
    setAlmacenId(nuevoAlmacenId);
    setLineas([]);
    setNuevaLinea(LINEA_VACIA);
  }

  function agregarLinea() {
    if (
      !nuevaLinea.productoId ||
      !nuevaLinea.lote.trim() ||
      !nuevaLinea.fProduccion ||
      !nuevaLinea.fVencimiento ||
      !nuevaLinea.cantidadTotal
    ) {
      setError("Completa producto, lote, fechas y cantidad antes de agregar.");
      return;
    }
    const cantidad = Number(nuevaLinea.cantidadTotal);
    if (!(cantidad > 0)) {
      setError("La cantidad debe ser mayor a 0.");
      return;
    }

    setError(null);
    setLineas((prev) => [
      ...prev,
      {
        productoId: nuevaLinea.productoId,
        lote: nuevaLinea.lote.trim(),
        fProduccion: nuevaLinea.fProduccion,
        fVencimiento: nuevaLinea.fVencimiento,
        cantidadTotal: cantidad,
        unidad: nuevaLinea.unidad,
      },
    ]);
    setNuevaLinea(LINEA_VACIA);
  }

  function quitarLinea(index: number) {
    setLineas((prev) => prev.filter((_, i) => i !== index));
  }

  function guardar(confirmar: boolean) {
    if (lineas.length === 0) {
      setError("Agrega al menos un producto a la lista antes de guardar.");
      return;
    }
    setError(null);

    const input: IngresoInput = { almacenId, guiaTraslado, lineas };

    startTransition(async () => {
      const result =
        mode === "crear"
          ? await createIngresoAction(input, confirmar)
          : await updateIngresoAction(ingresoId!, input, confirmar);

      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(`/ingresos/${result.id}`);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-sm font-semibold text-on-surface">Detalles del documento</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ingreso-almacen" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
                Almacén
              </label>
              {mode === "crear" ? (
                <select
                  id="ingreso-almacen"
                  value={almacenId}
                  onChange={(e) => cambiarAlmacen(e.target.value)}
                  className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {almacenes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 text-sm text-on-surface">
                  {almacenes.find((a) => a.id === almacenId)?.nombre}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="ingreso-guia" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
                Guía de traslado (opcional)
              </label>
              <input
                id="ingreso-guia"
                type="text"
                value={guiaTraslado}
                onChange={(e) => setGuiaTraslado(e.target.value)}
                className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold text-on-surface">Agregar producto</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="sm:col-span-2 lg:col-span-2">
              <label htmlFor="nueva-linea-producto" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
                Producto
              </label>
              <select
                id="nueva-linea-producto"
                value={nuevaLinea.productoId}
                onChange={(e) => setNuevaLinea((p) => ({ ...p, productoId: e.target.value }))}
                className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Seleccionar...</option>
                {productosDelAlmacen.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombreSabor} ({p.presentacion})
                  </option>
                ))}
              </select>
              {productosDelAlmacen.length === 0 ? (
                <p className="mt-1 text-xs text-secondary">
                  No hay productos activos en el catálogo para este almacén.
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="nueva-linea-lote" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
                Lote
              </label>
              <input
                id="nueva-linea-lote"
                type="text"
                value={nuevaLinea.lote}
                onChange={(e) => setNuevaLinea((p) => ({ ...p, lote: e.target.value }))}
                className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="nueva-linea-fprod" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
                F. Producción
              </label>
              <input
                id="nueva-linea-fprod"
                type="date"
                value={nuevaLinea.fProduccion}
                onChange={(e) => setNuevaLinea((p) => ({ ...p, fProduccion: e.target.value }))}
                className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="nueva-linea-fvenc" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
                F. Vencimiento
              </label>
              <input
                id="nueva-linea-fvenc"
                type="date"
                value={nuevaLinea.fVencimiento}
                onChange={(e) => setNuevaLinea((p) => ({ ...p, fVencimiento: e.target.value }))}
                className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2">
              <div className="w-2/3">
                <label htmlFor="nueva-linea-cantidad" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
                  Cantidad
                </label>
                <input
                  id="nueva-linea-cantidad"
                  type="number"
                  min="0"
                  step="0.01"
                  value={nuevaLinea.cantidadTotal}
                  onChange={(e) =>
                    setNuevaLinea((p) => ({ ...p, cantidadTotal: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="w-1/3">
                <label htmlFor="nueva-linea-unidad" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
                  Unidad
                </label>
                <select
                  id="nueva-linea-unidad"
                  value={nuevaLinea.unidad}
                  onChange={(e) => setNuevaLinea((p) => ({ ...p, unidad: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="kg">kg</option>
                  <option value="cajas">cajas</option>
                </select>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" className="mt-4" onClick={agregarLinea}>
            <IconPlus size={16} />
            Añadir a la lista
          </Button>
        </Card>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Card className="flex flex-col">
          <div className="flex items-center justify-between border-b border-outline-variant p-4">
            <div className="flex items-center gap-2">
              <IconPackage size={18} className="text-on-surface-variant" />
              <p className="text-sm font-semibold text-on-surface">Productos agregados</p>
            </div>
            <Badge variant="info">{lineas.length} ítem{lineas.length === 1 ? "" : "s"}</Badge>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {lineas.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-on-surface-variant">
                Aún no has agregado productos a esta ficha.
              </p>
            ) : (
              <ul className="space-y-2">
                {lineas.map((linea, index) => (
                  <li
                    key={index}
                    className="rounded-md border-l-4 border-l-primary border border-outline-variant bg-surface-container-low p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-on-surface">
                        {productosPorId.get(linea.productoId)?.nombreSabor ?? "—"}
                      </p>
                      <button
                        type="button"
                        onClick={() => quitarLinea(index)}
                        aria-label="Quitar producto"
                        className="rounded p-1 text-secondary transition-colors hover:bg-error-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-on-surface-variant">
                      <span className="rounded bg-surface-container px-1.5 py-0.5">
                        {linea.cantidadTotal} {linea.unidad}
                      </span>
                      <span className="rounded bg-surface-container px-1.5 py-0.5">Lote: {linea.lote}</span>
                      <span className="rounded bg-surface-container px-1.5 py-0.5">
                        Vence {formatFechaDMY(linea.fVencimiento)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error ? (
            <p className="mx-4 mb-3 rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">
              {error}
            </p>
          ) : null}

          <div className="space-y-2 border-t border-outline-variant p-4">
            <Button variant="outline" className="w-full" disabled={pending} onClick={() => guardar(false)}>
              Guardar como borrador
            </Button>
            <Button className="w-full" loading={pending} onClick={() => guardar(true)}>
              Confirmar ingreso
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

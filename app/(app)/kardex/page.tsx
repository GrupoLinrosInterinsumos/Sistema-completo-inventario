import Link from "next/link";
import { formatFechaLima } from "@/lib/format";
import { construirWhereKardex, parseKardexFiltros, TIPOS_MOVIMIENTO } from "@/lib/kardex";
import { prisma } from "@/lib/prisma";
import { labelUbicacion } from "@/lib/ubicacion";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { IconCheck, IconClock, IconDownload } from "@/app/components/ui/icons";

const TIPO_LABEL: Record<string, string> = {
  INGRESO: "Ingreso",
  SALIDA: "Salida",
  AJUSTE: "Ajuste",
  ANULACION: "Anulación",
};

const TIPO_VARIANT: Record<string, "success" | "warning" | "info" | "danger"> = {
  INGRESO: "success",
  SALIDA: "warning",
  AJUSTE: "info",
  ANULACION: "danger",
};

const PAGE_SIZE = 20;

export default async function KardexPage({ searchParams }: PageProps<"/kardex">) {
  const params = await searchParams;
  const filtros = parseKardexFiltros(params);
  const where = construirWhereKardex(filtros);
  const pageParam = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [movimientos, total, productos, almacenes, usuarios] = await Promise.all([
    prisma.movimiento.findMany({
      where,
      include: { producto: true, usuario: true, inventarioActual: { include: { almacen: true } } },
      orderBy: { fechaHora: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.movimiento.count({ where }),
    prisma.producto.findMany({ orderBy: { nombreSabor: "asc" } }),
    prisma.almacen.findMany({ orderBy: { nombre: "asc" } }),
    prisma.usuario.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filtroParams = Object.entries(filtros).filter(
    (entry): entry is [string, string] => Boolean(entry[1])
  );
  const queryString = new URLSearchParams(filtroParams).toString();

  function pageHref(p: number) {
    const sp = new URLSearchParams(filtroParams);
    sp.set("page", String(p));
    return `/kardex?${sp.toString()}`;
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">Kardex — Historial de movimientos</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Trazabilidad completa: quién, qué, cuándo y de dónde.
          </p>
        </div>
        <a href={`/api/kardex/export${queryString ? `?${queryString}` : ""}`}>
          <Button variant="outline">
            <IconDownload size={16} />
            Exportar a Excel
          </Button>
        </a>
      </div>

      <form method="get" className="mt-6 flex flex-col gap-4 rounded-card border border-outline-variant bg-surface-container-lowest p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="w-full sm:w-auto">
          <label htmlFor="kardex-producto" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Producto
          </label>
          <select
            id="kardex-producto"
            name="productoId"
            defaultValue={filtros.productoId ?? ""}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
          >
            <option value="">Todos</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombreSabor}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="kardex-almacen" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Almacén
          </label>
          <select
            id="kardex-almacen"
            name="almacenId"
            defaultValue={filtros.almacenId ?? ""}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
          >
            <option value="">Todos</option>
            {almacenes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="kardex-usuario" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Usuario
          </label>
          <select
            id="kardex-usuario"
            name="usuarioId"
            defaultValue={filtros.usuarioId ?? ""}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
          >
            <option value="">Todos</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="kardex-tipo" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Tipo
          </label>
          <select
            id="kardex-tipo"
            name="tipo"
            defaultValue={filtros.tipo ?? ""}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
          >
            <option value="">Todos</option>
            {TIPOS_MOVIMIENTO.map((t) => (
              <option key={t} value={t}>
                {TIPO_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="kardex-desde" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Desde
          </label>
          <input
            id="kardex-desde"
            type="date"
            name="desde"
            defaultValue={filtros.desde ?? ""}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
          />
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="kardex-hasta" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Hasta
          </label>
          <input
            id="kardex-hasta"
            type="date"
            name="hasta"
            defaultValue={filtros.hasta ?? ""}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
          />
        </div>

        <Button type="submit">Filtrar</Button>
      </form>

      <div className="mt-6 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant">
          <thead className="bg-surface-container">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Fecha</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Tipo</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Producto</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Almacén</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Ubicación</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Cantidad</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Usuario</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Referencia / Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {movimientos.map((m) => (
              <tr className="transition-colors hover:bg-surface-container" key={m.id}>
                <td className="px-4 py-2 text-sm text-on-surface-variant">
                  {formatFechaLima(m.fechaHora)}{" "}
                  {m.fechaHora.toLocaleTimeString("es-PE", { timeZone: "America/Lima", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-2 text-sm">
                  <Badge
                    variant={TIPO_VARIANT[m.tipo]}
                    icon={m.tipo === "INGRESO" ? <IconCheck size={12} /> : m.tipo === "SALIDA" ? <IconClock size={12} /> : undefined}
                  >
                    {TIPO_LABEL[m.tipo]}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-sm text-on-surface">{m.producto.nombreSabor}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{m.inventarioActual?.almacen.nombre ?? "—"}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">
                  {m.inventarioActual
                    ? `${labelUbicacion(m.inventarioActual.almacen.tipoUbicacion)} ${m.inventarioActual.ubicacionNumero} / Caja ${m.inventarioActual.nCaja}`
                    : "—"}
                </td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{m.cantidad} kg</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{m.usuario.nombre}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">
                  {m.referencia ?? m.observacion ?? "—"}
                </td>
              </tr>
            ))}
            {movimientos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-on-surface-variant">
                  No hay movimientos que coincidan con los filtros.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>

        {total > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant px-4 py-3">
            <p className="text-xs text-on-surface-variant">
              Mostrando {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} de {total} registros
            </p>
            <div className="flex items-center gap-1">
              <Link
                href={pageHref(Math.max(1, page - 1))}
                aria-disabled={page <= 1}
                className={`rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium transition-colors ${
                  page <= 1
                    ? "pointer-events-none opacity-40"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                Anterior
              </Link>
              <span className="px-2 text-xs text-on-surface-variant">
                Página {page} de {totalPages}
              </span>
              <Link
                href={pageHref(Math.min(totalPages, page + 1))}
                aria-disabled={page >= totalPages}
                className={`rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium transition-colors ${
                  page >= totalPages
                    ? "pointer-events-none opacity-40"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                Siguiente
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

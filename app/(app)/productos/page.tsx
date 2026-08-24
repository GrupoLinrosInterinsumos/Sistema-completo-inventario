import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { condicionesPorPalabraEnCampos } from "@/lib/search";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { LinkButton } from "@/app/components/ui/link-button";
import { IconPlus } from "@/app/components/ui/icons";
import { toggleProductoActivoAction } from "./actions";

const PAGE_SIZE = 50;

export default async function ProductosPage({ searchParams }: PageProps<"/productos">) {
  const session = await auth();
  const esSupervisor = session?.user.rol === "SUPERVISOR";
  const params = await searchParams;
  const almacenFiltro = typeof params.almacen === "string" ? params.almacen : "";
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const pageParam = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const where = {
    ...(almacenFiltro ? { almacen: { nombre: almacenFiltro as "CRAMER" | "SACCO" } } : {}),
    ...(q ? { AND: condicionesPorPalabraEnCampos(["nombreSabor", "codigo"], q) } : {}),
  };

  const [productos, total, almacenes] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { almacen: true },
      orderBy: { nombreSabor: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.producto.count({ where }),
    prisma.almacen.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (almacenFiltro) sp.set("almacen", almacenFiltro);
    if (q) sp.set("q", q);
    sp.set("page", String(p));
    return `/productos?${sp.toString()}`;
  }

  function filtroHref(almacen: string) {
    const sp = new URLSearchParams();
    if (almacen) sp.set("almacen", almacen);
    if (q) sp.set("q", q);
    return `/productos?${sp.toString()}`;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">Catálogo de productos</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Productos disponibles para registrar ingresos.
          </p>
        </div>

        {esSupervisor ? (
          <LinkButton href="/productos/nuevo">
            <IconPlus size={16} />
            Nuevo producto
          </LinkButton>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={filtroHref("")}
            className={`rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
              !almacenFiltro
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            Todos
          </Link>
          {almacenes.map((a) => (
            <Link
              key={a.id}
              href={filtroHref(a.nombre)}
              className={`rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
                almacenFiltro === a.nombre
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {a.nombre}
            </Link>
          ))}
        </div>

        <form method="get" className="flex items-center gap-2">
          {almacenFiltro ? <input type="hidden" name="almacen" value={almacenFiltro} /> : null}
          <label htmlFor="productos-q" className="sr-only">
            Buscar producto
          </label>
          <input
            id="productos-q"
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o código..."
            className="w-56 rounded-md border border-outline-variant px-3 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="submit" variant="outline" size="sm">
            Buscar
          </Button>
        </form>
      </div>

      <div className="mt-4 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant">
          <thead className="bg-surface-container">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                Nombre / sabor
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                Presentación
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                Almacén
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                Estado
              </th>
              {esSupervisor ? (
                <th className="px-4 py-2 text-right text-xs font-medium uppercase text-on-surface-variant">
                  Acciones
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {productos.map((producto) => (
              <tr className="transition-colors hover:bg-surface-container" key={producto.id}>
                <td className="px-4 py-2 text-sm text-on-surface">{producto.nombreSabor}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{producto.presentacion}</td>
                <td className="px-4 py-2 text-sm">
                  <Badge variant="info">{producto.almacen.nombre}</Badge>
                </td>
                <td className="px-4 py-2 text-sm">
                  <Badge variant={producto.activo ? "success" : "neutral"}>
                    {producto.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                {esSupervisor ? (
                  <td className="px-4 py-2 text-right text-sm">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/productos/${producto.id}/editar`}
                        className="font-medium text-on-surface-variant transition-colors hover:text-primary"
                      >
                        Editar
                      </Link>
                      <form action={toggleProductoActivoAction.bind(null, producto.id)}>
                        <button
                          type="submit"
                          className="font-medium text-on-surface-variant transition-colors hover:text-primary"
                        >
                          {producto.activo ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
            {productos.length === 0 ? (
              <tr>
                <td colSpan={esSupervisor ? 5 : 4} className="px-4 py-6 text-center text-sm text-on-surface-variant">
                  {q || almacenFiltro ? "No hay productos que coincidan con el filtro." : "Aún no hay productos en el catálogo."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>

        {total > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant px-4 py-3">
            <p className="text-xs text-on-surface-variant">
              Mostrando {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} de {total} productos
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

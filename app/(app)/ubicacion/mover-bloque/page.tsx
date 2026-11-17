import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fechaDesdeOrdenIngreso } from "@/lib/ubicacion";
import { formatFechaUTC } from "@/lib/format";
import { MoverBloqueForm, type ItemBloque } from "./mover-bloque-form";

export default async function MoverBloquePage({ searchParams }: PageProps<"/ubicacion/mover-bloque">) {
  const params = await searchParams;
  const ids = (typeof params.ids === "string" ? params.ids : "").split(",").filter(Boolean);
  const q = typeof params.q === "string" ? params.q : "";
  const volverHref =
    params.desde === "reporte" ? "/ubicacion/reporte" : q ? `/ubicacion?q=${encodeURIComponent(q)}` : "/ubicacion";

  const [encontrados, racks, ocupadasRaw] = await Promise.all([
    prisma.ubicacionStock.findMany({ where: { id: { in: ids } }, include: { rack: true } }),
    prisma.rack.findMany({ orderBy: { numero: "asc" } }),
    prisma.ubicacionStock.findMany({
      where: { rackId: { not: null } },
      select: { rackId: true, fila: true, columna: true, nombreProducto: true },
    }),
  ]);
  const ocupadas = ocupadasRaw as { rackId: string; fila: string; columna: number; nombreProducto: string }[];

  // Se respeta el orden en que llegaron (el de la lista de resultados).
  const porId = new Map(encontrados.map((e) => [e.id, e]));
  const items: ItemBloque[] = ids
    .map((id) => porId.get(id))
    .filter((e): e is NonNullable<typeof e> => !!e)
    .map((e) => {
      const venc = e.fVencimiento ?? fechaDesdeOrdenIngreso(e.ordenIngreso);
      return {
        id: e.id,
        nombreProducto: e.nombreProducto,
        ubicacionActual: e.rack ? `Rack ${e.rack.numero} — ${e.fila}${e.columna}` : (e.areaLibre ?? ""),
        lote: e.lote,
        vencimiento: venc ? formatFechaUTC(venc) : null,
      };
    });

  return (
    <div className="max-w-3xl">
      <p className="text-label-md uppercase tracking-wide text-on-surface-variant">
        <Link href={volverHref} className="hover:text-primary">
          Ubicación
        </Link>
      </p>
      <h1 className="mt-1 text-headline-md text-on-surface">Mover en bloque</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        {items.length} producto{items.length === 1 ? "" : "s"} — elige la nueva ubicación de todos a la vez.
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-body-sm text-on-surface-variant">
          No hay ubicaciones seleccionadas. Vuelve a la búsqueda y marca las que quieras mover.
        </p>
      ) : (
        <div className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-6">
          <MoverBloqueForm items={items} racks={racks} ocupadas={ocupadas} volverHref={volverHref} />
        </div>
      )}
    </div>
  );
}

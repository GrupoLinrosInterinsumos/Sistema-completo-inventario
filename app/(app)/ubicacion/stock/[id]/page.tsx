import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { labelUbicacion } from "@/lib/ubicacion";
import { camaraFisica, puertasDeCamaraFisica } from "@/lib/sacco-refrigeradoras";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { LinkButton } from "@/app/components/ui/link-button";
import { FridgeIcon } from "../../../stock/fridge-icon";
import { PalletIcon } from "../../../stock/pallet-icon";
import { UbicacionChips } from "../../../stock/ubicacion-chips";

export default async function UbicacionStockDetallePage({
  params,
}: PageProps<"/ubicacion/stock/[id]">) {
  const { id } = await params;

  const item = await prisma.inventarioActual.findUnique({
    where: { id },
    include: { producto: true, almacen: true },
  });

  if (!item) notFound();

  const esSacco = item.almacen.nombre === "SACCO";
  const claveHermanos = esSacco ? camaraFisica(item.ubicacionNumero) : item.ubicacionNumero;

  const hermanosRaw = await prisma.inventarioActual.findMany({
    where: {
      cantidadDisponible: { gt: 0 },
      almacenId: item.almacenId,
      ubicacionNumero: esSacco ? { in: puertasDeCamaraFisica(claveHermanos) } : item.ubicacionNumero,
    },
    select: { id: true, nCaja: true, producto: { select: { nombreSabor: true } } },
  });
  const hermanos = hermanosRaw.map((h) => ({ id: h.id, nCaja: h.nCaja, nombreSabor: h.producto.nombreSabor }));

  return (
    <div className="max-w-3xl">
      <p className="text-label-md uppercase tracking-wide text-on-surface-variant">
        <Link href="/ubicacion" className="hover:text-primary">
          Ubicación
        </Link>
      </p>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline-md text-on-surface">{item.producto.nombreSabor}</h1>
        <Badge variant="neutral">{item.almacen.nombre}</Badge>
      </div>

      <p className="mt-1 text-body-sm text-on-surface-variant">
        {labelUbicacion(item.almacen.tipoUbicacion)} {item.ubicacionNumero} / Caja {item.nCaja} · Lote {item.lote}
      </p>

      <div className="mt-6 flex flex-col items-center gap-4 rounded-card border border-outline-variant bg-surface-container-lowest p-10 text-center">
        {esSacco ? (
          <FridgeIcon size={96} />
        ) : (
          <PalletIcon numero={item.ubicacionNumero} caja={item.nCaja} size={96} />
        )}
        <p className="text-sm text-on-surface-variant">
          {item.cantidadDisponible} kg disponibles en esta caja.
        </p>
        <UbicacionChips
          label={`${labelUbicacion(item.almacen.tipoUbicacion)} ${item.ubicacionNumero}`}
          nCajaActual={item.nCaja}
          hermanos={hermanos}
          abiertoPorDefecto
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/ubicacion">
          <Button variant="outline">Volver</Button>
        </Link>
        <LinkButton href={`/stock/buscar?q=${encodeURIComponent(item.producto.codigo)}`}>
          Ir a Buscar / Retirar stock
        </LinkButton>
      </div>
    </div>
  );
}

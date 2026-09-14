import { prisma } from "@/lib/prisma";
import { NuevoDanadoForm } from "./nuevo-form";

export default async function NuevoRotoPage() {
  const [productos, ubicaciones] = await Promise.all([
    prisma.producto.findMany({ select: { nombreSabor: true }, distinct: ["nombreSabor"] }),
    prisma.ubicacionStock.findMany({ select: { nombreProducto: true }, distinct: ["nombreProducto"] }),
  ]);
  const nombresSugeridos = [
    ...new Set([...productos.map((p) => p.nombreSabor), ...ubicaciones.map((u) => u.nombreProducto)]),
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-headline-md text-on-surface">Registrar producto roto / NC</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Mercadería que llegó dañada o no conforme, sin importar de qué almacén sea.
      </p>

      <div className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-6">
        <NuevoDanadoForm nombresSugeridos={nombresSugeridos} />
      </div>
    </div>
  );
}

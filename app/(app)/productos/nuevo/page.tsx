import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createProductoAction } from "../actions";
import { ProductoForm } from "../producto-form";

export default async function NuevoProductoPage() {
  const session = await auth();
  if (session?.user.rol !== "SUPERVISOR") redirect("/productos");

  const almacenes = await prisma.almacen.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="max-w-md">
      <h1 className="text-headline-md text-on-surface">Nuevo producto</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Se agregará al catálogo disponible para registrar ingresos.
      </p>

      <div className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-6">
        <ProductoForm action={createProductoAction} submitLabel="Crear producto" almacenes={almacenes} />
      </div>
    </div>
  );
}

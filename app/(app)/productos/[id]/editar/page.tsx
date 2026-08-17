import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateProductoAction } from "../../actions";
import { ProductoForm } from "../../producto-form";

export default async function EditarProductoPage({
  params,
}: PageProps<"/productos/[id]/editar">) {
  const session = await auth();
  if (session?.user.rol !== "SUPERVISOR") redirect("/productos");

  const { id } = await params;
  const [producto, almacenes] = await Promise.all([
    prisma.producto.findUnique({ where: { id } }),
    prisma.almacen.findMany({ orderBy: { nombre: "asc" } }),
  ]);
  if (!producto) notFound();

  return (
    <div className="max-w-md">
      <h1 className="text-headline-md text-on-surface">Editar producto</h1>

      <div className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-6">
        <ProductoForm
          action={updateProductoAction.bind(null, producto.id)}
          submitLabel="Guardar cambios"
          almacenes={almacenes}
          initial={{
            nombreSabor: producto.nombreSabor,
            codigo: producto.codigo,
            presentacion: producto.presentacion,
            almacenId: producto.almacenId,
          }}
        />
      </div>
    </div>
  );
}

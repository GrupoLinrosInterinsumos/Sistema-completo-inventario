import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateUsuarioAction } from "../../actions";
import { UsuarioForm } from "../../usuario-form";

export default async function EditarUsuarioPage({
  params,
}: PageProps<"/usuarios/[id]/editar">) {
  const { id } = await params;
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) notFound();

  return (
    <div className="max-w-md">
      <h1 className="text-headline-md text-on-surface">Editar usuario</h1>

      <div className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-6">
        <UsuarioForm
          action={updateUsuarioAction.bind(null, usuario.id)}
          submitLabel="Guardar cambios"
          passwordOptional
          initial={{
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
          }}
        />
      </div>
    </div>
  );
}

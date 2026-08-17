import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { LinkButton } from "@/app/components/ui/link-button";
import { IconPlus } from "@/app/components/ui/icons";
import { toggleUsuarioActivoAction } from "./actions";

export default async function UsuariosPage() {
  const session = await auth();

  const usuarios = await prisma.usuario.findMany({
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">Usuarios</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Gestión de usuarios y roles del sistema.
          </p>
        </div>

        <LinkButton href="/usuarios/nuevo">
          <IconPlus size={16} />
          Nuevo usuario
        </LinkButton>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant">
          <thead className="bg-surface-container">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                Nombre
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                Correo
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                Rol
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                Estado
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium uppercase text-on-surface-variant">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {usuarios.map((usuario) => {
              const esUsuarioActual = usuario.id === session?.user.id;
              return (
                <tr className="transition-colors hover:bg-surface-container" key={usuario.id}>
                  <td className="px-4 py-2 text-sm text-on-surface">
                    {usuario.nombre}
                    {esUsuarioActual ? (
                      <span className="ml-2 text-xs text-on-surface-variant">(tú)</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2 text-sm text-on-surface-variant">{usuario.email}</td>
                  <td className="px-4 py-2 text-sm text-on-surface-variant">
                    {usuario.rol === "SUPERVISOR" ? "Supervisor / Admin" : "Almacén"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <Badge variant={usuario.activo ? "success" : "neutral"}>
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right text-sm">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/usuarios/${usuario.id}/editar`}
                        className="font-medium text-on-surface-variant transition-colors hover:text-primary"
                      >
                        Editar
                      </Link>
                      {!esUsuarioActual ? (
                        <form action={toggleUsuarioActivoAction.bind(null, usuario.id)}>
                          <button
                            type="submit"
                            className="font-medium text-on-surface-variant transition-colors hover:text-primary"
                          >
                            {usuario.activo ? "Desactivar" : "Activar"}
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

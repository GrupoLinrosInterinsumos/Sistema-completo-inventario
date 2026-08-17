import { createUsuarioAction } from "../actions";
import { UsuarioForm } from "../usuario-form";

export default function NuevoUsuarioPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-headline-md text-on-surface">Nuevo usuario</h1>

      <div className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-6">
        <UsuarioForm action={createUsuarioAction} submitLabel="Crear usuario" />
      </div>
    </div>
  );
}

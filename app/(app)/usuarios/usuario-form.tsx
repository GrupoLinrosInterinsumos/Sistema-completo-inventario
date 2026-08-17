"use client";

import { useActionState } from "react";
import { Button } from "@/app/components/ui/button";
import type { UsuarioFormState } from "./actions";

type Props = {
  action: (state: UsuarioFormState, formData: FormData) => Promise<UsuarioFormState>;
  submitLabel: string;
  initial?: { nombre: string; email: string; rol: "ALMACEN" | "SUPERVISOR" };
  passwordOptional?: boolean;
};

export function UsuarioForm({ action, submitLabel, initial, passwordOptional }: Props) {
  const [state, formAction, pending] = useActionState<UsuarioFormState, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          defaultValue={initial?.nombre}
          className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={initial?.email}
          className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="rol" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Rol
        </label>
        <select
          id="rol"
          name="rol"
          required
          defaultValue={initial?.rol ?? "ALMACEN"}
          className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="ALMACEN">Almacén</option>
          <option value="SUPERVISOR">Supervisor / Admin</option>
        </select>
      </div>

      <div>
        <label htmlFor="password" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Contraseña {passwordOptional ? "(dejar en blanco para no cambiarla)" : ""}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required={!passwordOptional}
          minLength={8}
          className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {state?.error ? (
        <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{state.error}</p>
      ) : null}

      <Button type="submit" loading={pending}>
        {pending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}

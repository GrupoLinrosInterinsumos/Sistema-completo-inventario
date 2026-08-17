"use client";

import { useActionState } from "react";
import { Button } from "@/app/components/ui/button";
import type { ProductoFormState } from "./actions";

type Almacen = { id: string; nombre: string };

type Props = {
  action: (state: ProductoFormState, formData: FormData) => Promise<ProductoFormState>;
  submitLabel: string;
  almacenes: Almacen[];
  initial?: { nombreSabor: string; codigo: string; presentacion: string; almacenId: string };
};

export function ProductoForm({ action, submitLabel, almacenes, initial }: Props) {
  const [state, formAction, pending] = useActionState<ProductoFormState, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="nombreSabor" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Nombre / sabor
        </label>
        <input
          id="nombreSabor"
          name="nombreSabor"
          type="text"
          required
          defaultValue={initial?.nombreSabor}
          className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="almacenId" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Almacén
        </label>
        <select
          id="almacenId"
          name="almacenId"
          required
          defaultValue={initial?.almacenId ?? almacenes[0]?.id}
          className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {almacenes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="codigo" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Código
        </label>
        <input
          id="codigo"
          name="codigo"
          type="text"
          required
          defaultValue={initial?.codigo}
          className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="presentacion" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Presentación
        </label>
        <input
          id="presentacion"
          name="presentacion"
          type="text"
          required
          placeholder="ej. 5kg, 10kg"
          defaultValue={initial?.presentacion}
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

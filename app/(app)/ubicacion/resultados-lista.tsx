"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { marcarVaciosAction } from "./actions";

export type ResultadoUnificado = {
  id: string;
  nombreProducto: string;
  ubicacion: string;
  href: string;
  origen: "CRAMER" | "SACCO" | "UBICACION";
};

export function ResultadosLista({ resultados }: { resultados: ResultadoUnificado[] }) {
  const router = useRouter();
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function alternar(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function marcarVacios() {
    setError(null);
    startTransition(async () => {
      const result = await marcarVaciosAction([...seleccionados]);
      if (result && "error" in result) {
        setError(result.error);
        return;
      }
      setSeleccionados(new Set());
      router.refresh();
    });
  }

  return (
    <div className="mt-8">
      {seleccionados.size > 0 ? (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-card border border-outline-variant bg-surface-container-low px-4 py-2.5">
          <p className="text-sm font-medium text-on-surface">
            {seleccionados.size} {seleccionados.size === 1 ? "ubicación" : "ubicaciones"} seleccionada
            {seleccionados.size === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSeleccionados(new Set())}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" loading={pending} onClick={marcarVacios}>
              Marcar como vacías
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mb-3 rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>
      ) : null}

      <ul className="divide-y divide-outline-variant overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
        {resultados.map((r) => {
          const seleccionable = r.origen === "UBICACION";
          const marcado = seleccionados.has(r.id);
          return (
            <li key={`${r.origen}-${r.id}`} className="flex items-center gap-3 px-4 py-3">
              {seleccionable ? (
                <input
                  type="checkbox"
                  checked={marcado}
                  onChange={() => alternar(r.id)}
                  aria-label={`Seleccionar ${r.nombreProducto}`}
                  className="h-5 w-5 shrink-0 rounded border-outline-variant text-primary focus:ring-primary"
                />
              ) : (
                <span className="h-5 w-5 shrink-0" />
              )}
              <Link href={r.href} className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs text-on-surface-variant">{r.nombreProducto}</p>
                  <p className="truncate text-lg font-bold leading-snug text-primary">{r.ubicacion}</p>
                </div>
                <Badge variant={r.origen === "UBICACION" ? "info" : "neutral"}>{r.origen}</Badge>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconSearch } from "./icons";

// Busca a medida que se escribe (con un pequeño debounce), sin esperar Enter
// ni un botón "Buscar". Actualiza el query param en la URL, así que la
// página server sigue siendo la que trae los datos — esto solo dispara la
// navegación.
export function LiveSearch({
  paramName = "q",
  placeholder,
}: {
  paramName?: string;
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(searchParams.get(paramName) ?? "");
  const [pending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (valor.trim()) params.set(paramName, valor);
      else params.delete(paramName);
      startTransition(() => {
        router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
      });
    }, 250);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return (
    <div className="relative w-full max-w-md">
      <IconSearch
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
      />
      <input
        type="text"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-9 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {pending ? (
        <span
          aria-hidden="true"
          className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-outline-variant border-t-primary"
        />
      ) : null}
    </div>
  );
}

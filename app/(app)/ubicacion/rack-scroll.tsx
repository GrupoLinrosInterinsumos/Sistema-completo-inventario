"use client";

import { useEffect, useRef } from "react";

// Contenedor con scroll horizontal para la grilla del rack. En los racks
// invertidos la columna 1 y las letras están a la derecha, así que se abre
// desplazado hasta ese extremo para que se vea lo importante sin tener que
// arrastrar.
export function RackScroll({
  alFinal,
  className,
  children,
}: {
  alFinal: boolean;
  className: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollLeft = alFinal ? ref.current.scrollWidth : 0;
  }, [alFinal]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

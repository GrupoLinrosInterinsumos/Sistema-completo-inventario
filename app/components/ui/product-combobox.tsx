"use client";

import { useEffect, useId, useRef, useState } from "react";

type Producto = { id: string; nombreSabor: string; codigo: string; presentacion: string };

type Props = {
  productos: Producto[];
  value: string;
  onChange: (productoId: string) => void;
  label: string;
  placeholder?: string;
};

// Selector de producto con búsqueda por teclado: escribe y filtra en vez de
// desplazarse por una lista larga. Selecciona con clic, flechas + Enter, o
// Escape para cerrar sin cambiar nada.
export function ProductComboBox({ productos, value, onChange, label, placeholder }: Props) {
  const idPrefix = useId();
  const seleccionado = productos.find((p) => p.id === value) ?? null;
  const textoDeSeleccion = (p: Producto | null) => (p ? `${p.nombreSabor} (${p.presentacion})` : "");

  const [texto, setTexto] = useState(textoDeSeleccion(seleccionado));
  const [abierto, setAbierto] = useState(false);
  const [resaltado, setResaltado] = useState(0);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Si `value` cambia por fuera (ej. se limpia el formulario), sincroniza el
  // texto mostrado durante el render en vez de en un efecto aparte.
  const [ultimoValue, setUltimoValue] = useState(value);
  if (value !== ultimoValue) {
    setUltimoValue(value);
    setTexto(textoDeSeleccion(seleccionado));
  }

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  const filtro = texto.trim().toLowerCase();
  const coincidencias =
    filtro === "" || texto === textoDeSeleccion(seleccionado)
      ? productos
      : productos.filter(
          (p) => p.nombreSabor.toLowerCase().includes(filtro) || p.codigo.toLowerCase().includes(filtro)
        );

  function seleccionar(p: Producto) {
    onChange(p.id);
    setTexto(`${p.nombreSabor} (${p.presentacion})`);
    setAbierto(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!abierto && (e.key === "ArrowDown" || e.key === "Enter")) {
      setAbierto(true);
      return;
    }
    if (!abierto) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setResaltado((r) => Math.min(r + 1, coincidencias.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setResaltado((r) => Math.max(r - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const p = coincidencias[resaltado];
      if (p) seleccionar(p);
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  }

  return (
    <div ref={contenedorRef} className="relative">
      <label htmlFor={idPrefix} className="block text-label-md uppercase tracking-wide text-on-surface-variant">
        {label}
      </label>
      <input
        id={idPrefix}
        type="text"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={`${idPrefix}-list`}
        aria-autocomplete="list"
        autoComplete="off"
        value={texto}
        placeholder={placeholder}
        onFocus={() => {
          setAbierto(true);
          setResaltado(0);
        }}
        onChange={(e) => {
          setTexto(e.target.value);
          setAbierto(true);
          setResaltado(0);
          if (value) onChange("");
        }}
        onKeyDown={onKeyDown}
        className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {abierto && coincidencias.length > 0 ? (
        <ul
          id={`${idPrefix}-list`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-outline-variant bg-surface-container-lowest shadow-md"
        >
          {coincidencias.map((p, i) => (
            <li key={p.id} role="option" aria-selected={p.id === value}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => seleccionar(p)}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                  i === resaltado ? "bg-primary-fixed text-on-primary-fixed" : "text-on-surface hover:bg-surface-container"
                }`}
              >
                {p.nombreSabor} <span className="text-xs text-on-surface-variant">({p.presentacion})</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {abierto && coincidencias.length === 0 ? (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-outline-variant bg-surface-container-lowest p-3 text-sm text-on-surface-variant shadow-md">
          Sin coincidencias.
        </div>
      ) : null}
    </div>
  );
}

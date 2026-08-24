"use client";

import { useState } from "react";
import Link from "next/link";
import type { NavIcon, Sistema } from "@/lib/nav";
import { Logo } from "@/app/logo";
import { Avatar } from "@/app/components/ui/avatar";
import { NavLinks } from "./nav-links";

type NavItem = { href: string; label: string; icon: NavIcon; sistema: Sistema };

type Props = {
  items: NavItem[];
  userName: string;
  rolLabel: string;
  sistema?: string | null;
  logoutAction: () => void;
};

export function MobileNav({ items, userName, rolLabel, sistema, logoutAction }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <header
        className="relative z-40 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 pb-2.5"
        style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-2.5">
          <Link href="/inicio" aria-label="Volver a Sistemas Almacén">
            <Logo className="h-8 w-auto" />
          </Link>
          {sistema ? (
            <Link href="/inicio" className="rounded-chip bg-primary-fixed px-2 py-1 text-xs font-semibold text-primary">
              {sistema}
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          style={{ touchAction: "manipulation" }}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-low active:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex w-72 max-w-[80vw] flex-col border-r border-outline-variant bg-surface-container-lowest shadow-xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div
              className="flex items-center justify-between border-b border-outline-variant px-4 pb-4"
              style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
            >
              <Link href="/inicio" aria-label="Volver a Sistemas Almacén" onClick={() => setOpen(false)}>
                <Logo className="h-8 w-auto" />
                <p className="mt-1 text-xs text-on-surface-variant">Gestión de inventario</p>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                style={{ touchAction: "manipulation" }}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:text-on-surface active:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              <NavLinks items={items} onNavigate={() => setOpen(false)} />
            </nav>

            <div className="flex items-center gap-3 border-t border-outline-variant px-4 py-4">
              <Avatar name={userName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-on-surface">{userName}</p>
                <p className="text-xs text-on-surface-variant">{rolLabel}</p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  aria-label="Cerrar sesión"
                  className="rounded-md p-2 text-on-surface-variant transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v.5M19 12H9m10 0-3-3m3 3-3 3" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="flex-1 bg-black/30"
          />
        </div>
      ) : null}
    </div>
  );
}

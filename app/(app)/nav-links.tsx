"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sistemaDePathname, type NavIcon, type Sistema } from "@/lib/nav";
import { NavIconGlyph } from "./nav-icons";

type NavItem = { href: string; label: string; icon: NavIcon; sistema: Sistema };

export function NavLinks({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const sistemaActual = sistemaDePathname(pathname);
  const itemsDelSistema = items.filter((item) => item.sistema === sistemaActual);

  const coincidencias = itemsDelSistema.filter(
    (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
  );
  const masEspecifico =
    coincidencias.length > 0
      ? coincidencias.reduce((a, b) => (b.href.length > a.href.length ? b : a))
      : undefined;

  return (
    <>
      {itemsDelSistema.map((item) => {
        const activo = item.href === masEspecifico?.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={activo ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              activo
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <NavIconGlyph icon={item.icon} className={activo ? "text-on-primary" : "text-on-surface-variant"} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

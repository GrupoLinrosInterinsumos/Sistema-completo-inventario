import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NAV_ITEMS } from "@/lib/nav";
import { Logo } from "@/app/logo";
import { Avatar } from "@/app/components/ui/avatar";
import { logoutAction } from "./actions";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const rol = session.user.rol;
  const items = NAV_ITEMS.filter((item) => item.roles.includes(rol));
  const rolLabel = rol === "SUPERVISOR" ? "Supervisor / Admin" : "Almacén";
  const userName = session.user.name ?? "";

  return (
    <div className="min-h-screen lg:flex">
      <MobileNav items={items} userName={userName} rolLabel={rolLabel} logoutAction={logoutAction} />

      <aside className="hidden border-r border-outline-variant bg-surface-container-lowest lg:flex lg:w-64 lg:flex-col">
        <div className="border-b border-outline-variant px-6 py-5">
          <Link href="/inicio" aria-label="Volver a Sistemas Almacén">
            <Logo className="h-10 w-auto" />
          </Link>
          <p className="mt-1.5 text-xs text-on-surface-variant">Gestión de inventario</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <NavLinks items={items} />
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
              className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v.5M19 12H9m10 0-3-3m3 3-3 3" />
              </svg>
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-background p-4 lg:p-8">{children}</main>
    </div>
  );
}

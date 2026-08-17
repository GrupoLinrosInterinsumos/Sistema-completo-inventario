import Link from "next/link";
import { auth } from "@/auth";
import { Logo } from "@/app/logo";
import { IconGrid, IconPackage } from "@/app/components/ui/icons";

export default async function InicioPage() {
  const session = await auth();
  const rol = session?.user.rol;
  const landingRol = rol === "SUPERVISOR" ? "/dashboard" : "/ingresos";

  const sistemas = [
    { label: "CRAMER", href: landingRol, icon: <IconPackage size={28} /> },
    { label: "SACCO", href: landingRol, icon: <IconPackage size={28} /> },
    { label: "UBICACIÓN", href: "/ubicacion", icon: <IconGrid size={28} /> },
  ];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Logo className="h-14 w-auto" />
      <h1 className="mt-4 text-headline-lg text-on-surface">Sistemas Almacén</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">Elige el sistema que vas a usar.</p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        {sistemas.map((sistema) => (
          <Link
            key={sistema.label}
            href={sistema.href}
            className="flex flex-col items-center gap-3 rounded-card border border-outline-variant bg-surface-container-lowest p-8 text-on-surface shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-primary">
              {sistema.icon}
            </span>
            <span className="text-headline-sm">{sistema.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

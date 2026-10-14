import Link from "next/link";
import { Logo } from "@/app/logo";
import { IconGrid, IconPackage } from "@/app/components/ui/icons";
import type { NombreAlmacenSistema } from "@/lib/sistema-almacen";
import { elegirSistemaAction } from "./actions";

export default function InicioPage() {
  const almacenes: { sistema: NombreAlmacenSistema; label: string; icon: React.ReactNode }[] = [
    { sistema: "CRAMER", label: "CRAMER", icon: <IconPackage size={28} /> },
    { sistema: "SACCO", label: "SACCO", icon: <IconPackage size={28} /> },
    { sistema: "FRACCIONAMIENTO", label: "FRACCIONAMIENTO / PUCHOS", icon: <IconPackage size={28} /> },
  ];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Logo className="h-14 w-auto" />
      <h1 className="mt-4 text-headline-lg text-on-surface">Sistemas Almacén</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">Elige el sistema que vas a usar.</p>

      <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {almacenes.map((almacen) => (
          <form key={almacen.sistema} action={elegirSistemaAction}>
            <input type="hidden" name="sistema" value={almacen.sistema} />
            <button
              type="submit"
              className="flex w-full flex-col items-center gap-3 rounded-card border border-outline-variant bg-surface-container-lowest p-8 text-on-surface shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-primary">
                {almacen.icon}
              </span>
              <span className="text-headline-sm">{almacen.label}</span>
            </button>
          </form>
        ))}
        <Link
          href="/ubicacion"
          className="flex flex-col items-center gap-3 rounded-card border border-outline-variant bg-surface-container-lowest p-8 text-on-surface shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-primary">
            <IconGrid size={28} />
          </span>
          <span className="text-headline-sm">UBICACIÓN</span>
        </Link>
      </div>
    </div>
  );
}

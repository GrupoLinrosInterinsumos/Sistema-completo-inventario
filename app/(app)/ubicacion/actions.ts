"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type UbicacionFormState = { error?: string } | undefined;

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("No autorizado.");
  return session;
}

export async function crearUbicacionStockAction(
  _prevState: UbicacionFormState,
  formData: FormData
): Promise<UbicacionFormState> {
  await requireSession();

  const nombreProducto = String(formData.get("nombreProducto") ?? "").trim();
  const modo = String(formData.get("modo") ?? "rack");
  const ordenIngreso = Number(formData.get("ordenIngreso"));

  if (!nombreProducto || !ordenIngreso) {
    return { error: "Completa todos los campos." };
  }

  if (modo === "area") {
    const areaLibre = String(formData.get("areaLibre") ?? "").trim();
    if (!areaLibre) return { error: "Escribe el nombre de la zona (ej. Piso, Gabinete)." };

    const creado = await prisma.ubicacionStock.create({
      data: { nombreProducto, areaLibre, ordenIngreso },
    });
    revalidatePath("/ubicacion");
    redirect(`/ubicacion/${creado.id}`);
  }

  const rackId = String(formData.get("rackId") ?? "").trim();
  const fila = String(formData.get("fila") ?? "").trim().toUpperCase();
  const columna = Number(formData.get("columna"));

  if (!rackId || !fila || !columna) {
    return { error: "Completa todos los campos." };
  }

  const rack = await prisma.rack.findUnique({ where: { id: rackId } });
  if (!rack) return { error: "Rack no válido." };

  if (fila.length !== 1 || fila < rack.filaMin || fila > rack.filaMax) {
    return { error: `La fila debe estar entre ${rack.filaMin} y ${rack.filaMax} para el Rack ${rack.numero}.` };
  }
  if (columna < 1 || columna > rack.columnas) {
    return { error: `La columna debe estar entre 1 y ${rack.columnas} para el Rack ${rack.numero}.` };
  }

  const creado = await prisma.ubicacionStock.create({
    data: { nombreProducto, rackId, fila, columna, ordenIngreso },
  });

  revalidatePath("/ubicacion");
  redirect(`/ubicacion/${creado.id}`);
}

export async function marcarVacioAction(id: string) {
  await requireSession();
  await prisma.ubicacionStock.delete({ where: { id } });
  revalidatePath("/ubicacion");
  redirect("/ubicacion");
}

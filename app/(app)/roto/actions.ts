"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type RotoFormState = { error?: string } | undefined;

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("No autorizado.");
  return session;
}

export async function crearProductoDanadoAction(
  _prevState: RotoFormState,
  formData: FormData
): Promise<RotoFormState> {
  const session = await requireSession();

  const nombreProducto = String(formData.get("nombreProducto") ?? "").trim();
  const motivo = String(formData.get("motivo") ?? "");
  const cantidad = Number(formData.get("cantidad"));
  const unidad = String(formData.get("unidad") ?? "kg").trim();
  const ubicacion = String(formData.get("ubicacion") ?? "").trim();
  const observacion = String(formData.get("observacion") ?? "").trim();

  if (!nombreProducto || !ubicacion) {
    return { error: "Completa el nombre del producto y la ubicación." };
  }
  if (motivo !== "ROTO" && motivo !== "NC") {
    return { error: "Selecciona un motivo." };
  }
  if (!(cantidad > 0)) {
    return { error: "La cantidad debe ser mayor a 0." };
  }

  const creado = await prisma.productoDanado.create({
    data: {
      nombreProducto,
      motivo,
      cantidad,
      unidad: unidad || "kg",
      ubicacion,
      observacion: observacion || null,
      usuarioId: session.user.id,
    },
  });

  revalidatePath("/roto");
  redirect(`/roto?creado=${creado.id}`);
}

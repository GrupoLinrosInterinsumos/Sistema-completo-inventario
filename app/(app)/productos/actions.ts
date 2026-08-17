"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ProductoFormState = { error?: string } | undefined;

async function requireSupervisor() {
  const session = await auth();
  if (!session || session.user.rol !== "SUPERVISOR") {
    throw new Error("No autorizado.");
  }
}

function readProductoInput(formData: FormData) {
  return {
    nombreSabor: String(formData.get("nombreSabor") ?? "").trim(),
    codigo: String(formData.get("codigo") ?? "").trim(),
    presentacion: String(formData.get("presentacion") ?? "").trim(),
    almacenId: String(formData.get("almacenId") ?? "").trim(),
  };
}

export async function createProductoAction(
  _prevState: ProductoFormState,
  formData: FormData
): Promise<ProductoFormState> {
  await requireSupervisor();
  const { nombreSabor, codigo, presentacion, almacenId } = readProductoInput(formData);

  if (!nombreSabor || !codigo || !presentacion || !almacenId) {
    return { error: "Todos los campos son obligatorios." };
  }

  try {
    await prisma.producto.create({ data: { nombreSabor, codigo, presentacion, almacenId } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Ya existe un producto con ese código." };
    }
    throw e;
  }

  revalidatePath("/productos");
  redirect("/productos");
}

export async function updateProductoAction(
  id: string,
  _prevState: ProductoFormState,
  formData: FormData
): Promise<ProductoFormState> {
  await requireSupervisor();
  const { nombreSabor, codigo, presentacion, almacenId } = readProductoInput(formData);

  if (!nombreSabor || !codigo || !presentacion || !almacenId) {
    return { error: "Todos los campos son obligatorios." };
  }

  try {
    await prisma.producto.update({
      where: { id },
      data: { nombreSabor, codigo, presentacion, almacenId },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Ya existe un producto con ese código." };
    }
    throw e;
  }

  revalidatePath("/productos");
  redirect("/productos");
}

export async function toggleProductoActivoAction(id: string) {
  await requireSupervisor();
  const producto = await prisma.producto.findUniqueOrThrow({ where: { id } });
  await prisma.producto.update({
    where: { id },
    data: { activo: !producto.activo },
  });
  revalidatePath("/productos");
}

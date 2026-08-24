"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SISTEMA_ALMACEN_COOKIE } from "@/lib/sistema-almacen";

export async function elegirSistemaAction(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");

  const sistema = String(formData.get("sistema") ?? "");
  if (sistema !== "CRAMER" && sistema !== "SACCO") {
    throw new Error("Sistema no válido.");
  }

  const store = await cookies();
  store.set(SISTEMA_ALMACEN_COOKIE, sistema, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(session.user.rol === "SUPERVISOR" ? "/dashboard" : "/ingresos");
}

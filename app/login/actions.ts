"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Usuario o contraseña incorrectos." };
    }
    throw error;
  }

  // El operador (rol ALMACEN) siempre entra por Sistemas Almacén para elegir
  // CRAMER/SACCO — un callbackUrl viejo (ej. a /ingresos) no debe saltarse
  // ese paso. El supervisor sí puede volver a donde estaba.
  const session = await auth();
  const destino =
    session?.user.rol === "SUPERVISOR" && typeof callbackUrl === "string" && callbackUrl
      ? callbackUrl
      : "/inicio";
  redirect(destino);
}

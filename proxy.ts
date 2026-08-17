import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { NAV_ITEMS, type Rol } from "@/lib/nav";

const { auth } = NextAuth(authConfig);

function defaultPathForRole(rol: Rol) {
  return rol === "SUPERVISOR" ? "/dashboard" : "/ingresos";
}

function isPathAllowed(pathname: string, rol: Rol) {
  const candidatos = NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  if (candidatos.length === 0) return true;
  const masEspecifico = candidatos.reduce((a, b) => (b.href.length > a.href.length ? b : a));
  return masEspecifico.roles.includes(rol);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isLoginPage = pathname === "/login";
  const isApiRoute = pathname.startsWith("/api");

  if (!isLoggedIn && isApiRoute) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!isLoggedIn && !isLoginPage) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const rol = req.auth?.user.rol;

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/inicio", req.url));
  }

  if (isLoggedIn && rol && !isApiRoute && !isPathAllowed(pathname, rol)) {
    return NextResponse.redirect(new URL(defaultPathForRole(rol), req.url));
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|webp|ico|gif)$).*)",
  ],
};

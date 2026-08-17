import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Prisma/bcrypt here) — consumed by both auth.ts
// (Node.js runtime, full config with providers) and middleware.ts (Edge runtime).
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.rol = (user as { rol: "ALMACEN" | "SUPERVISOR" }).rol;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.rol = token.rol;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

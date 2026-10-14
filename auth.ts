import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";
import { verifyCredentials } from "@/lib/services/users";
import { loginInput } from "@/lib/validation/content";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }
  interface User {
    role?: Role;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8 hours
  pages: { signIn: "/admin/login", error: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginInput.safeParse(raw);
        if (!parsed.success) return null;
        // Slow down password guessing per account (10 attempts / 15 minutes).
        if (!rateLimit(`login:${parsed.data.email}`, { max: 10, windowMs: 15 * 60 * 1000 }).ok)
          return null;
        const actor = await verifyCredentials(parsed.data.email, parsed.data.password);
        return actor
          ? { id: actor.id, name: actor.name, email: actor.email, role: actor.role }
          : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.uid ?? "");
      session.user.role = token.role as Role;
      return session;
    },
  },
});

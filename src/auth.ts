import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        try {
          const db = getDb();
          const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
          if (!user) return null;
          const ok = await compare(password, user.passwordHash);
          if (!ok) return null;
          return { id: user.id, email: user.email, name: user.name || "Lectrice" };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 365 * 24 * 60 * 60 },
  pages: { signIn: "/" },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.userId) (session.user as { id?: string }).id = token.userId as string;
      return session;
    },
  },
});

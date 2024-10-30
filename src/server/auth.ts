import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig } from "next-auth";
import NextAuth, { User } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/server/db/index";
import { getUsersFromDb } from "../../actions/user.actions";
import { users, account, sessions, verificationTokens, authenticators } from "./db/schema";

const adapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: account,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
  authenticatorsTable : authenticators,
});

const authConfig: NextAuthConfig = {
  adapter,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        const res = await getUsersFromDb(email as string, password as string);
        if (res.success) {
          return res.data as User;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
  },

  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = crypto.randomUUID();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
  secret: process.env.AUTH_SECRET!,
  experimental: { enableWebAuthn: true },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

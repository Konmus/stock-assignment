import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import * as bcrypt from "bcrypt";
import { signRefreshToken, signToken } from "./jwt";
import { accounts, sessions, users, verificationTokens } from "./db/schema";
import { eq, or } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { firstFirstOrThrow } from "./findFirstOrThrow";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { encode } from "next-auth/jwt";

class CustomError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
    this.message = code;
    this.stack = undefined;
  }
}
const adapter = DrizzleAdapter(db, {
  accountsTable: accounts,
  usersTable: users,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
} as any);
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log(credentials);
        const user = await db
          .select()
          .from(users)
          .where(
            or(
              eq(users.email, credentials?.username as string),
              eq(users.username, credentials?.username as string),
            ),
          )
          .then((res) => res[0] ?? null);
        console.log(user);
        if (
          user &&
          (await bcrypt.compare(
            credentials?.password as string,
            user.password as string,
          ))
        ) {
          const { password, ...userWithoutPass } = user;
          const accessToken = await signToken(userWithoutPass);
          const refreshToken = await signRefreshToken(userWithoutPass);
          const response = { ...userWithoutPass, accessToken, refreshToken };
          //          console.log(response);
          return response;
        } else {
          throw new CustomError("invalid_password");
        }
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
        const sessionToken = await signToken(params.token);

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
      return encode(params);
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});

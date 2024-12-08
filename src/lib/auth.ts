import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import * as bcrypt from "bcrypt";
import { signRefreshToken, signToken } from "./jwt";
import { usersTable } from "./db/schema";
import { eq, or } from "drizzle-orm";
import * as schema from "./db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { firstFirstOrThrow } from "./findFirstOrThrow";

//TODO: Implement JSON for api/auth/callback/credentials
//x-www-encode wont work only JSON work
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
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
          .from(usersTable)
          .where(
            or(
              eq(usersTable.email, credentials?.username!),
              eq(usersTable.username, credentials?.username!),
            ),
          )
          .then(firstFirstOrThrow);
        /*
        const user = await db.users.findFirst({
          where: {
            OR: [
              {
                email: credentials?.username,
              },
              {
                username: credentials?.username,
              },
            ],
          },
          include: {
            account: true,
          },
        });*/
        console.log(user);
        // const user = await fetch("http://localhost:3000/api/login", {
        //   method: "POST",
        //   body: JSON.stringify(credentials),
        //   headers: {
        //     // accept: "*/*",
        //     "Content-Type": "application/json",
        //   },
        // });

        // const User = await user.json();
        // console.log(User);

        if (
          user &&
          (await bcrypt.compare(credentials?.password as string, user.password))
        ) {
          const { password, ...userWithoutPass } = user;
          const accessToken = await signToken(userWithoutPass);
          const refreshToken = await signRefreshToken(userWithoutPass);
          const response = { ...userWithoutPass, accessToken, refreshToken };
          //          console.log(response);
          return response;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /* @ts-ignore */
    async jwt({ token, user }) {
      // console.log(token);
      // if (user) {
      //   return {
      //     accessToken: token.accessToken,
      //     expiresAt: token.exp,
      //     refreshToken: token.refreshToken,
      //   };
      // }
      console.log(new Date(token.exp * 1000) < new Date());
      // console.log("hello", token.accessToken, "before");
      /* if (new Date(token.exp * 1000) < new Date()) {
        const newAcessToken = await refreshToken(token.refreshToken);
        console.log(newAcessToken, "after:");
        return { ...token, accessToken: newAcessToken };
      } */
      return { ...token, ...user };
    },
    async session({ token, session }) {
      if (token) {
        session.user.name = token.username;
        session.user.role = token.account.role;
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.exp = token.exp;
      }
      session.user = token;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

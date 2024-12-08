import { User } from "next-auth";
import { JWT } from "next-auth/jwt";
import type { UserRole } from "@prisma/client";
import { TAccount } from "./account";

declare module "next-auth" {
  interface Session {
    user: User & {
      username: string;
      id: string;
      account: TAccount;
      role: UserRole;
      accessToken: string;
      iat: number;
      exp: number;
      jti: string;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    account: TAccount;
    username: string;
    email: string;
    accessToken: string;
    iat: number;
    exp: number;
    jti: string;
  }
}

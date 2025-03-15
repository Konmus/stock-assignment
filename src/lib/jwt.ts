import { jwtVerify, SignJWT } from "jose";
import type { JWTPayload } from "jose";
import { nanoid } from "nanoid";
import { JWT } from "next-auth/jwt";

export async function signToken(payload: JWTPayload | undefined | JWT) {
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
  const token = await new SignJWT({ payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setJti(nanoid())
    .setExpirationTime("30d")
    .sign(secretKey);
  return token;
}

export async function decodeJwt(token: string | undefined | null) {
  try {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    if (!token) {
      throw new Error("No Token to decode");
    }
    const decodedJwt = await jwtVerify(token, secretKey);
    return decodedJwt.payload as JWT;
  } catch (err) {
    console.log(err);
  }
}

export async function signRefreshToken(payload: JWTPayload | JWT) {
  const secretKey = new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET_KEY,
  );
  const token = await new SignJWT({ payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setJti(nanoid())
    .setExpirationTime("1y")
    .sign(secretKey);
  return token;
}

export async function decodeRefreshJwt(token: string | undefined) {
  try {
    const secretKey = new TextEncoder().encode(
      process.env.JWT_REFRESH_SECRET_KEY,
    );
    if (!token) {
      throw new Error("No Token to decode");
    }
    const decodedJwt = await jwtVerify(token, secretKey);
    return decodedJwt.payload as JWT;
  } catch (err) {
    console.log(err);
    return null;
  }
}

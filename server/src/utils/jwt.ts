import jwt from "jsonwebtoken";

export type JwtPayload = {
  id: number;
  role: "donor" | "requester" | "admin";
  email: string;
};

export function signToken(payload: JwtPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.verify(token, secret) as JwtPayload;
}

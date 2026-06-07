import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: "donor" | "requester" | "admin";
        email: string;
      };
    }
  }
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireRole(roles: Array<"donor" | "requester" | "admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

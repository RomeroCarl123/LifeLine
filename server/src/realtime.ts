import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { verifyToken } from "./utils/jwt.js";

type DashboardEvent = {
  title: string;
  message: string;
  type: "request" | "status" | "donor";
  requestId?: number;
};

let io: Server | null = null;

export function initRealtime(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (typeof token !== "string") return next(new Error("Missing token"));

    try {
      socket.data.user = verifyToken(token);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as {
      id: number;
      role: "donor" | "requester" | "admin";
    };

    socket.join(`role:${user.role}`);
    socket.join(`user:${user.id}`);
  });

  return io;
}

export function notifyDashboard(
  rooms: string | string[],
  event: DashboardEvent,
) {
  if (!io) return;
  const targetRooms = Array.isArray(rooms) ? rooms : [rooms];
  targetRooms.forEach((room) => io?.to(room).emit("dashboard:notification", event));
}

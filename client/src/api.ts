export type Role = "donor" | "requester" | "admin";

export type SessionUser = {
  id: number;
  email: string;
  role: Role;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://127.0.0.1:4000";

export async function api<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error(
      "Could not connect to the server. Make sure the backend is running on port 4000.",
    );
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

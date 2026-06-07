import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../api";

type Notification = {
  title: string;
  message: string;
  type: "request" | "status" | "donor";
  requestId?: number;
};

type Props = {
  token: string;
};

const typeStyles: Record<Notification["type"], string> = {
  request: "bg-[#FFE5EA] text-[#D02752]",
  status: "bg-[#FFEAF0] text-[#D02752]",
  donor: "bg-[#FFE5EA] text-[#8A244B]",
};

export default function LiveNotifications({ token }: Props) {
  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("dashboard:notification", (item: Notification) => {
      setItems((current) => [item, ...current].slice(0, 5));
      setHasUnread(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const toggleOpen = () => {
    setOpen((next) => !next);
    setHasUnread(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-[#F1CAD5] bg-white/90 text-[#D02752] transition hover:bg-white"
        aria-label="Notifications"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {hasUnread && (
          <span className="pulse-dot absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#F63049] ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="animate-dropdown absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-[#F1CAD5] bg-[rgba(255,255,255,0.95)] shadow-[0_24px_56px_-38px_rgba(16,35,62,0.35)] backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-[#F8DDE4] px-4 py-3">
            <div>
              <p className="text-sm font-black text-[#8A244B]">Notifications</p>
              <p className="text-xs font-semibold text-[#8A244B]">
                {connected ? "Live updates connected" : "Trying to reconnect"}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                connected ? "bg-[#FFE5EA] text-[#8A244B]" : "bg-[#FFF1F5] text-[#8A244B]"
              }`}
            >
              {connected ? "Online" : "Offline"}
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto p-3">
            {items.map((item, index) => (
              <article
                key={`${item.title}-${item.requestId ?? index}-${index}`}
                className="animate-card-in rounded-[1rem] border border-transparent p-3 transition hover:border-[#F8DDE4] hover:bg-[#FFF5F8]"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${typeStyles[item.type]}`}>
                  {item.type}
                </span>
                <p className="mt-3 text-sm font-black text-[#8A244B]">{item.title}</p>
                <p className="mt-1 text-sm leading-5 text-[#8A244B]">{item.message}</p>
              </article>
            ))}
            {items.length === 0 && (
              <p className="rounded-[1rem] border border-dashed border-[#F1CAD5] bg-[#FFF5F8] p-4 text-sm text-[#8A244B]">
                New request and status updates will appear here.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

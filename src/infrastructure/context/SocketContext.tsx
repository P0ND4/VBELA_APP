import React, { createContext, useContext, useRef, useState, ReactNode, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import { getTokens } from "infrastructure/security/tokens";
import { Permissions } from "domain/entities/data";
import { useLogout } from "infrastructure/auth/useLogout";
import useGetUser from "infrastructure/hooks/useGetUser";
import { useAppSelector } from "application/store/hook";

export type WebSocketEventMap = {
  "update-change": (data: string) => void;
  logout: (data: string) => void;
  PONG: (data: { timestamp: number }) => void;
};

export type WebSocketEmitMap = {
  "update-change": ({ entity }: { entity: string }) => void;
  "account-updated": ({ identifier }: { identifier: string }) => void;
  PING: () => void;
  validate: () => void;
};

interface WebSocketContextType {
  socket: Socket<WebSocketEventMap, WebSocketEmitMap> | null;
  ping?: number | null;
  emit: (entity: keyof Permissions) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { getUserInformation } = useGetUser();
  const { logout } = useLogout();

  const socketRef = useRef<Socket<WebSocketEventMap, WebSocketEmitMap> | null>(null);
  const session = useAppSelector((state) => state.session);
  const [isConnected, setIsConnected] = useState(false);
  const [ping, setPing] = useState<number | null>(null);

  const sessionRef = useRef(session);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startPing = () => {
      interval = setInterval(() => {
        if (!socketRef.current?.connected) {
          setPing(null);
          return;
        }

        const start = Date.now();
        let timeout: NodeJS.Timeout;

        timeout = setTimeout(() => {
          setPing(null);
          socketRef.current?.off("PONG");
        }, 1000);

        socketRef.current.emit("PING");
        socketRef.current.once("PONG", () => {
          clearTimeout(timeout);
          setPing(Date.now() - start);
        });
      }, 1000);
    };

    if (isConnected) startPing();
    else setPing(null);

    return () => {
      clearInterval(interval);
      socketRef.current?.off("PONG");
    };
  }, [isConnected]);

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const connect = async () => {
    if (socketRef.current?.connected) return;

    const { accessToken } = await getTokens();

    const newSocket = io(process.env.EXPO_PUBLIC_WEBSOCKET as string, {
      auth: { token: accessToken },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.removeAllListeners();

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("validate", { logout: sessionRef.current });
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("update-change", async () => {
      await getUserInformation();
    });

    newSocket.on("logout", async () => {
      await disconnect();
      sessionRef.current = false;
      logout();
    });

    socketRef.current = newSocket;
  };

  const emit = (entity: keyof Permissions) =>
    socketRef.current && socketRef.current.emit("update-change", { entity });

  return (
    <WebSocketContext.Provider
      value={{
        socket: socketRef.current,
        ping,
        emit,
        connect,
        disconnect,
        isConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext debe usarse dentro de un WebSocketProvider");
  }
  return context;
};

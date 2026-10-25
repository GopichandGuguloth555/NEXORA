"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_BASE_URL } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    const newSocket = io(SOCKET_BASE_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    const socketStateTimeout = window.setTimeout(() => setSocket(newSocket), 0);

    return () => {
      window.clearTimeout(socketStateTimeout);
      newSocket.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider
      value={{
        socket: token && user ? socket : null,
        connected: token && user ? connected : false,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

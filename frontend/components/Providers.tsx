"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { SocketProvider } from "@/context/SocketContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <SocketProvider>{children}</SocketProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

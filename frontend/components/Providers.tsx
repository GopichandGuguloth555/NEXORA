"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { SocketProvider } from "@/context/SocketContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <AuthProvider>
        <WorkspaceProvider>
          <SocketProvider>{children}</SocketProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

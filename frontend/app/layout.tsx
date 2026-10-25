import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = localFont({
  src: "./fonts/outfit-latin-wght-normal.woff2",
  variable: "--font-outfit",
  display: "swap",
  weight: "100 900",
});

const syne = localFont({
  src: "./fonts/syne-latin-wght-normal.woff2",
  variable: "--font-syne",
  display: "swap",
  weight: "400 800",
});

export const metadata: Metadata = {
  title: "Nexora - Plan. Collaborate. Build.",
  description:
    "All-in-one project planning, task management, team chat, document editing, and file collaboration workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-[#050505] text-zinc-100 font-sans flex flex-col selection:bg-zinc-300 selection:text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

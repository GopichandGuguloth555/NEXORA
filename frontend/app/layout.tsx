import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
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

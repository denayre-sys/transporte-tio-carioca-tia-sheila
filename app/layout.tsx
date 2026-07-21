import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { cookies } from "next/headers";
import { verificarSessao } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `${APP_NAME} | Transporte Escolar`,
  description: `Gerenciamento do transporte escolar ${APP_NAME}`,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#2E4433",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("sessao")?.value;
  const sessao = await verificarSessao(token);

  return (
    <html lang="pt-BR">
      <body className="font-body">
        {sessao ? (
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-screen p-4 pb-24 pt-16 md:p-10 md:pb-10 md:pt-10 max-w-6xl">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Mi Aplicación",
  description: "Plataforma para gestionar tus enlaces y perfil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background"
        suppressHydrationWarning  
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "v(dev) Quest",
  description: "Sua jornada de desenvolvimento em uma aventura épica."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mirfa — Secure Transaction Service",
  description: "Encrypt, store, and decrypt JSON payloads with envelope encryption",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}

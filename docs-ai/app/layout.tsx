import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "QR-Passport Docs AI", description: "AI-проверка документации QR-Passport" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body>{children}</body></html>; }

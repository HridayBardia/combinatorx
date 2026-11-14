import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CombinatorX: Neural Skip-Connection Topology Engine",
  description:
    "Discrete Mathematics & Graph Theory (DMGT) playground for analyzing neural skip connections via Ordinary Generating Functions (OGFs), Linear Recurrences, and Companion Matrix Exponentiation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080C14] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}

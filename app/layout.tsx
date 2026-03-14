import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Tree of Knowledge — Every Branch of Human Understanding",
  description: "Explore all human knowledge as an interactive tree. AI-powered infinite depth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Nunito:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#0a1424]">{children}</body>
    </html>
  );
}

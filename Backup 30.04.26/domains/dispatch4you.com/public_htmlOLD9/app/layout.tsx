import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dispatcher Courses",
  description: "Professional training for transport logistics dispatchers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0e1a] text-white">{children}</body>
    </html>
  );
}

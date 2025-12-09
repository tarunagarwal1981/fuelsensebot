import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FuelSense Bot - Teams Chatbot",
  description: "Maritime fuel analysis chatbot application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


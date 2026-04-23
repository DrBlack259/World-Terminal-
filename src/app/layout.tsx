import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TickerTape from "@/components/layout/TickerTape";

export const metadata: Metadata = {
  title: "WORLD TERMINAL — Global Intelligence Dashboard",
  description: "Real-time global deals, conflicts, elections, resources, and elite intelligence monitoring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-terminal-bg text-terminal-text font-mono overflow-hidden">
        <div className="flex flex-col h-screen">
          <Header />
          <TickerTape />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

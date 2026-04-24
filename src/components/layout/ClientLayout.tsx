"use client";
import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import TickerTape from "./TickerTape";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-[100dvh]">
      <Header onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <TickerTape />
      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

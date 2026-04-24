import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { CurrencyProvider } from "@/context/CurrencyContext";

export const metadata: Metadata = {
  title: "WORLD TERMINAL — Global Intelligence Dashboard",
  description: "Real-time global deals, conflicts, elections, resources, and elite intelligence monitoring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-terminal-bg text-terminal-text font-mono">
        <CurrencyProvider>
          <ClientLayout>{children}</ClientLayout>
        </CurrencyProvider>
      </body>
    </html>
  );
}

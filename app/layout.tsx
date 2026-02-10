import type { Metadata } from "next";
import "./globals.css";
import { geistSans, geistMono } from "./fonts";

import Providers from "./providers";
import IntroSplash from "./components/landing/IntroSplash";
import ChatWidget from "./components/chat/ChatWidget";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";

export const metadata: Metadata = {
  title: "Xovato Tech",
  description: "Innovative digital solutions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {/* Intro overlay (shows once per session) */}
          <IntroSplash brand="Xovato" />

          {/* This wrapper allows dragging without affecting other fixed elements */}
          <div className="fixed inset-0 pointer-events-none z-[9999]">
            <div className="absolute inset-0 pointer-events-none">
              <ChatWidget />
            </div>
          </div>

          <GlobalErrorBoundary>
            {children}
          </GlobalErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { AudioPlayer } from '@/components/AudioPlayer';
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "TrackFlow - Unified Music Creation, Distribution & Sync",
  description: "A unified platform combining beat licensing, music distribution, royalty splitting, and sync licensing into a single rights-aware system.",
  keywords: ["beats", "music distribution", "royalty splits", "sync licensing", "producers", "rights management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
          <AudioPlayer />
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--dark-800)',
              color: 'var(--foreground)',
              border: '1px solid var(--dark-700)',
            },
          }}
        />
      </body>
    </html>
  );
}

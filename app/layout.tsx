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
  title: "AudioGenes - Elite Beat Marketplace & Rights Licensing",
  description: "The premier marketplace for rights-locked music assets. Secure distribution, automated split contracts, and instant sync licensing.",
  keywords: ["beats", "music marketplace", "royalty splits", "sync licensing", "producers", "sonic legacy", "AudioGenes"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
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

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "The Beat Vault - Premium Beat Marketplace",
  description: "Multi-vendor beat marketplace with instant licensing and downloads. Find professional beats from top producers.",
  keywords: ["beats", "instrumentals", "hip hop", "music", "licensing", "producers"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
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

'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { 
  Music, 
  Search, 
  User, 
  Menu, 
  X,
  LogOut,
  LayoutDashboard,
  Heart
} from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, profile, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              TrackFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/marketplace" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Marketplace
            </Link>
            <Link 
              href="/producers" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Producers
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Licensing
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search beats..."
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-dark-700 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard/artist/favorites">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button 
                    onClick={signOut}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-900 border-t border-dark-700 animate-fade-in">
          <div className="px-4 py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search beats..."
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm"
              />
            </div>
            <nav className="flex flex-col gap-2">
              <Link 
                href="/marketplace" 
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg"
              >
                Marketplace
              </Link>
              <Link 
                href="/producers" 
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg"
              >
                Producers
              </Link>
              <Link 
                href="/pricing" 
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg"
              >
                Licensing
              </Link>
            </nav>
            {!user && (
              <div className="flex flex-col gap-2 pt-4 border-t border-dark-700">
                <Link href="/login">
                  <Button variant="ghost" fullWidth>Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" fullWidth>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

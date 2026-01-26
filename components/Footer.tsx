import Link from 'next/link';
import { Music, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 bg-dark-950 border-t border-white/10 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-40 h-12 flex items-center justify-center">
                <img src="/trackflow-logo.png" alt="TrackFlow" className="w-full h-full object-contain" />
              </div>
            </Link>
            <p className="text-gray-400 text-sm">
              The premier marketplace for rights-locked music assets.
              Empowering creators with secure distribution and licensing solutions.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-semibold text-white mb-4">Marketplace</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/marketplace" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Browse Beats
                </Link>
              </li>
              <li>
                <Link href="/producers" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Find Producers
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Licensing Info
                </Link>
              </li>
              <li>
                <Link href="/genres" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Explore Genres
                </Link>
              </li>
            </ul>
          </div>

          {/* For Producers */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Producers</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/sell" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Sell Your Beats
                </Link>
              </li>
              <li>
                <Link href="/signup?role=producer" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Producer Resources
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} TrackFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-gray-500 text-sm">
              Made with 💜 for music creators
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Music, ArrowLeft, Mic, Headphones } from 'lucide-react';

function SignupContent() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as 'artist' | 'producer' || 'artist';
  
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'artist' | 'producer'>(defaultRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, displayName, role);
    
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="glass border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Music className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold gradient-text">ArtistFlow</span>
      </div>

      <h1 className="text-2xl font-bold text-white text-center mb-2">
        Create Account
      </h1>
      <p className="text-gray-400 text-center mb-8">
        Join the rights-aware revolution
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('artist')}
              className={`p-4 rounded-xl border-2 transition-all ${
                role === 'artist'
                  ? 'border-primary bg-primary/10'
                  : 'border-dark-600 hover:border-dark-500'
              }`}
            >
              <Headphones className={`w-6 h-6 mx-auto mb-2 ${role === 'artist' ? 'text-primary' : 'text-gray-400'}`} />
              <p className={`font-medium ${role === 'artist' ? 'text-white' : 'text-gray-400'}`}>
                Artist
              </p>
              <p className="text-xs text-gray-500 mt-1">Buy beats</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('producer')}
              className={`p-4 rounded-xl border-2 transition-all ${
                role === 'producer'
                  ? 'border-secondary bg-secondary/10'
                  : 'border-dark-600 hover:border-dark-500'
              }`}
            >
              <Mic className={`w-6 h-6 mx-auto mb-2 ${role === 'producer' ? 'text-secondary' : 'text-gray-400'}`} />
              <p className={`font-medium ${role === 'producer' ? 'text-white' : 'text-gray-400'}`}>
                Producer
              </p>
              <p className="text-xs text-gray-500 mt-1">Sell beats</p>
            </button>
          </div>
        </div>

        <Input
          label="Display Name"
          type="text"
          placeholder="Your name or alias"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" fullWidth isLoading={loading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-gray-400 text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-gray-500 text-xs">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="text-gray-400 hover:underline">Terms</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-gray-400 hover:underline">Privacy Policy</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-dark-950 to-secondary/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Suspense fallback={<div className="bg-dark-900 border border-dark-700 rounded-2xl p-8 text-center text-gray-400">Loading...</div>}>
          <SignupContent />
        </Suspense>
      </div>
    </div>
  );
}

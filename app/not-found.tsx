import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <h1 className="text-9xl font-black text-primary mb-4 animate-pulse">404</h1>
      <h2 className="text-2xl font-bold uppercase tracking-widest mb-8">Page Not Found</h2>
      <p className="text-gray-400 max-w-md text-center mb-12">
        The signal you are looking for has been lost in the void. Return to the main frequency.
      </p>
      <Link href="/">
        <Button className="px-8 py-4 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-xl hover:scale-105 transition-transform">
          Return Home
        </Button>
      </Link>
    </div>
  );
}

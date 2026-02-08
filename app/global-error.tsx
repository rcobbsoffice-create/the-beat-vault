'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-4xl font-black uppercase text-red-500 mb-4 animate-pulse">Critical System Failure</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            {error.message || 'An unexpected error has occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-red-500/10 border border-red-500/50 text-red-500 font-bold uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all"
          >
            Reboot System
          </button>
        </div>
      </body>
    </html>
  );
}

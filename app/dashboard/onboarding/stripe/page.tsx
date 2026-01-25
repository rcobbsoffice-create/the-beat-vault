'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Loader2, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

function StripeOnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const accountId = searchParams.get('account_id');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const handleComplete = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep(2);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStep(3);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Stripe Connect onboarding complete!', {
       style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #D4AF37' }
    });
    
    router.push('/dashboard/producer/storefront');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="max-w-xl w-full p-8 border-white/5 bg-dark-900/50 shadow-2xl relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[120px] -ml-32 -mb-32" />

        <div className="relative z-10 space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                 <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                 <h1 className="text-2xl font-black text-white italic">STRIPE <span className="text-primary not-italic">CONNECT</span></h1>
                 <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Account ID: {accountId || 'acct_mock_8h2j'}</p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-dark-950 border border-white/5 transition-all">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${step >= 1 ? 'bg-primary border-primary text-black' : 'bg-dark-800 border-white/5 text-gray-500'}`}>
                    {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                 </div>
                 <div className="flex-1">
                    <p className={`text-sm font-bold ${step >= 1 ? 'text-white' : 'text-gray-500'}`}>Verify Business Entity</p>
                    <p className="text-xs text-gray-500">Identity and professional documentation verification.</p>
                 </div>
              </div>
              <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${step >= 2 ? 'bg-dark-950 border-white/5' : 'bg-transparent border-transparent opacity-40'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${step >= 2 ? 'bg-primary border-primary text-black' : 'bg-dark-800 border-white/5 text-gray-500'}`}>
                    {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                 </div>
                 <div className="flex-1">
                    <p className={`text-sm font-bold ${step >= 2 ? 'text-white' : 'text-gray-500'}`}>Payout Methods</p>
                    <p className="text-xs text-gray-500">Link your bank account or debit card for instant payouts.</p>
                 </div>
              </div>
              <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${step >= 3 ? 'bg-dark-950 border-white/5' : 'bg-transparent border-transparent opacity-40'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${step >= 3 ? 'bg-primary border-primary text-black' : 'bg-dark-800 border-white/5 text-gray-500'}`}>
                    {step > 3 ? <Check className="w-4 h-4" /> : '3'}
                 </div>
                 <div className="flex-1">
                    <p className={`text-sm font-bold ${step >= 3 ? 'text-white' : 'text-gray-500'}`}>Security Check</p>
                    <p className="text-xs text-gray-500">Final platform compliance and fraud protection check.</p>
                 </div>
              </div>
           </div>

           <div className="pt-4">
              <Button 
                fullWidth 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest h-14"
                onClick={handleComplete}
                isLoading={isProcessing}
              >
                 {isProcessing ? 'Finalizing Setup...' : 'Confirm & Complete Onboarding'}
              </Button>
              <p className="text-[10px] text-gray-500 text-center mt-4 flex items-center justify-center gap-2">
                 <ShieldCheck className="w-3 h-3 text-success" />
                 Securely powered by Stripe Connect
              </p>
           </div>
        </div>
      </Card>
    </div>
  );
}

export default function StripeOnboardingPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
       </div>
    }>
      <StripeOnboardingContent />
    </Suspense>
  );
}

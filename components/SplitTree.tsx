'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  DollarSign, 
  User, 
  ArrowDown, 
  TrendingUp, 
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SplitParty {
  name: string;
  role: string;
  percentage: number;
  amount?: string;
  status: 'pending' | 'settled';
}

interface SplitTreeProps {
  totalAmount: string;
  parties: SplitParty[];
}

export function SplitTree({ totalAmount, parties }: SplitTreeProps) {
  return (
    <div className="space-y-8 py-4">
      {/* Total Source */}
      <div className="flex flex-col items-center">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center relative z-10">
          <Badge className="mb-2 bg-emerald-500 text-black font-bold">Revenue Source</Badge>
          <div className="text-3xl font-black text-white">${totalAmount}</div>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Gross Sale</p>
        </div>
        
        {/* Connector Line */}
        <div className="w-px h-12 bg-gradient-to-b from-emerald-500/50 to-emerald-500/10" />
      </div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {/* Horizontal Connector Line (Desktop Only) */}
        <div className="hidden lg:block absolute top-[-1px] left-[12.5%] right-[12.5%] h-px bg-emerald-500/10" />

        {parties.map((party, index) => (
          <div key={index} className="flex flex-col items-center group">
            {/* Vertical Connector Line */}
            <div className="w-px h-8 bg-emerald-500/10 mb-[-1px]" />
            
            <Card className="p-4 bg-dark-900 border-white/5 w-full hover:border-emerald-500/30 transition-all hover:scale-[1.02] duration-300 relative overflow-hidden">
               {/* Background Accent */}
               <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary border border-white/5">
                    <User className="w-5 h-5" />
                 </div>
                 <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{party.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{party.role}</p>
                 </div>
               </div>

               <div className="flex items-end justify-between border-t border-white/5 pt-3">
                 <div>
                    <span className="text-[10px] text-gray-600 block mb-0.5 uppercase font-bold">Earnings</span>
                    <span className="text-lg font-black text-white">{party.percentage}%</span>
                 </div>
                 <div className="text-right">
                    <span className="text-emerald-500 text-sm font-bold block">${party.amount || '0.00'}</span>
                    <Badge variant={party.status === 'settled' ? 'success' : 'default'} className="mt-1 text-[9px] h-4">
                      {party.status}
                    </Badge>
                 </div>
               </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Workflow Legend */}
      <div className="flex justify-center gap-8 pt-8 border-t border-white/5">
         <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Rights Protected
         </div>
         <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <Zap className="w-3 h-3 text-emerald-500" /> Automated Split
         </div>
         <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Real-time Settlement
         </div>
      </div>
    </div>
  );
}

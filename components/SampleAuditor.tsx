'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle,
  FileText,
  Lock
} from 'lucide-react';

interface SampleAuditorProps {
  onComplete: (clearanceStatus: boolean) => void;
}

export function SampleAuditor({ onComplete }: SampleAuditorProps) {
  const [samples, setSamples] = useState([
    { id: '1', name: 'Main Melody Loop', source: 'Internal / Original', cleared: true },
    { id: '2', name: 'Drum Kit 808', source: 'Splice / Royalty Free', cleared: true },
  ]);

  const [declaration, setDeclaration] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-warning/10 text-warning border border-warning/20">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Rights Audit</h3>
          <p className="text-sm text-gray-400">Declare sample sources for Sync & Distribution clearance.</p>
        </div>
      </div>

      <div className="space-y-3">
        {samples.map(s => (
          <Card key={s.id} className="p-4 bg-dark-900 border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <span className="text-sm font-bold text-white">{s.name}</span>
                <p className="text-[10px] text-gray-500">{s.source}</p>
              </div>
            </div>
            <Badge variant="success" className="gap-1 px-2 h-6">
              <CheckCircle2 className="w-3 h-3" /> Fully Cleared
            </Badge>
          </Card>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-start gap-3">
          <input 
            type="checkbox" 
            id="audit-check"
            checked={declaration}
            onChange={(e) => setDeclaration(e.target.checked)}
            className="w-5 h-5 mt-1 accent-primary rounded border-dark-600 bg-dark-800"
          />
          <label htmlFor="audit-check" className="text-xs text-gray-400 leading-relaxed cursor-pointer select-none">
            I hereby certify that all samples used in this production are either original, royalty-free, or have been fully cleared for commercial distribution and synchronization. I understand that ArtistFlow is a <strong className="text-white">Rights-Aware</strong> platform and misuse can lead to account suspension.
          </label>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
           <Button 
            fullWidth 
            className={`gap-2 font-bold ${declaration ? 'bg-primary text-black' : 'bg-dark-800 text-gray-500 cursor-not-allowed'}`}
            disabled={!declaration}
            onClick={() => onComplete(true)}
           >
             <Lock className="w-4 h-4" />
             Verify Rights Clearance
           </Button>
        </div>
      </div>

      <p className="text-[10px] text-gray-600 text-center italic">
        ArtistFlow uses automated fingerprinting to verify declarations against public databases.
      </p>
    </div>
  );
}

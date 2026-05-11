import { useEffect, useState } from 'react';
import { parseClaimToken } from '../lib/claimLink';
import type { ClaimPayload } from '../lib/claimLink';
import { Shield, AlertCircle, ArrowDownLeft, Loader2 } from 'lucide-react';

export interface ClaimDetailsProps {
  token: string;
  onValid?: (payload: ClaimPayload) => void;
  alreadyClaimed?: boolean;
}

function formatAmount(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    return '0.00';
  }
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ClaimDetails({ token, onValid, alreadyClaimed = false }: ClaimDetailsProps) {
  const [status, setStatus] = useState<'loading' | 'valid' | 'error'>('loading');
  const [payload, setPayload] = useState<ClaimPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    parseClaimToken(token)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setPayload(result);
          setStatus('valid');
          onValid?.(result);
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => { cancelled = true; };
  }, [token, onValid]);

  if (status === 'loading') {
    return (
      <div data-testid="claim-loading" className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Verifying claim token...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div data-testid="claim-error" className="bg-gray-800 rounded-lg p-6 border border-red-500/20 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Invalid Claim Link</h2>
        <p className="text-gray-400 text-sm mb-4">This claim link is invalid, expired, or has been tampered with.</p>
        <div className="bg-gray-700/50 rounded-lg p-3">
          <p className="text-sm text-red-400">Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  if (alreadyClaimed) {
    return (
      <div data-testid="claim-already-claimed" className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Shield className="w-7 h-7 text-yellow-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Already Claimed</h2>
        <p className="text-gray-400 text-sm">This token has already been claimed.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
          <ArrowDownLeft className="w-6 h-6 text-green-400" />
        </div>
      </div>
      <div className="text-center mb-4">
        <p className="text-gray-400 text-sm mb-1">You are receiving</p>
        <p className="text-3xl font-bold text-white" data-testid="claim-amount">
          {formatAmount(payload!.amount)} USDC
        </p>
      </div>
      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">From</span>
          <span className="text-sm text-white font-medium" data-testid="claim-sender">VeilPay Admin</span>
        </div>
      </div>
    </div>
  );
}

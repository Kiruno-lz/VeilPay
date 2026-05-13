import { useEffect, useState, useCallback } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import type { WalletName } from '@solana/wallet-adapter-base';
import { useAppState } from '../context/useAppState';

export interface UseWalletReturn {
  connected: boolean;
  publicKey: string | null;
  walletName: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  selectWallet: (walletName: string) => void;
  signTransaction: ((transaction: any) => Promise<any>) | undefined;
}

export function useWallet(): UseWalletReturn {
  const solanaWallet = useSolanaWallet();
  const { dispatch } = useAppState();
  const [selectedWalletName, setSelectedWalletName] = useState<string | null>(null);

  // Sync with global AppState whenever wallet state changes
  useEffect(() => {
    if (solanaWallet.connected && solanaWallet.publicKey) {
      dispatch({
        type: 'SET_WALLET',
        payload: {
          connected: true,
          publicKey: solanaWallet.publicKey.toBase58(),
          adapter: solanaWallet.wallet?.adapter ?? null,
        },
      });
    } else if (!solanaWallet.connected) {
      dispatch({
        type: 'SET_WALLET',
        payload: null,
      });
    }
  }, [solanaWallet.connected, solanaWallet.publicKey, solanaWallet.wallet, dispatch]);

  const connect = useCallback(async () => {
    if (!solanaWallet.wallet) {
      throw new Error('No wallet selected');
    }
    await solanaWallet.connect();
  }, [solanaWallet]);

  const disconnect = useCallback(async () => {
    await solanaWallet.disconnect();
  }, [solanaWallet]);

  const selectWallet = useCallback(
    (walletName: string) => {
      setSelectedWalletName(walletName);
      solanaWallet.select(walletName as WalletName);
    },
    [solanaWallet]
  );

  return {
    connected: solanaWallet.connected,
    publicKey: solanaWallet.publicKey?.toBase58() ?? null,
    walletName: selectedWalletName,
    connect,
    disconnect,
    selectWallet,
    signTransaction: solanaWallet.signTransaction,
  };
}

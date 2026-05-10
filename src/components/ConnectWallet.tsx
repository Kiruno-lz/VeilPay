import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';

interface ConnectWalletProps {
  className?: string;
}

const SUPPORTED_WALLETS = [
  { name: 'Phantom', icon: '👻' },
  { name: 'Solflare', icon: '🔥' },
  { name: 'Backpack', icon: '🎒' },
];

function shortenAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function ConnectWallet({ className = '' }: ConnectWalletProps) {
  const { connected, publicKey, walletName, connect, disconnect, selectWallet } = useWallet();
  const [showWalletList, setShowWalletList] = useState(false);

  const handleSelectWallet = async (name: string) => {
    selectWallet(name);
    setShowWalletList(false);
    await connect();
  };

  if (connected && publicKey) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
          <span className="text-lg">
            {SUPPORTED_WALLETS.find((w) => w.name === walletName)?.icon || <Wallet size={18} />}
          </span>
          <span className="text-sm font-mono text-gray-200">{shortenAddress(publicKey)}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          data-testid="disconnect-button"
        >
          <LogOut size={16} />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowWalletList(!showWalletList)}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        data-testid="connect-button"
      >
        <Wallet size={18} />
        Connect Wallet
        <ChevronDown
          size={16}
          className={`transition-transform ${showWalletList ? 'rotate-180' : ''}`}
        />
      </button>

      {showWalletList && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider">Select Wallet</div>
          {SUPPORTED_WALLETS.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => handleSelectWallet(wallet.name)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left"
              data-testid={`wallet-option-${wallet.name.toLowerCase()}`}
            >
              <span className="text-xl">{wallet.icon}</span>
              <span className="text-sm font-medium text-gray-200">{wallet.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

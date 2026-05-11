// Generate test wallets for VeilPay devnet testing
// Run: bun run tests/wallets/generate.ts

import { Keypair } from '@solana/web3.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const WALLETS_DIR = import.meta.dir;

function generateWallet(index: number): { name: string; publicKey: string; secretKey: number[] } {
  const keypair = Keypair.generate();
  return {
    name: `test-wallet-${index}`,
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Array.from(keypair.secretKey),
  };
}

function main() {
  const count = 5;
  const wallets = [];

  for (let i = 1; i <= count; i++) {
    const wallet = generateWallet(i);
    wallets.push(wallet);

    const filePath = join(WALLETS_DIR, `${wallet.name}.json`);
    writeFileSync(filePath, JSON.stringify(wallet, null, 2));
    console.log(`Generated: ${filePath}`);
    console.log(`  Public Key: ${wallet.publicKey}`);
  }

  // Also generate a README with instructions
  const readmePath = join(WALLETS_DIR, 'README.md');
  const readme = `# VeilPay Test Wallets

These wallets are for **devnet testing only**. Do NOT use these on mainnet.

## Usage

1. Copy a wallet's secret key to your localStorage:
   \`\`\`js
   localStorage.setItem('veilpay_test_wallet', JSON.stringify([...secretKey]))
   \`\`\`

2. Set \`VITE_USE_TEST_WALLET=true\` in your \`.env.local\`

3. The app will use this wallet for real devnet interactions

## Wallets

${wallets.map(w => `- **${w.name}**: \`${w.publicKey}\``).join('\n')}

## Security Warning

These wallets are generated deterministically for testing. They have NO real funds.
Fund them via the [Solana Faucet](https://faucet.solana.com/) before use.
`;
  writeFileSync(readmePath, readme);
  console.log(`\nGenerated README: ${readmePath}`);
}

main();

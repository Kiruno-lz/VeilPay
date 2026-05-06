# VeilPay Architecture

> High-level design for a privacy payroll tool built on Cloak + Solana.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (React App)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Admin Page   │  │ Claim Page   │  │ Audit Page       │  │
│  │ /            │  │ /claim       │  │ /audit           │  │
│  │              │  │              │  │                  │  │
│  │ • Connect    │  │ • Paste link │  │ • Enter key      │  │
│  │ • Upload CSV │  │ • Connect    │  │ • View history   │  │
│  │ • Deposit    │  │ • Claim USDC │  │                  │  │
│  │ • Disburse   │  │              │  │                  │  │
│  │ • View keys  │  │              │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼──────────────────┼───────────────────┼────────────┘
          │                  │                   │
          ▼                  ▼                   ▼
   ┌─────────────────────────────────────────────────────┐
   │              CLOAK TYPESCRIPT SDK                    │
   │   deposit()  |  transfer()  |  generateViewingKey()  │
   │        Client-side Groth16 proofs in browser         │
   └─────────────────────┬───────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   CLOAK RELAYER     │
              │  (relay.cloak.so)   │
              │   No custody —      │
              │   submits tx to     │
              │   Solana on behalf  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  SOLANA DEVNET/     │
              │     MAINNET         │
              │                     │
              │  ┌───────────────┐  │
              │  │ Cloak Shielded│  │
              │  │     Pool      │  │
              │  │  (UTXO-based) │  │
              │  └───────────────┘  │
              │                     │
              │  ┌───────────────┐  │
              │  │ USDC Token    │  │
              │  │  Account      │  │
              │  └───────────────┘  │
              └─────────────────────┘
```

---

## Component Diagram

### AdminPage (`/`) — The Primary Interface

```
AdminPage
├── ConnectWallet              # Solana Wallet Adapter
│   └── (Phantom / Solflare / Backpack)
├── BalanceCard                # Shows USDC balance (public + shielded)
│   └── useWalletBalance
├── Step 1: UploadCSV
│   ├── DropZone               # react-dropzone or native
│   ├── CSVPreview             # Parsed table preview
│   └── TotalDisplay           # Sum of all amounts
├── Step 2: DepositCard
│   ├── AmountInput            # How much USDC to shield
│   ├── DepositButton          # Calls cloak.deposit()
│   └── StatusBadge            # idle / proving / confirming / done
├── Step 3: DisburseForm
│   ├── RecipientList          # Read-only list from CSV
│   ├── DisburseButton         # Calls cloak.transfer() in loop
│   ├── ProgressBar            # 3/12 processed...
│   └── ResultLinks            # Generated claim links (copyable)
└── Step 4: AuditDashboard
    ├── KeyGenerator           # cloak.generateViewingKey()
    ├── KeyList                # Active keys with revoke button
    └── AuditExporter          # Generate PDF/CSV report
```

### ClaimPage (`/claim?token=<jwt>`) — No-Frills Recipient View

```
ClaimPage
├── TokenValidator             # Verify claim token (client-side JWT)
├── ClaimDetails
│   ├── AmountDisplay          # "You are receiving 1,500 USDC"
│   └── SenderInfo             # "From: VeilPay Admin"
├── ConnectWallet              # Recipient connects their wallet
├── ClaimButton                # Recipient calls cloak.receive()
└── SuccessState               # "Received! Check your wallet."
```

> **Key decision**: Claim page is a standalone route with a query param. The token is a short-lived JWT containing the encrypted note + commitment reference. It does NOT need a backend — the token is generated client-side by the admin and shared via any channel (email, Telegram, Slack).

### AuditPage (`/audit`) — Third-Party Auditor Login

```
AuditPage
├── KeyInput                   # Textarea for viewing key
├── DecryptButton              # Client-side decryption
├── TransactionTable
│   ├── DateColumn
│   ├── AmountColumn           # Decrypted from shielded data
│   ├── RecipientColumn        # Decrypted address
│   └── TypeColumn             # deposit / transfer / claim
└── ExportButton               # Download as CSV
```

---

## Data Flows

### Flow 1: Admin Deposits USDC into Pool

```
Admin clicks "Deposit 100 USDC"
  │
  ▼
React state: status = "PROVING"
  │
  ▼
Cloak SDK: deposit({ amount: 100_000_000, token: USDC })
  ├── Generate Groth16 proof (client-side, ~2 seconds)
  ├── Build shielded transaction
  └── Send to Cloak Relayer
        │
        ▼
  Relayer submits to Solana
        │
        ▼
  Transaction confirmed
        │
        ▼
React state: status = "CONFIRMED", refresh balance
```

### Flow 2: Batch Disbursement

```
Admin uploads "payroll.csv" (12 recipients)
  │
  ▼
csvParser.ts validates + returns array:
  [{ address: "7xK...tg2", amount: 1500000000 }, ...]
  │
  ▼
Admin clicks "Disburse to 12 Recipients"
  │
  ▼
React state: status = "DISBURSING", progress = 0/12
  │
  ▼
FOR each recipient:
  ├── Cloak SDK: transfer({
  │     to: recipient.address,
  │     amount: recipient.amount,
  │     viewingKey: adminViewingKey
  │   })
  ├── Generate proof (~1-2s per tx)
  ├── Send to Relayer
  ├── Wait confirmation
  └── Generate claim link (JWT with note + commitment)
  │
  ▼
React state: progress = 12/12, display all claim links
```

> **Optimization**: For hackathon MVP, transfers can be sequential. For production, Cloak supports batching multiple outputs in a single shielded transaction — but this is an optimization, not required for the demo.

### Flow 3: Recipient Claims

```
Recipient opens claim link:
https://veilpay.vercel.app/claim?token=eyJhbG...
  │
  ▼
ClaimPage parses JWT:
  { commitment: "abc123", note: "encrypted-note-data" }
  │
  ▼
Recipient connects wallet
  │
  ▼
Recipient clicks "Claim USDC"
  │
  ▼
Cloak SDK: receive({ commitment, note })
  ├── Generate proof
  ├── Submit to Relayer
  └── USDC arrives in recipient's public wallet
  │
  ▼
Success screen + confetti
```

### Flow 4: Auditor Views History

```
Admin goes to "Audit" tab
  │
  ▼
Clicks "Generate Viewing Key"
  │
  ▼
Cloak SDK: generateViewingKey({ scope: "full", expiry: "30d" })
  │
  ▼
Displays key as text — admin copies and sends to auditor
  │
  ▼
Auditor opens /audit, pastes key
  │
  ▼
Cloak SDK: decryptHistory({ viewingKey })
  │
  ▼
Table rendered with decrypted amounts, addresses, timestamps
```

---

## State Management

No external state library needed. React `useState` + `useContext` is sufficient.

```typescript
// Global App State (React Context)
interface AppState {
  wallet: { connected: boolean; publicKey: string } | null;
  cloak: CloakSdkInstance | null;
  balance: {
    publicUsdc: number;      // Normal wallet USDC
    shieldedUsdc: number;    // Inside Cloak pool
  };
  recipients: Recipient[];   // From CSV
  disbursement: {
    status: 'idle' | 'depositing' | 'disbursing' | 'completed' | 'error';
    progress: number;         // 0-N processed
    total: number;            // N total
    claimLinks: ClaimLink[];  // Generated links
  };
  audit: {
    viewingKeys: ViewingKey[];
  };
}
```

---

## Key Technical Decisions

### 1. Why No Backend?

VeilPay is **100% client-side**. This is intentional:
- Cloak SDK handles all ZK proof generation in the browser
- The Relayer is the only "server" and it's operated by Cloak
- No database needed — CSV is ephemeral, claim links are JWTs
- Fits hackathon constraint of solo development in 6 days

Trade-off: Admin must copy-paste claim links manually. Production version would add a simple backend for link persistence and email delivery.

### 2. Claim Link Format

Claim links are JWTs (signed client-side with a throwaway secret — security is "obscurity through randomness" for hackathon):

```typescript
interface ClaimToken {
  commitment: string;   // On-chain commitment reference
  note: string;         // Encrypted note needed to claim
  amount: number;       // Human-readable amount (for UI display)
  exp: number;          // 7-day expiration
}
```

> Production would use a backend-generated token with proper signing.

### 3. CSV Parser

Uses `papaparse` (lightweight, battle-tested):

```typescript
// src/lib/csvParser.ts
import Papa from 'papaparse';

interface ParsedRow {
  address: string;  // Validated as Solana pubkey
  amount: number;   // In USDC decimals (6)
}

export function parsePayrollCSV(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.map((row: any) => ({
          address: validateSolanaAddress(row.address),
          amount: Math.round(parseFloat(row.amount) * 1_000_000),
        }));
        resolve(rows);
      },
      error: reject,
    });
  });
}
```

### 4. Cloak SDK Wrapper

Abstracts Cloak interactions with devnet/mainnet switching:

```typescript
// src/lib/cloak.ts
import { Cloak } from '@cloakxyz/cloak-sdk';

class CloakWrapper {
  private sdk: Cloak;

  constructor(network: 'devnet' | 'mainnet') {
    this.sdk = new Cloak({
      network,
      relayerEndpoint: network === 'devnet'
        ? 'https://relay-devnet.cloak.so'
        : 'https://relay.cloak.so',
    });
  }

  async deposit(amount: number, token: string) {
    const proof = await this.sdk.generateDepositProof({ amount, token });
    return this.sdk.submitViaRelayer(proof);
  }

  async transfer(to: string, amount: number) {
    const proof = await this.sdk.generateTransferProof({ to, amount });
    return this.sdk.submitViaRelayer(proof);
  }

  async generateViewingKey(scope: 'full' | 'amount-only', expiryDays: number) {
    return this.sdk.createViewingKey({ scope, expiry: expiryDays * 86400 });
  }

  async decryptHistory(viewingKey: string) {
    return this.sdk.decryptWithViewingKey(viewingKey);
  }
}
```

> **Note**: The actual Cloak SDK API may differ — this is a speculative interface based on their documentation. Adjust once the real SDK is imported.

---

## File Size Budget

Target: Keep bundle under **500KB gzipped** for fast loading.

| Dependency | Size (gzipped) | Justification |
|---|---|---|
| React + DOM | ~42KB | Framework |
| Solana Web3.js | ~85KB | Wallet + tx |
| @solana/wallet-adapter | ~35KB | Multi-wallet |
| Cloak SDK | ~150KB (est.) | ZK + proofs |
| Tailwind CSS | ~15KB (purged) | Styling |
| PapaParse | ~8KB | CSV parsing |
| **Total** | **~335KB** | Well under budget |

---

## Deployment

```yaml
Platform: Vercel
Build: npm run build (Vite → dist/)
Environment:
  VITE_SOLANA_NETWORK: "devnet"   # Switch to "mainnet-beta" later
  VITE_USDC_MINT: "EPjFW...5tB"   # Devnet USDC mint
Branch strategy:
  main → Production (Vercel auto-deploy)
```

---

## Post-Hackathon Extensions

If continuing beyond the hackathon:

1. **Backend service** — Persist claim links, send via email/Telegram, webhook notifications
2. **Recurring payroll** — Cron-based scheduling, saved recipient lists
3. **Multi-sig admin** — Squads / Realm integration for DAO treasury
4. **Multi-token** — USDT, SOL support via Cloak
5. **Mobile app** — React Native with same Cloak SDK
6. **API** — Programmatic access for payroll platforms (Gusto, Deel competitor)

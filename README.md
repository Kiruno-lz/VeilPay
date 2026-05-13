# VeilPay

> Private payroll and disbursement on Solana — built with [Cloak](https://cloak.so/) for the Solana Frontier Hackathon.

VeilPay is a browser-based tool that lets organizations and DAOs batch-pay contractors and employees in USDC without exposing amounts, recipients, or timestamps on-chain. Built on top of Cloak's shielded pool and client-side Groth16 proofs.

---

## Live Demo

[veilpay-sol.vercel.app](https://veilpay-sol.vercel.app) (Devnet)

---

## What It Does

1. **Connect wallet** — Admin connects their Solana wallet (Phantom / Solflare)
2. **Upload roster** — Drop a CSV with recipient addresses and USDC amounts
3. **Deposit to pool** — USDC enters Cloak's shielded pool via client-side proof
4. **Batch disburse** — One shielded transaction fans out to all recipients privately
5. **Stealth claims** — Each recipient gets a unique claim link — no Cloak knowledge required
6. **Audit view** — Admin generates scoped viewing keys for finance / auditors / tax

### Before vs After

| Before (on-chain) | After (with VeilPay) |
|---|---|
| Salary amounts permanently public | Amounts hidden even on explorer |
| Recipient wallets trivially indexed | Recipient addresses shielded |
| Competitors parse treasury flows | No public signals for competitors |
| Auditors = block explorers | Scoped viewing keys for compliant audit |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Wallet | Solana Wallet Adapter (Phantom, Solflare, Backpack) |
| Privacy Engine | Cloak TypeScript SDK |
| Network | Solana Devnet / Mainnet |
| Build | Vite 6 + TypeScript |

---

## Quick Start

```bash
# Clone
git clone https://github.com/Kiruno-lz/VeilPay.git
cd VeilPay

# Install
bun install

# Dev server (uses Devnet by default)
bun run dev

# Build for production
bun run build
```

### CSV Format

```csv
address,amount
7xKXtg2CW87d97TXJSDpbD5jBkheTq... ,1500.00
8YMyt3DX98d88UYKSEpbE6jClheUq... ,2300.50
```

---

## Project Structure

```
veilpay-frontier/
├── src/
│   ├── components/
│   │   ├── ConnectWallet.tsx      # Wallet connection button
│   │   ├── UploadCSV.tsx          # CSV drag-and-drop parser
│   │   ├── DepositCard.tsx        # Deposit into Cloak pool
│   │   ├── DisburseForm.tsx       # Batch disbursement UI
│   │   ├── ClaimLink.tsx          # Stealth claim link generator
│   │   ├── AuditDashboard.tsx     # Viewing key management
│   │   └── TransactionStatus.tsx  # Real-time status tracker
│   ├── hooks/
│   │   ├── useCloakSdk.ts         # Cloak SDK initialization
│   │   ├── useWalletBalance.ts    # USDC balance fetcher
│   │   └── useTransaction.ts      # Transaction state machine
│   ├── lib/
│   │   ├── cloak.ts               # Cloak SDK wrapper + error handling
│   │   ├── csvParser.ts           # PapaParse wrapper
│   │   ├── claimLink.ts           # Stealth link generation
│   │   └── viewingKey.ts          # Scoped viewing key utils
│   ├── pages/
│   │   ├── AdminPage.tsx          # Main admin dashboard
│   │   ├── ClaimPage.tsx          # External claim page (no wallet needed)
│   │   └── AuditPage.tsx          # Auditor login page
│   ├── types/
│   │   └── index.ts               # Shared TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Submission Tracks

| Track | Prize | Status |
|---|---|---|
| [Cloak Track](https://superteam.fun/earn/listing/cloak-track) — Private payroll | $5,010 USDC | Primary target |
| [SagaPad](https://superteam.fun/earn/listing/sagapad-or-build-agentic-skills-that-helps-colosseum-projects-and-founders-win-on-x) — AI skill for privacy projects | $1,000 USDC | Secondary |
| [dum.fun](https://superteam.fun/earn/listing/dumdotfun) — Token launch + engagement | $500 USDC | 10-minute bonus |

---

---

## Why We Built This

Every transaction on Solana is public by default. For individuals that's inconvenient. For organizations it's an operational risk — payroll amounts get indexed, treasury movements telegraph strategy, counterparty flows are parsed by competitors.

Cloak closes that gap with a UTXO shielded pool. VeilPay makes it **usable** for the most common organizational pain point: paying people.

---

## Team

Built solo for the Solana Frontier Hackathon, May 2026.

---

## License

MIT

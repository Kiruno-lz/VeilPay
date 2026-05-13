# PRODUCT.md — VeilPay

> Product specification for VeilPay, a privacy payroll tool on Solana.

---

## 1. Product Name

**VeilPay**

---

## 2. Register

**Product**: Browser-based application (app UI, admin dashboard, tool)  
**Category**: Privacy payroll and disbursement on Solana  
**Form**: Single-page web app with three primary views: Admin Dashboard, Stealth Claim Page, and Audit Dashboard.

---

## 3. Users

### Primary Personas

| Persona | Role | Goal | Pain Point |
|---|---|---|---|
| **DAO Treasurer** | Manages multi-sig treasury for a DAO | Pay contributors monthly without exposing treasury flows | Competitors index public payroll to infer runway and headcount |
| **Startup CFO** | Runs finance at a crypto-native startup | Disburse salaries to contractors in USDC | Salary amounts and recipient wallets are permanently public on-chain |
| **Payroll Admin** | Operations person executing payments | Batch-pay 50+ people with minimal crypto knowledge | Existing tools require recipients to understand shielded pools |

### Secondary Personas

| Persona | Role | Goal |
|---|---|---|
| **Contractor / Employee** | Receives payment | Claim USDC via a simple link without installing new wallets or learning Cloak |
| **Auditor / Accountant** | External finance reviewer | View decrypted transaction history with a scoped, revocable key |
| **Compliance Officer** | Legal / tax reviewer | Prove payments occurred without exposing them to the public |

---

## 4. Product Purpose

**One sentence:** VeilPay lets organizations and DAOs batch-pay contractors in USDC on Solana without exposing payment amounts, recipient addresses, or timestamps on-chain.

---

## 5. Strategic Principles

1. **Privacy is the default, not a feature.** Every design decision must preserve the shielded guarantee — amounts, recipients, and timestamps never leak to public explorers.
2. **Recipients should not need to know Cloak exists.** A contractor receives a link, connects their wallet, and clicks "Claim." Zero education required.
3. **Auditability without exposure.** Admins generate scoped, time-bound viewing keys for finance teams and auditors. No backdoors. No permanent visibility.
4. **Batch operations, not single transactions.** The core value is paying many people at once — one deposit, one proof, many recipients.
5. **Hackathon-shippable, production-viable.** Build the minimal complete flow in 6 days, but architect it so it can scale to real treasuries post-hackathon.

---

## 6. Tone & Voice

1. **Confident, not aggressive.** We know privacy matters. We don't need to shout about it with cyberpunk tropes.
2. **Clear over clever.** "Shielded" and "private" are used precisely. No made-up jargon. No "Web3" filler.
3. **Professional but approachable.** This is a finance tool, not a trading app. Calm language, no hype, no FOMO.
4. **Action-oriented.** Buttons say "Upload Roster," "Deposit to Pool," "Disburse Now" — not "Get Started" or "Learn More."
5. **Trustworthy.** Error messages explain what happened and what to do next. No blame. No vague "something went wrong."

---

## 7. Anti-References (What We Avoid)

| What we avoid | Why | What we do instead |
|---|---|---|
| **Crypto-cliché dark neon** (purple grids, glowing borders, "cyber" aesthetics) | Signals "hobby project" or "degen tool," not serious finance | Clean, bold color blocks with strong typography — think Wise, not WazirX |
| **SaaS-cream generic** (beige backgrounds, soft shadows, interchangeable illustrations) | Looks like every other B2B tool; no personality or conviction | Distinctive color system, confident spacing, clear hierarchy |
| **Hero-metric templates** ("$2B+ protected," "10,000+ users" — fake social proof) | Hackathon projects don't have metrics. Pretending otherwise is dishonest. | No fake numbers. Show the product, not imaginary traction. |
| **Dark-mode-only default** | Forces a niche aesthetic on a general audience | Respect system preference, but design for light mode first |
| **Jargon-heavy copy** ("zero-knowledge rollups," "trustless settlement") | Alienates non-crypto users (the people actually getting paid) | Plain language: "hidden on-chain," "private claim link," "scoped viewing key" |

---

## 8. Key Differentiators

| # | Differentiator | How It's Delivered |
|---|---|---|
| 1 | **True on-chain privacy** | Built on Cloak's shielded pool with client-side Groth16 proofs — amounts, recipients, and timestamps are cryptographically hidden |
| 2 | **Zero-recipient-friction** | Stealth claim links mean contractors don't need to understand shielded pools, install special wallets, or hold gas tokens |
| 3 | **Scoped audit keys** | Admins generate time-bound viewing keys for accountants/auditors. Keys can be revoked. No permanent backdoor. |
| 4 | **Batch-native design** | Upload a CSV, deposit once, disburse to many — the UI is built around paying groups, not one-off transactions |
| 5 | **Browser-native, no backend** | All proofs generated client-side. No server sees recipient lists, amounts, or viewing keys. No database to breach. |

---

## Design Reference

**Inspiration:** Wise (TransferWise) — clean, bold color blocks, strong typography, confident but not aggressive.  
**Palette direction:** Distinctive but restrained. Avoid crypto-neon and SaaS-beige. Use color to signal action and state, not decoration.

---

*Last updated: May 2026 — Solana Frontier Hackathon, Cloak Track.*

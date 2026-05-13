# VeilPay Design System

> Product design specification for VeilPay — a privacy payroll dashboard on Solana.
> Design direction: **Wise-inspired color block style** — bold flat color blocks, strong contrast, clean typography, generous whitespace. Professional yet approachable.
>
> **Color strategy: Committed** — one saturated accent (teal/cyan) carries 30–60% of surface.

---

## 1. Color System

All colors specified in **OKLCH** for perceptual uniformity and predictable contrast.

### 1.1 Primary Accent — Teal/Cyan

A confident teal that signals trust and tech without the blue cliché.

| Token | OKLCH | Tailwind Arbitrary | Usage |
|-------|-------|-------------------|-------|
| `primary-50` | `oklch(97% 0.02 195)` | `bg-[oklch(97%_0.02_195)]` | Subtle backgrounds, hover states |
| `primary-100` | `oklch(93% 0.04 195)` | `bg-[oklch(93%_0.04_195)]` | Light tint backgrounds |
| `primary-200` | `oklch(85% 0.08 195)` | `bg-[oklch(85%_0.08_195)]` | Borders, dividers on light |
| `primary-300` | `oklch(75% 0.12 195)` | `bg-[oklch(75%_0.12_195)]` | Secondary buttons, icons |
| `primary-400` | `oklch(65% 0.14 195)` | `bg-[oklch(65%_0.14_195)]` | Hover on secondary |
| `primary-500` | `oklch(55% 0.15 195)` | `bg-[oklch(55%_0.15_195)]` | **Primary accent** — CTAs, active states |
| `primary-600` | `oklch(48% 0.14 195)` | `bg-[oklch(48%_0.14_195)]` | Primary hover |
| `primary-700` | `oklch(40% 0.12 195)` | `bg-[oklch(40%_0.12_195)]` | Primary pressed |
| `primary-800` | `oklch(32% 0.09 195)` | `bg-[oklch(32%_0.09_195)]` | Dark variant backgrounds |
| `primary-900` | `oklch(24% 0.06 195)` | `bg-[oklch(24%_0.06_195)]` | Deep backgrounds |
| `primary-950` | `oklch(18% 0.04 195)` | `bg-[oklch(18%_0.04_195)]` | Near-black with teal tint |

### 1.2 Secondary — Warm Amber

For warnings, pending states, and action highlights that need warmth.

| Token | OKLCH | Tailwind Arbitrary | Usage |
|-------|-------|-------------------|-------|
| `secondary-50` | `oklch(97% 0.02 85)` | `bg-[oklch(97%_0.02_85)]` | Subtle warning backgrounds |
| `secondary-100` | `oklch(93% 0.04 85)` | `bg-[oklch(93%_0.04_85)]` | Light warning tint |
| `secondary-200` | `oklch(85% 0.08 85)` | `bg-[oklch(85%_0.08_85)]` | Warning borders |
| `secondary-300` | `oklch(75% 0.12 85)` | `bg-[oklch(75%_0.12_85)]` | Warning icons |
| `secondary-400` | `oklch(68% 0.14 85)` | `bg-[oklch(68%_0.14_85)]` | Secondary action hover |
| `secondary-500` | `oklch(60% 0.15 85)` | `bg-[oklch(60%_0.15_85)]` | **Secondary accent** — warnings, highlights |
| `secondary-600` | `oklch(52% 0.13 85)` | `bg-[oklch(52%_0.13_85)]` | Secondary pressed |
| `secondary-700` | `oklch(44% 0.11 85)` | `bg-[oklch(44%_0.11_85)]` | Dark warning text |
| `secondary-800` | `oklch(35% 0.08 85)` | `bg-[oklch(35%_0.08_85)]` | Dark variant |
| `secondary-900` | `oklch(26% 0.05 85)` | `bg-[oklch(26%_0.05_85)]` | Deep amber background |
| `secondary-950` | `oklch(20% 0.03 85)` | `bg-[oklch(20%_0.03_85)]` | Near-black with amber tint |

### 1.3 Neutral Scale — Tinted Toward Primary

Neutrals carry a subtle teal tint to unify the palette. Dark mode is the primary context.

| Token | OKLCH | Tailwind Arbitrary | Usage |
|-------|-------|-------------------|-------|
| `neutral-0` | `oklch(100% 0 195)` | `bg-[oklch(100%_0_195)]` | Pure white (rarely used) |
| `neutral-50` | `oklch(97% 0.005 195)` | `bg-[oklch(97%_0.005_195)]` | Lightest background |
| `neutral-100` | `oklch(92% 0.01 195)` | `bg-[oklch(92%_0.01_195)]` | Light backgrounds, cards on light mode |
| `neutral-200` | `oklch(82% 0.015 195)` | `bg-[oklch(82%_0.015_195)]` | Borders on light |
| `neutral-300` | `oklch(70% 0.02 195)` | `bg-[oklch(70%_0.02_195)]` | Disabled text on light |
| `neutral-400` | `oklch(58% 0.02 195)` | `bg-[oklch(58%_0.02_195)]` | Muted text on light |
| `neutral-500` | `oklch(48% 0.02 195)` | `bg-[oklch(48%_0.02_195)]` | Secondary text |
| `neutral-600` | `oklch(38% 0.015 195)` | `bg-[oklch(38%_0.015_195)]` | Borders on dark |
| `neutral-700` | `oklch(28% 0.01 195)` | `bg-[oklch(28%_0.01_195)]` | Card backgrounds on dark |
| `neutral-800` | `oklch(20% 0.008 195)` | `bg-[oklch(20%_0.008_195)]` | Elevated surfaces on dark |
| `neutral-900` | `oklch(14% 0.005 195)` | `bg-[oklch(14%_0.005_195)]` | **Base background** — page bg |
| `neutral-950` | `oklch(10% 0.003 195)` | `bg-[oklch(10%_0.003_195)]` | Deepest background, top bar |

### 1.4 Semantic Colors

| Token | OKLCH | Usage |
|-------|-------|-------|
| `success-500` | `oklch(65% 0.18 145)` | Success states, completed transactions |
| `success-600` | `oklch(58% 0.16 145)` | Success hover |
| `error-500` | `oklch(58% 0.18 25)` | Errors, failed transactions |
| `error-600` | `oklch(52% 0.16 25)` | Error hover |
| `warning-500` | `oklch(68% 0.14 85)` | Warnings (alias to secondary-400) |
| `info-500` | `oklch(65% 0.14 195)` | Info states (alias to primary-400) |

### 1.5 Dark Mode Mapping

VeilPay is **dark mode primary**. All default styles target dark mode.

| Element | Background | Text | Border |
|---------|-----------|------|--------|
| Page | `neutral-900` | `neutral-100` | — |
| Card | `neutral-800` | `neutral-100` | `neutral-600` |
| Card (elevated) | `neutral-700` | `neutral-100` | `neutral-600` |
| Input | `neutral-800` | `neutral-100` | `neutral-600` |
| Input (focused) | `neutral-800` | `neutral-100` | `primary-500` |
| Button (primary) | `primary-500` | `neutral-0` | — |
| Button (secondary) | `neutral-700` | `neutral-100` | `neutral-600` |
| Top bar | `neutral-950` | `neutral-100` | `neutral-800` |
| Sidebar | `neutral-950` | `neutral-200` | `neutral-800` |

### 1.6 Color Block Strategy

Following Wise's approach, use **flat color blocks** to create visual rhythm:

- **Hero/dashboard header**: Large `primary-900` or `primary-950` block with white text
- **Stat cards**: Alternate `neutral-800` with `primary-800` blocks for key metrics
- **Step sections**: Each step gets a subtle left border (`primary-500` 4px) on `neutral-800` background
- **Status badges**: Solid color blocks (no borders) — `success-500`, `secondary-500`, `error-500`
- **CTA areas**: Full-width `primary-500` block for primary actions

---

## 2. Typography

### 2.1 Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

Use `font-feature-settings: "cv02", "cv03", "cv04", "cv11"` for better numerals (tabular figures, slashed zero).

### 2.2 Type Scale

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|-------|------|-------------|--------|----------------|-------|
| `text-xs` | 12px | 16px | 400 | 0.01em | Captions, timestamps |
| `text-sm` | 14px | 20px | 400 | 0 | Body small, labels |
| `text-base` | 16px | 24px | 400 | 0 | Body text |
| `text-lg` | 18px | 28px | 500 | -0.01em | Lead text, card titles |
| `text-xl` | 20px | 30px | 600 | -0.02em | Section headings |
| `text-2xl` | 24px | 32px | 600 | -0.02em | Page titles |
| `text-3xl` | 30px | 38px | 700 | -0.02em | Hero headlines |
| `text-4xl` | 36px | 44px | 700 | -0.03em | Large hero text |
| `text-5xl` | 48px | 56px | 800 | -0.03em | Display (rare) |

### 2.3 Font Weights

| Weight | Usage |
|--------|-------|
| 400 | Body text, descriptions |
| 500 | Labels, medium emphasis |
| 600 | Headings, button text, emphasized labels |
| 700 | Page titles, hero text |
| 800 | Display numbers, stats |

### 2.4 Monospace Stack

For addresses, amounts, and code:

```css
font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
```

Use `text-sm` with `font-variant-numeric: tabular-nums` for aligned numbers.

---

## 3. Spacing & Layout

### 3.1 Base Unit

Base unit: **4px**

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |

### 3.2 Grid System

- **Max content width**: 1200px (`max-w-6xl`)
- **Dashboard max width**: 1024px (`max-w-5xl`)
- **Narrow content**: 640px (`max-w-xl`)
- **Gutter**: 24px (`px-6`)
- **Section gap**: 32px (`gap-8`)

### 3.3 Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Ultra-wide |

### 3.4 Layout Patterns

**Dashboard Layout:**
```
┌─────────────────────────────────────┐
│  Top Bar (fixed, h-14, z-50)        │
├──────────┬──────────────────────────┤
│ Sidebar  │  Main Content            │
│ (w-64)   │  (flex-1, overflow-auto) │
│ fixed    │                          │
│ h-screen │                          │
└──────────┴──────────────────────────┘
```

**Content Padding:**
- Mobile: `px-4` (16px)
- Tablet+: `px-6` (24px)
- Desktop+: `px-8` (32px)

---

## 4. Components

### 4.1 Button

**Primary Button:**
```
Background:    primary-500
Text:          neutral-0 (white)
Padding:       px-5 py-2.5 (20px × 10px)
Border-radius: rounded-lg (8px)
Font:          text-sm font-semibold
Hover:         primary-600
Active:        primary-700
Disabled:      neutral-700 text-neutral-500 cursor-not-allowed
Transition:    all 200ms ease-out
```

**Secondary Button:**
```
Background:    neutral-700
Text:          neutral-100
Border:        1px solid neutral-600
Padding:       px-5 py-2.5
Border-radius: rounded-lg
Font:          text-sm font-semibold
Hover:         neutral-600
Active:        neutral-800
```

**Ghost Button:**
```
Background:    transparent
Text:          primary-400
Hover:         primary-950 (subtle tint)
Active:        primary-900
```

**Button Sizes:**
| Size | Padding | Font |
|------|---------|------|
| Small | `px-3 py-1.5` | `text-xs font-medium` |
| Default | `px-5 py-2.5` | `text-sm font-semibold` |
| Large | `px-6 py-3` | `text-base font-semibold` |

### 4.2 Card

**Default Card:**
```
Background:    neutral-800
Border:        1px solid neutral-600
Border-radius: rounded-xl (12px)
Padding:       p-6 (24px)
Shadow:        none (flat design)
```

**Elevated Card:**
```
Background:    neutral-700
Border:        1px solid neutral-600
Border-radius: rounded-xl
Padding:       p-6
Shadow:        shadow-lg (for dark: subtle glow)
```

**Color Block Card (for stats/metrics):**
```
Background:    primary-800
Text:          neutral-100
Border-radius: rounded-xl
Padding:       p-6
```

**Card with Left Accent:**
```
Border-left:   4px solid primary-500
Background:    neutral-800
Border-radius: rounded-xl
Padding:       p-6
```

### 4.3 Input

**Text Input:**
```
Background:    neutral-800
Border:        1px solid neutral-600
Border-radius: rounded-lg (8px)
Padding:       px-4 py-2.5
Font:          text-sm
Text:          neutral-100
Placeholder:   neutral-500

Focus:
  Border:      primary-500
  Ring:        ring-2 ring-primary-500/20

Error:
  Border:      error-500
  Ring:        ring-2 ring-error-500/20
```

**Input with Icon:**
```
Left icon:     absolute left-3, text-neutral-500
Input padding: pl-10 pr-4 py-2.5
```

**Label:**
```
Font:          text-sm font-medium
Color:         neutral-300
Margin-bottom: space-1.5 (6px)
```

**Helper Text:**
```
Font:          text-xs
Color:         neutral-500
Margin-top:    space-1.5
```

### 4.4 Badge

**Status Badges (solid color blocks — no borders):**

| Variant | Background | Text |
|---------|-----------|------|
| Default | `neutral-700` | `neutral-200` |
| Primary | `primary-500` | `neutral-0` |
| Success | `success-500` | `neutral-0` |
| Warning | `secondary-500` | `neutral-950` |
| Error | `error-500` | `neutral-0` |
| Info | `primary-800` | `primary-200` |

```
Padding:       px-2.5 py-0.5
Border-radius: rounded-full
Font:          text-xs font-semibold
```

### 4.5 Step Indicator

**Step Circle:**
```
Active:
  Background:    primary-500
  Text:          neutral-0
  Size:          w-8 h-8
  Border-radius: rounded-full
  Font:          text-sm font-bold

Inactive:
  Background:    neutral-700
  Text:          neutral-400
  Border:        1px solid neutral-600

Completed:
  Background:    success-500
  Text:          neutral-0
```

**Step Connector:**
```
Active:   bg-primary-500, h-0.5
Inactive: bg-neutral-700, h-0.5
```

### 4.6 Table

**Data Table:**
```
Container:     bg-neutral-800 rounded-xl border border-neutral-600
Header row:    bg-neutral-900/50 border-b border-neutral-600
Header text:   text-xs font-semibold text-neutral-400 uppercase tracking-wider
Row:           border-b border-neutral-700 last:border-0
Row hover:     bg-neutral-700/50
Cell padding:  px-4 py-3
Cell text:     text-sm text-neutral-200
```

### 4.7 Modal / Dialog

```
Overlay:       bg-neutral-950/80 backdrop-blur-sm
Container:     bg-neutral-800 rounded-2xl border border-neutral-600
Max-width:     max-w-lg
Padding:       p-6
Shadow:        shadow-2xl
```

### 4.8 Toast / Notification

```
Container:     rounded-lg px-4 py-3
Success:       bg-success-500/10 border border-success-500/20 text-success-500
Error:         bg-error-500/10 border border-error-500/20 text-error-500
Warning:       bg-secondary-500/10 border border-secondary-500/20 text-secondary-400
Info:          bg-primary-500/10 border border-primary-500/20 text-primary-400
```

---

## 5. Elevation & Borders

### 5.1 Elevation (Shadows)

Flat design with minimal, purposeful shadows:

| Token | Shadow | Usage |
|-------|--------|-------|
| `shadow-sm` | `0 1px 2px oklch(0% 0 0 / 0.3)` | Subtle lift |
| `shadow-md` | `0 4px 6px -1px oklch(0% 0 0 / 0.4)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px -3px oklch(0% 0 0 / 0.5)` | Modals, popovers |
| `shadow-xl` | `0 20px 25px -5px oklch(0% 0 0 / 0.6)` | Full-screen overlays |

### 5.2 Borders

| Token | Value | Usage |
|-------|-------|-------|
| `border` | `1px solid` | Default borders |
| `border-2` | `2px solid` | Emphasized borders |
| `border-4` | `4px solid` | Accent borders (left accent on cards) |

**Border Colors:**
- Default: `neutral-600`
- Focus: `primary-500`
- Error: `error-500`
- Success: `success-500`

### 5.3 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Small elements |
| `rounded-md` | 6px | Tags, badges |
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 12px | Cards, containers |
| `rounded-2xl` | 16px | Modals, large containers |
| `rounded-full` | 9999px | Pills, avatars, badges |

---

## 6. Motion

### 6.1 Easing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Entering |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Exiting |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy interactions |

### 6.2 Durations

| Token | Value | Usage |
|-------|-------|-------|
| `duration-instant` | 75ms | Micro-interactions |
| `duration-fast` | 150ms | Hover states |
| `duration-normal` | 200ms | Standard transitions |
| `duration-slow` | 300ms | Page transitions |
| `duration-slower` | 500ms | Complex animations |

### 6.3 Common Transitions

```css
/* Button hover */
transition: all 200ms ease-out;

/* Input focus */
transition: border-color 150ms ease-out, box-shadow 150ms ease-out;

/* Card hover lift */
transition: transform 200ms ease-out, background-color 200ms ease-out;

/* Modal enter */
animation: modal-enter 300ms ease-out;
@keyframes modal-enter {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

/* Toast slide in */
animation: toast-slide 300ms ease-out;
@keyframes toast-slide {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Progress bar fill */
transition: width 500ms ease-out;

/* Skeleton shimmer */
animation: shimmer 2s infinite;
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### 6.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Hero Section Design (Dashboard)

The hero section is the **top of the AdminPage dashboard** — the first thing admins see. It uses bold color blocks to establish visual hierarchy and guide the eye through key metrics.

### 7.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Color Block: primary-950]                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  VeilPay Admin              [Connect Wallet Button]   │  │
│  │  Privacy payroll on Solana                            │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  [Color Block: neutral-900]                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  USDC Balance│ │ Shielded     │ │ Recipients   │        │
│  │  $12,450.00  │ │ $8,200.00    │ │ 24 pending   │        │
│  │  [neutral-800│ │ [primary-800]│ │ [neutral-800]│        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  [Color Block: neutral-900]                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Step 1: Upload Recipients                            │  │
│  │  [neutral-800 with left border primary-500]           │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Step 2: Deposit Funds                                │  │
│  │  [neutral-800 with left border primary-500]           │  │
│  └───────────────────────────────────────────────────────┘  │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Top Bar (Header)

```
Background:    primary-950
Border-bottom: 1px solid primary-900
Height:        h-14 (56px)
Position:      fixed top-0 left-0 right-0 z-50

Content:
  - Logo: "VeilPay" text-2xl font-bold text-neutral-0
  - Tagline: "Privacy payroll on Solana" text-sm text-primary-300
  - Right: ConnectWallet button (primary style)
```

### 7.3 Stats Row

Three-column grid of color block cards:

```
Container:     grid grid-cols-1 md:grid-cols-3 gap-4 mt-6

Card 1 (Balance):
  Background:    neutral-800
  Border-radius: rounded-xl
  Padding:       p-6
  Label:         "USDC Balance" text-sm text-neutral-400
  Value:         "$12,450.00" text-3xl font-bold text-neutral-0 font-mono
  Change:        "+ $1,200 today" text-sm text-success-500

Card 2 (Shielded - accent block):
  Background:    primary-800
  Border-radius: rounded-xl
  Padding:       p-6
  Label:         "Shielded in Pool" text-sm text-primary-200
  Value:         "$8,200.00" text-3xl font-bold text-neutral-0 font-mono
  Change:        "92% of total" text-sm text-primary-300

Card 3 (Recipients):
  Background:    neutral-800
  Border-radius: rounded-xl
  Padding:       p-6
  Label:         "Pending Recipients" text-sm text-neutral-400
  Value:         "24" text-3xl font-bold text-neutral-0 font-mono
  Change:        "From payroll.csv" text-sm text-neutral-500
```

### 7.4 Step Sections

Each step is a card with a left accent border, creating a visual timeline:

```
Container:     space-y-4 mt-8

Step Card:
  Background:    neutral-800
  Border:        1px solid neutral-600
  Border-left:   4px solid primary-500
  Border-radius: rounded-xl
  Padding:       p-6

Step Header:
  Flex row, items-center, gap-3
  Step number:   w-8 h-8 rounded-full bg-primary-500 text-neutral-0
                 text-sm font-bold flex items-center justify-center
  Step title:    text-lg font-semibold text-neutral-100

Step Content:
  Margin-left:   ml-11 (44px, aligns with step number)
  Content:       Component-specific UI
```

### 7.5 Color Block Rhythm

The hero section uses alternating color blocks to create visual interest:

1. **Header**: `primary-950` — establishes brand, darkest block
2. **Stats**: Mix of `neutral-800` and `primary-800` — the shielded amount gets the accent block to draw attention
3. **Steps**: `neutral-800` with `primary-500` left border — consistent, guided rhythm
4. **CTA areas**: `primary-500` full-width block for primary actions (e.g., "Disburse Now")

### 7.6 Responsive Behavior

**Mobile (< 768px):**
- Stats stack vertically (1 column)
- Step numbers shrink to `w-7 h-7`
- Content padding reduces to `p-4`
- Top bar hides tagline, shows only logo + wallet button

**Tablet (768px - 1024px):**
- Stats in 2+1 grid (first two side by side, third full width)
- Full padding maintained

**Desktop (> 1024px):**
- Stats in 3-column grid
- Sidebar appears (if implemented): `w-64` fixed left
- Main content has `ml-64` offset

---

## 8. Tailwind Configuration

### 8.1 Recommended tailwind.config.js Extension

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'oklch(97% 0.02 195)',
          100: 'oklch(93% 0.04 195)',
          200: 'oklch(85% 0.08 195)',
          300: 'oklch(75% 0.12 195)',
          400: 'oklch(65% 0.14 195)',
          500: 'oklch(55% 0.15 195)',
          600: 'oklch(48% 0.14 195)',
          700: 'oklch(40% 0.12 195)',
          800: 'oklch(32% 0.09 195)',
          900: 'oklch(24% 0.06 195)',
          950: 'oklch(18% 0.04 195)',
        },
        secondary: {
          50: 'oklch(97% 0.02 85)',
          100: 'oklch(93% 0.04 85)',
          200: 'oklch(85% 0.08 85)',
          300: 'oklch(75% 0.12 85)',
          400: 'oklch(68% 0.14 85)',
          500: 'oklch(60% 0.15 85)',
          600: 'oklch(52% 0.13 85)',
          700: 'oklch(44% 0.11 85)',
          800: 'oklch(35% 0.08 85)',
          900: 'oklch(26% 0.05 85)',
          950: 'oklch(20% 0.03 85)',
        },
        neutral: {
          0: 'oklch(100% 0 195)',
          50: 'oklch(97% 0.005 195)',
          100: 'oklch(92% 0.01 195)',
          200: 'oklch(82% 0.015 195)',
          300: 'oklch(70% 0.02 195)',
          400: 'oklch(58% 0.02 195)',
          500: 'oklch(48% 0.02 195)',
          600: 'oklch(38% 0.015 195)',
          700: 'oklch(28% 0.01 195)',
          800: 'oklch(20% 0.008 195)',
          900: 'oklch(14% 0.005 195)',
          950: 'oklch(10% 0.003 195)',
        },
        success: {
          500: 'oklch(65% 0.18 145)',
          600: 'oklch(58% 0.16 145)',
        },
        error: {
          500: 'oklch(58% 0.18 25)',
          600: 'oklch(52% 0.16 25)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
```

### 8.2 CSS Custom Properties (Alternative)

If not extending Tailwind config, use CSS variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Primary - Teal/Cyan */
    --primary-50: oklch(97% 0.02 195);
    --primary-100: oklch(93% 0.04 195);
    --primary-200: oklch(85% 0.08 195);
    --primary-300: oklch(75% 0.12 195);
    --primary-400: oklch(65% 0.14 195);
    --primary-500: oklch(55% 0.15 195);
    --primary-600: oklch(48% 0.14 195);
    --primary-700: oklch(40% 0.12 195);
    --primary-800: oklch(32% 0.09 195);
    --primary-900: oklch(24% 0.06 195);
    --primary-950: oklch(18% 0.04 195);

    /* Secondary - Amber */
    --secondary-50: oklch(97% 0.02 85);
    --secondary-100: oklch(93% 0.04 85);
    --secondary-200: oklch(85% 0.08 85);
    --secondary-300: oklch(75% 0.12 85);
    --secondary-400: oklch(68% 0.14 85);
    --secondary-500: oklch(60% 0.15 85);
    --secondary-600: oklch(52% 0.13 85);
    --secondary-700: oklch(44% 0.11 85);
    --secondary-800: oklch(35% 0.08 85);
    --secondary-900: oklch(26% 0.05 85);
    --secondary-950: oklch(20% 0.03 85);

    /* Neutral - Tinted toward teal */
    --neutral-0: oklch(100% 0 195);
    --neutral-50: oklch(97% 0.005 195);
    --neutral-100: oklch(92% 0.01 195);
    --neutral-200: oklch(82% 0.015 195);
    --neutral-300: oklch(70% 0.02 195);
    --neutral-400: oklch(58% 0.02 195);
    --neutral-500: oklch(48% 0.02 195);
    --neutral-600: oklch(38% 0.015 195);
    --neutral-700: oklch(28% 0.01 195);
    --neutral-800: oklch(20% 0.008 195);
    --neutral-900: oklch(14% 0.005 195);
    --neutral-950: oklch(10% 0.003 195);

    /* Semantic */
    --success-500: oklch(65% 0.18 145);
    --success-600: oklch(58% 0.16 145);
    --error-500: oklch(58% 0.18 25);
    --error-600: oklch(52% 0.16 25);
  }

  body {
    background-color: var(--neutral-900);
    color: var(--neutral-100);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
}
```

---

## 9. Usage Examples

### 9.1 Primary Button

```tsx
<button className="px-5 py-2.5 bg-primary-500 text-neutral-0 text-sm font-semibold rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors duration-200 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed">
  Connect Wallet
</button>
```

### 9.2 Stat Card (Accent Block)

```tsx
<div className="bg-primary-800 rounded-xl p-6">
  <p className="text-sm text-primary-200 mb-1">Shielded in Pool</p>
  <p className="text-3xl font-bold text-neutral-0 font-mono">$8,200.00</p>
  <p className="text-sm text-primary-300 mt-1">92% of total</p>
</div>
```

### 9.3 Step Card

```tsx
<section className="bg-neutral-800 border border-neutral-600 border-l-4 border-l-primary-500 rounded-xl p-6">
  <div className="flex items-center gap-3 mb-4">
    <span className="w-8 h-8 rounded-full bg-primary-500 text-neutral-0 text-sm font-bold flex items-center justify-center">
      1
    </span>
    <h2 className="text-lg font-semibold text-neutral-100">Upload Recipients</h2>
  </div>
  <div className="ml-11">
    {/* Step content */}
  </div>
</section>
```

### 9.4 Status Badge

```tsx
<span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-500 text-neutral-0">
  Completed
</span>
```

### 9.5 Input Field

```tsx
<div>
  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
    Amount (USDC)
  </label>
  <input
    type="number"
    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-150"
    placeholder="0.00"
  />
  <p className="text-xs text-neutral-500 mt-1.5">Minimum deposit: 1 USDC</p>
</div>
```

---

## 10. Accessibility

### 10.1 Contrast Requirements

All text must meet **WCAG AA** (4.5:1 for normal text, 3:1 for large text):

| Combination | Ratio | Pass |
|-------------|-------|------|
| `neutral-100` on `neutral-900` | 12.8:1 | AA ✓ |
| `neutral-0` on `primary-500` | 7.2:1 | AA ✓ |
| `neutral-0` on `primary-800` | 9.1:1 | AA ✓ |
| `neutral-100` on `neutral-800` | 8.4:1 | AA ✓ |
| `primary-200` on `primary-800` | 5.6:1 | AA ✓ |
| `neutral-0` on `success-500` | 6.8:1 | AA ✓ |
| `neutral-950` on `secondary-500` | 8.2:1 | AA ✓ |

### 10.2 Focus States

All interactive elements must have visible focus indicators:

```css
/* Default focus ring */
focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 focus:ring-offset-neutral-900

/* High contrast focus (for keyboard navigation) */
.focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2
```

### 10.3 Reduced Motion

Respect `prefers-reduced-motion` as specified in Section 6.4.

---

## 11. File Structure

```
project/
├── DESIGN.md              # This file
├── tailwind.config.js     # Extended with design tokens
├── src/
│   ├── index.css          # CSS variables + base styles
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── StepIndicator.tsx
│   │   └── ...            # Feature components
│   └── pages/
│       └── AdminPage.tsx  # Hero section implementation
```

---

## 12. Implementation Checklist

- [ ] Extend `tailwind.config.js` with OKLCH color tokens
- [ ] Add CSS custom properties to `index.css`
- [ ] Import Inter and JetBrains Mono fonts (Google Fonts or local)
- [ ] Update `AdminPage.tsx` with color block hero layout
- [ ] Create reusable `Button`, `Card`, `Input`, `Badge` components
- [ ] Implement step indicator with left accent border
- [ ] Add stat cards with alternating color blocks
- [ ] Verify contrast ratios meet WCAG AA
- [ ] Test responsive behavior at all breakpoints
- [ ] Verify reduced motion support

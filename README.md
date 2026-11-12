<div align="center">

# 🧙‍♂️ Albion Wizard
### *State-of-the-Art Economic Terminal & Silver Maximization Engine for Albion Online*

[![CI](https://github.com/Tribal-Chief-001/albion-wizard/actions/workflows/ci.yml/badge.svg)](https://github.com/Tribal-Chief-001/albion-wizard/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-albion--wizard.xandred.workers.dev-38bdf8?style=flat-square&logo=cloudflare)](https://albion-wizard.xandred.workers.dev/)
[![Easy Anti-Cheat Safe](https://img.shields.io/badge/Easy%20Anti--Cheat-100%25%20Safe-10b981?style=flat-square)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](package.json)
[![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript)](tsconfig.json)
[![Tailwind CSS 3.4](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](tailwind.config.js)

<p align="center">
  <a href="https://albion-wizard.xandred.workers.dev/"><strong>⚡ Launch Live Production Terminal</strong></a> •
  <a href="#-the-core-economic-systems"><strong>Core Systems</strong></a> •
  <a href="#-architectural-blueprint"><strong>Architecture</strong></a> •
  <a href="#-mathematical-formulations"><strong>Math Formulas</strong></a> •
  <a href="#-local-development"><strong>Quickstart</strong></a> •
  <a href="#-eac--tos-compliance"><strong>Anti-Cheat Safety</strong></a>
</p>

</div>

---

## ⚡ Executive Summary

**Silver is the foundational asset of Albion Online.** It dictates everything from instant 700/700 combat masteries via Tomes of Insight to eliminating "gear fear" completely during high-tier full-loot PvP.

**Albion Wizard** is an ultra-fast, Bloomberg-grade financial analytics terminal designed from first principles to exploit market inefficiencies across Albion Online's isolated regional economies. Built on modern web standards (React 19, TypeScript, Tailwind CSS, Vite) and distributed globally across **Cloudflare's Anycast Edge Network**, it delivers real-time arbitrage detection with **0% ban risk**, zero backend server requirements, and zero client injection.

---

## 🏛️ The Core Economic Systems

```
                                  [ Albion Wizard Cockpit ]
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
 [Stage 1: Bootstrap]                 [Stage 2: Compounding]               [Stage 3: Whale Cartel]
 • Faction Point Arbitrage Matrix     • Black Market Starvation Scanner    • Gold-Silver Macro Oracle
 • Safe-Zone Heart Conversion         • 700/700 SPF Refining Studio        • Staging Server Patch Diff
 • Royal City Crest Pricing           • +EV Quality Reroll Simulator       • Transmutation Negative Cycles
                                      • Transport Manifest Cart
```

### 1. 🔥 Black Market Starvation Permutations Engine
- **First Principle:** PvE open-world mob drops and dungeon loot do not spawn from thin air; they are purchased automatically by the system from Caerleon's Black Market. When stock hits zero, the automated buy order escalates exponentially.
- **The Scanner:** Monitors live order books across all 6 Royal Cities and the Black Market. It identifies starving enchantment and quality combinations (e.g. T6.2 Excellent, T7.1 Masterpiece) where the automated buy order has inflated to **200%–800% of Royal City prices**.
- **Execution:** Generates instant net profit calculations taking into account 4% Premium vs 8% Non-Premium tax deductions and live price ages.

### 2. 📦 Caerleon Haul Manifest Cart & Weight Estimator
- **Interactive Haul Drawer:** Click "+ Haul" on any arbitrage card to add items to your active transport manifest with dynamic quantity controls.
- **Cargo Weight Modeling:** Real-time cargo weight calculation (kg) paired with mount recommendations:
  - 🐎 **Armored Horse:** Lightweight stealth & rapid gank evasion (<1,000 kg).
  - 🐗 **Wild Boar / Spectral Direboar:** Balanced Red Zone agility (<2,500 kg).
  - 🐻 **Grizzly Bear:** Heavy CC-immune armor cargo (<5,000 kg).
  - 🦣 **Elder's Transport Mammoth:** Maximum cartel transport volume (<40,000 kg).
- **Clipboard Export:** One-click manifest copy for scout communications and discord transport coordination.

### 3. ⚡ 700/700 Focus Refining & Crafting Studio
- **Resource Return Rate (RRR):** Models exact city production bonuses (15.2% baseline up to 53.9% in bonus cities with Focus).
- **Exponential Focus Curve:** Calculates true Focus cost reduction based on your mastery specs ($Spec \in [0, 700]$):
  $$\text{Focus Cost}(Spec) = \text{BaseCost} \times 0.5^{\frac{Spec}{100}}$$
- **Silver Per Focus (SPF):** Dynamic ranking of every resource tier (T4 to T8, .0 to .4) showing net silver generated per focus point consumed, letting players extract 2.5M–5M+ pure passive silver daily.

### 4. 🎲 +EV Quality Reroll Simulator
- **Closed-form Geometric Probability:** Calculates exact expected silver expenditure to roll Masterpiece or Excellent qualities at the Repair Station NPC based on internal Item Value.
- **Monte Carlo Simulation Engine:** Runs customizable stochastic simulations (500 to 10,000 iterations) with exact empirical distributions.
- **Tail-Risk Quantile Analysis:** Calculates P25, P50 (Median), P75, P90, and P99 maximum risk scenarios, proving mathematically whether an item has statistically guaranteed Positive Expected Value (+EV) before touching the forge.

### 5. 🛡️ Faction Point Arbitrage & Heart Matrix
- **Safe-Zone Wealth Generation:** Converts raw Faction Points earned during Yellow Zone Outpost Caps and Bandit Assaults into deterministic physical items.
- **Regional Heart Arbitrage:** Computes real-time conversion rates across all 6 faction tokens (`Treeheart`, `Mountain Heart`, `Rockheart`, `Vineheart`, `Beastheart`, `Shadowheart`) and crests, identifying peak payout routes (18–25 Silver/Point).

### 6. 📈 Gold-Silver Macro Oracle & Patch Anticipation
- **Gold-Silver Cycle Tracker:** Tracks the secular inflation of Gold against Silver, plotting current valuations against 30-day moving averages and identifying high-volume monthly premium dip opportunities.
- **Patch Front-Running Oracle:** Anticipates equipment balance updates from Sandbox Interactive's Staging Server, highlighting weapon archetypes slated for buffs to accumulate before patch day.

---

## 🏗️ Architectural Blueprint

```
                      ┌─────────────────────────────────┐
                      │    Albion Online Data Project   │
                      │     (Crowdsourced AODP CDN)     │
                      └────────────────┬────────────────┘
                                       │ Gzip / Deflate JSON
                                       ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                        Albion Wizard SPA Client                        │
  │                      (Vite 6 + React 19 + Tailwind)                    │
  ├────────────────────────────────────────────────────────────────────────┤
  │  • 40ms Micro-Paced API Client with Exponential Backoff (aodp.ts)      │
  │  • 820+ Item Catalog (Swords, Daggers, Axes, Bows, Magic, Armors, etc.)│
  │  • Live Sprite Generator (render.albiononline.com/v1/item/{id}.png)     │
  │  • Real-time Web Audio Synthesizer (Chime & Alert Oscillator Engine)   │
  │  • Multi-Cluster Switcher (Americas / Europe / Asia)                   │
  │  • One-Click In-Game Item Name Copy ("Ctrl+V Ready")                   │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │ Static Assets Edge Pipeline
                                      ▼
                      ┌─────────────────────────────────┐
                      │    Cloudflare Workers Edge CDN  │
                      │   (Unlimited Bandwidth, HTTPS)  │
                      └─────────────────────────────────┘
```

---

## 📐 Mathematical Formulations

### 1. Black Market Net Profit & ROI
$$\text{Net Profit} = P_{\text{BM\_Buy}} \times (1 - \text{Tax Rate}) - P_{\text{Royal\_Sell}}$$
$$\text{ROI (\%)} = \left(\frac{\text{Net Profit}}{P_{\text{Royal\_Sell}}}\right) \times 100$$
*(Where Tax Rate is 4% for Premium accounts, 8% for non-Premium).*

### 2. Resource Return Rate (RRR)
$$\text{RRR} = \frac{\text{Production Bonus}}{100 + \text{Production Bonus}}$$
- Flat City Base: 15.2%
- Matching Refining City: 36.7% (without focus)
- Matching Refining City with Focus: 53.9%
- High-Tier Black Zone HQ: Up to 58.2%

### 3. Closed-Form Expected Value of Quality Rerolling
$$\mathbb{E}[\text{Reroll Cost to Target}] = \frac{\text{Cost Per Roll}}{P(\text{Target Quality})}$$
$$\mathbb{E}[\text{Net Reroll Profit}] = \text{Black Market Value} \times (1 - \text{Tax}) - \text{Base Item Buy Price} - \mathbb{E}[\text{Reroll Cost to Target}]$$

---

## 🔒 EAC & ToS Compliance

Albion Wizard is **100% compliant** with Sandbox Interactive's Terms of Service (Section 13) and Easy Anti-Cheat (EAC):

| Security Boundary | Status | Details |
| :--- | :--- | :--- |
| **Process Memory Injection** | ✅ Zero Risk | Web application running entirely inside your browser. Never interacts with `Albion-Online.exe` memory space. |
| **Automation & Macros** | ✅ Zero Risk | Strict adherence to the "1 Click = 1 Action" policy. No auto-clickers, bots, or automated orders. |
| **Packet Interception** | ✅ Zero Risk | Consumes public, crowdsourced market data from the Albion Online Data Project (AODP). No packet sniffing by the browser. |
| **Combat Radars / Cheats** | ✅ Zero Risk | Strictly macroeconomic analysis. Contains zero combat radar or real-time player location features. |

*Read the complete [Security Policy](SECURITY.md) and [EAC Compliance Whitepaper](docs/EAC_TOS_COMPLIANCE.md).*

---

## 🚀 Local Development

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

```bash
# 1. Clone the repository
git clone https://github.com/Tribal-Chief-001/albion-wizard.git
cd albion-wizard

# 2. Install dependencies
npm install

# 3. Start local development server with Vite HMR
npm run dev

# 4. Open in browser
# http://localhost:3000
```

### Build & Verification Commands
```bash
# Strict TypeScript compilation check (no emit)
npm run typecheck

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ☁️ Deployment

### Option A: Cloudflare Workers / Pages (Recommended)
This repository includes a production-ready `wrangler.jsonc` configured for Cloudflare Workers Static Assets.
```bash
# Deploy instantly to Cloudflare Edge
npx wrangler deploy
```

### Option B: Vercel (Zero Configuration)
Import `Tribal-Chief-001/albion-wizard` into [Vercel](https://vercel.com/new). Vercel will automatically detect the Vite preset and compile `dist/`.

---

## 🗺️ Roadmap & Upgrades

- [x] **v1.0 (The Foundation):**
  - [x] Full AODP REST API client with micro-pacing & exponential backoff.
  - [x] 820+ item catalog with real-time Albion Render API sprite engine.
  - [x] Black Market Starvation Permutations Engine.
  - [x] Interactive Caerleon Haul Manifest Cart with mount weight limits.
  - [x] 700/700 Focus Refining & Transmutation Studio.
  - [x] +EV Quality Reroll Simulator with Monte Carlo engine.
  - [x] Faction Point Arbitrage Matrix.
  - [x] Gold-Silver Macro Oracle & Staging Patch Tracker.
  - [x] Synthesized Web Audio alerts (zero external sound files).
  - [x] Automated GitHub Actions CI pipeline.
- [ ] **v2.0 (The Empire Upgrade):**
  - [ ] **Mammoth Profit-Density Arbitrageur:** Safe-zone Yellow Zone city-to-city bulk resource cargo optimizer.
  - [ ] **BZ Hideout vs Royal City RRR Comparison Matrix:** Interactive toggle comparing 53.9% (City) vs 58.2% (Q6 HQ) gear return deltas.
  - [ ] **Faction City Transport Contract Optimizer:** 15 $\to$ 18 (Safe) vs 15 $\to$ 27 (Red Zone) route payout calculator.
  - [ ] **Watchlist & Starred Items:** Client-side IndexedDB persistence for customized item monitoring.

---

## 🤝 Contributing

We welcome community contributions! Please review our:
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Project Ledger & Systems Ledger](docs/ALBION_SILVER_SYSTEMS_LEDGER.md)

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

*Albion Online is a registered trademark of Sandbox Interactive GmbH. Albion Wizard is an independent open-source economic tool and is not affiliated with or endorsed by Sandbox Interactive GmbH.*

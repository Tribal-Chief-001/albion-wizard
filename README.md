# Albion Wizard 🧙‍♂️
> High-Leverage Black Market Arbitrage, Starvation Scanner & Economic Cockpit for Albion Online.

[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20with-Cloudflare%20Pages-f38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Vercel Compatible](https://img.shields.io/badge/Vercel-Compatible-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![EAC Safe](https://img.shields.io/badge/Easy%20Anti--Cheat-100%25%20Safe-10b981)](#security--anti-cheat-invariants)

---

## ⚡ Overview

Albion Wizard is a high-performance web platform designed to maximize silver velocity in *Albion Online*. It operates strictly out-of-process, utilizing crowdsourced order-book data from the **Albion Online Data Project (AODP)** and sprite rendering from the official **Albion Render API**.

### Key Features
* 🛰️ **Multi-Cluster Support:** Switch seamlessly between **Americas (West)**, **Europe**, and **Asia (East)**.
* 🔥 **Black Market Starvation Permutation Scanner:** Detects unsupplied high-tier enchantment & quality items where the NPC Black Market price-ramp algorithm has inflated buy orders by 200%–500%+.
* 🛡️ **Faction Point Arbitrage Matrix:** Interactive calculator translating Faction Points into deterministic Faction Heart/Crest silver yields across all 6 Royal Cities.
* 📋 **One-Click In-Game Search:** Click any arbitrage card to immediately copy its localized item name into your clipboard for instantaneous `Ctrl+V` market searching in-game.
* 🔔 **Web Audio Chime Alerts:** Synthesized browser-native audio notifications when high-ROI opportunities or starvation spikes are identified.
* 👑 **Tax & Fee Intelligence:** Toggle between Premium (4% tax) and Non-Premium (8% tax) to calculate exact net profit after fees.

---

## 🛠️ Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/Tribal-Chief-001/albion-wizard.git
cd albion-wizard

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## ☁️ Deployment

### 1. Cloudflare Pages (100% Free & Unlimited Bandwidth)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select `Tribal-Chief-001/albion-wizard`.
3. Set configuration:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
4. Click **Save and Deploy**. Any subsequent `git push` will trigger an automated global deployment.

### 2. Vercel
1. Import `Tribal-Chief-001/albion-wizard` directly on [Vercel](https://vercel.com/new).
2. Framework preset will automatically detect `Vite`.
3. Click **Deploy**.

---

## 🔒 Security & Anti-Cheat Invariants

This platform is strictly non-intrusive and 100% compliant with Sandbox Interactive's (SBI) Terms of Service:
* **No Memory Hooking / DLL Injection:** Operates entirely within the browser.
* **No Macro / Input Automation:** Adheres to the "1 Click = 1 Action" policy.
* **Passive Public Data:** Only reads public AODP crowdsourced market order books.

---

## 📄 Documentation
Comprehensive mathematical foundations and roadmap available in [docs/ALBION_SILVER_SYSTEMS_LEDGER.md](docs/ALBION_SILVER_SYSTEMS_LEDGER.md).

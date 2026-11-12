# Albion Wizard Architecture & Engineering Blueprint

This document outlines the software design, data ingestion pipeline, mathematical modeling layer, and edge deployment infrastructure of **Albion Wizard**.

---

## 🏛️ High-Level System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               Albion Online Game Client                │
                    │      (Player queries in-game Market Boards)            │
                    └──────────────────────────┬─────────────────────────────┘
                                               │ Network Packets (pcap)
                                               ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               Albion Data Client (Desktop)             │
                    │         (Crowdsourced packet sniffers by players)      │
                    └──────────────────────────┬─────────────────────────────┘
                                               │ ZeroMQ / HTTPS Ingest
                                               ▼
                    ┌────────────────────────────────────────────────────────┐
                    │             Albion Online Data Project (AODP)          │
                    │        https://{west|europe|east}.albion-online-data    │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
                                               │ Gzip / Deflate Encoded REST API
                                               │ Batched Multi-Item Requests
                                               ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────┐
 │                                 Albion Wizard Frontend Client                             │
 │                              (Vite 6 + React 19 + TypeScript)                             │
 ├───────────────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                           │
 │   ┌──────────────────────────┐   ┌──────────────────────────┐   ┌─────────────────────┐   │
 │   │      AODP Client         │   │   Arbitrage Engine       │   │  Audio Synthesizer  │   │
 │   │   • Micro-pacing (40ms)  │──▶│   • Starvation Scanner   │──▶│  • Web Audio API    │   │
 │   │   • Gzip Headers         │   │   • Net ROI / Spread     │   │  • Chimes & Pings   │   │
 │   │   • Cluster Switcher     │   │   • Cartel Starvations   │   │  • Zero Asset Files │   │
 │   └──────────────────────────┘   └─────────────┬────────────┘   └─────────────────────┘   │
 │                                                │                                          │
 │                                                ▼                                          │
 │   ┌───────────────────────────────────────────────────────────────────────────────────┐   │
 │   │                                Economic Subsystems                                │   │
 │   ├───────────────────────┬───────────────────────────┬───────────────────────────────┤   │
 │   │  Refining & Crafting  │    Reroll Simulator       │   Gold Macro & Patch Oracle   │   │
 │   │  • 15.2% to 57.9% RRR │    • Closed-form EV       │   • 30-Day Moving Average     │   │
 │   │  • Focus Exponential  │    • Monte Carlo Engine   │   • Seasonal Subs Cycles      │   │
 │   │  • SPF Yield Matrix   │    • Tail-Risk CDF Curve  │   • Staging Diff Watcher      │   │
 │   └───────────────────────┴───────────────────────────┴───────────────────────────────┘   │
 │                                                │                                          │
 │                                                ▼                                          │
 │   ┌───────────────────────────────────────────────────────────────────────────────────┐   │
 │   │                               Reactive User Interface                             │   │
 │   │  • Dark Bloomberg Terminal aesthetic (Tailwind CSS)                               │   │
 │   │  • Albion Render CDN Sprites (`render.albiononline.com/v1/item/{id}.png`)          │   │
 │   │  • One-click clipboard in-game search copy                                        │   │
 │   │  • Responsive mobile & desktop multi-column drawer layout                         │   │
 │   └───────────────────────────────────────────────────────────────────────────────────┘   │
 └─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                               │ Static Edge Distribution
                                               ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               Cloudflare Workers / Pages               │
                    │               Global Edge CDN (Anycast)                │
                    │               SPA Fallback Routing                     │
                    └────────────────────────────────────────────────────────┘
```

---

## 📡 1. Data Ingestion & API Layer (`src/services/aodp.ts`)

Albion Wizard does not require any backend server. It operates as a high-performance **Serverless Static Single Page Application (SPA)** that communicates directly with the Albion Online Data Project (AODP).

### Multi-Cluster Regional Endpoints
Albion Online runs three isolated regional servers:
- **Americas (West):** `https://west.albion-online-data.com/api/v2/stats/prices`
- **Europe (Europe):** `https://europe.albion-online-data.com/api/v2/stats/prices`
- **Asia (East):** `https://east.albion-online-data.com/api/v2/stats/prices`

### Micro-Pacing & Rate-Limit Resilience
To prevent hitting browser connection limits or receiving HTTP 429 (Too Many Requests) from AODP Cloudflare edge nodes:
1. **Batching:** Requests query up to 80 items per HTTP request using comma-separated item IDs.
2. **Compression Enforcement:** Requests explicitly pass `Accept-Encoding: gzip, deflate, br` headers.
3. **Exponential Backoff:** If a 429 response is encountered, the client pauses for 1,500ms before retrying.
4. **Timestamp Normalization:** Timestamps received from AODP are sanitized to remove duplicated timezone identifiers (`Z` or `+00:00`) before ISO date parsing.

---

## 🧠 2. Mathematical Modeling Engine

### A. Black Market Starvation Permutations
The automated Black Market NPC in Caerleon adjusts its buy price according to supply inventory:
$$\text{Starvation Index} = \frac{P_{\text{BM\_Buy}} - P_{\text{Royal\_Sell}}}{P_{\text{Royal\_Sell}}} \times \left(1 + \frac{\Delta t_{\text{hours}}}{24}\right)$$

When an enchanted high-tier item has zero supply for over 24 hours, the NPC price climbs rapidly. The engine filters for opportunities where:
$$\text{Net Margin} = P_{\text{BM\_Buy}} \times (1 - \text{Tax}) - P_{\text{Royal\_Sell}} > 0$$

### B. Silver Per Focus (SPF) Formulation
For refining and crafting:
$$\text{SPF} = \frac{V_{\text{output}} + (V_{\text{returned}} \times \text{RRR}) - C_{\text{inputs}} - \text{StationFee}}{\text{FocusPointsConsumed}}$$
Where Focus cost scales exponentially with player mastery specialization ($Spec \in [0, 700]$):
$$\text{Focus Cost}(Spec) = \text{BaseCost} \times 0.5^{\frac{Spec}{100}}$$

### C. Equipment Quality Reroll Expected Value (+EV)
Rerolling quality at the Repair Station NPC costs a fixed silver fee $C_{\text{roll}}$ determined by the item's internal value. Given independent roll probabilities:
$$\mathbb{E}[\text{Cost to Masterpiece}] = \frac{C_{\text{roll}}}{P(\text{Masterpiece})}$$
$$\mathbb{E}[\text{Net Profit}] = P_{\text{BM\_Masterpiece}} \times (1 - \text{Tax}) - P_{\text{Normal\_Buy}} - \mathbb{E}[\text{Cost to Masterpiece}]$$

---

## 🔊 3. Audio Synthesizer Engine

Rather than bundling heavy audio MP3/WAV assets that increase bundle size and require HTTP network requests, Albion Wizard synthesizes real-time sound effects using the **Web Audio API**:
- **Gain Nodes & Oscillators:** Generates crystalline pleasant notification chimes on high-ROI finds.
- **Audio Lifecycle Management:** Oscillator nodes ramp gain to zero and automatically disconnect upon completion to prevent browser memory leaks.
- **User Preference Persistence:** Audio toggle state is stored in browser memory.

---

## 🚀 4. Build & Distribution

- **Bundler:** Vite 6 with Rollup code-splitting.
- **TypeScript:** Strict type-safety with zero implicit `any`.
- **Styling:** Tailwind CSS with PurgeCSS tree-shaking for minimal CSS bundle footprint (<35 kB).
- **Edge Deployment:** Zero-configuration deployment via `wrangler.jsonc` supporting Cloudflare Workers Static Assets and Cloudflare Pages.

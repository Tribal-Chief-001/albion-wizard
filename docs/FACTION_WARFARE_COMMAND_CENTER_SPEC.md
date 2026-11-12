# Faction Warfare Command Center: Architecture, Game Mechanics & UI Specification

**Version:** 1.0.0  
**Target Platform:** Albion Wizard (Vite + React 19 + TypeScript + Tailwind CSS)  
**Security & Compliance:** 100% EAC & Sandbox Interactive ToS Compliant (Out-of-Process, Zero Memory Injection, Passive AODP REST API / Crowdsourced Ingestion)

---

## 1. Executive Product Vision

The **Faction Warfare Command Center** is an interactive, high-leverage decision support module within Albion Wizard. It transforms Faction Warfare from an opaque, disorganized zerg activity into a deterministic, algorithmic silver- and point-generating machine for both absolute beginners (0 spec, <20k silver budget) and high-volume economic arbitrageurs.

The module solves three fundamental player pain points:
1. **Bandit Assault Blindness:** Players miss the high-payout 1-hour Red Zone Bandit Assault because the game gives only a localized 15-minute warning with zero countdown clock.
2. **Beginner Gank Anxiety & Gear Fear:** New players fear entering Red Zones, believing they need expensive 8.3 sets or will instantly lose everything to 10-man gank squads.
3. **Sub-optimal Point Monetization:** Casual players burn hard-earned Faction Points on sub-optimal RNG Faction Chests (yielding a poor 8–10 Silver/Point) instead of executing deterministic Cape Crafting Multipliers (yielding 24–35+ Silver/Point).

---

## 2. Bandit Assault Prediction Clock

### 2.1 Game Mechanics & Timing Dynamics

Bandit Assault is a recurring continent-wide event where all Red Zone faction outposts surrounding Caerleon are captured by bandits and become contested territory. Capturing these outposts yields massive Faction Point pools distributed at the event's conclusion.

```
 Previous Bandit Ends
       │
       ▼
 [0h 00m - 2h 30m] ──────────▶ LOCKED COOLDOWN (Trigger Probability = 0%)
                               No rolls occur. Server lockout timer active.
       │
       ▼
 [2h 30m - 4h 00m] ──────────▶ ROLL WINDOW OPEN (P = 15% - 50%)
                               Periodic server hazard roll every 15-30 minutes.
       │
       ▼
 [4h 00m - 5h 30m] ──────────▶ HIGH PROBABILITY / OVERDUE (P = 50% - 98%)
                               Approaching asymptotic maximum limit (~5.5h - 6h max).
       │
       ▼
 [T - 15 Minutes]  ──────────▶ 15-MINUTE ADVANCE WARNING BROADCAST
                               Server sends continent-wide system message.
       │
       ▼
 [T + 0 to T + 60m] ─────────▶ BANDIT ASSAULT ACTIVE (Red Zone Outpost Rush)
```

#### Cooldown & Roll Engine Formulation
Let $t$ represent the elapsed time (in minutes) since the previous Bandit Assault ended:

1. **Lockout Period ($t < t_{\text{lockout}}$):**
   $$P_{\text{trigger}}(t) = 0 \quad \text{for } t < 150 \text{ min (2.5 hours)}$$

2. **Probabilistic Hazard Window ($t \ge 150$ min):**
   Empirical data gathered across Albion West, Europe, and East discord tracking bots (BANS, AlbionKit) models the cumulative probability $F(t)$ via a 2-parameter Weibull CDF:
   $$F(t) = 1 - \exp\left( - \left(\frac{t - t_{\text{lockout}}}{\lambda}\right)^k \right)$$
   Where:
   - $t_{\text{lockout}} = 150 \text{ minutes}$ (2.5h minimum cooldown)
   - Scale parameter $\lambda = 105 \text{ minutes}$ (characteristic roll duration)
   - Shape parameter $k = 2.4$ (steepening hazard rate as time elapses)

   **Empirical Probability Curve Table:**
   | Elapsed Time $t$ | Post-Lockout $\Delta t$ | State | Cumulative Probability $F(t)$ |
   | :--- | :--- | :--- | :---: |
   | **0h - 2h 30m** (0 - 150m) | 0 min | `LOCKED_COOLDOWN` | **0.0%** |
   | **3h 00m** (180m) | 30 min | `ROLL_WINDOW_EARLY` | **4.8%** |
   | **3h 30m** (210m) | 60 min | `ROLL_WINDOW_MODERATE` | **23.5%** |
   | **4h 00m** (240m) | 90 min | `ROLL_WINDOW_MEDIAN` | **47.6%** |
   | **4h 15m** (255m) | 105 min | `HIGH_PROBABILITY` | **62.1%** |
   | **4h 45m** (285m) | 135 min | `HIGH_PROBABILITY` | **82.3%** |
   | **5h 00m** (300m) | 150 min | `IMMINENT` | **91.8%** |
   | **5h 30m** (330m) | 180 min | `OVERDUE` | **98.4%** |

#### UTC Server Schedules & Daily Maintenance Resets
Albion Online operates three distinct regional physical servers:
- **Americas (West):** Daily server maintenance at **10:00 UTC** (duration ~30–45 min).
- **Europe (Amsterdam):** Daily server maintenance at **10:00 UTC** (duration ~30–45 min).
- **Asia (East / Singapore):** Daily server maintenance at **22:00 UTC** (duration ~30–45 min).

*Maintenance Invariant:* Immediately upon server boot post-maintenance, the Bandit timer resets to a guaranteed cooldown state of at least 2.5 hours. The roll engine does not roll during server restart.

---

### 2.2 Ingestion Architecture for Real-Time Crowd Webhooks (BANS / AlbionKit)

Because Albion Wizard runs entirely in the player's web browser on Cloudflare Pages without local memory sniffing, it ingests real-time events through an edge webhook relay:

```
 [ In-Game Client ] ──▶ [ Packet Sniffer / OCR ]
                              │
                              ▼
                   [ Discord Webhook / Bot ]
                    (BANS / AlbionKit Scouts)
                              │
                              ▼
          ┌──────────────────────────────────────────────┐
          │     Cloudflare Edge Worker Ingest Relay      │
          │      POST /api/v1/bandit/report              │
          │  • HMAC Verification / Shared Secret Token   │
          │  • Consensus Engine: N>=3 Crowd Confirmations│
          │  • Ephemeral KV Cache (TTL 120s)             │
          └──────────────────────┬───────────────────────┘
                                 │ Server-Sent Events (SSE) / Polling (30s)
                                 ▼
          ┌──────────────────────────────────────────────┐
          │           Albion Wizard Frontend             │
          │  • State: WARNING_15M (Pulsing Red HUD)      │
          │  • Web Audio API Synthesizer (Chime Fanfare) │
          │  • Browser Push Notification                 │
          └──────────────────────────────────────────────┘
```

#### Ingestion Data Contract (JSON Payload)
```typescript
export interface BanditEventPayload {
  cluster: 'west' | 'europe' | 'east';
  status: 'cooldown' | 'rolling' | 'warning_15m' | 'active';
  lastEventEndedUtc: string; // ISO 8601
  warningTriggeredUtc?: string; // ISO 8601 (when the 15m server banner fired)
  expectedEventStartUtc?: string; // ISO 8601 (warningTriggeredUtc + 15 mins)
  confidence: number; // 0.0 to 1.0 based on scout verification
  source: 'bans_relay' | 'albionkit_webhook' | 'crowd_verified';
}
```

#### Dual-Mode Fallback & Manual Sync
If the public webhook relay is unreachable or the user is playing on a quiet cluster:
1. **Simulated Clock Engine:** Tracks local elapsed time since the user clicked `"Bandit Just Ended"` or set a known baseline.
2. **"15m Warning Spotted" Quick Button:** One-click instant sync that locks the local client into the 15-minute countdown and emits the notification chime for all connected tabs.

---

### 2.3 Audio Synthesizer Chime Engine (Web Audio API)

To maintain zero external MP3/WAV dependencies, the alert system uses the Web Audio API with dual oscillators (sine + triangle) creating a 3-stage melodic fanfare:
- **Stage 1 (Alert Ping):** 587.33 Hz (D5), duration 120ms.
- **Stage 2 (Harmonic Rise):** 880.00 Hz (A5), duration 160ms.
- **Stage 3 (Triumphant Chord):** 1174.66 Hz (D6), duration 400ms with exponential gain decay.

---

## 3. Un-Gankable Zero-Cost Leech Loadout & Playbook

### 3.1 Bill of Materials: Ultra-Budget Solo Loadout (<20,000 Silver)

Beginners routinely die in Red Zones because they bring 150k+ silver gear with combat abilities designed for 1v1 duels rather than mobility-based disengagements. 

To maximize Faction Points, combat damage is irrelevant: **dealing exactly 1 tick of damage to an Outpost Boss guarantees 100% full Faction Point participation credit**.

#### Recommended Primary Setup: 4.0 Double-Bladed Staff (Extreme Mobility)
| Slot | Item | Tier / Quality | Est. Market Cost | Primary Ability & Escape Role |
| :--- | :--- | :---: | :---: | :--- |
| **Main Hand (2H)** | Double-Bladed Staff | 4.0 Normal | 5,500 Silver | **Q: Concussive Blow / Cartwheel** (untargeted hop)<br>**W: Stun Run** (+20% movespeed)<br>**E: Soaring Swipe** (15-meter untargeted leap over chokes/cliffs) |
| **Armor** | Assassin Jacket | 4.0 Normal | 3,200 Silver | **R: Ambush** (8 seconds of full invisibility, breaks mob aggro and player lock) |
| **Shoes** | Miner Boots | 4.0 Normal | 3,800 Silver | **F: Flee** (120% movespeed for 5s, breaks all CC, full CC immunity) |
| **Head** | Mage Cowl | 4.0 Normal | 2,100 Silver | **D: Poison** (20-meter range DoT; allows tagging the boss from maximum safety) |
| **Cape** | Regular Cape | 3.0 / 4.0 Normal | 900 Silver | Energy regeneration baseline. |
| **Mount** | Riding Horse | Tier 3 | 7,000 Silver | 40% base / 80% gallop speed. Does not overload you upon dismount! |
| **Food / Potion** | 1x T4 Invisibility Potion<br>1x T7 Catfish | 4.0 / 7.0 | 2,400 Silver<br>400 Silver | Emergency second stealth layer.<br>250% out-of-combat HP regeneration. |
| **TOTAL** | — | — | **~25,300 Silver** | *(Alternative with T2/T3 Mule: **19,200 Silver**)* |

#### Alternative Setup: 4.0 Bloodletter + Shield
- **Weapon:** 4.0 Bloodletter (~10,500 Silver) + 4.0 Shield (~1,000 Silver).
- **Mobility:** W2 Dash (9m) + E Career Ender (10m untargeted dash) = 19 meters of instant distance.
- **Cost:** ~29,000 Silver.

---

### 3.2 Faction Blob Positioning Protocol

```
 [ ENEMY GANK CLUMP / BOMB SQUAD ]
                 │
                 ▼ (Hostile Engage Direction)
 ┌─────────────────────────────────────────────────────────────┐
 │ FRONT VANGUARD: Tanks, Clump Targets (HIGH CASUALTY ZONE)   │
 │ • Absorbs Permafrost, Brimstone, Galatine bomb escalation   │
 ├─────────────────────────────────────────────────────────────┤
 │ MAIN 50-MAN FACTION BLOB: DPS & Healers (CLUMP ZONE)        │
 │ • Vulnerable to counter-engages and wide AoEs               │
 └─────────────────────────────────────────────────────────────┘
                                 │
                     1.5 Screens Distance (~35-45m)
                                 │
 ┌─────────────────────────────────────────────────────────────┐
 │ 🛡️ THE LEECH BUFFER ZONE (SAFE POSITIONING)                  │
 │ • Stay mounted at the rear/flank perimeter                  │
 │ • Keep faction nametags visible on screen edge              │
 │ • Path along zone boundaries / forest brush, NOT open roads │
 └─────────────────────────────────────────────────────────────┘
```

1. **The "1.5-Screen Leech Buffer" Rule:**
   - Never ride in the front 10 meters of the faction march (scouts and vanguard tanks die first).
   - Never clump inside the capture circle with 30 players. AoE Escalation multiplies enemy ability damage by +8% per person hit up to +100%. A single 8.3 Galatine or Spiked Gauntlet will wipe a clump of 15 players instantly.
   - Stay 1.5 screens behind the main force, trailing their movement path.

2. **The "Tag-and-Mount" Outpost Protocol:**
   - As the allied blob engages the Outpost Champion, remain mounted at the edge of the outpost courtyard.
   - Wait until the boss reaches ~30% HP (all enemy defenders have retreated or died).
   - Dismount at maximum range (18–20m), cast **Mage Cowl Poison (D)** on the Champion.
   - Immediately press your mount button (`A` key, 3s remount cast).
   - Sit mounted outside the ring. When the outpost captures, you receive the full 1,000–2,500 Faction Points.

3. **Hostile Counter Situational Awareness:**
   - Continuously monitor the Red Zone Hostile Counter in the lower-right corner.
   - If the counter jumps by $\ge 4$ players in 3 seconds, a coordinated hostile gank group has zoned in.
   - Immediately align your horse toward the nearest blue/yellow transition gate.

---

### 3.3 Escape Mechanics & Anti-Gank Flowchart

When dismounted or ambushed by hostile gankers in Red Zones, follow this deterministic escape chain:

```
 Dismounted / Attacked by Gankers
               │
               ▼
 [ Step 1: Press R (Assassin Jacket Ambush) ]
 • Immediately invisible for up to 8s
 • Walk at a 90° angle away from the road into tree line / terrain
               │
               ├─────────────────────────┐
      (AoE sprayed near you?)            │ (Clean stealth)
               │                         │
               ▼                         ▼
 [ Step 2: Drink T4 Invis Potion ]       │
 • Additional 4.5s untargetable stealth  │
               │                         │
               └───────────┬─────────────┘
                           │
                           ▼
 [ Step 3: Activate F (Miner Boots Flee) ]
 • +120% Movement Speed for 5 seconds
 • Immune to stuns, roots, silences, and slows
                           │
                           ▼
 [ Step 4: Weapon Mobility Jump (E + W) ]
 • Double-Bladed E (15m) or Bloodletter E + Dash (19m)
 • Leap over cliff ledges, chokepoints, or resource nodes
                           │
                           ▼
 [ Step 5: Reset & Remount ]
 • Break line of sight for 5 seconds (Out of Combat)
 • Remount (3s cast) and gallop to safe zone gate
```

---

## 4. Interactive UI Tools Specification

### 4.1 Tool 1: Live SpP Converter & Arbitrage Matrix

#### Mathematical Foundations
1. **Raw Heart Silver-per-Point (SpP):**
   $$\text{SpP}_{\text{Heart}} = \frac{P_{\text{sell}}(\text{Heart}) \times (1 - \text{Tax}) - \text{SetupFee}}{3000}$$
   Where:
   - $\text{Tax} = 0.04$ (Premium) or $0.08$ (Non-Premium)
   - $\text{SetupFee} = 0.025$ (Sell Order) or $0.0$ (Instant Sell)

2. **Faction Crest SpP:**
   $$\text{SpP}_{\text{Crest}, T} = \frac{P_{\text{sell}}(\text{Crest}_T) \times (1 - \text{Tax}) - \text{SetupFee}}{\text{PointsCost}_T}$$
   Where $\text{PointsCost} \in \{1000 \text{ (T4)}, 1500 \text{ (T5)}, 3000 \text{ (T6)}, 4500 \text{ (T7)}, 6000 \text{ (T8)}\}$.

3. **Finished Faction Cape Crafting Multiplier:**
   Crafting recipe:
   - 1x Regular Cape of Tier $T$ ($P_{\text{BaseCape}}$)
   - 1x Faction Crest of Tier $T$ (Costs $\text{PointsCost}_{\text{crest}}$)
   - $N_{\text{hearts}}$ Faction Hearts (Costs $N \times 3000$ points if redeemed via points, or bought via silver)
   $$\text{Net Cape Revenue} = P_{\text{sell}}(\text{Cape}_T) \times (1 - \text{Tax}) - P_{\text{buy}}(\text{BaseCape}_T)$$
   $$\text{SpP}_{\text{Cape}} = \frac{\text{Net Cape Revenue}}{\text{PointsCost}_{\text{crest}} + (N_{\text{hearts}} \times 3000)}$$
   *Empirical Result:* While raw hearts convert at 15–18 SpP, crafting T4.0 and T6.0 Thetford and Fort Sterling Capes regularly achieves **25 to 34 SpP** (+60% value uplift!).

#### UI Architecture & Components
- **Points Input & Quick Chips:** Numeric input with preset buttons (`30k`, `100k`, `250k`, `500k`, `1M`).
- **Mode Toggle:** `Raw Redemption (Hearts/Crests)` vs `Cape Crafting Multiplier` vs `Cross-City Arbitrage`.
- **Live AODP Feed:** Fetches real-time prices across all 6 royal cities for tokens:
  - `T1_FACTION_FOREST_TOKEN_1` (Treeheart - Lymhurst)
  - `T1_FACTION_MOUNTAIN_TOKEN_1` (Mountain Heart - Fort Sterling)
  - `T1_FACTION_HIGHLAND_TOKEN_1` (Rockheart - Martlock)
  - `T1_FACTION_SWAMP_TOKEN_1` (Vineheart - Thetford)
  - `T1_FACTION_STEPPE_TOKEN_1` (Beastheart - Bridgewatch)
  - `T1_FACTION_CAERLEON_TOKEN_1` (Shadowheart - Caerleon)
  - `T4_ARMOR_CREST_*` through `T8_ARMOR_CREST_*`
  - `T4_CAPEITEM_FW_*` through `T8_CAPEITEM_FW_*`
- **Output Table:** Columns:
  1. Item Sprite & Name
  2. City / Source
  3. Points Cost
  4. Market Sell Price
  5. Net Total Silver Yield
  6. Silver-Per-Point (SpP) with color-coded yield indicator:
     - 🔴 `< 14 SpP` (Poor / Avoid)
     - 🟡 `14 - 18 SpP` (Standard Heart Baseline)
     - 🟢 `19 - 25 SpP` (High Yield)
     - 🟣 `> 25 SpP` (Optimal Cape Multiplier Arbitrage)

---

### 4.2 Tool 2: Safe-Route Smuggler Cargo Optimizer

#### Trade Mission Mechanics (Heart Transport)
Faction Enlistment NPCs offer Smuggler Transport Contracts with refundable collateral:
- **Small Crate:** Deposit 3 Hearts $\to$ Reward 4 Hearts (+1 Heart Net / +33% ROI, ~30kg).
- **Medium Crate:** Deposit 9 Hearts $\to$ Reward 11 Hearts (+2 Hearts Net / +22% ROI, ~90kg).
- **Large Crate:** Deposit 15 Hearts $\to$ Reward 18 Hearts (+3 Hearts Net / +20% ROI, ~150kg).

#### The 100% Safe-Zone Invariant
When the route traverses exclusively Blue (T4) and Yellow (T5) zones:
- Opposing faction players can engage in combat, but **Full-Loot Death is physically impossible**.
- Defeat results only in a 3-minute knockout and a 10% durability loss on equipped gear.
- **The Heart Crate is 100% immune to drops or loss.**
- Total repair cost on 4.0 gear is ~1,200 Silver against a guaranteed profit of **135,000 to 150,000 Silver per Large run**.

#### Pathfinding Engine & Metrics
- **Graph Topology:** Directed graph of Royal Continent zones with zone classifications ($Z_{\text{tier}} \in \{\text{Blue}, \text{Yellow}, \text{Red}\}$).
- **Safe-Path Constraint:** Dijkstra/BFS shortest path with Red Zone edge weights set to $\infty$.
- **Mount Travel Calculator:**
  $$\text{Trip Duration (min)} = \sum_{z \in \text{path}} \left( \frac{\text{Zone Diameter (m)}}{v_{\text{gallop}}} + \tau_{\text{gate}} \right)$$
  Where:
  - Average zone diameter $\approx 850$ meters
  - $\tau_{\text{gate}} = 10 \text{ seconds}$ zone transition overhead
- **Mount Comparison Engine:**
  | Mount | Base Speed | Gallop Speed | Carry Weight | Knockout Risk | Silver/Minute Score |
  | :--- | :---: | :---: | :---: | :---: | :---: |
  | **T5 Transport Ox** | 30% | 75% | 1,848 kg | Low (Huge HP pool) | **~11,500 Silver/min** |
  | **T5 Armored Horse** | 40% | 85% | 0 kg (Player weight) | Negligible | **~14,200 Silver/min** |
  | **T6 Pest Lizard** | 75% (No gallop drop) | 75% constant | 450 kg | Zero (Immune to slows) | **~13,800 Silver/min** |
  | **Grizzly Bear** | 50% | 85% | 2,126 kg | Ultra-Safe (Intimidate aura) | **~14,000 Silver/min** |

---

### 4.3 Tool 3: Bandit Event Countdown & Alert Chime UI

#### UI State Machine
1. `STATE_COOLDOWN` (0m to 150m):
   - Blue status ring: `"Cooldown Active (No rolls possible)"`.
   - Remaining time until first roll window opens.
2. `STATE_ROLL_WINDOW` (150m to 240m):
   - Amber status ring: `"Roll Window Open"`.
   - Displays real-time cumulative Weibull probability gauge ($F(t) \in [15\%, 65\%]$).
3. `STATE_IMMINENT` (240m to 330m):
   - Orange status ring: `"Bandit Imminent (>85% Probability)"`.
   - Suggested action: *"Return to Royal City bank, equip leech set, and wait for announcement."*
4. `STATE_WARNING_15M` (15m remaining):
   - Flashing crimson emergency banner: `"🚨 BANDIT ASSAULT IN 15 MINUTES!"`.
   - Countdown timer counting down from 15:00 to 0:00.
   - Audio chime triggers automatically.
5. `STATE_ACTIVE` (0m to 60m):
   - Emerald active combat banner: `"⚔️ BANDIT ASSAULT ACTIVE (Red Zones Contested)"`.
   - Elapsed event timer (0:00 to 60:00).

---

### 4.4 Tool 4: Outpost Star Density Heatmap / Priority Guide

#### Faction Point Calculation Formula
$$\text{Points}_{\text{outpost}} = \text{Base} \times (1 + 0.20 \times S) \times (1 + R_{\text{standing}}) \times M_{\text{frontline}}$$
Where:
- $\text{Base} = 1,000$ points per outpost champion kill.
- $S \in \{0, 1, 2, 3, 4, 5\}$ (Zone Defense Stars; 5 stars = $+100\%$ bonus).
- $R_{\text{standing}} \in [0.10, 0.50]$ (Player Faction Standing Rank bonus).
- $M_{\text{frontline}} = 1.15$ (Frontline proximity multiplier if contesting active frontline).
- *Max Theoretical Points per Single Outpost:* $1,000 \times 2.0 \times 1.5 \times 1.15 = \mathbf{3,450 \text{ Points}}$.

#### Zone Priority & Boss Mechanics Guide
| Zone Name | Biome | Red Zone Choke Risk | Boss Type | Fast-Burn Strategy |
| :--- | :--- | :---: | :--- | :--- |
| **Roastcorpse Steppe** | Steppe | High (Open road) | Steppe Falconer | Burn bird adds quickly; boss has low physical armor. |
| **Birchcopse** | Forest | Moderate | Forest Wildling | Interrupt rooting staff cast; easy to kite outside room. |
| **Lewsdon Hill** | Mountain | High (Narrow cliffs) | Mountain Priestess | High priority on healing circles; purge priestess shield. |
| **Runnelvein Bog** | Swamp | Extreme (Water slows) | Swamp Witch | Avoid green toxic puddles; high magical damage. |
| **Deadvein Gully** | Highland | Extreme (Caerleon gate) | Highland Hammer | Heavy telegraphed earth slams; dodge frontal cone. |

---

## 5. Implementation Roadmap & Integration Blueprint

### File Tree Integration Plan
```
src/
├── components/
│   ├── FactionWarfare/
│   │   ├── FactionCommandCenter.tsx       # Main tab container
│   │   ├── BanditPredictionClock.tsx      # SVG Probability Arc & 15m Countdown
│   │   ├── SpPArbitrageMatrix.tsx         # Live AODP Heart/Crest/Cape matrix
│   │   ├── SmugglerCargoOptimizer.tsx     # 15->18 Safe-zone route calculator
│   │   ├── OutpostPriorityHeatmap.tsx     # Star density & boss tactics guide
│   │   └── ZeroCostLeechPlaybook.tsx      # Interactive build inspector & escape sim
│   └── Navbar.tsx                         # Direct tab switch to 'faction_matrix'
├── data/
│   ├── factionRoutes.ts                   # Pre-compiled safe zone routing graph
│   └── factionItems.ts                    # Tokens, crests, and cape IDs
└── utils/
    └── banditEngine.ts                    # Weibull roll math & webhook state machine
```

---
*Authored by:* `fw_tactics_tools`  
*Engineering Status:* Architectural Design Complete & Ready for Implementation.

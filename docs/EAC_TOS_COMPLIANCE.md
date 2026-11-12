# Albion Online & Easy Anti-Cheat (EAC) Compliance Whitepaper

This document provides a technical and legal analysis of how **Albion Wizard** strictly adheres to Sandbox Interactive GmbH's Terms of Service (ToS) and the Easy Anti-Cheat (EAC) integrity system.

---

## 📜 1. Sandbox Interactive Terms of Service (Section 13) Review

Under Sandbox Interactive's official Terms of Service (Section 13: "Prohibited Conduct"), users are prohibited from:
1. *Modifying, intercepting, or hacking the game client or server communication.*
2. *Using unauthorized bots, macros, or automated software that interacts with the game client to execute gameplay actions.*
3. *Accessing or reading volatile system memory (RAM) allocated to `Albion-Online.exe`.*

---

## 🛡️ 2. Architectural Compliance Invariants

| Compliance Requirement | In-Game Risk | Albion Wizard Implementation | Status |
| :--- | :--- | :--- | :--- |
| **No Memory Injection** | High (Bannable) | Executes 100% in a standard web browser (Chrome, Firefox, Safari). Zero system privileges, zero memory hooking, zero DLL injection. | **100% Safe (Compliant)** |
| **No Input Automation** | High (Bannable) | Contains no macros, auto-clickers, or automated inputs. All in-game purchases, crafting, and transport maneuvers are made manually by the human player. | **100% Safe (Compliant)** |
| **No Packet Sniffing by Web App** | Neutral | Albion Wizard does not sniff packets. It queries the public, open-source **Albion Online Data Project (AODP)** REST API over standard HTTPS. | **100% Safe (Compliant)** |
| **No Combat Radar / Zoom Hacks** | Extreme (Instant Ban) | Albion Wizard contains zero combat radar features. It does not track player coordinates, health bars, stealth states, or dungeon instances. | **100% Safe (Compliant)** |
| **1 Click = 1 Action Rule** | High (Bannable) | Clicking an item in Albion Wizard simply copies the English item identifier to the OS clipboard for manual pasting into the market search box. | **100% Safe (Compliant)** |

---

## 🌐 3. The Albion Online Data Project (AODP) Relationship

Albion Wizard's pricing feeds originate from the **Albion Online Data Project (AODP)**:
- AODP is a community-driven, open-source distributed database maintained since 2017.
- AODP collects market board prices when volunteer players open market windows with the standalone Albion Data Client running.
- Sandbox Interactive has historically permitted passive network data aggregation (similar to World of Warcraft's Auction House API and EVE Online's market endpoints) provided that client memory is untouched and automated gameplay is prohibited.

---

## ✅ Summary Conclusion

Albion Wizard is fundamentally an **out-of-game economic calculation engine and decision-support terminal**. Using Albion Wizard is equivalent to using a specialized spreadsheet, an in-game market notebook, or an online crafting calculator. It introduces zero risk to player accounts under Easy Anti-Cheat and Sandbox Interactive policies.

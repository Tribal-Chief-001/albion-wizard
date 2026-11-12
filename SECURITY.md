# Security & Anti-Cheat Policy

## Supported Versions

Only the latest release running on the `main` branch is actively supported with security patches and API updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🔒 Easy Anti-Cheat (EAC) & Sandbox Interactive (SBI) Compliance Invariants

**Albion Wizard is strictly non-intrusive, out-of-process, and 100% compliant with the official Albion Online Terms of Service (Section 13) and Easy Anti-Cheat (EAC) boundaries.**

### 1. Zero Process Memory Interaction (100% Out-of-Process)
- Albion Wizard is a client-side single-page web application executing entirely inside your web browser.
- It **never** interacts with `Albion-Online.exe`, reads process memory, hooks DLLs, injects code, or touches operating system virtual memory allocations.
- It does not intercept game sockets or decrypt live network packets.

### 2. Strict "1 Click = 1 Action" Policy (Zero Automation / Zero Macros)
- Albion Wizard contains **no bots, auto-clickers, hotkey macros, or automated trading agents**.
- All market transactions (buying items, crafting, rerolling qualities, transporting cargo) are executed **100% manually by the player** directly within the game client.
- The clipboard utility simply copies localized item names (e.g. `T6_2H_CLAYMORE`) to your operating system clipboard so you can conveniently paste (`Ctrl+V`) into the in-game market search bar.

### 3. Public Crowdsourced Data Only
- Albion Wizard queries crowdsourced market order books from the **Albion Online Data Project (AODP)** REST API (`albion-online-data.com`).
- AODP collects public market data broadcast by players running the open-source Albion Data Client while viewing market boards in game.
- No private game data, account credentials, or real-time player locations are ever processed or accessed.

---

## 🛡️ Reporting a Security Vulnerability

If you discover a security vulnerability, data leakage issue, or potential Terms of Service conflict within Albion Wizard:

1. **Do NOT open a public GitHub Issue.**
2. Send an email with reproduction steps and technical details directly to the repository maintainer:
   - **GitHub Maintainer:** [@Tribal-Chief-001](https://github.com/Tribal-Chief-001)
   - Alternatively, open a private advisory via [GitHub Security Advisories](https://github.com/Tribal-Chief-001/albion-wizard/security/advisories/new).
3. We will acknowledge receipt within 24 hours, review the vulnerability, and coordinate a patch release.

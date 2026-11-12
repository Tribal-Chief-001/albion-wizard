# Contributing to Albion Wizard

Thank you for your interest in contributing to **Albion Wizard**! 🧙‍♂️

Albion Wizard is a community-driven, open-source economic intelligence terminal built for *Albion Online*. We welcome contributions ranging from UI improvements and data caching optimizations to novel economic arbitrage algorithms.

---

## 📜 Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Absolute Safety & Anti-Cheat Invariants](#absolute-safety--anti-cheat-invariants)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Git Commit Protocol (Rich Project Ledgers)](#git-commit-protocol-rich-project-ledgers)
6. [Pull Request Process](#pull-request-process)
7. [Coding Guidelines](#coding-guidelines)

---

## 🤝 Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat fellow contributors with respect and professionalism.

---

## 🔒 Absolute Safety & Anti-Cheat Invariants
Before submitting any code, be aware that Albion Wizard has a **zero-tolerance policy** for Terms of Service violations:
- **NO Memory Hooking or DLL Injection**: PRs introducing native binaries, memory readers, or process hooks will be immediately rejected and reported.
- **NO Automation or Macros**: Features providing automated in-game input (auto-buyers, auto-crafters, botting scripts) are strictly prohibited.
- **100% Out-of-Process Web Architecture**: All code must execute strictly within modern web browsers querying public APIs (such as AODP).

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [npm](https://www.npmjs.com/) (v10 or higher)
- [Git](https://git-scm.com/)

### Local Setup
```bash
# 1. Fork the repo and clone your fork
git clone https://github.com/<your-username>/albion-wizard.git
cd albion-wizard

# 2. Install dependencies
npm install

# 3. Start local development server with Hot Module Replacement (HMR)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Development Workflow

Always branch from `main`:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

### Verification Scripts
Before committing, ensure your code compiles without TypeScript errors:
```bash
# Check TypeScript compilation without emitting files
npm run typecheck

# Verify production Vite build
npm run build
```

---

## 📝 Git Commit Protocol (Rich Project Ledgers)

We maintain an authoritative, permanent engineering ledger across all commits. **Never submit generic one-liner commits** like `fix bugs` or `update code`.

Every commit must follow this rich structure:

```
<type>(<scope>): <concise subject line>

Why / Context:
<Intuitive explanation of the problem, motivation, or root cause.>

Detailed Inventory:
- <Module/File 1>: Specific architectural or algorithmic change.
- <Module/File 2>: Specific UI/UX or data contract update.

Verification / Impact:
- Compilation: Passed `npm run build` and `npm run typecheck`.
- Edge Cases: Explicit test cases or edge cases handled.
- Live Deployment: Effect on Cloudflare Workers / Vercel bundles.
```

### Allowed Types:
- `feat`: New feature or user-facing economic calculator.
- `fix`: Bug fix in pricing calculations, UI rendering, or API fetching.
- `docs`: Documentation updates (README, guides, ledgers).
- `style`: Formatting, whitespace, UI styling tweaks without logic changes.
- `refactor`: Code reorganization without changing external behavior.
- `perf`: Performance optimizations (e.g. data caching, debounce, DOM virtualization).
- `ci`: CI/CD workflows, GitHub Actions, Wrangler configurations.

---

## 📬 Pull Request Process

1. **Keep PRs focused**: Each PR should solve one specific problem or add one coherent feature.
2. **Update Documentation**: If you modify formulas, API contracts, or add components, update `docs/` and `README.md` accordingly.
3. **Verify CI**: Ensure GitHub Actions pass all lint, typecheck, and build steps.
4. **Fill the PR Template**: Provide clear context, screenshots for UI changes, and mathematical verification for economic algorithms.

---

## 💻 Coding Guidelines

- **React 19 & TypeScript**: Strict types only. Avoid `any` types; define explicit interfaces in `src/types/`.
- **Styling**: Use utility classes via Tailwind CSS. Ensure all components render seamlessly in Dark Mode.
- **Data Safety**: Always sanitize and validate incoming AODP data (check for `null`, `undefined`, negative prices, and timezone offsets in timestamps).
- **Audio & Performance**: Debounce expensive computations and ensure audio synthesis (Web Audio API) cleans up oscillator nodes properly.

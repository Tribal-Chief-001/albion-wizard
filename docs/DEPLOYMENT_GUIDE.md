# Deployment Guide: Albion Wizard

Albion Wizard is architected as an ultra-lightweight, high-performance static Single Page Application (SPA). It can be deployed worldwide on modern edge networks with **zero server costs, unlimited bandwidth, and instant global CDN replication**.

---

## 🌐 Live Production Target
- **Primary Cloudflare Edge:** [https://albion-wizard.xandred.workers.dev/](https://albion-wizard.xandred.workers.dev/)
- **Repository:** [https://github.com/Tribal-Chief-001/albion-wizard](https://github.com/Tribal-Chief-001/albion-wizard)

---

## ⚡ Deployment Option 1: Cloudflare Workers (Recommended)

Albion Wizard comes pre-configured with `wrangler.jsonc` utilizing Cloudflare's **Workers Static Assets** engine.

### Prerequisites
- Node.js 20+
- A free [Cloudflare Account](https://dash.cloudflare.com/)
- Wrangler CLI (`npm install -g wrangler` or via `npx wrangler`)

### Automated Git Deploy (Zero-Config)
1. In your Cloudflare Dashboard, navigate to **Compute (Workers & Pages)** > **Create Application**.
2. Select **Connect to Git** and choose `Tribal-Chief-001/albion-wizard`.
3. Set your build configuration:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**. Every subsequent push to `main` will automatically build and deploy within 45 seconds.

### Manual CLI Deploy
If you want to deploy directly from your local terminal:
```bash
# 1. Build the production bundle
npm run build

# 2. Authenticate with Cloudflare
npx wrangler login

# 3. Deploy assets to Cloudflare edge
npx wrangler deploy
```

---

## 🔼 Deployment Option 2: Cloudflare Pages

If you prefer Cloudflare Pages over Workers:
1. In Cloudflare Dashboard, go to **Workers & Pages** > **Pages** > **Connect to Git**.
2. Select `albion-wizard`.
3. Set Build Settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Set Single Page Application (SPA) routing: Pages automatically routes non-asset routes to `index.html`.

---

## ▲ Deployment Option 3: Vercel (Drop-in Support)

Albion Wizard is 100% compatible with Vercel without requiring any additional configuration files.

1. Navigate to [Vercel New Project](https://vercel.com/new).
2. Import `Tribal-Chief-001/albion-wizard`.
3. Vercel automatically detects Vite:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.

---

## 🔒 Custom Domain & Edge SSL Setup

To attach a custom domain (e.g. `albionwizard.com` or `albion.yourdomain.com`):
1. In Cloudflare Dashboard, navigate to your Worker or Pages project.
2. Select **Custom Domains** > **Add Custom Domain**.
3. Enter your domain or subdomain.
4. Cloudflare automatically provisions an SSL/TLS edge certificate (Universal SSL) with automatic HTTP/3 and Brotli compression.

---

## 🧪 Local Production Preview

To test the exact production bundle locally before deploying:
```bash
# Compile production bundle
npm run build

# Start Vite production preview server
npm run preview
```
Visit the local preview URL (typically `http://localhost:4173/`).

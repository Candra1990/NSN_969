# 🌌 NSN969 Multi-View Hub

[![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.14-06B6D4?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.14.0-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

An ultra-premium, high-performance **Multi-View Streaming Platform and Community Command Hub** custom-engineered for the **NSN969 Family**. Designed to unify live streamer channels, sync real-time broadcast statuses, play interactive ambient audio backsound tracks, and coordinate multi-screen setups cleanly in one centralized, cinematic dashboard.

---

## 📸 Key Features

*   **🎬 Dynamic Multi-View Grid Engine**  
    Add, host, and arrange up to 6 live streams concurrently. Drag, delete, expand, or adjust volume layouts on the fly with custom aspect ratios suited for both PC and responsive mobile viewpoints.
*   **🎙️ Smart Real-Time Live Status Indicators**  
    Synchronizes natively with the YouTube Live API & RSS streams to instantly flag when members are broadcasting live, pushing them to the front with bright active pulses.
*   **🪐 Elite Cinematic Glassmorphism UI**  
    A dark theme built with tailored gradients, micro-animations, responsive 3D perspective gallery sliders, and rich gold-accents mirroring luxury entertainment platforms.
*   **📡 Secure Full-Stack Architecture**  
    Utilizes a robust Express production server to proxy API routes securely, shielding sensitive Firebase credential layers while packing high-speed Static Assets caching.
*   **🎼 Ambient Backsound Player**  
    Interactive playlist with localized MP3 directories, seamless controls, volume persistence, and live admin uploads so background music sets the perfect cinematic vibe.
*   **🌐 Localized Multi-Lang Capability**  
    Instantly switch between full high-fidelity English and Indonesian localizations built into memory layouts.

---

## 🏗️ System Architecture & Directories

```ebnf
├── .env.example              # Template for server-side private environment credentials
├── package.json              # Full project dependency manifest & pipeline scripts
├── server.ts                 # Full-stack production-ready Express + Vite SSR custom proxy
├── index.html                # High-fidelity single page application entry point
├── src/
│   ├── main.tsx              # React mounting root initialized with strict safe trees
│   ├── App.tsx               # Primary router & view controller (Home / Multiview / Admin)
│   ├── types.ts              # Globally unified TypeScript models (Streamer, Backsound, Track)
│   ├── components/           # Extracted modular React view blocks
│   │   ├── HomeDashboard.tsx      # Main cinematic landing page & gang list board
│   │   ├── Multiview.tsx          # Advanced interactive multi-grid streaming player
│   │   ├── Navbar.tsx             # Floating glassmorphic header with navigation
│   │   ├── AudioPlayer.tsx        # Persistent backsound core with volume slider
│   │   ├── GalleryCarousel.tsx    # 3D interactive sliding snapshot carousel
│   │   └── MemberIllustration.tsx # Procedural mathematical fallback SVG avatar generator
│   └── lib/
│       └── firebase.ts            # Enterprise Firestore Client & Secure OAuth wrapper
└── public/
    ├── gallery/              # HD community screenshots & highlight slider image assets
    ├── images/               # Branded application assets (logo, cinematic background)
    ├── member/               # High-definition family member profile photographs
    └── music/                # Direct high-fidelity sound MP3 layers
```

---

## 🚀 Execution & Deployment Manual

### 1. Prerequisites
Ensure you have **Node.js 18+** and **npm** installed on your hosting system.

### 2. Sandbox Setup and Decoupled Server Launch
Clone your code, open the root workspace folder, and run:
```bash
# Install precise runtime and compiler components
npm install

# Run the full-stack development proxy server
npm run dev
```
The developer server binds to host `0.0.0.0` and port `3000` automatically. Open `http://localhost:3000` to preview in real-time.

### 3. Build & Compile for Stable Deployments
For production containers (e.g., Cloud Run, Vercel, VPS), compile high-speed optimized bundles with:
```bash
npm run build
```
This triggers **Vite compilation** to yield optimized static static assets in `dist/`, then triggers a native CJS bundle compiler for `server.ts` via **esbuild** into `dist/server.cjs` mapping all external modules cleanly.

### 4. Direct Production Run
Boot the compiled stack natively via:
```bash
npm run start
```

---

## 🎨 Asset Integration Guild Lines

To keep files fully connected to the interface on production platforms (like **Vercel** or **GitHub**), make sure all assets uploaded inside AI Studio are properly committed into your master git branch.

1.  **Gang Photos Directory (`/public/member/`)**  
    All filenames must be lowercase matching their streamer names. Our custom-designed `.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')` normalizer maps streamer titles to physical pictures automatically.
2.  **Gallery Slider (`/public/gallery/`)**  
    Place your active community memories directly in the folder as `gallery_1.jpg`, `gallery_2.jpg` up to `gallery_5.jpg` to feed the 3D slider natively.
3.  **Core Icons/Logos (`/public/images/`)**  
    Place `NSN969_LOGO.png` and `gta_beach_crew_1781157104663.png` inside to populate site-wide branding immediately on live builds.

---

## 🛡️ License

Built with extreme craftsmanship by the Google AI Studio Coding Agent. Under the MIT License. All rights to brand graphics belong strictly to the **NSN969 Community**.

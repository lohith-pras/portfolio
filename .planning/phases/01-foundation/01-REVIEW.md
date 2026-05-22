---
status: "issues_found"
files_reviewed: 3
critical: 1
warning: 2
info: 1
total: 4
---
# Code Review Report

## Summary
The foundation configuration files are well-structured and utilize modern tooling (Next.js 15, React 19). However, a critical issue was found regarding GSAP premium plugins that will break the build if not correctly sourced. Additionally, there are warnings related to missing TypeScript definitions for `three` and potential bundle bloat from relying on multiple heavy animation libraries.

## Findings

### [CR-01] Missing GSAP Premium Plugins
**File**: `package.json` & `src/lib/gsap.ts`
**Description**: The file `src/lib/gsap.ts` imports `DrawSVGPlugin` and `ScrambleTextPlugin`, which are GSAP Club (premium) plugins. However, `package.json` only installs the standard public `gsap` package, which does not contain these files. Attempting to build or run the project will result in a "Module not found" error.
**Recommendation**: If you have a GSAP Club license, install the premium package using `@gsap/business` (or similar) via an `.npmrc` registry configuration, or use a local tarball (e.g., `"gsap": "file:gsap-bonus.tgz"`). If you do not have a license, remove these plugin imports and their usage from the application.

### [WR-01] Multiple Animation Libraries Installed
**File**: `package.json`
**Description**: The project includes `gsap`, `framer-motion`, and `@react-spring/three`. Loading multiple comprehensive animation ecosystems will significantly increase the JavaScript bundle size and can lead to performance degradation.
**Recommendation**: Consolidate your animations around a single library (e.g., standardizing entirely on `gsap` or `framer-motion`). If `@react-spring/three` is strictly necessary for physics-based 3D animations, consider whether standard GSAP tickers can handle those cases instead.

### [WR-02] Missing TypeScript Definitions for Three.js
**File**: `package.json`
**Description**: The project installs `three` and uses TypeScript, but `@types/three` is missing from `devDependencies`. This will cause TypeScript compilation errors when importing from the `three` module directly.
**Recommendation**: Install the required type definitions by running `npm i -D @types/three`.

### [IN-01] Safe SSR GSAP Registration
**File**: `src/lib/gsap.ts`
**Description**: Although the file is marked with `'use client'`, Next.js will still evaluate the module on the server during Server-Side Rendering (SSR). Calling `gsap.registerPlugin()` at the top level is mostly safe in GSAP 3, but evaluating premium or complex plugins can occasionally access browser APIs and trigger "window is not defined" errors during the SSR pass.
**Recommendation**: Wrap the plugin registration in a client-side environment check to guarantee it is SSR-safe:
`if (typeof window !== 'undefined') { gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, ScrambleTextPlugin); }`

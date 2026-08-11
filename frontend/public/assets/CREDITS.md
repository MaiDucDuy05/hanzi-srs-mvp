# Asset Library — CREDITS & Governance

All SVG assets in `frontend/public/assets/` and `frontend/src/assets/svg/` are governed by this file. **Every imported (non-original) asset must be registered here before commit.**

## Licensing status

| Status | Meaning |
|---|---|
| **Original** | Hand-authored in-house in the "Cute Panda Forest" style. No attribution needed. |
| **Sourced** | Downloaded from Freepik / SVGRepo / Icons8 / Storyset / Figma / other. MUST have a row below. |

## Visual language

Flat 2D, rounded, pastel forest-green + lime, big-eyed panda mascot. Light-only (no dark theme — decided 2026-08-07).
Color source of truth: `frontend/src/app/globals.css` (`:root` + `@theme inline`).
Full spec: `docs/design-system/asset-library.md`.

## Sourced assets registry

| Path | Source | License | Author | Link |
|---|---|---|---|---|
| _(none yet — all assets are original)_ | | | | |

## Do / Don't

- ✅ kebab-case filenames, `{category}-{asset}-{variant}` naming.
- ✅ Palette tokens only; icons use `fill="currentColor"`.
- ✅ SVGO-optimized (keep `viewBox`).
- ❌ No pure-black outlines, no neon, no gradients-as-shading.
- ❌ Never hotlink remote SVGs — always download and commit the file.

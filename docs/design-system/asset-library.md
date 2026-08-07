# Cute Panda Forest — SVG Asset Library Structure

**Version** | **Date** | **Status** | **Owner**
---|---|---|---
1.0 | 2026-08-08 | Approved for cataloging | Design System

Reference aesthetics: **Duolingo Kids**, **Khan Academy Kids**, **Lingokids**, modern educational mobile games.

---

## 1. Visual Language — "Cute Panda Forest"

One cohesive style for **every** asset. If a new asset doesn't follow the checklist below, it doesn't ship.

### 1.1 Style Pillars

| # | Rule | Detail |
|---|------|--------|
| 1 | **Flat vector** | No photorealism, no gradients-as-shading. Flat shapes + up to **2 tint layers** per object. |
| 2 | **Rounded everything** | `border-radius`-like rounding on all corners. No sharp points, no acute angles on friendly characters. |
| 3 | **Soft outlines** | Optional **2–3px** outline in a darker tint of the fill color (never pure black) on illustrations; **no outline** on icons (filled/outline cut) unless stated. |
| 4 | **Big eyes, chunky body** | Characters: oversized expressive eyes, round heads (~head = 40–50% of body height), stubby limbs. |
| 5 | **Pastel + forest palette** | See tokens §1.2. High lightness, low saturation. One saturated "pop" accent per scene. |
| 6 | **Blob shadows** | Ground shadows are soft ellipse blobs or rounded drop shapes, ~10–15% opacity darker fill. |
| 7 | **Smiling inanimate objects** | Books, teacups, dumplings may carry tiny happy faces — the brand's signature charm. |
| 8 | **No text baked in** | Localize by layering HTML text over speech bubbles / banners / cards. Exceptions: tiny decorative motifs (e.g. a "福" on a lantern) — keep as commented `<text>` so it can be swapped. |

### 1.2 Color Tokens — LIVE (source of truth: `frontend/src/app/globals.css`)

> **2026-08-08: Re-synced to the implemented app.** These hex values ARE the project tokens (`:root` + `@theme` in `globals.css`). Any new asset MUST use these exact values. Older draft tokens (soft-blues, pastels) were retired — the app is **forest-green + pastel-lime, light-only, no dark mode** (decided 2026-08-07).

```css
/* Primary greens */
--brand / --color-forest:  #5e7f26;   /* primary, headings, links */
--brand-dark:              #4a6520;   /* hover-dark, pressed */
--color-olive:             #6e8b2d;   /* hover/icon variant */
--color-bamboo:            #78993a;   /* borders, dividers, leaf fill */

/* Secondary pastel backgrounds */
--color-light-bamboo:      #dde8a6;   /* section bg, stone fill */
--color-soft-lime:         #eaf3c5;   /* card/highlight, cloud bg */
--color-pale-green:        #f3f8d7;   /* panels, blob fill, flower center */
--color-mint-cream:        #fafcec;   /* page background */
--background:              #fafcec;
--foreground:              #4a5a3a;   /* body text (soft dark green) */

/* Accent CTA */
--color-accent-lime:       #c7cf35;   /* primary CTA pill, flower petals */
--color-accent-olive:      #b8c533;   /* CTA hover, flower center */

/* Neutral */
--color-off-white:         #fbfbf8;   /* footer, secondary bg */
--white:                   #ffffff;   /* cards */

/* Panda mascot */
--panda-ink:               #2e2e2e;   /* ears, eye patches, body — never pure #000 */
--panda-white:             #ffffff;   /* head, belly */
--panda-cheek:             #f8b4c4;   /* blush */

/* Deep-green text on pastel (hero) */
--hero-ink:                #215b3b;   /* hero heading, strong accents */
```

> Extended pastels for food/flowers/animals may be added to the palette ONLY after the same "soft, pastel, forest-adjacent" check — no neon, no saturated primaries. Record additions in `globals.css` + this file together.

### 1.3 SVG Technical Spec

| Property | Illustration / Scene | Icon | UI Component |
|---|---|---|---|
| viewBox | `0 0 512 512` (scenes `1024 640`) | `0 0 24 24` | per component, `0 0 512 512` default |
| color model | hard-coded fills (palette tokens) | `fill="currentColor"` | theme-aware tokens |
| shape | paths + circles, `<g>` per limb | single path, 2px round caps | layered `<g>`, named ids |
| export | optimize with SVGO before commit | same | same |

---

## 2. Storage Layout (repo)

Physical files live in the frontend; the catalog (this file) is the source of truth for names.

```
frontend/
├─ public/assets/                    # Static SVG served by URL (decorative, scenes, patterns)
│  ├─ illustrations/  nature/  backgrounds/  ui/  icons/  game/
├─ src/assets/svg/                   # SVGs imported as React components (interactive: icons, buttons, progress)
│  ├─ icons/   ui/
└─ src/components/assets/            # Thin React wrappers (AssetIcon, AssetIllustration, PandaAvatar…)
```

- **Static → `public/assets`**: backgrounds, decorative layers, full scenes (referenced via `/assets/...`).
- **Component → `src/assets/svg`**: anything that must recolor, animate, or toggle state at runtime (icons via `currentColor`, button skins, progress fill).
- **Naming prefixes in filenames stay identical** whether the file is static or a component — the folder decides the consumption mode, not the name.

---

## 3. Integration with React / Next.js 16

Next.js 16 runs **Turbopack**; import SVGs as React components via `@svgr/webpack`:

```ts
// next.config.ts
const nextConfig = {
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};
export default nextConfig;
```

> Without this rule, `import url from './icon.svg'` returns a URL string (`type: 'asset'`) — fine for static use, not for runtime recoloring.

**Consumption modes:**

| Mode | When | Example |
|---|---|---|
| `<img src="/assets/illustrations/panda/panda-happy.svg">` | Static, no interaction | hero scenes |
| `import PandaIcon from "@/assets/svg/icons/nav-home.svg"` | Recolor / animate / state | nav, buttons, progress |
| CSS `background-image` | Tiled patterns, layered parallax | `forest-layer-*`, `pattern-*` |

**Optimization rules**
- Run SVGO (`preset-default` + `removeViewBox: false`, `cleanupIds: true`) on every committed SVG.
- Every icon: `fill="currentColor"`, no fixed fill, no fixed `width/height` (inherits font-size).
- Add `aria-hidden="true"` + `role="img"`/`aria-label` at the component layer, never inside the raw file.
- Keep `id`s only where `<use>` or gradient references require them.

---

## 4. Asset Type Taxonomy

| Type | Meaning | Used for |
|---|---|---|
| **Illustration (Il)** | Standalone picture that tells something (a scene, a character, an object with personality) | heroes, characters, animals, food, scenes |
| **Icon (I)** | Minimal pictogram, `currentColor`, 24×24, read at 16–32px | navigation, audio, settings, misc |
| **Decorative Element (D)** | Ambient filler — never the message, only the mood | clouds, leaves, blobs, patterns, parallax layers |
| **UI Component (UC)** | Interface chrome with states (default/hover/active/disabled) | buttons, cards, bubbles, banners, progress |

---

## 5. Naming Conventions

### 5.1 Rules

1. **kebab-case** everywhere: `panda-happy.svg`, `btn-primary-hover.svg`.
2. **Pattern:** `{category}-{asset}-{variant/state}.svg` — variant and state are optional.
3. **Icons:** prefix `{group}-` + name: `nav-home`, `audio-volume-mute`. No leading `icon-` (group prefix already says it).
4. **State suffix order:** `-hover`, `-pressed`, `-active`, `-disabled`, `-locked`, `-completed`, `-correct`, `-wrong`.
5. **Scale/format suffixes** only when a variant genuinely differs: `-sm/-md/-lg`, `-color/-mono`, `-filled/-outline`.
6. **Component name:** PascalCase of the filename → `panda-happy.svg` ⇒ `<PandaHappy />` (SVGR default).
7. No version numbers, no dates, no locale codes in filenames. Localization lives in markup, not filenames.
8. Folders are plural nouns: `panda/`, `bamboo/`, `flowers/`, `icons/`.

### 5.2 Quick Reference

| Folder | Pattern | Example |
|---|---|---|
| illustrations/panda | `panda-{emotion|action}` | `panda-cheering.svg` |
| nature/* | `{plant}-{part|variant}` | `leaf-maple.svg`, `tree-sakura.svg` |
| backgrounds | `bg-{screen}-{variant}` or `forest-layer-{depth}` | `bg-game-quiz.svg` |
| ui | `{component}-{variant}-{state}` | `button-primary-hover.svg` |
| icons | `{group}-{noun}` | `nav-settings.svg` |
| game | `{game}-{element}-{state}` | `mem-card-matched.svg`, `quiz-option-correct.svg` |

---

## 6. Category Catalog

Legend: **Il** = Illustration · **I** = Icon · **D** = Decorative Element · **UC** = UI Component

> Keyword strategy: each folder lists ready-to-paste search phrases. See §7 for per-source transformation rules (Freepik, SVGRepo, Icons8, Storyset, Figma Community, Google).

---

### 6.1 📂 `illustrations/`

#### `illustrations/panda/` — the mascot (richest folder)
*Purpose:* brand character in every emotional state + actions used across onboarding, feedback, celebrations.

| Asset file | Type | Notes |
|---|---|---|
| `panda-mascot-full.svg` | Il | canonical full-body, front pose |
| `panda-mascot-head.svg` | Il | head-only, avatar crop |
| `panda-baby.svg` | Il | small variant, "beginner" moments |
| `panda-happy.svg` / `panda-cheering.svg` / `panda-victory.svg` / `panda-dancing.svg` | Il | positive feedback |
| `panda-waving.svg` / `panda-greeting.svg` | Il | onboarding, lesson start |
| `panda-thinking.svg` / `panda-confused.svg` / `panda-surprised.svg` | Il | hint/processing states |
| `panda-studying.svg` / `panda-reading.svg` / `panda-writing.svg` / `panda-listening.svg` / `panda-speaking.svg` | Il | one per skill (skill badges use them) |
| `panda-eating-bamboo.svg` | Il | idle, streak snack moments |
| `panda-sad.svg` / `panda-crying.svg` / `panda-tired.svg` / `panda-sleeping.svg` | Il | wrong answer, low energy |
| `panda-blushing.svg` / `panda-with-balloon.svg` / `panda-playing.svg` | Il | reward, surprise |
| `panda-holding-book.svg` | Il | study context |
| `panda-friend-deer.svg` | Il | companion animal duo |
| `panda-silhouette.svg` | D | watermark, loading placeholder |

**Keywords:** `cute panda flat illustration`, `panda mascot kawaii`, `panda cartoon children education`, `panda emotions set`, `cute panda png flat vector`, `panda waving cartoon`.

#### `illustrations/bamboo/`
*Purpose:* the forest environment's signature plant — motif, props, framing.

| Asset file | Type | Notes |
|---|---|---|
| `bamboo-stalk.svg` / `bamboo-sprout.svg` / `bamboo-shoot.svg` | Il | growth/level metaphors |
| `bamboo-cluster.svg` / `bamboo-grove.svg` | Il / D | scene filler, backdrop |
| `bamboo-leaf.svg` | D | scatter + motif |
| `bamboo-pole.svg` / `bamboo-fence.svg` | D | props, dividers |
| `bamboo-border.svg` / `bamboo-stamp.svg` | D | frame edge, stamp |

**Keywords:** `bamboo flat illustration`, `bamboo plant cartoon`, `bamboo forest vector`, `bamboo leaf pattern`, `bamboo svg cute`.

#### `illustrations/animals/`
*Purpose:* HSK animal vocabulary (HSK1–3 core) + zodiac series + forest friends. **Each animal = 1 file, one consistent angle/pose so sets tile together.**

| Asset file | Type | Notes |
|---|---|---|
| `animal-fox.svg` `animal-rabbit.svg` `animal-owl.svg` `animal-deer.svg` `animal-squirrel.svg` `animal-hedgehog.svg` `animal-frog.svg` `animal-butterfly.svg` `animal-bird.svg` `animal-bee.svg` `animal-ladybug.svg` | Il | forest friends |
| `animal-cat.svg` `animal-dog.svg` `animal-mouse.svg` `animal-fish.svg` `animal-turtle.svg` | Il | everyday pets/pets vocab |
| `animal-tiger.svg` `animal-monkey.svg` `animal-elephant.svg` `animal-bear.svg` `animal-snake.svg` `animal-horse.svg` `animal-sheep.svg` `animal-rooster.svg` `animal-pig.svg` `animal-ox.svg` `animal-crane.svg` `animal-dragon.svg` | Il | zodiac + HSK animals (十二生肖) |
| `animal-set-forest.svg` / `animal-set-zodiac.svg` | Il | group scenes for games |

**Keywords:** `cute animals flat set`, `forest animals cartoon vector`, `chinese zodiac animals flat`, `kawaii animal faces`, `animal illustrations children`.

#### `illustrations/characters/`
*Purpose:* humans + mentors shown in stories, lesson scenes, teacher tools.

| Asset file | Type | Notes |
|---|---|---|
| `character-teacher-panda.svg` | Il | mascot-teacher |
| `character-teacher-owl.svg` | Il | wise mentor |
| `character-mentor-fox.svg` / `character-friend-rabbit.svg` | Il | recurring cast |
| `character-student-boy.svg` / `character-student-girl.svg` | Il | learners; 2 skin tones, chibi |
| `character-grandpa.svg` / `character-grandma.svg` | Il | family vocab, stories |
| `character-shopkeeper.svg` / `character-chef.svg` / `character-doctor.svg` | Il | occupation vocab |
| `character-family-set.svg` | Il | family lesson (家庭成员) |

**Keywords:** `cute teacher cartoon flat`, `kawaii kid avatar`, `chibi character vector`, `family cartoon illustration`, `occupation flat character set`.

#### `illustrations/mountains/`
*Purpose:* landscape layers, "progress = climb" metaphors, scenery backdrops.

| Asset file | Type | Notes |
|---|---|---|
| `mountain-single.svg` / `mountain-range.svg` / `mountain-snow-peak.svg` | D | parallax layers |
| `mountain-hill.svg` / `mountain-hills-rolling.svg` | D | gentle slopes |
| `mountain-terraces.svg` | Il | Chinese rice terraces — cultural scene |
| `mountain-temple.svg` / `mountain-cave.svg` | Il | story settings |

**Keywords:** `flat mountains illustration`, `cute hills landscape`, `chinese mountain scenery vector`, `parallax mountain layers`.

#### `illustrations/clouds/`
*Purpose:* sky dressing, thought bubbles, weather vocab, mood accents.

| Asset file | Type | Notes |
|---|---|---|
| `cloud-flat.svg` / `cloud-soft.svg` / `cloud-puff.svg` / `cloud-morning.svg` / `cloud-night.svg` | D | backgrounds, transitions |
| `cloud-sun.svg` / `cloud-rain.svg` / `cloud-lightning.svg` | Il | weather vocab (天气) |
| `cloud-hearts.svg` | D | romance/friendship filler |

**Keywords:** `cute cloud flat vector`, `kawaii weather icons`, `cloud sun cartoon`, `cloud illustration soft`.

#### `illustrations/buildings/`
*Purpose:* Chinese cultural architecture + everyday buildings for place vocabulary (地方).

| Asset file | Type | Notes |
|---|---|---|
| `building-pagoda.svg` / `building-temple.svg` / `building-archway.svg` | Il | cultural landmarks (牌坊) |
| `building-lantern.svg` / `building-bridge.svg` | Il | signature props |
| `building-school.svg` / `building-library.svg` / `building-house.svg` / `building-shop.svg` / `building-garden.svg` | Il | place vocab |
| `building-town-row.svg` / `building-wall.svg` | D | skyline backdrops |

**Keywords:** `chinese pagoda flat illustration`, `cute school building cartoon`, `chinese lantern vector`, `house flat vector kids`, `asian architecture cute`.

#### `illustrations/objects/`
*Purpose:* classroom + everyday objects; **objects get happy faces** (style pillar 7).

| Asset file | Type | Notes |
|---|---|---|
| `object-book.svg` `object-book-open.svg` `object-pencil.svg` `object-backpack.svg` `object-chair.svg` `object-table.svg` `object-lamp.svg` | Il | classroom set |
| `object-brush-calligraphy.svg` `object-scroll.svg` `object-ink-stone.svg` | Il | Chinese culture set |
| `object-teacup.svg` `object-kettle.svg` `object-fan.svg` `object-lantern.svg` `object-abacus.svg` | Il | culture/life |
| `object-medal.svg` `object-certificate.svg` `object-trophy.svg` | Il | recognition props |
| `object-hourglass.svg` `object-map.svg` `object-compass.svg` `object-umbrella.svg` `object-key.svg` `object-lock.svg` `object-bell.svg` | Il | misc lessons |

**Keywords:** `school supplies flat cartoon`, `cute stationery vector`, `chinese calligraphy tools illustration`, `happy objects kawaii`, `classroom objects kids`.

#### `illustrations/food/`
*Purpose:* food is the biggest HSK vocabulary cluster — dumplings, fruits, meals.

| Asset file | Type | Notes |
|---|---|---|
| `food-dumplings.svg` `food-baozi.svg` `food-dimsum.svg` `food-mooncake.svg` `food-spring-roll.svg` `food-hotpot.svg` `food-noodles.svg` `food-rice-bowl.svg` | Il | Chinese cuisine |
| `food-tea.svg` `food-chopsticks.svg` | Il | culture |
| `food-apple.svg` `food-banana.svg` `food-orange.svg` `food-watermelon.svg` `food-strawberry.svg` `food-grapes.svg` | Il | fruits (水果) |
| `food-egg.svg` `food-milk.svg` `food-juice.svg` `food-cake.svg` `food-cookie.svg` `food-ice-cream.svg` `food-lollipop.svg` | Il | daily + treats |
| `food-pizza.svg` `food-hamburger.svg` | Il | loanwords (披萨, 汉堡) |

**Keywords:** `cute food flat illustration`, `chinese food cartoon vector`, `kawaii food faces`, `fruits flat set children`, `dim sum illustration`.

---

### 6.2 📂 `nature/`

*Purpose:* forest dressing — fills, scatter, story backgrounds. **Everything here is D (Decorative) unless marked Il.**

#### `nature/leaves/`
| Asset | Type | Notes |
|---|---|---|
| `leaf-single.svg` `leaf-fern.svg` `leaf-maple.svg` `leaf-lotus.svg` `leaf-tropical.svg` `leaf-pile.svg` `leaf-floating.svg` | D | scatter, seasonal accents |

**Keywords:** `cute leaf flat`, `leaf pattern vector`, `maple leaf cartoon`, `tropical leaf kids`.

#### `nature/grass/`
| Asset | Type | Notes |
|---|---|---|
| `grass-tuft.svg` `grass-patch.svg` `grass-tall.svg` `grass-bunch.svg` `grass-blade.svg` | D | ground edges |

**Keywords:** `grass tuft flat`, `cute grass patch`, `grass cartoon vector`.

#### `nature/flowers/`
| Asset | Type | Notes |
|---|---|---|
| `flower-daisy.svg` `flower-tulip.svg` `flower-sakura.svg` `flower-lotus.svg` `flower-sunflower.svg` `flower-cherry-blossom.svg` `flower-single.svg` | D | scatter + vocab |
| `flower-bouquet.svg` `flower-vase.svg` `flower-meadow.svg` | Il | gifts, scenes |

**Keywords:** `cute flowers flat set`, `flower svg kawaii`, `sakura flat vector`, `flower meadow illustration`.

#### `nature/trees/`
| Asset | Type | Notes |
|---|---|---|
| `tree-round.svg` `tree-pine.svg` `tree-sakura.svg` `tree-palm.svg` `tree-bamboo.svg` `tree-apple.svg` `tree-sapling.svg` `tree-willow.svg` | D/Il | round canopy default |
| `tree-stump.svg` `tree-forest.svg` | D | props, fill |

**Keywords:** `cute tree flat vector`, `round tree cartoon`, `sakura tree illustration`, `forest trees kids`.

#### `nature/rocks/`
| Asset | Type | Notes |
|---|---|---|
| `rock-small.svg` `rock-big.svg` `rock-flat.svg` `rock-mossy.svg` `stone-path.svg` `pebbles.svg` | D | terrain |

**Keywords:** `cute rocks flat`, `stone path vector`, `pebbles cartoon`.

#### `nature/bushes/`
| Asset | Type | Notes |
|---|---|---|
| `bush-round.svg` `bush-flowered.svg` `bush-cluster.svg` `bush-berry.svg` `hedge.svg` | D | dividers, corners |

**Keywords:** `cute bush flat`, `bush cartoon vector`, `hedge kids illustration`.

#### `nature/vines/`
| Asset | Type | Notes |
|---|---|---|
| `vine-swing.svg` `vine-hanging.svg` `vine-with-leaves.svg` `vine-gourd.svg` `vine-flower.svg` | D | dangling accents |

**Keywords:** `hanging vine flat`, `vine swing cartoon`, `ivy leaf vector cute`.

#### `nature/water/`
| Asset | Type | Notes |
|---|---|---|
| `water-drop.svg` `water-splash.svg` `water-wave.svg` `water-rain.svg` `water-puddle.svg` `water-lily-pad.svg` | D | effects + vocab |
| `water-river.svg` `water-pond.svg` `water-waterfall.svg` | D/Il | scene floors |

**Keywords:** `water drop cute`, `splash flat vector`, `river cartoon illustration`, `water waves kawaii`.

---

### 6.3 📂 `backgrounds/`

*Purpose:* full scenes (Il) and re-usable ambient layers (D). **All optimized for 16:9 / 1024×640.**

#### `backgrounds/hero/`
| Asset | Type | Notes |
|---|---|---|
| `hero-forest-greeting.svg` | Il | landing page, masked with text zone |
| `hero-lesson-start.svg` / `hero-celebration.svg` | Il | session start / finish |
| `hero-panda-home.svg` | Il | profile/home top |
| `hero-forest-sky.svg` | D | reusable sky floor |

**Keywords:** `forest illustration children`, `panda forest scene`, `cartoon landscape background`, `kids app hero illustration`.

#### `backgrounds/lesson/`
| Asset | Type | Notes |
|---|---|---|
| `bg-lesson-classroom.svg` `bg-lesson-bamboo-forest.svg` `bg-lesson-park.svg` `bg-lesson-home.svg` `bg-lesson-sky.svg` | Il | generic lesson rooms |
| `bg-lesson-kitchen.svg` `bg-lesson-market.svg` `bg-lesson-zoo.svg` `bg-lesson-city.svg` `bg-lesson-street.svg` | Il | theme lessons (food, animals, places) |

**Keywords:** `classroom flat background`, `cute forest background children`, `market scene illustration`, `zoo cartoon background`.

#### `backgrounds/game/`
| Asset | Type | Notes |
|---|---|---|
| `bg-game-balloon.svg` `bg-game-memory.svg` `bg-game-quiz.svg` `bg-game-matching.svg` `bg-game-dragdrop.svg` `bg-game-writing.svg` `bg-game-timer.svg` `bg-game-celebration.svg` | Il | one per mini-game (FR-11/12, quiz, matching…) |

**Keywords:** `quiz game background kids`, `game scene cartoon`, `balloon game illustration`, `memory game background`.

#### `backgrounds/forest/` — parallax kit
| Asset | Type | Notes |
|---|---|---|
| `forest-layer-far.svg` `forest-layer-mid.svg` `forest-layer-near.svg` | D | 3-depth parallax |
| `forest-canopy.svg` `forest-ground.svg` `forest-path.svg` `forest-arch.svg` `forest-frame.svg` | D | framing + floors |

**Keywords:** `forest parallax layers`, `cartoon forest background`, `jungle canopy flat`.

#### `backgrounds/blobs/`
| Asset | Type | Notes |
|---|---|---|
| `blob-1.svg` … `blob-6.svg` | D | organic shape variations |
| `blob-cloud.svg` `blob-bubble.svg` `blob-wave.svg` `blob-star.svg` | D | card/highlight shapes |

**Keywords:** `organic blob shape svg`, `pastel blob vector`, `blob background cute`, `cloud blob shape`.

#### `backgrounds/gradients/`
| Asset | Type | Notes |
|---|---|---|
| `gradient-sky-day.svg` `gradient-sky-dawn.svg` `gradient-sky-dusk.svg` `gradient-sky-night.svg` | D | complex multi-stop skies |
| `gradient-forest.svg` `gradient-sunset.svg` `gradient-rainbow.svg` `gradient-card.svg` | D | scene wash |

> Rule: **prefer CSS `bg-linear-to-*` in Tailwind v4** for simple gradients. Ship SVG only for multi-stop/special shapes.

**Keywords:** `sky gradient illustration`, `sunset gradient vector`, `rainbow gradient background`.

#### `backgrounds/decorative-patterns/` — seamless tiles (repeatable)
| Asset | Type | Notes |
|---|---|---|
| `pattern-bamboo.svg` `pattern-leaves.svg` `pattern-clouds.svg` `pattern-dots.svg` `pattern-waves.svg` `pattern-paw-prints.svg` `pattern-stars.svg` `pattern-lanterns.svg` `pattern-hearts.svg` `pattern-chevrons.svg` | D | tile 128×128/256×256, seamless |

**Keywords:** `seamless pattern svg`, `cute pattern vector`, `chinese lantern pattern`, `dots pattern pastel`.

---

### 6.4 📂 `ui/`

*Purpose:* interface chrome with **state variants**. Prefer CSS for plain buttons; use SVG skins where the hand-drawn look must stay consistent. All **UC**.

#### `ui/buttons/`
| Asset | Notes |
|---|---|
| `button-primary.svg` `button-secondary.svg` `button-ghost.svg` `button-success.svg` `button-danger.svg` `button-round.svg` `button-pill.svg` `button-icon.svg` | base skins |
| `button-hover.svg` `button-pressed.svg` `button-disabled.svg` `button-active.svg` | state variants |
| `button-skip.svg` `button-next.svg` `button-check.svg` `button-back.svg` | action-coded |

**Keywords:** `cute button ui kit`, `game button vector`, `rounded button flat`, `kids app button`.

#### `ui/frames/`
| Asset | Notes |
|---|---|
| `frame-rounded.svg` `frame-card-border.svg` `frame-dashed.svg` `frame-scalloped.svg` `frame-polaroid.svg` | generic frames |
| `frame-notebook.svg` `frame-wood.svg` `frame-washi-tape.svg` `frame-sticker.svg` | themed frames |

**Keywords:** `cartoon frame png`, `kids frame vector`, `notebook frame cute`, `washi tape frame`.

#### `ui/speech-bubbles/`
| Asset | Notes |
|---|---|
| `bubble-speech.svg` `bubble-thought.svg` `bubble-shout.svg` `bubble-whisper.svg` | direction variants |
| `bubble-question.svg` `bubble-exclamation.svg` `bubble-love.svg` `bubble-hint.svg` `bubble-error.svg` `bubble-multi.svg` | coded bubbles |

**Keywords:** `speech bubble cute`, `thought bubble vector`, `comic bubble kids`, `dialogue bubble flat`.

#### `ui/banners/`
| Asset | Notes |
|---|---|
| `banner-hero.svg` `banner-promo.svg` `banner-welcome.svg` | big headers |
| `banner-reward.svg` `banner-trophy.svg` `banner-streak.svg` `banner-new-course.svg` `banner-vip.svg` `banner-notification.svg` | context banners |

**Keywords:** `game banner ui`, `ribbon banner vector`, `reward banner cartoon`, `cute banner kids`.

#### `ui/cards/`
| Asset | Notes |
|---|---|
| `card-lesson.svg` `card-lesson-completed.svg` `card-lesson-locked.svg` | lesson card states |
| `card-flashcard-front.svg` `card-flashcard-back.svg` `card-word.svg` `card-quiz-option.svg` | study surfaces |
| `card-reward.svg` `card-trophy.svg` `card-treasure.svg` `card-avatar-frame.svg` `card-profile.svg` | profile/rewards |

**Keywords:** `game card ui`, `flashcard template cute`, `card frame vector`, `lesson card game`.

#### `ui/tabs/`
| Asset | Notes |
|---|---|
| `tab-pill.svg` `tab-underline.svg` `tab-bubble.svg` `tab-bookmark.svg` `tab-active.svg` `tab-inactive.svg` | tab skins |

**Keywords:** `tab ui cute`, `pill tab vector`, `bookmark tab cartoon`.

#### `ui/progress-bars/`
| Asset | Notes |
|---|---|
| `progress-track.svg` `progress-fill.svg` `progress-segmented.svg` `progress-dots.svg` | bars + steps |
| `progress-ring.svg` `progress-streak.svg` `progress-xp.svg` `progress-level.svg` `progress-preview.svg` | gamified meters |

**Keywords:** `progress bar game ui`, `xp bar vector`, `level meter cute`, `streak progress cartoon`.

#### `ui/badges/`
| Asset | Notes |
|---|---|
| `badge-level-hsk1.svg` … `badge-level-hsk9.svg` | 9 level badges |
| `badge-complete.svg` `badge-new.svg` `badge-hot.svg` `badge-trending.svg` | status |
| `badge-vip.svg` `badge-free.svg` `badge-star.svg` `badge-streak.svg` `badge-achievement.svg` | tier/gamification |

**Keywords:** `game badge ui`, `level badge vector`, `achievement badge cute`, `vip badge cartoon`.

#### `ui/ribbons/`
| Asset | Notes |
|---|---|
| `ribbon-banner.svg` `ribbon-curved.svg` `ribbon-folded.svg` `ribbon-corner.svg` | shapes |
| `ribbon-star.svg` `ribbon-rosette.svg` `ribbon-prize.svg` `ribbon-winner.svg` | prize flags |

**Keywords:** `ribbon vector flat`, `winner ribbon cartoon`, `rosette badge cute`, `folded ribbon ui`.

#### `ui/modals/`
| Asset | Notes |
|---|---|
| `modal-base.svg` `modal-confirm.svg` | structural |
| `modal-reward.svg` `modal-trophy.svg` `modal-chest.svg` `modal-vip-upsell.svg` `modal-tip.svg` `modal-success.svg` `modal-warning.svg` `modal-error.svg` | context skins |

**Keywords:** `popup ui game`, `modal frame vector`, `reward popup cute`, `dialog box cartoon`.

---

### 6.5 📂 `icons/`

*Purpose:* **24×24, `fill="currentColor"`, 2px round caps, no text.** All **I**. Filled style (not stroke) to match the chunky look; stroke variants only if a set needs them (`-outline` suffix).

#### `icons/navigation/`
| Asset | | | |
|---|---|---|---|
| `nav-home.svg` `nav-lessons.svg` `nav-games.svg` `nav-progress.svg` `nav-profile.svg` `nav-shop.svg` `nav-leaderboard.svg` `nav-settings.svg` | bottom bar + menus |
| `nav-back.svg` `nav-forward.svg` `nav-close.svg` `nav-menu.svg` `nav-more.svg` `nav-search.svg` `nav-arrow-up.svg` `nav-arrow-down.svg` `nav-arrow-left.svg` `nav-arrow-right.svg` `nav-check.svg` `nav-cancel.svg` `nav-refresh.svg` `nav-sort.svg` `nav-filter.svg` `nav-fullscreen.svg` | chrome |

**Keywords:** `home icon filled`, `menu icon vector`, `back arrow icon`, `navigation icons set kids`.

#### `icons/games/`
| Asset | Notes |
|---|---|
| `game-memory.svg` `game-flashcards.svg` `game-matching.svg` `game-dragdrop.svg` `game-quiz.svg` `game-balloon.svg` `game-writing.svg` `game-multiple-choice.svg` `game-word-search.svg` `game-true-false.svg` | one per mini-game (FR-03…FR-13) |
| `game-timer.svg` `game-hearts.svg` `game-lives.svg` `game-hint.svg` `game-power-up.svg` `game-skip.svg` | in-game status |

**Keywords:** `memory game icon`, `flashcard icon`, `quiz icon filled`, `game icons set flat`.

#### `icons/courses/`
| Asset | Notes |
|---|---|
| `course-hsk1.svg` … `course-hsk9.svg` | level badges (numbered) |
| `course-theme.svg` `course-grammar.svg` `course-vocabulary.svg` `course-listening.svg` `course-speaking.svg` `course-reading.svg` `course-writing.svg` | curriculum types |
| `course-lesson.svg` `course-unit.svg` `course-chapter.svg` `course-locked.svg` `course-completed.svg` `course-progress.svg` `course-streak.svg` | states + structure |

**Keywords:** `level icon numbered`, `course icon flat`, `lock icon`, `lesson icon vector`.

#### `icons/rewards/`
| Asset | Notes |
|---|---|
| `reward-star.svg` `reward-coin.svg` `reward-gem.svg` `reward-heart.svg` `reward-trophy.svg` `reward-badge.svg` `reward-medal.svg` `reward-xp.svg` `reward-lightning.svg` `reward-gift.svg` `reward-key.svg` `reward-chest.svg` `reward-ticket.svg` `reward-gold.svg` `reward-diamond.svg` | economy set |

**Keywords:** `coin icon game`, `star icon filled`, `gem icon vector`, `reward icons set`.

#### `icons/profile/`
| Asset | Notes |
|---|---|
| `profile-user.svg` `profile-avatar.svg` `profile-edit.svg` `profile-level.svg` `profile-xp.svg` `profile-achievements.svg` `profile-friends.svg` `profile-stats.svg` `profile-calendar.svg` `profile-heart.svg` `profile-fire.svg` `profile-target.svg` `profile-flag.svg` | profile/settings-adjacent |

**Keywords:** `user icon filled`, `profile icon`, `calendar icon flat`, `fire streak icon`.

#### `icons/settings/`
| Asset | Notes |
|---|---|
| `settings-gear.svg` `settings-sound.svg` `settings-music.svg` `settings-notifications.svg` `settings-language.svg` `settings-dark-mode.svg` `settings-account.svg` `settings-privacy.svg` `settings-about.svg` `settings-logout.svg` `settings-help.svg` `settings-translation.svg` `settings-voice.svg` | settings panel |

**Keywords:** `gear icon flat`, `language icon`, `logout icon`, `notification bell icon filled`.

#### `icons/audio/`
| Asset | Notes |
|---|---|
| `audio-play.svg` `audio-pause.svg` `audio-stop.svg` `audio-record.svg` | transport |
| `audio-volume-high.svg` `audio-volume-low.svg` `audio-volume-mute.svg` `audio-speaker.svg` | volume |
| `audio-slow.svg` `audio-speed.svg` `audio-repeat.svg` `audio-forward.svg` `audio-rewind.svg` | playback rate (pinyin practice) |
| `audio-wave.svg` `audio-mic.svg` `audio-mic-off.svg` | HSKK recording |

**Keywords:** `play icon filled`, `volume icon`, `microphone icon vector`, `speaker icon flat`.

#### `icons/leaderboard/`
| Asset | Notes |
|---|---|
| `leaderboard-podium.svg` `leaderboard-cup.svg` `leaderboard-crown.svg` `leaderboard-medal.svg` | podium kit |
| `leaderboard-rank-1.svg` `leaderboard-rank-2.svg` `leaderboard-rank-3.svg` `leaderboard-star.svg` `leaderboard-fire.svg` `leaderboard-trophy.svg` `leaderboard-arrow-up.svg` `leaderboard-arrow-down.svg` | rank states |

**Keywords:** `podium icon`, `trophy icon flat`, `rank medal`, `leaderboard icons set`.

#### `icons/achievements/`
| Asset | Notes |
|---|---|
| `achievement-trophy.svg` `achievement-medal.svg` `achievement-star.svg` `achievement-gem.svg` `achievement-leaf.svg` `achievement-crown.svg` `achievement-badge.svg` | unlocked types |
| `achievement-lock.svg` `achievement-unlock.svg` `achievement-completion.svg` `achievement-milestone.svg` `achievement-timeline.svg` `achievement-check.svg` `achievement-flame.svg` | states + timelines |

**Keywords:** `achievement icon`, `medal icon flat`, `unlock icon`, `milestone icon`.

#### `icons/miscellaneous/`
| Asset | Notes |
|---|---|
| `misc-info.svg` `misc-help.svg` `misc-warning.svg` `misc-error.svg` | status |
| `misc-plus.svg` `misc-minus.svg` `misc-check-circle.svg` `misc-x-circle.svg` `misc-grid.svg` `misc-list.svg` | actions/views |
| `misc-share.svg` `misc-download.svg` `misc-upload.svg` `misc-link.svg` `misc-qr.svg` `misc-refresh.svg` `misc-filter.svg` `misc-sort.svg` `misc-copy.svg` `misc-edit.svg` `misc-trash.svg` `misc-lock.svg` `misc-unlock.svg` `misc-eye.svg` `misc-eye-off.svg` `misc-calendar.svg` `misc-clock.svg` `misc-location.svg` `misc-mail.svg` `misc-phone.svg` `misc-external.svg` | utility set |

**Keywords:** `info icon`, `settings icon set`, `utility icons flat`, `trash icon vector`.

---

### 6.6 📂 `game/`

*Purpose:* mini-game chrome (FR-11/12 and quiz/matching/quiz flows). All **UC** unless marked.

#### `game/memory-game/`
| Asset | Type | Notes |
|---|---|---|
| `mem-card-front.svg` `mem-card-back.svg` `mem-card-flipped.svg` | UC | card shell states |
| `mem-card-word.svg` `mem-card-pinyin.svg` `mem-card-meaning.svg` | UC | face content slots |
| `mem-card-matched.svg` `mem-card-mismatch.svg` `mem-card-timer.svg` | UC | feedback states |
| `mem-card-panda.svg` | Il | pattern/back art |

**Keywords:** `memory card game`, `flip card ui`, `matching cards cartoon`, `memory game template`.

#### `game/flashcards/`
| Asset | Type | Notes |
|---|---|---|
| `flashcard-front.svg` `flashcard-back.svg` `flashcard-deck.svg` `flashcard-stack.svg` `flashcard-shuffle.svg` `flashcard-flip.svg` `flashcard-mastered.svg` `flashcard-review.svg` `flashcard-progress.svg` | UC | FR-04 deck |

**Keywords:** `flashcard template cute`, `deck of cards vector`, `flip card animation`.

#### `game/matching/`
| Asset | Type | Notes |
|---|---|---|
| `matching-board.svg` `matching-tile.svg` `matching-zone.svg` `matching-node.svg` | UC | board + cells (FR-03) |
| `matching-line.svg` `matching-line-ok.svg` `matching-line-wrong.svg` `matching-pair-connected.svg` | UC | connector states |

**Keywords:** `matching game ui`, `connect line game`, `puzzle connect vector`.

#### `game/drag-and-drop/`
| Asset | Type | Notes |
|---|---|---|
| `dragdrop-zone.svg` `dragdrop-zone-active.svg` `dragdrop-zone-ok.svg` `dragdrop-zone-wrong.svg` `dragdrop-target.svg` | UC | drop-zone states |
| `dragdrop-item-tile.svg` `dragdrop-grab-handle.svg` `dragdrop-cursor.svg` | UC | draggable affordances |

**Keywords:** `drag and drop game`, `drop zone ui`, `drag handle icon`, `match tile vector`.

#### `game/quiz/`
| Asset | Type | Notes |
|---|---|---|
| `quiz-question-bubble.svg` `quiz-result-face.svg` `quiz-progress-dots.svg` `quiz-timer.svg` | UC | question chrome |
| `quiz-option.svg` `quiz-option-a.svg` `quiz-option-b.svg` `quiz-option-c.svg` `quiz-option-d.svg` | UC | choice shells |
| `quiz-option-correct.svg` `quiz-option-wrong.svg` `quiz-option-disabled.svg` | UC | answer states |

**Keywords:** `quiz ui game`, `answer button abc`, `question bubble cartoon`, `quiz template kids`.

#### `game/rewards/`
| Asset | Type | Notes |
|---|---|---|
| `reward-gift.svg` `reward-chest.svg` `reward-chest-open.svg` `reward-mystery-box.svg` `reward-crate.svg` | Il | gacha/chests |
| `reward-coin.svg` `reward-gem.svg` `reward-key.svg` `reward-ticket.svg` `reward-bonus.svg` `reward-multiplier.svg` | Il | economy items |

**Keywords:** `treasure chest game`, `gift box cute`, `reward coin vector`, `mystery box game`.

#### `game/stars/`
| Asset | Type | Notes |
|---|---|---|
| `star-filled.svg` `star-empty.svg` `star-half.svg` `star-gold.svg` `star-sparkle.svg` `star-shine.svg` | Il/D | rating (1–3 stars) |
| `star-1.svg` `star-2.svg` `star-3.svg` `star-small.svg` `star-big.svg` `star-burst.svg` | D | scoring callouts |

**Keywords:** `game stars rating`, `3 stars vector`, `gold star cartoon`, `star burst flat`.

#### `game/trophies/`
| Asset | Type | Notes |
|---|---|---|
| `trophy-gold.svg` `trophy-silver.svg` `trophy-bronze.svg` `trophy-cup.svg` `trophy-plate.svg` `trophy-tall.svg` `trophy-tiny.svg` `trophy-ribbon.svg` `trophy-shine.svg` | Il | podium + rewards |

**Keywords:** `trophy flat vector`, `gold cup cartoon`, `medal trophy set`, `winner cup kids`.

#### `game/confetti/`
| Asset | Type | Notes |
|---|---|---|
| `confetti-burst.svg` `confetti-poppers.svg` `confetti-balloons.svg` `confetti-party-hat.svg` | D | celebration scenes |
| `confetti-piece-round.svg` `confetti-piece-rect.svg` `confetti-piece-star.svg` `confetti-piece-triangle.svg` `confetti-streamer.svg` `confetti-sparkle.svg` | D | particle pieces (CSS-animated) |

**Keywords:** `confetti burst vector`, `party popper flat`, `celebration confetti`, `balloons cartoon`.

---

## 7. Sourcing Playbook (per platform)

**Master query formula:** `{subject} + {style} + {format}` where
`{style}` ∈ `flat | cute | cartoon | kawaii | children | kids` and `{format}` ∈ `svg | vector | illustration | icon`.

| Source | How to search | Transformation rules | Worked example (panda) |
|---|---|---|---|
| **Freepik** | `illustrations` category → filter *Flat* | append `flat illustration`; prefer packs; check free/license filter | `cute panda flat illustration` |
| **SVGRepo** | search bar; filter *color: any*, style *colored* | append nothing for subject; add `cute` if results are line-art; download raw SVG | `panda` + filter colored → download `panda-cute` |
| **Icons8** | search bar; filter *style: Flat* → SVG download | for icons add nothing; for illustrations add `cute`; note "icons8 free" license | `panda` → Flat style |
| **Storyset** | search subject; pick a character/scene; *Customize* colors then *Edit / Get illustration* → SVG | Storyset is scenes/characters only — best for `illustrations/characters` + `backgrounds/hero` | `panda forest` scene |
| **Figma Community** | search `"panda" illustration` / `"kids" ui kit`; duplicate file → export SVG | best for **complete kits** (buttons, bubbles, cards) — import once, keep as source-of-truth | `panda illustration kit` |
| **Google** | `"{subject} svg {style}"` + `filetype:svg` | verify license on the source site (see §7.1); never hotlink | `cute panda svg flat` |

### 7.1 License & attribution rules (non-negotiable)
- **Freepik**: free assets require attribution; premium without. Record `author + link` in `frontend/public/assets/CREDITS.md`.
- **SVGRepo / Icons8**: CC0/own-license — no attribution required for CC0; Icons8 free requires link back.
- **Storyset / Figma Community**: check each item; Storyset free needs attribution.
- **Redraw rule**: if an asset is close but not on-style, **re-draw it** in the house style instead of shipping a foreign style. Consistency beats convenience.
- Every imported asset gets a line in `CREDITS.md` (`path | source | license | author | link`).

---

## 8. Scaling & Reuse Rules

1. **One file = one asset.** No multi-asset collages except intentional group scenes (`animal-set-*`).
2. **Reuse over duplicates.** The same `panda-happy.svg` appears in quiz feedback, streaks, and profile — no per-screen copies.
3. **New asset Definition of Done:**
   - [ ] kebab-case name from this catalog's patterns
   - [ ] correct type (Il/I/D/UC) + viewBox
   - [ ] palette tokens only; `currentColor` where it's an icon
   - [ ] SVGO-optimized; no leftover editor junk (`inkscape:*`, empty `<g>`)
   - [ ] license recorded in `CREDITS.md` if sourced
   - [ ] added to this catalog under its folder
4. **Style check before commit** (visual QA): flat? rounded? big-eyed? pastel-forest? soft shadow? no pure black outlines?
5. **Theme swap** stays token-driven: never hard-code a hex outside the §1.2 palette; icons recolor via `currentColor` + CSS.

---

## 9. Outstanding Questions

- Confirm whether SVGR (`@svgr/webpack` in `next.config.ts`) should be installed now, or only when the first icon is needed (YAGNI).
- Confirm hero aspect ratio (16:9 vs 4:3) — affects `hero-*` and `bg-*` viewBoxes.
- Vietnamese UI copy vs Chinese learning content: speech-bubble art is text-free by design, but confirm whether `bubble-*` needs a Vietnamese-friendly text measure (font-size ≥ 16px, long-word wrapping).

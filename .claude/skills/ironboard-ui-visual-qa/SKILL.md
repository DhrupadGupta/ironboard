---
name: ironboard-ui-visual-qa
description: Enforce the Ironboard visual identity from reference/design/gym-management-homepage-2.html and visually QA the running application. Use when building or changing any UI, choosing colours/fonts/spacing/components, reviewing a screen, or before claiming UI work is done. Blocks generic SaaS/admin-dashboard redesigns — no Tailwind default palette, no Material/Bootstrap/shadcn look, no blue-and-white dashboards, no rounded cards with drop shadows.
---

# Ironboard — UI & Visual QA

`reference/design/gym-management-homepage-2.html` is the **visual source of truth**.
It is READ-ONLY and must never be redesigned, restyled or "modernised".

Full token-level extraction lives in `docs/ui/DESIGN_SYSTEM.md`. Read it before writing UI code.
Where this skill and the HTML source disagree, **the HTML wins**.

## 1. The anti-pattern this skill exists to prevent

The single largest risk to this project is an LLM producing a competent, generic admin
dashboard instead of Ironboard. **Reject on sight:**

| ❌ Never | ✅ Ironboard |
|---|---|
| Tailwind default palette (`slate`, `indigo-600`, `gray-50`) | `--ink #0c0c09`, `--volt #cbff3d`, `--paper #f4f3ec` |
| White/light-grey dashboard background | Near-black `#0c0c09` ground |
| Blue or purple primary | Volt green `#cbff3d` — the **only** accent |
| Inter / Roboto / system-ui everywhere | Anton (display) · Oswald (body) · JetBrains Mono (labels) |
| `border-radius: 8px` cards | **`border-radius: 0`** — hard rectangles only |
| `box-shadow` elevation | 1px hairline borders `rgba(244,243,236,0.10)` |
| Sidebar + topbar admin chrome | Sticky blurred header; locker-board grids |
| Gradients, glassmorphism, neumorphism | Flat ink, hairlines, one accent |
| Sentence-case headings | **Uppercase Anton**, `line-height: 0.95` |
| Emoji or coloured icon sets | Unicode block glyphs `◧ ◫ ◨ ◩ ◪ ▦` in volt, in a 42px hairline square |
| Gap-based card grids with margins | Shared hairline borders (`.board`) or `gap:1px` on a `--line` background (`.feat-grid`) |
| Toast/pill/badge with rounded corners | Square volt chip: `--volt` bg, `--ink` text, `4px 9px` |

If a design decision would look at home in any generic SaaS product, it is wrong here.

## 2. Tokens — copy these exactly

From the `:root` block of the source (lines 11–21). **Never introduce a new hex value.**

```css
:root{
  --ink:#0c0c09;        /* page + card background */
  --ink-2:#151511;      /* card hover — the only elevation step */
  --ink-3:#1e1e18;      /* declared, unused — reserved 3rd elevation */
  --volt:#cbff3d;       /* the single accent */
  --volt-dim:#a5d62f;   /* declared, unused — reserved accent hover */
  --paper:#f4f3ec;      /* primary text */
  --paper-dim:#a9a89c;  /* secondary text */
  --line: rgba(244,243,236,0.10);        /* standard hairline */
  --line-strong: rgba(244,243,236,0.22); /* emphasised border */
}
```

Three literals also appear: `rgba(12,12,9,0.88)` (header background behind the blur),
`rgba(244,243,236,0.35)` (logo mark third square), `rgba(203,255,61,0.35)` (middle plate border).

**Preserve `--ink-3` and `--volt-dim`** even though the source never uses them — do not delete
them as dead code.

### ⚠️ Accent-colour conflict (`CON-06`)
`reference/lab2/` embeds screenshots of this same layout in **blue** (p.8) and **red**
(pp.9–10). The supplied HTML — filename suffix `-2` — uses volt green.
**Volt green `#cbff3d` governs.** Never use the blue or red variants.

### Contrast — all pairings clear WCAG AAA
`paper`/`ink` 17.61:1 · `volt`/`ink` 16.71:1 · `ink`/`volt` 16.71:1 ·
`paper-dim`/`ink` 8.18:1 · `paper-dim`/`ink-2` 7.64:1.
Any new pairing must stay **≥ 7:1**.

## 3. Typography

```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Three voices, strictly separated:**

| Family | Weights | Role |
|---|---|---|
| **Anton** | 400 only | `h1,h2,h3`, logo, stat numerals — **always uppercase**, `letter-spacing:0.01em`, `line-height:0.95` |
| **Oswald** | 400/500/600/700 | Body prose, `line-height:1.5` base / `1.7` in reading blocks |
| **JetBrains Mono** | 400/500 | Every label, ID, tag, button, metric caption — **uppercase**, tracked `0.08em`–`0.14em` |

Scale (fixed sizes unless noted): hero `clamp(52px,7.2vw,96px)` · CTA `clamp(38px,6vw,68px)` ·
section `clamp(34px,4vw,52px)` · stat numeral `40px` · card title `26px` · logo `22px` ·
feature title `19px` · hero sub `17px` · section sub `15px` · card desc `14.5px` ·
body/feature `14px` · list item `13.5px` · mono labels `12px` · small mono `11px`.

**The one deliberate exception:** `.feat h3` overrides the heading rule —
`font-family:'Oswald'; font-weight:600; text-transform:none`. Feature titles are the only
sentence-case headings. Preserve this.

## 4. Layout & spacing

- Container: `max-width:1180px; margin:0 auto; padding:0 32px` (→ `20px` ≤640px).
- Section rhythm: `.section{padding:100px 0}` (→ `70px` ≤640px); hero `120px 0 90px`
  (→ `90px 0 60px`); CTA `110px 0`; footer `50px 0 40px`.
- Component padding: card `36px 32px` · feature `34px 30px` · flow step `30px 26px` ·
  button `12px 22px` · chip `4px 9px`.
- **Sections are separated by `border-bottom:1px solid var(--line)` — never by margin.**
- Observed spacing set: `1,4,8,9,10,12,14,16,18,20,22,26,30,32,34,36,40,50,56,60,70,90,100,110,120`.
  It is **not** a strict 8pt grid. Do not "regularise" it.

**Two hairline grid techniques — use the right one:**

```css
/* P-01 Locker board — department grids */
.board{display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
       border:1px solid var(--line);}
.card{border-right:1px solid var(--line); border-bottom:1px solid var(--line);}

/* P-02 Hairline gap grid — feature grids */
.feat-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--line);}
.feat{background:var(--ink);}
```

With `auto-fit`, a partial final row leaves open edges (5 cards → 4 + 1). **That is the
authentic look — not a bug to fix.**

Full-bleed grids use `<div class="wrap" style="padding:0;">` so borders sit flush at the measure.

## 5. Components

**Buttons** — two variants, no radius, `white-space:nowrap`, always paired one solid + one ghost:
```css
.btn{padding:12px 22px; font:12px 'JetBrains Mono'; letter-spacing:0.1em;
     text-transform:uppercase; border:1px solid var(--line-strong); transition:all .2s ease;}
.btn-solid{background:var(--volt); color:var(--ink); border-color:var(--volt); font-weight:500;}
.btn-solid:hover{background:var(--paper); border-color:var(--paper);}
.btn-ghost{color:var(--paper);}
.btn-ghost:hover{border-color:var(--volt); color:var(--volt);}
```

**Card (`P-01`)** — anatomy in order: `.card-top` (mono ID left, volt chip right,
`margin-bottom:26px`) → Anton `h3` 26px → dim desc 14.5px/1.7 → `ul` with
`li{border-top:1px solid var(--line); padding:9px 0; display:flex; gap:10px}` and
`li::before{content:'—'; color:var(--volt); flex-shrink:0}`.

**Paired hover (`P-07`)** — the signature interaction: card background lifts
`--ink`→`--ink-2` (`.25s`) **and** its `.tag-id` ignites to volt (`.2s`), simultaneously.

**Section header triad (`P-03`)** — volt mono tag (`0.14em`) → Anton headline with explicit
`<br>` → dim prose capped at `380px`, `align-items:flex-end`, `padding-bottom:6px` for
baseline alignment.

**Stat rail (`P-09`)** — Anton 40px numeral over mono 11px label, hairline-separated;
rotates to a 3-up grid ≤900px.

**Logo mark (`P-12`)** — 14px volt square with two box-shadows faking a receding plate stack:
`box-shadow:4px 0 0 var(--paper), 8px 0 0 rgba(244,243,236,0.35)`.

**Navigation** — sticky, blurred, hairline-bottomed; never a sidebar:
```css
header{position:sticky; top:0; z-index:100;
       background:rgba(12,12,9,0.88); backdrop-filter:blur(10px);
       border-bottom:1px solid var(--line);}
nav{display:flex; align-items:center; justify-content:space-between;
    padding:20px 32px; max-width:1180px; margin:0 auto;}   /* → 18px 20px ≤640px */
.navlinks{display:flex; gap:36px; align-items:center;}
.navlinks a{font:12px 'JetBrains Mono'; letter-spacing:0.1em; text-transform:uppercase;
            color:var(--paper-dim); transition:color .2s ease;}
.navlinks a:hover{color:var(--paper);}
```
Link cluster sits right, logo left, ending in one ghost + one solid button. Footer link
columns use `.foot-col h4` (mono 11px, `0.12em`, `--paper-dim`) over `14px` links at
`opacity:.82`, hovering to volt at full opacity.

**`border-radius` is used exactly once in the entire source:** `50%` on the decorative plates.

## 6. Motion

```css
.reveal{opacity:0; transform:translateY(16px); transition:opacity .6s ease, transform .6s ease;}
.reveal.in{opacity:1; transform:translateY(0);}
@media (prefers-reduced-motion: reduce){
  .reveal{opacity:1; transform:none; transition:none;}
  html{scroll-behavior:auto;}
}
```
IntersectionObserver at `threshold:0.12`, **`unobserve` after firing** (one-shot; never re-animates).

**Only two durations exist:** `.2s`/`.25s` interaction, `.6s` entrance. Easing is always the
`ease` keyword — no custom cubic-bézier. `prefers-reduced-motion` support is mandatory, not polish.

## 7. Responsive

Four `max-width` breakpoints, each targeting one specific failure:

| BP | Change |
|---|---|
| **900px** | Hero → 1 column; stat rail vertical list → 3-up grid; divider `border-left` → `border-top` |
| **860px** | `.navlinks a:not(.btn){display:none}` — see the gap below |
| **760px** | `.feat-grid` → 1 column |
| **640px** | `.wrap` padding 32→20; nav 20→18/20; section 100→70; hero 120/90→90/60 |

Intrinsically responsive without media queries: `.board` (`auto-fit minmax(280px,1fr)`),
`.flow` (`overflow-x:auto`, `min-width:200px` steps), `clamp()` headlines, `flex-wrap` on
section heads and footer.

### ⚠️ Known gap — no mobile navigation (`INC-11`)
Below 860px the source hides all nav links with **no hamburger or drawer**;
Departments/Workflow/Features become unreachable. The application **must add** a mobile nav —
but build it from these tokens (mono uppercase labels, hairline borders, volt accents, no
radius) and **do not alter the desktop design** to accommodate it. This is `ASM-19`, an
enhancement, not an excuse to redesign.

## 8. Accessibility

Already in the source — preserve all of it: `lang="en"` · viewport meta ·
`:focus-visible{outline:2px solid var(--volt); outline-offset:3px}` (not `:focus`) ·
`prefers-reduced-motion` · `aria-hidden="true"` + `pointer-events:none` on decoration ·
`::selection{background:var(--volt); color:var(--ink)}` · AAA contrast · semantic landmarks ·
logical heading order.

Must be **added** when extending: skip-to-content link · mobile navigation ·
`aria-hidden="true"` on any reused block glyph · `scroll-margin-top` for the sticky header ·
real routes for the placeholder `href="#"` links.

> Note the asymmetry: the design is **more accessible than the requirements demand** —
> Lab 2 contains no accessibility NFR at all. Accessibility work here is an enhancement
> (`ENH`), not academic coverage. Keep it; just classify it honestly.

## 9. Visual QA procedure

**Never claim UI work is done without looking at it.** Reading CSS is not QA.

1. **Run the app** (see the `run` skill or the project's start command).
2. **Screenshot with Playwright.** Chromium is pre-installed at `/opt/pw-browsers/chromium`;
   `PLAYWRIGHT_BROWSERS_PATH` is set. Do **not** run `playwright install`.
   Capture every breakpoint: **1280 · 900 · 860 · 760 · 640 · 375**.
3. **Read every screenshot with the Read tool.** Mandatory.
4. **Compare side-by-side** with the reference: open
   `reference/design/gym-management-homepage-2.html` in the same browser and screenshot it.
5. **Run the checklist** (§10) against each screen.
6. **Record results** in `docs/ui/VISUAL_QA_REPORT.md` with the screenshot paths as evidence.

Screenshots are evidence. A QA claim without an attached image is not a result.

## 10. Visual QA checklist

Per screen, at every breakpoint:

**Identity**
- [ ] Background is `--ink` `#0c0c09` — not white, not grey, not near-black-blue
- [ ] Volt `#cbff3d` is the **only** accent; no blue/red/purple anywhere
- [ ] No `border-radius` except decorative circles
- [ ] No `box-shadow` used for elevation
- [ ] No gradient, glassmorphism or neumorphism

**Typography**
- [ ] Headings are Anton, uppercase, `line-height:0.95`
- [ ] Body is Oswald; labels/IDs/buttons are JetBrains Mono, uppercase, tracked
- [ ] Feature-style titles are the only sentence-case headings
- [ ] No system-ui/Inter/Roboto fallback is visibly rendering (check the network tab loads all 3)

**Structure**
- [ ] Sections separated by 1px `--line` hairlines, not margins
- [ ] Grids use `P-01` or `P-02`, not `gap` + margins
- [ ] Container is 1180px with 32px (→20px) gutters
- [ ] Buttons appear as one solid + one ghost pair

**Interaction**
- [ ] Card hover lifts background **and** ignites its mono ID to volt
- [ ] Solid button hover drains volt → paper
- [ ] Ghost button hover takes volt border **and** text
- [ ] Keyboard `Tab` shows the 2px volt focus ring at 3px offset
- [ ] Text selection is volt-on-ink

**Motion**
- [ ] Reveal fires once at 12% visibility, `.6s`
- [ ] With `prefers-reduced-motion: reduce` emulated, nothing animates and scroll is instant

**Responsive**
- [ ] 900px: hero collapses, stat rail goes 3-up horizontal
- [ ] 860px: nav links hide **and the added mobile nav works**
- [ ] 760px: feature grid stacks, 1px dividers still read
- [ ] 640px: gutters tighten to 20px
- [ ] 375px: no horizontal scroll, no clipped text, no overlapping elements

**Accessibility**
- [ ] Contrast ≥ 7:1 on every text pairing
- [ ] Skip link present and functional
- [ ] Decorative glyphs are `aria-hidden`
- [ ] Anchor targets are not hidden under the sticky header

## 11. UI design diagram (`DIA-12`)

Course policy Lab 7 requires a UI design diagram using the **three golden rules**.
⚠️ **No supplied document enumerates them** — they come from the prescribed textbook
(Pressman 9th ed.). Using them requires `ASM-09`; state that assumption in the deliverable:

1. **Place the user in control** — e.g. reversible actions, no forced modal flows
2. **Reduce the user's memory load** — e.g. Member ID visible throughout a flow
3. **Make the interface consistent** — e.g. the same locker-board pattern in every department

Produce `docs/diagrams/ui/ui-design.puml` + PNG plus a written analysis mapping each Ironboard
screen to the three rules. Cite `ASM-09` and the missing-source caveat.

## 12. Related skills

- `software-engineering-diagrams` — renders `DIA-12`; this skill owns its content.
- `requirements-traceability` — the UI column of each row; every screen must trace to a `US-nn`.
- `testing-and-quality` — owns accessibility/component test evidence; this skill owns the
  visual judgement.

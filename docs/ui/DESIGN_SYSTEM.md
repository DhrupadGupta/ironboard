# Ironboard — Design System

**Source of truth:** `reference/design/gym-management-homepage-2.html` (READ-ONLY)
**Extraction method:** direct reading of the CSS/HTML source — every value below is quoted
from the file, with the originating line number. Nothing here is invented or "improved".
**Status:** documentation only. The homepage must **not** be redesigned.

> **Rule:** where this document and the HTML source ever disagree, **the HTML wins**.
> Values are reproduced here for reuse across the application, not to replace the original.

---

## 1. Design intent

The homepage is a **brutalist / industrial gym-floor aesthetic**:

- Near-black "ink" ground, bone-white "paper" text, one electric "volt" accent.
- Condensed uppercase display type (Anton) against a monospace label voice (JetBrains Mono).
- **Hairline structure, not shadows.** Depth is expressed with 1px semi-transparent rules and
  a single background lift on hover — there is no `box-shadow` for elevation anywhere in the
  file, and no `border-radius` except on the decorative weight plates.
- The signature motif is the **"locker board"** — a bordered grid whose cells share hairline
  dividers, evoking a gym locker wall / weight board. The product name derives from it
  ("Put every department on **one board**").

---

## 2. Colour

### 2.1 Tokens — `:root` (lines 11–21)

| Token | Value | Role in the source |
|---|---|---|
| `--ink` | `#0c0c09` | Page background; card background; text on volt; **6 uses** |
| `--ink-2` | `#151511` | Card hover background — the only elevation step; **1 use** |
| `--ink-3` | `#1e1e18` | **Declared, 0 uses.** Reserved third elevation level |
| `--volt` | `#cbff3d` | Accent — logo mark, eyebrow, tags, list bullets, solid button, focus ring; **18 uses** |
| `--volt-dim` | `#a5d62f` | **Declared, 0 uses.** Reserved accent hover/pressed state |
| `--paper` | `#f4f3ec` | Primary text; **11 uses** |
| `--paper-dim` | `#a9a89c` | Secondary text, nav links, labels; **11 uses** |
| `--line` | `rgba(244,243,236,0.10)` | Standard hairline divider; **14 uses** |
| `--line-strong` | `rgba(244,243,236,0.22)` | Emphasised border — ghost button, feature icon, plates; **3 uses** |

> `--ink-3` and `--volt-dim` are declared but never referenced (verified by counting
> `var(--…)` occurrences). Preserve them; do not delete. See `INC-12` in the reference analysis.

### 2.2 Literal colours used outside the token set

| Value | Where | Line | Meaning |
|---|---|---|---|
| `rgba(12,12,9,0.88)` | `header` background | 58 | `--ink` at 88 % opacity, behind the blur |
| `rgba(244,243,236,0.35)` | `.logo .mark` third box-shadow | 73 | `--paper` at 35 % |
| `rgba(203,255,61,0.35)` | middle `.plate` border | 289 | `--volt` at 35 % (inline style) |

### 2.3 Contrast (computed, WCAG 2.1)

| Pair | Ratio | AA (4.5) | AAA (7.0) |
|---|---|---|---|
| `--paper` on `--ink` | **17.61 : 1** | ✅ | ✅ |
| `--volt` on `--ink` | **16.71 : 1** | ✅ | ✅ |
| `--ink` on `--volt` (solid button, count badge) | **16.71 : 1** | ✅ | ✅ |
| `--paper-dim` on `--ink` | **8.18 : 1** | ✅ | ✅ |
| `--paper-dim` on `--ink-2` (card hover) | **7.64 : 1** | ✅ | ✅ |

All text pairings clear AAA. Preserve these pairings when extending the system.

### 2.4 ⚠️ Accent-colour conflict in the reference set

`reference/lab2/…SE_Lab2.pdf` embeds screenshots of this same layout in **two other accent
colours**: blue/indigo (≈`#4a4ad4`, p.8) and red/crimson (≈`#d94a4a`, pp.9–10). The supplied
HTML — filename suffix `-2` — uses volt green.

**Resolution:** `--volt: #cbff3d` governs, per the instruction that the HTML is the visual
source of truth. The conflict is recorded as `CON-06`, not silently reconciled.

---

## 3. Typography

### 3.1 Families (line 9 — Google Fonts)

```
https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap
```

| Family | Weights loaded | Role |
|---|---|---|
| **Anton** | 400 (single weight) | Display — `h1`, `h2`, `h3`, `.display`, `.logo`, `.stat .num` |
| **Oswald** | 400, 500, 600, 700 | Body — `body` default, plus `.feat h3` at 600 |
| **JetBrains Mono** | 400, 500 | Labels — `.mono`, nav, buttons, tags, stats, footer meta |

`display=swap` is used. Both `fonts.googleapis.com` and `fonts.gstatic.com` are preconnected
(lines 7–8, `crossorigin` on the latter).

### 3.2 Base rules

| Selector | Declarations | Line |
|---|---|---|
| `*` | `margin:0; padding:0; box-sizing:border-box` | 22 |
| `html` | `scroll-behavior:smooth` | 23 |
| `body` | `background:var(--ink); color:var(--paper); font-family:'Oswald',sans-serif; font-weight:400; line-height:1.5; overflow-x:hidden` | 24–31 |
| `h1,h2,h3,.display` | `font-family:'Anton',sans-serif; font-weight:400; text-transform:uppercase; letter-spacing:0.01em; line-height:0.95` | 32–38 |
| `.mono` | `font-family:'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:0.12em; font-size:12px` | 39–44 |
| `a` | `color:inherit; text-decoration:none` | 45 |

**Display line-height is `0.95`** — tighter than the cap height, producing the stacked,
poster-like headline blocks. Headlines in the source use explicit `<br>` to control ragging.

### 3.3 Type scale — every size in the file

| Role | Selector | Size | Family | Tracking | Line-height | Line |
|---|---|---|---|---|---|---|
| Hero headline | `.hero h1` | `clamp(52px, 7.2vw, 96px)` | Anton | 0.01em | 0.95 | 126 |
| CTA headline | `.cta h2` | `clamp(38px, 6vw, 68px)` | Anton | 0.01em | 0.95 | 225 |
| Section headline | `.section-head h2` | `clamp(34px, 4vw, 52px)` | Anton | 0.01em | 0.95 | 155 |
| Stat number | `.stat .num` | `40px` | Anton | — | — | 141–143 |
| Card title | `.card h3` | `26px` | Anton | 0.01em | 0.95 | 186 |
| Logo | `.logo` | `22px` | Anton | 0.02em | — | 66–70 |
| Feature title | `.feat h3` | `19px` | **Oswald 600** | — | — | 217 |
| Hero sub | `.hero-sub` | `17px` | Oswald | — | 1.7 | 130–132 |
| Section sub | `.section-head p` | `15px` | Oswald | — | 1.7 | 156 |
| Card description | `.card p.desc` | `14.5px` | Oswald | — | 1.7 | 187 |
| Feature body | `.feat p` | `14px` | Oswald | — | 1.7 | 218 |
| Flow step body | `.flow-step p` | `14px` | Oswald | — | 1.6 | 204 |
| Footer link | `.foot-col a` | `14px` | Oswald | — | — | 239 |
| Card list item | `.card li` | `13.5px` | Oswald | — | — | 189–192 |
| `.mono` base | `.mono` | `12px` | JetBrains Mono | 0.12em | — | 39–44 |
| Section tag | `.tag` | `12px` | JetBrains Mono | **0.14em** | — | 157–160 |
| Nav link | `.navlinks a` | `12px` | JetBrains Mono | 0.10em | — | 76–82 |
| Button | `.btn` | `12px` | JetBrains Mono | 0.10em | — | 84–92 |
| Card ID | `.tag-id` | `12px` | JetBrains Mono | 0.12em (`.mono`) | — | 178–181 |
| Stat label | `.stat .lbl` | `11px` | JetBrains Mono | 0.10em | — | 144–147 |
| Card count badge | `.card-count` | `11px` | JetBrains Mono | — | — | 182–185 |
| Footer column head | `.foot-col h4` | `11px` | JetBrains Mono | 0.12em | — | 235–238 |
| Footer bottom | `.foot-bottom` | `11px` | JetBrains Mono | **0.08em** | — | 241–246 |

### 3.4 Hierarchy rules

1. **Three voices, strictly separated.** Anton = headline. Oswald = prose. JetBrains Mono =
   any label, ID, tag, button or metric caption. Never mix roles.
2. **Everything monospace is uppercase and tracked out** (0.08em–0.14em). Tracking rises as
   size falls, except `.foot-bottom` (0.08em) which is deliberately the quietest.
3. **All Anton is uppercase** via the shared `h1,h2,h3,.display` rule.
4. **One deliberate exception:** `.feat h3` (line 217) overrides the heading rule with
   `text-transform:none; font-family:'Oswald'; font-weight:600`. Feature titles are sentence
   case — the only sentence-case headings in the page. This is intentional; preserve it.
5. **Prose line-height is 1.7** for reading blocks (`.hero-sub`, `.section-head p`,
   `.card p.desc`, `.feat p`), `1.6` for the tighter flow steps, `1.5` on `body`.
6. **Three fluid `clamp()` headlines only.** Everything else is fixed-size.

---

## 4. Spacing & layout

### 4.1 Container

```css
.wrap{max-width:1180px; margin:0 auto; padding:0 32px;}   /* line 46 */
@media(max-width:640px){ .wrap{padding:0 20px;} }         /* line 255 */
```

`nav` repeats the same measure independently: `max-width:1180px; margin:0 auto; padding:20px 32px`
(lines 62–65), because `<nav>` sits outside `.wrap`.

**Full-bleed grid technique:** the department board and feature grid are wrapped in
`<div class="wrap" style="padding:0;">` (lines 320, 436) so the grid's own borders sit flush
at the 1180px measure with no inner gutter.

### 4.2 Vertical rhythm

| Region | Padding | Mobile (≤640px) | Line |
|---|---|---|---|
| `nav` | `20px 32px` | `18px 20px` | 64 / 256 |
| `.hero` | `120px 0 90px` | `90px 0 60px` | 102 / 259 |
| `.section` | `100px 0` | `70px 0` | 150 / 257 |
| `.cta` | `110px 0` | — | 223 |
| `footer` | `50px 0 40px` | — | 230 |

### 4.3 Component padding

| Component | Padding | Line |
|---|---|---|
| `.card` (department) | `36px 32px` | 168 |
| `.feat` | `34px 30px` | 211 |
| `.flow-step` | `30px 26px` | 200 |
| `.btn` | `12px 22px` | 86 |
| `.card-count` badge | `4px 9px` | 184 |
| `.hero-side` | `padding-left:36px` | 136 |
| `.hero-side .stat` | `18px 0` | 138 |

### 4.4 Gaps

| Context | Gap | Line |
|---|---|---|
| `.hero-grid` | `60px` | 118 |
| `.foot-cols` | `60px` | 234 |
| `.navlinks` | `36px` | 75 |
| `.section-head` | `40px` | 152 |
| `.foot-grid` | `26px` | 232 |
| `.hero-cta`, `.cta-actions` | `16px` | 133 / 227 |
| `.logo` | `10px` | 67 |
| `.eyebrow` | `10px` | 122 |
| `.card li` | `10px` | 191 |
| `.btn` internal | `8px` | 85 |
| `.feat-grid` | **`1px`** (hairline technique) | 208 |

**Observed spacing set:** `1, 4, 8, 9, 10, 12, 14, 16, 18, 20, 22, 26, 30, 32, 34, 36, 40, 50,
56, 60, 70, 90, 100, 110, 120` px. Broadly a 2px-base scale favouring multiples of 4 and 6;
it is **not** a strict 8pt grid. Do not "regularise" it.

### 4.5 Section separation

Sections are separated by **hairline borders, never margins**:

```css
.hero{border-bottom:1px solid var(--line);}      /* line 103 */
.section{border-bottom:1px solid var(--line);}   /* line 150 */
```

`.cta` and `footer` have **no** bottom border — the page ends open.

### 4.6 Grid systems

| Grid | Definition | Line |
|---|---|---|
| Hero | `grid-template-columns:1.4fr 1fr; gap:60px; align-items:end` | 118 |
| Department board | `grid-template-columns:repeat(auto-fit,minmax(280px,1fr))` | 164 |
| Feature grid | `grid-template-columns:repeat(3,1fr); gap:1px; background:var(--line)` | 208 |
| Workflow strip | `display:flex; overflow-x:auto; gap:0` — steps `flex:1; min-width:200px` | 197, 200 |
| Hero stats ≤900px | `grid-template-columns:repeat(3,1fr); gap:20px` | 251 |

**Two different hairline techniques are used — both must be preserved:**

- **Board (`.board`)** — container has `border:1px solid var(--line)`; each `.card` carries
  `border-right` + `border-bottom`. Because the grid is `auto-fit`, trailing cells in a partial
  final row leave visible open edges. This is the authentic "locker board" look seen in the
  Lab 2 screenshots (5 cards → 4 + 1, with the last row open to the right). **Not a bug.**
- **Feature grid (`.feat-grid`)** — no borders at all; the container background is `--line`
  and `gap:1px` lets it show through as dividers, while each `.feat` repaints `--ink`.

---

## 5. Navigation

```css
header{
  position:sticky; top:0; z-index:100;
  background:rgba(12,12,9,0.88);
  backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line);
}                                                   /* lines 56–61 */
nav{display:flex; align-items:center; justify-content:space-between;
    padding:20px 32px; max-width:1180px; margin:0 auto;}   /* 62–65 */
```

**Structure** (lines 273–284): logo left; right cluster of three anchor links + two buttons.

| Item | Type | Target |
|---|---|---|
| Departments | `.navlinks a` | `#departments` |
| Workflow | `.navlinks a` | `#workflow` |
| Features | `.navlinks a` | `#features` |
| Sign in | `.btn .btn-ghost` | `#` |
| Get started | `.btn .btn-solid` | `#` |

**States:** links rest at `--paper-dim`, hover to `--paper` over `.2s ease` (lines 79–83).

**Logo mark** (lines 71–74) — the system's core motif:

```css
.logo .mark{
  width:14px; height:14px; background:var(--volt);
  box-shadow:4px 0 0 var(--paper), 8px 0 0 rgba(244,243,236,0.35);
}
```

A 14px volt square whose two box-shadows fake a receding row of three squares — a stack of
weight plates, echoing the hero `.plate-row`. Used in both header (line 275) and footer (486).

### ⚠️ Mobile navigation gap

```css
@media(max-width:860px){ .navlinks a:not(.btn){display:none;} }   /* line 97 */
```

Below **860px** the three section links are hidden with **no hamburger, drawer, or
replacement** — only the two buttons remain. `Departments`, `Workflow` and `Features` become
unreachable from the nav. This is a genuine gap in the source (recorded as `INC-11`). Any
application navigation will need a mobile pattern **added using these tokens**, without
altering the desktop design.

---

## 6. Cards

### 6.1 Department card — `.card` (lines 167–193)

```css
.card{
  padding:36px 32px;
  border-right:1px solid var(--line);
  border-bottom:1px solid var(--line);
  background:var(--ink);
  transition:background .25s ease;
  position:relative;
}
.card:hover{background:var(--ink-2);}
.card:hover .tag-id{color:var(--volt);}
```

Anatomy, in source order (lines 323–334):

1. `.card-top` — `flex; justify-content:space-between; align-items:flex-start; margin-bottom:26px`
2. `.tag-id.mono` — `Dept / 01`, JetBrains Mono 12px, `--paper-dim`, **→ `--volt` on card hover**
3. `.card-count` — `5 stories`, JetBrains Mono 11px, `--ink` text on **`--volt`** background,
   `padding:4px 9px` (a solid volt chip — the only filled label in the page)
4. `.card h3` — Anton 26px uppercase, `margin-bottom:14px`
5. `.card p.desc` — Oswald 14.5px, `--paper-dim`, `line-height:1.7`, `margin-bottom:20px`
6. `.card ul` — `list-style:none`; each `li` is `13.5px`, `padding:9px 0`,
   `border-top:1px solid var(--line)`, `display:flex; gap:10px`
7. `.card li::before` — `content:'—'` in `--volt`, `flex-shrink:0` (em-dash bullets that never
   collapse on wrap)

**Two hover effects fire together** — background lifts `--ink` → `--ink-2` (`.25s`) *and* the
department ID ignites to volt (`.2s`). This paired reaction is the board's signature interaction.

### 6.2 Feature card — `.feat` (lines 211–218)

```css
.feat{background:var(--ink); padding:34px 30px;}
.feat .icon{
  width:42px; height:42px; border:1px solid var(--line-strong);
  display:flex; align-items:center; justify-content:center;
  margin-bottom:20px; color:var(--volt);
}
```

Icons are **Unicode block glyphs**, not an icon font: `◧ ◫ ◨ ◩ ◪ ▦` (lines 439–464), rendered
volt inside a 42px hairline square. Feature cards have **no hover state** — they are
informational, not interactive.

### 6.3 Flow step — `.flow-step` (lines 199–204)

```css
.flow-step{flex:1; min-width:200px; padding:30px 26px; border-right:1px solid var(--line);}
.flow-step:last-child{border-right:none;}
.flow-step .mono{color:var(--volt); display:block; margin-bottom:14px;}
```

Volt monospace department label over `14px/1.6` dim body copy. No hover state.

---

## 7. Buttons

```css
.btn{
  display:inline-flex; align-items:center; gap:8px;
  padding:12px 22px;
  font-family:'JetBrains Mono',monospace;
  font-size:12px; letter-spacing:0.1em; text-transform:uppercase;
  border:1px solid var(--line-strong);
  transition:all .2s ease;
  white-space:nowrap;
}                                                              /* lines 84–92 */
.btn-solid{background:var(--volt); color:var(--ink); border-color:var(--volt); font-weight:500;}
.btn-solid:hover{background:var(--paper); border-color:var(--paper);}
.btn-ghost{color:var(--paper);}
.btn-ghost:hover{border-color:var(--volt); color:var(--volt);}
```

| Variant | Rest | Hover |
|---|---|---|
| **Solid** (primary) | volt fill, ink text, weight 500 | **paper fill**, ink text — accent drains to bone-white |
| **Ghost** (secondary) | transparent, paper text, `--line-strong` border | volt border **and** volt text |

Two variants only. **No border-radius** — every button is a hard rectangle.
`white-space:nowrap` prevents label wrapping at any breakpoint.

**Pairings in the source:** hero (`Explore departments` solid + `See how it works` ghost),
nav (`Sign in` ghost + `Get started` solid), CTA (`Request a demo` solid + `Talk to sales` ghost).
Primary-solid is always paired with exactly one ghost.

---

## 8. Borders & rules

| Purpose | Value | Example |
|---|---|---|
| Standard divider | `1px solid var(--line)` | section bottoms, card edges, list item tops, stat rows |
| Emphasised border | `1px solid var(--line-strong)` | `.btn` default, `.feat .icon`, `.plate` |
| Decorative plate | `2px solid var(--line-strong)` | `.plate` (line 114) |
| Vertical rule | `border-left:1px solid var(--line)` | `.hero-side` (line 135) |
| Footer rule | `border-top:1px solid var(--line)` | `.foot-bottom` (line 242) |
| Eyebrow dash | `26px × 1px`, `background:var(--volt)` | `.eyebrow::before` (line 124) |

**`border-radius` is used exactly once:** `border-radius:50%` on `.plate` (line 113). Every
other element in the page is a hard rectangle. This is a defining rule of the system.

**No `box-shadow` is used for elevation.** The only `box-shadow` in the file fakes the
three-square logo mark (line 73).

---

## 9. Animation & motion

### 9.1 Reveal on scroll

```css
.reveal{opacity:0; transform:translateY(16px);
        transition:opacity .6s ease, transform .6s ease;}
.reveal.in{opacity:1; transform:translateY(0);}         /* lines 263–264 */
```

```js
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));   /* lines 514–517 */
```

- Threshold **0.12** — fires when 12 % of the element is visible.
- **`io.unobserve` after firing** — one-shot; elements never re-animate. Preserve this.
- Applied to: every `.section-head`, `.board`, `.flow`, `.feat-grid`, and the three CTA children.

### 9.2 Reduced motion (lines 265–268)

```css
@media (prefers-reduced-motion: reduce){
  .reveal{opacity:1; transform:none; transition:none;}
  html{scroll-behavior:auto;}
}
```

Reveal is **fully neutralised** (not merely shortened) and smooth scrolling is disabled.
This is mandatory behaviour, not optional polish.

### 9.3 Transition inventory

| Element | Property | Duration | Easing | Line |
|---|---|---|---|---|
| `.navlinks a` | `color` | `.2s` | ease | 80 |
| `.btn` | `all` | `.2s` | ease | 90 |
| `.tag-id` | `color` | `.2s` | ease | 180 |
| `.card` | `background` | `.25s` | ease | 172 |
| `.reveal` | `opacity`, `transform` | `.6s` | ease | 263 |

**Only two durations exist: `.2s`/`.25s` for interaction, `.6s` for entrance.** Easing is
always the `ease` keyword — no custom cubic-bézier anywhere.

`html{scroll-behavior:smooth}` (line 23) drives the anchor navigation.

### 9.4 Decorative weight plates (lines 106–116, 287–291)

```css
.plate-row{
  position:absolute; right:-120px; top:50%; transform:translateY(-50%);
  display:flex; align-items:center; opacity:0.9; pointer-events:none;
}
.plate{border-radius:50%; border:2px solid var(--line-strong);
       display:flex; align-items:center; justify-content:center;}
```

Three overlapping circles, sized and offset inline:

| Plate | Size | Offset | Border |
|---|---|---|---|
| 1 | `340px` | — | `--line-strong` |
| 2 | `240px` | `margin-left:-290px` | `rgba(203,255,61,0.35)` — volt @ 35 % |
| 3 | `150px` | `margin-left:-195px` | `--line-strong` |

Container is `aria-hidden="true"` and `pointer-events:none`; the hero clips it with
`overflow:hidden`. **Static — the plates do not animate.**

---

## 10. Responsive behaviour

Four breakpoints, all `max-width`. They are **not** a uniform scale — each targets one
specific failure.

### `≤900px` — hero collapse (lines 248–253)
```css
.hero-grid{grid-template-columns:1fr;}
.hero-side{border-left:none; border-top:1px solid var(--line);
           padding-left:0; padding-top:30px;
           display:grid; grid-template-columns:repeat(3,1fr); gap:20px;}
.hero-side .stat{border-bottom:none; padding:0;}
```
The stat rail rotates from a **vertical bordered list** to a **horizontal 3-up grid**, and its
divider migrates from `border-left` to `border-top`.

### `≤860px` — nav links hidden (line 97)
```css
.navlinks a:not(.btn){display:none;}
```
See §5 — no replacement pattern is provided.

### `≤760px` — features stack (line 219)
```css
.feat-grid{grid-template-columns:1fr;}
```
The 1px gap keeps working as a horizontal divider between stacked cards.

### `≤640px` — compact padding (lines 254–260)
```css
.wrap{padding:0 20px;}
nav{padding:18px 20px;}
.section{padding:70px 0;}
.section-head{flex-direction:column; align-items:flex-start;}
.hero{padding:90px 0 60px;}
```

### Intrinsically responsive (no media query needed)

| Component | Mechanism |
|---|---|
| `.board` | `repeat(auto-fit, minmax(280px,1fr))` — reflows 5 → 4 → 3 → 2 → 1 columns |
| `.flow` | `overflow-x:auto` with `min-width:200px` steps — scrolls horizontally instead of wrapping |
| Headlines | `clamp()` on hero, section and CTA |
| `.section-head` | `flex-wrap:wrap` |
| `.foot-grid`, `.foot-cols`, `.foot-bottom` | `flex-wrap:wrap` |
| `body` | `overflow-x:hidden` — contains the off-canvas plate row |

---

## 11. Page sections

| # | Section | Selector | Content |
|---|---|---|---|
| 1 | **Header** | `header > nav` | Logo, 3 links, 2 buttons. Sticky, blurred, `z-index:100` |
| 2 | **Hero** | `.hero` | Eyebrow "Gym Operations Platform"; headline "One system. / Every **department** / on the same floor."; sub-copy; 2 CTAs; 3-stat rail (`05` departments / `25` user stories / `01` source of truth); decorative plate row |
| 3 | **Departments** | `.section#departments` | Tag "Departments"; headline "Built around who / actually runs the gym."; 5-card locker board |
| 4 | **Workflow** | `.section#workflow` | Tag "How it flows"; headline "From walk-in / to renewal."; 5-step strip: Reception → Membership → Trainer → Accounting → Admin |
| 5 | **Features** | `.section#features` | Tag "Platform features"; headline "Everything each / role actually needs."; 6-cell feature grid |
| 6 | **CTA** | `.cta` | Centred. Tag "Get started"; headline "Put every department / on **one board.**"; 2 CTAs. `text-align:center`, `h2` capped at `820px` and auto-centred |
| 7 | **Footer** | `footer` | Logo; 3 link columns (two both titled "Departments", one "Product"); bottom bar with copyright + module list |

### Section header pattern (`.section-head`, lines 151–160)

```css
.section-head{
  display:flex; justify-content:space-between; align-items:flex-end;
  gap:40px; margin-bottom:56px; flex-wrap:wrap;
}
.section-head p{max-width:380px; color:var(--paper-dim); font-size:15px;
                line-height:1.7; padding-bottom:6px;}
.tag{font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:0.14em;
     text-transform:uppercase; color:var(--volt); margin-bottom:14px; display:block;}
```

Consistent across sections 3, 4 and 5: **volt mono tag → Anton headline with `<br>` → dim
prose capped at 380px, baseline-aligned right.** `padding-bottom:6px` optically aligns the
prose baseline to the headline's descender. Reproduce this pattern for any new section.

### Footer note

Two footer columns are **both headed "Departments"** (lines 489, 495) — the five departments
split across two columns rather than one long list. Intentional layout, not a duplication bug.

---

## 12. Interaction inventory

| Trigger | Effect | Line |
|---|---|---|
| `.navlinks a:hover` | `--paper-dim` → `--paper` | 83 |
| `.btn-solid:hover` | volt fill → paper fill (bg + border) | 94 |
| `.btn-ghost:hover` | border + text → volt | 96 |
| `.card:hover` | background `--ink` → `--ink-2` | 175 |
| `.card:hover .tag-id` | `--paper-dim` → `--volt` | 176 |
| `.foot-col a:hover` | `--paper` → `--volt`, `opacity .82` → `1` | 240 |
| `a:focus-visible`, `button:focus-visible` | `outline:2px solid var(--volt); outline-offset:3px` | 50–53 |
| `::selection` | `background:var(--volt); color:var(--ink)` | 47 |
| Scroll into view | `.reveal` → `.reveal.in` | 514–517 |
| Anchor click | smooth scroll | 23 |

**Every hover state resolves toward volt or paper — never away.** Focus uses `:focus-visible`
(not `:focus`), so keyboard users get the ring without mouse users seeing it.

---

## 13. Reusable design patterns

Named patterns to carry into the application. Reuse these rather than inventing new ones.

| Pattern | Rule | Source |
|---|---|---|
| **P-01 Locker board** | Bordered container + cells with `border-right`/`border-bottom`, `auto-fit minmax(280px,1fr)` | `.board`/`.card` |
| **P-02 Hairline gap grid** | Container background `--line` + `gap:1px`; children repaint `--ink` | `.feat-grid` |
| **P-03 Section header triad** | Volt mono tag → Anton headline w/ `<br>` → 380px dim prose, baseline-aligned | `.section-head` |
| **P-04 Mono label voice** | Any ID, tag, metric caption or button: JetBrains Mono, uppercase, 11–12px, 0.08–0.14em | `.mono`, `.tag`, `.tag-id`, `.lbl` |
| **P-05 Volt chip** | Solid `--volt` background + `--ink` text, `4px 9px` — the only filled label | `.card-count` |
| **P-06 Em-dash bullet** | `li::before{content:'—'; color:var(--volt); flex-shrink:0}` with `display:flex; gap:10px` | `.card li` |
| **P-07 Paired hover** | Background lift **plus** an accent ignite on a child, two durations | `.card` + `.tag-id` |
| **P-08 Two-button CTA** | Exactly one `.btn-solid` + one `.btn-ghost`, `gap:16px` | hero, nav, CTA |
| **P-09 Stat rail** | Anton 40px numeral over mono 11px label, hairline-separated; vertical → 3-up ≤900px | `.hero-side` |
| **P-10 Scroll-scrolling strip** | `flex` + `overflow-x:auto` + `min-width` steps; no wrap, no media query | `.flow` |
| **P-11 One-shot reveal** | `IntersectionObserver` @ 0.12 + `unobserve`, `.6s`, reduced-motion neutralised | `.reveal` |
| **P-12 Plate motif** | Overlapping bordered circles / triple-square logo mark; `aria-hidden`, `pointer-events:none` | `.plate-row`, `.logo .mark` |
| **P-13 Hairline separation** | Sections divided by `border-bottom`, never by margin | `.section` |
| **P-14 Full-bleed grid** | `<div class="wrap" style="padding:0">` so grid borders sit flush at the measure | lines 320, 436 |

---

## 14. Accessibility

### Present in the source

| Feature | Implementation | Line |
|---|---|---|
| Language declared | `<html lang="en">` | 2 |
| Responsive viewport | `<meta name="viewport" content="width=device-width, initial-scale=1.0">` | 5 |
| Visible focus ring | `:focus-visible` → 2px volt, 3px offset | 50–53 |
| Reduced motion honoured | Reveal + smooth scroll fully disabled | 265–268 |
| Decoration hidden from AT | `.plate-row` has `aria-hidden="true"` | 287 |
| Decoration not interactive | `pointer-events:none` | 110 |
| AAA contrast | All five text pairings ≥ 7:1 (§2.3) | — |
| Semantic landmarks | `<header>`, `<nav>`, `<section>`, `<footer>` | — |
| Logical heading order | `h1` (hero) → `h2` (sections) → `h3` (cards) | — |

### Gaps to address when extending (do **not** fix by redesigning the homepage)

| Gap | Detail |
|---|---|
| **No mobile navigation** | Links hidden ≤860px with no alternative (§5, `INC-11`) |
| **No skip link** | No skip-to-content anchor before the sticky header |
| **Decorative glyphs unlabelled** | `◧ ◫ ◨ ◩ ◪ ▦` are read by screen readers; each needs `aria-hidden="true"` when reused |
| **Sticky header offset** | `scroll-behavior:smooth` + `position:sticky` can land anchor targets under the header; no `scroll-margin-top` is set |
| **Placeholder links** | `Sign in`, `Get started`, `Request a demo`, `Talk to sales` are all `href="#"` |
| **Empty `.logo .mark`** | Decorative `<span>` with no text or `aria-hidden` |

---

## 15. Copy voice

Observed from the source; follow it for any new interface text.

- **Headlines:** short declaratives broken across lines with `<br>`, ending in a full stop.
  *"One system. Every department on the same floor."* / *"From walk-in to renewal."*
- **Accent word:** exactly one word or phrase per headline wrapped in `.accent` (volt).
  Hero → "department"; CTA → "one board."
- **Tags:** two or three words, uppercase mono. *"Departments"*, *"How it flows"*,
  *"Platform features"*, *"Get started"*.
- **Body:** plain operational language with em-dashes. *"The first touchpoint — registration,
  verification and the daily front-desk rhythm."*
- **Domain vocabulary:** *board*, *floor*, *department*, *front desk*, *ledger*, *touchpoint*,
  *member*, *prospect*, *plan*, *session*. The gym-floor metaphor is sustained throughout —
  keep it.

---

## 16. Extension checklist

Before adding any new UI to Ironboard, verify:

- [ ] Colours come from the nine `:root` tokens — no new hex values
- [ ] Type uses only Anton / Oswald / JetBrains Mono, in their assigned roles (§3.4)
- [ ] Labels, IDs and buttons use the mono voice, uppercase, tracked
- [ ] `border-radius: 0` — circles only for the plate motif
- [ ] Separation by 1px `--line` hairlines, not shadows or margins
- [ ] Hover states resolve **toward** volt or paper
- [ ] Focus uses `:focus-visible` with the 2px volt ring
- [ ] New motion is `.2s`/`.25s` (interaction) or `.6s` (entrance), easing `ease`
- [ ] `prefers-reduced-motion` neutralises any new animation
- [ ] Contrast against `--ink` / `--ink-2` stays ≥ 7:1
- [ ] Reuses a pattern from §13 rather than introducing a new one
- [ ] The homepage source file itself remains **unmodified**

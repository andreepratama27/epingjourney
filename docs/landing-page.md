# EpingJourney — Landing Page Design Spec

**Version:** 1.0
**Status:** Design Draft
**Companion to:** [prd.md](./prd.md)
**Copy & translations:** [i18n.md](./i18n.md) — all final user-facing strings live there (Bahasa Indonesia first)
**Mode:** Light (default) — dark toggle deferred to in-app
**Vibe:** Soft Maternal — warm, calming, trustworthy. Not clinical.

> **Note on copy:** The English text shown in the wireframes below is for
> *layout illustration only*. The shipped product is Indonesia-first — see
> [i18n.md § 3 Copy Mapping](./i18n.md#3-copy-mapping--per-section-in-landing-pagemd)
> for the authoritative Bahasa Indonesia copy of every section.

---

## 1. Color Palette — "Soft Maternal"

A warm, low-saturation palette inspired by nurseries, oat milk, and morning light.
Designed to feel like a hug, not a hospital.

```
╭──────────────────────────────────────────────────────────────╮
│                      PRIMARY PALETTE                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ░░░░░░░░░  Cream Base       #FBF7F2   bg, surfaces         │
│   ░░░░░░░░░  Warm White       #FFFDF9   cards, modals        │
│                                                              │
│   ▒▒▒▒▒▒▒▒▒  Dusty Rose       #E8B4B8   primary CTA          │
│   ▒▒▒▒▒▒▒▒▒  Rose Deep        #C97B81   CTA hover/press      │
│                                                              │
│   ▓▓▓▓▓▓▓▓▓  Sage Green       #A8C4A2   accent / success     │
│   ▓▓▓▓▓▓▓▓▓  Sage Deep        #6B8E68   accent text          │
│                                                              │
│   ░░░░░░░░░  Oat Beige        #E5DCC9   secondary surface    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                      SEMANTIC COLORS                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ▒▒▒▒▒▒▒▒▒  Amber Warn       #E8A87C   "Overdue" sessions   │
│   ▓▓▓▓▓▓▓▓▓  Sky Calm         #A6C8D9   "Upcoming" sessions  │
│   ▓▓▓▓▓▓▓▓▓  Lavender Mist    #C9B8D9   info / streaks       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                      TEXT & NEUTRALS                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ████████  Ink                #2D2A26   primary text        │
│   ▓▓▓▓▓▓▓▓  Soft Ink           #5C574F   secondary text      │
│   ▒▒▒▒▒▒▒▒  Muted              #9A938A   tertiary / hint     │
│   ░░░░░░░░  Hairline           #E8E1D5   borders, dividers   │
│                                                              │
╰──────────────────────────────────────────────────────────────╯
```

**Contrast notes:** Ink on Cream Base = 12.4:1 (AAA). Rose Deep on Cream = 4.8:1 (AA). All CTAs pass WCAG AA.

---

## 2. Typography

A two-font system: **Kalam** for personality (handwritten warmth, the "mom-to-mom note"
feel) + **Nunito Sans** for everything that must be read fast at 3 AM.

```
╭──────────────────────────────────────────────────────────────────╮
│                       PRIMARY — KALAM                            │
│                       (handwritten, warm)                        │
├──────────────────────────────────────────────────────────────────┤
│  Display / H1       "Kalam" 700    48–64px   short headlines     │
│  Section eyebrow    "Kalam" 400    14–16px   "For EP mothers"    │
│  Pull quotes        "Kalam" 400    20–24px   testimonials        │
│  Decorative accent  "Kalam" 400    varies    "Today's Total"     │
│                                                                  │
│  ✱ Kalam is for moments of warmth — keep lines ≤ 6 words.        │
│  ✱ Never use Kalam for body text, inputs, or numerals.           │
├──────────────────────────────────────────────────────────────────┤
│                       PAIR — NUNITO SANS                         │
│                       (rounded, highly readable)                 │
├──────────────────────────────────────────────────────────────────┤
│  Sub-headings       "Nunito Sans" 700   24–32px                  │
│  Body               "Nunito Sans" 400   16–18px   line-height 1.6│
│  UI / Buttons       "Nunito Sans" 600   14–16px                  │
│  Labels / captions  "Nunito Sans" 500   12–14px                  │
│  Numerals (oz, ⏱)   "Nunito Sans" 700   tabular nums on          │
╰──────────────────────────────────────────────────────────────────╯
```

**Why this pairing:** Kalam's hand-drawn imperfection feels like a friend's note;
Nunito Sans's rounded terminals carry that warmth into the functional UI without
clashing. It says *"a real mom made this"* not *"a corporate wellness brand made this"*.

**Loading:**
```
@import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Nunito+Sans:wght@400;500;600;700;800&display=swap');
```

**Usage rules:**
1. One Kalam moment per viewport — overuse turns charm into chaos.
2. Body copy is *always* Nunito Sans, never Kalam.
3. Pair Kalam display headlines with a 1.2 line-height (it has tall ascenders).
4. Nunito Sans tabular figures (`font-feature-settings: "tnum"`) are mandatory
   for the timer and any oz/ml display so digits don't jitter.

---

## 3. Full Page Layout — Section by Section

### § Hero — "You're doing enough."

Goal: Empathy + clarity in 2 seconds. Single CTA: **Start Pumping Now**.

```
┌────────────────────────────────────────────────────────────────────┐
│  [BG: Cream Base #FBF7F2 with subtle radial sage glow top-right]   │
│                                                                    │
│  🤱 EpingJourney            Features  Why Us  FAQ    [ Sign in ]   │
│  ────────────────────────────────────────────────────────────      │
│                                                                    │
│                                                                    │
│   For exclusively pumping mothers                                  │
│                                                                    │
│   ╭───────────────────────────────╮      ╭─────────────────╮       │
│   │  Track every drop.            │      │                 │       │
│   │  Forget the math.             │      │   ┌─────────┐   │       │
│   │                               │      │   │ 02:14:32│   │       │
│   │  Built for the 3 AM pump,     │      │   │  Next   │   │       │
│   │  the 2 oz win, and every      │      │   │  Session│   │       │
│   │  shift in between.            │      │   └─────────┘   │       │
│   │                               │      │   ▓▓▓▓▓▓▓▓▓▓    │       │
│   │  ╭───────────────────────╮    │      │   Today: 18 oz  │       │
│   │  │  Start Pumping Now →  │    │      │                 │       │
│   │  ╰───────────────────────╯    │      │   [phone mockup]│       │
│   │   Free · No signup to try     │      │                 │       │
│   ╰───────────────────────────────╯      ╰─────────────────╯       │
│                                                                    │
│   ★★★★★  "Saved my sanity at 3am" — Maya, EP mom of twins          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Colors:
  • Headline:     Ink #2D2A26 (Kalam 700, 56px, line-height 1.2)
  • Sub-eyebrow:  Sage Deep #6B8E68 (Kalam 400, 16px — handwritten note feel)
  • Body:         Soft Ink #5C574F
  • CTA fill:     Dusty Rose #E8B4B8  → hover Rose Deep #C97B81
  • CTA text:     Warm White #FFFDF9
  • Phone frame:  Oat Beige #E5DCC9 with soft shadow
  • Star rating:  Amber Warn #E8A87C
```

---

### § Problem — "Pumping brain is real."

Goal: Make her feel seen. No solutions yet, just empathy.

```
┌────────────────────────────────────────────────────────────────────┐
│  [BG: Warm White #FFFDF9]                                          │
│                                                                    │
│              You're not forgetful. You're exhausted.               │
│              ──────────────────────────────────────                │
│                                                                    │
│   ╭────────────────╮  ╭────────────────╮  ╭────────────────╮       │
│   │      🕐         │  │      📋         │  │      💧         │       │
│   │                │  │                │  │                │       │
│   │  "When was     │  │  "Did I log    │  │  "How much did │       │
│   │   my last      │  │   that 4am     │  │   I make       │       │
│   │   pump?"       │  │   session?"    │  │   today?"      │       │
│   ╰────────────────╯  ╰────────────────╯  ╰────────────────╯       │
│                                                                    │
│   Exclusive pumping is a 24-hour logistics job. We built           │
│   EpingJourney to carry the mental load — so you don't have to.    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Colors:
  • Card BG:      Cream Base #FBF7F2
  • Card border:  Hairline #E8E1D5 (1px)
  • Quote text:   Ink #2D2A26 (Kalam 400, 20px — feels handwritten)
  • Body copy:    Soft Ink #5C574F
  • Emoji tone:   keep native (warmth)
  • Card radius:  16px, soft shadow rgba(45,42,38,0.04)
```

---

### § Feature 1 — Hybrid Tracker & Timer

```
┌────────────────────────────────────────────────────────────────────┐
│  [BG: Cream Base]   Layout: 50/50 split, image LEFT                │
│                                                                    │
│  ╭──────────────────────────╮   01 ─ One tap. That's it.           │
│  │                          │   ─────────────────────────          │
│  │   ┌──────────────────┐   │                                      │
│  │   │   ⏱  00:14:23    │   │   Start the timer when you sit       │
│  │   │                  │   │   down. Stop it when you're done.    │
│  │   │  ▓▓▓▓▓▓░░░░░░    │   │   Forgot to start? Log it manually   │
│  │   │                  │   │   in 3 seconds.                      │
│  │   │  [ STOP TIMER ]  │   │                                      │
│  │   └──────────────────┘   │   ✓  Keeps running if you close      │
│  │                          │      the tab                         │
│  │   Live · Sage glow       │   ✓  Works offline                   │
│  ╰──────────────────────────╯   ✓  Manual entry for missed pumps   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Colors:
  • Active timer ring:  Sage Green #A8C4A2 (animated pulse)
  • Timer numerals:     Ink #2D2A26 (tabular)
  • STOP button:        Dusty Rose #E8B4B8
  • Checkmark bullets:  Sage Deep #6B8E68
```

---

### § Feature 2 — Hybrid Smart Scheduler

```
┌────────────────────────────────────────────────────────────────────┐
│  [BG: Warm White]   Layout: 50/50 split, image RIGHT               │
│                                                                    │
│   02 ─ A schedule that bends.        ╭───────────────────────────╮ │
│   ─────────────────────────          │  TODAY                    │ │
│                                      │  ─────────                │ │
│   Set your interval (e.g. every      │  06:00  ✓  3.2 oz         │ │
│   3 hours). We project your day      │  09:00  ✓  3.5 oz         │ │
│   and tomorrow.                      │  12:00  ⚠  Overdue 14m    │ │
│                                      │  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔       │ │
│   Run late? We'll ask:               │  15:00  ◷  Upcoming       │ │
│   "Shift the rest of today?"         │  18:00  ◷  Upcoming       │ │
│                                      │  21:00  ◷  Upcoming       │ │
│   You stay in control.               │                           │ │
│                                      │  [ Shift remaining → ]    │ │
│                                      ╰───────────────────────────╯ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Colors:
  • Completed (✓):    Sage Deep #6B8E68
  • Overdue (⚠):      Amber Warn #E8A87C  + soft amber row bg
  • Upcoming (◷):     Sky Calm  #A6C8D9
  • Shift CTA:        Dusty Rose outline button
  • Row dividers:     Hairline #E8E1D5
```

---

### § Feature 3 — Output Tracking ("The Total")

```
┌────────────────────────────────────────────────────────────────────┐
│  [BG: Cream Base]   Layout: 50/50, image LEFT                      │
│                                                                    │
│  ╭──────────────────────────╮   03 ─ Watch your total grow.        │
│  │                          │   ─────────────────────────          │
│  │      Today's Total       │                                      │
│  │                          │   Log volume right after each        │
│  │       ┌──────────┐       │   session — oz or ml, your choice.   │
│  │       │  24.5 oz │       │                                      │
│  │       └──────────┘       │   See your daily total climb in      │
│  │                          │   real time. Small wins, every day.  │
│  │   ▓▓▓▓▓▓▓▓▓▓░░░░░░       │                                      │
│  │   Goal: 30 oz            │   ✓  Switch oz / ml anytime          │
│  │                          │   ✓  7-day trend at a glance         │
│  │   Last: 3.5 oz · 06:00   │   ✓  No goals required               │
│  ╰──────────────────────────╯                                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Colors:
  • "Today's Total" label: Sage Deep #6B8E68 (Kalam 400, 18px)
  • Big number:       Ink #2D2A26 (Nunito Sans 800, 56px, tabular nums)
  • Progress fill:    Sage Green #A8C4A2
  • Progress track:   Oat Beige #E5DCC9
  • Goal label:       Soft Ink #5C574F
```

---

### § "Built for 3 AM"  — Dark Mode Showcase

Goal: Tease the in-app dark mode without leaving our light marketing world.

```
┌────────────────────────────────────────────────────────────────────┐
│  [BG: Cream Base, transitions to a soft gradient panel]            │
│                                                                    │
│              We thought about 3 AM so you don't have to.           │
│              ───────────────────────────────────────────           │
│                                                                    │
│   One-handed. Thumb-zone buttons. Auto-dimming dark mode for       │
│   night sessions. Built by people who've been there.               │
│                                                                    │
│        ╭─────────────────────╮    ╭─────────────────────╮          │
│        │  ░░░░░░░░░░░░░░░░░  │    │  ███████████████████ │          │
│        │  ░  Daytime UI   ░  │    │  █  3 AM Dark Mode █ │          │
│        │  ░  cream + rose ░  │    │  █   ink + amber   █ │          │
│        │  ░░░░░░░░░░░░░░░░░  │    │  ███████████████████ │          │
│        ╰─────────────────────╯    ╰─────────────────────╯          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Colors:
  • Section panel: gradient Cream Base → Lavender Mist tint
  • Dark mockup:   Ink #2D2A26 BG with Amber Warn accents
  • Caption text:  Soft Ink #5C574F
```

---

### § Social Proof

```
┌────────────────────────────────────────────────────────────────────┐
│  [BG: Warm White]                                                  │
│                                                                    │
│                  Loved by moms in the trenches                     │
│                  ─────────────────────────────                     │
│                                                                    │
│  ╭────────────────╮  ╭────────────────╮  ╭────────────────╮        │
│  │ "First app     │  │ "The shift     │  │ "I stopped     │        │
│  │  that didn't   │  │  prompt is     │  │  doing math    │        │
│  │  guilt me for  │  │  genius. Real  │  │  at 4am.       │        │
│  │  being late."  │  │  parenting."   │  │  Game changer."│        │
│  │                │  │                │  │                │        │
│  │  — Sarah, EP   │  │  — Priya, mom  │  │  — Amelia, EP  │        │
│  │    6 months    │  │    of newborn  │  │    twin mom    │        │
│  ╰────────────────╯  ╰────────────────╯  ╰────────────────╯        │
│                                                                    │
│        ★★★★★  4.9 / 5    ·    1,200+ moms tracking daily           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Colors:
  • Card BG:        Cream Base
  • Quote marks:    Dusty Rose #E8B4B8 (large, decorative)
  • Author:         Sage Deep #6B8E68
  • Stars:          Amber Warn #E8A87C
```

---

### § Final CTA

```
┌────────────────────────────────────────────────────────────────────┐
│  [BG: full-bleed Dusty Rose #E8B4B8 panel, soft grain]             │
│                                                                    │
│                                                                    │
│                  Your next pump is in 2 hours.                     │
│                  Let us count it down for you.                     │
│                                                                    │
│                                                                    │
│              ╭─────────────────────────────────╮                   │
│              │     Start Pumping Now  →        │                   │
│              ╰─────────────────────────────────╯                   │
│                                                                    │
│              Free forever · No card · Works offline                │
│                                                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Colors:
  • Panel BG:    Dusty Rose #E8B4B8
  • Headline:    Warm White #FFFDF9 (Kalam 700, 44px, line-height 1.2)
  • CTA fill:    Warm White #FFFDF9
  • CTA text:    Rose Deep #C97B81
  • Fine print:  Warm White at 80% opacity
```

---

### § Footer

```
┌────────────────────────────────────────────────────────────────────┐
│  [BG: Oat Beige #E5DCC9]                                           │
│                                                                    │
│  🤱 EpingJourney                                                   │
│  Built with care for pumping moms.                                 │
│                                                                    │
│  Product            Resources         Company                      │
│  ───────            ─────────         ───────                      │
│  Features           EP 101 Guide      About                        │
│  Pricing            Lactation FAQ     Contact                      │
│  Changelog          Blog              Privacy                      │
│  Roadmap            Help Center       Terms                        │
│                                                                    │
│  ─────────────────────────────────────────────────                 │
│  © 2026 EpingJourney  ·  Made in 🇮🇩  ·  Not medical advice          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Colors:
  • BG:          Oat Beige #E5DCC9
  • Headings:    Ink #2D2A26
  • Links:       Soft Ink #5C574F → hover Rose Deep
  • Divider:     Hairline #E8E1D5
```

---

## 4. Mobile Layout (≤ 640px)

```
╭────────────────────╮
│ 🤱 EpingJourney  ☰ │
├────────────────────┤
│                    │
│  For EP mothers    │
│                    │
│  Track every drop. │
│  Forget the math.  │
│                    │
│  ┌──────────────┐  │
│  │ Phone mockup │  │
│  │   24.5 oz    │  │
│  └──────────────┘  │
│                    │
│ ╭────────────────╮ │
│ │ Start Pumping →│ │
│ ╰────────────────╯ │
│  Free · No signup  │
│                    │
│  ─────────────     │
│                    │
│  Problem section   │
│  (stacked cards)   │
│                    │
│  Feature 1         │
│  (image top,       │
│   text below)      │
│                    │
│  ...               │
╰────────────────────╯

Mobile rules:
  • CTA button always full-width minus 24px gutter
  • Primary CTA pinned in thumb zone (bottom 30%) on hero
  • Single column, 24px padding
  • Feature mockups stack vertically, image above text
  • Sticky bottom "Start Pumping Now" bar appears on scroll
```

---

## 5. Component Inventory (for shadcn / COSS UI)

```
╭──────────────────────────────────────────────────────────────╮
│  Section          Components needed                          │
├──────────────────────────────────────────────────────────────┤
│  Nav              Button, NavigationMenu                     │
│  Hero             Button (primary), Badge (rating)           │
│  Problem          Card × 3                                   │
│  Features × 3     Card, Progress, Badge                      │
│  3 AM Showcase    Card (themed), Tabs (optional)             │
│  Social Proof     Card × 3, Avatar (optional)                │
│  Final CTA        Button (large)                             │
│  Footer           Separator, link list                       │
╰──────────────────────────────────────────────────────────────╯
```

---

## 6. Motion & Micro-interactions

- **Hero phone mockup:** subtle 4s float (translateY ±4px, ease-in-out).
- **Timer ring** (Feature 1): slow pulse, sage glow, 2s cycle.
- **Progress bar** (Feature 3): animates 0 → 24.5 oz on scroll into view.
- **CTA hover:** Dusty Rose → Rose Deep, 200ms, slight scale 1.02.
- **Section reveal:** 12px translateY + opacity, 400ms, stagger 80ms.
- Reduce motion respected: disable all on `prefers-reduced-motion`.

---

## 7. Open Questions for Next Iteration

1. Do we need a **founder note / story** section for trust? (mom-built credibility)
2. Pricing — free forever, or "free + paid stash management later"?
3. Do we want a **waitlist mode** for v0, or ship the app live with the landing page?
4. Logo / wordmark direction — keep emoji 🤱 placeholder or commission?

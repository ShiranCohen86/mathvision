# MathVision — Engineering Spec (condensed)

The full, interview-driven product/UX/AI specification (all 30 deliverables) was
approved as the project plan. This file is the in-repo, engineering-facing
distillation that the code is built against.

## What it is

A free, personal **PWA** for a family/friends circle (≤20): photograph any math
problem → recognise it → **verify** it → solve it → **watch an animated,
step-by-step solution** → tutor chat, multiple methods, practice, gamification.
Bilingual **Hebrew/English with full RTL**. Android-led, also iOS/tablet/desktop
— one URL, installable.

## Locked decisions

| Topic | Decision |
|---|---|
| Distribution | Web app / PWA, one URL, no app stores |
| Audience | Everyone / all ages (family) |
| Languages | He + En, RTL + LTR (math stays LTR) |
| Frontend | React + Vite + SASS |
| Backend | Node + Express (JS) — serves API **and** client |
| Database | MongoDB (Mongoose) → Atlas in prod |
| Images | Cloudinary (or GridFS) |
| OCR | Mathpix (`OcrProvider`) |
| AI | OpenAI (`LlmProvider`), cost-no-object for accuracy |
| Verification | Layered: Node numeric → **SymPy** service → Wolfram (flag) |
| Animation | One Presentation Style Engine, switchable styles |
| Math scope | Everything (arithmetic → diff-eq) + physics/chem formulas |
| Engagement | Full gamification + private family leaderboard |
| Offline | Online to solve, offline to review |
| Deploy | Render (web + private verifier) |

## Principles

1. **Verified-or-nothing** — nothing earns a "✓" unless the verifier confirms it.
2. **Everything is a swappable provider** — OCR, LLM, verifier, image store, style.
3. **One data model, many surfaces** — a solution is semantic data; UI + every style render it.
4. **Premium by default** — 60fps, motion with intent, fluid responsive, immaculate RTL.
5. **Ship the vertical slice first** — photo → verified → animated solution.

## Architecture

```
React + Vite + SASS PWA  ──HTTPS/JWT/SSE──>  Express (TS) on Render
  · capture / style engine / i18n+RTL            · serves client + /api
  · offline review (SW + IndexedDB)              · pipeline orchestration
                                                 · Layer-1 numeric verify
        ┌───────────────┬──────────────┬───────────────┴───────────────┐
   MongoDB Atlas    Cloudinary     Mathpix · OpenAI         Python SymPy verifier
     (data)          (images)        (swappable)             (private, Layer-2)
```

**Solve pipeline:** preprocess → OCR (Mathpix) → normalize → recognition confirm
→ classify → solve (LLM + CAS) → **verify every step** → pedagogize → render model
→ tutor / practice. See approved plan §13.

## Data model (MongoDB collections)

users · families · problems · images · recognitions · solutions
(methods→steps) · verifications · tutorSessions · practiceProblems · attempts ·
topics · userTopicMastery · xpEvents · progress · achievements · userAchievements ·
dailyChallenges · challengeResults · settings. Access control enforced in Express
(scoped by `profileId`/`familyId`).

## Roadmap

- **Phase 0 — Foundations** *(in progress)*: monorepo, design system, i18n+RTL,
  PWA, Express+Mongo, provider interfaces, Node verifier, Render+CI.
- **Phase 1 — Magic core**: capture → Mathpix → recognition confirm → LLM+CAS
  verified solve → whiteboard animation + playback → history.
- **Phase 2 — Breadth & trust**: all domains, handwritten OCR, multi-problem,
  multiple methods, math editor, CAS golden bank.
- **Phase 3 — Learn**: tutor chat, practice + grading, analytics + weak-topic.
- **Phase 4 — Engage**: full gamification + family leaderboard.
- **Phase 5 — Presentation & offline**: more styles + hand-drawn, graphs/geometry,
  offline review.
- **Phase 6 — Polish & platforms**: iOS-Safari, tablet/foldable, a11y, perf, RTL.

## Status

Phase 0 scaffolding: client shell, server + health, providers + Layer-1 verifier
(with the first golden-bank tests), Python verifier, Render blueprint, CI.

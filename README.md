# MathVision

Photograph any math problem and **watch a verified, beautifully-animated, step-by-step solution** — like a teacher at a whiteboard. A bilingual (Hebrew / English, full RTL) **progressive web app** built for a small family/friends circle.

> **Trust spine:** the LLM proposes, a CAS verifies, and nothing earns a "✓" unless the math engine confirms it.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + SASS (JavaScript), PWA (installable, offline review) |
| Backend | Node.js + Express (JavaScript) — serves the API **and** the built frontend |
| Database | MongoDB (Mongoose) — MongoDB Atlas in production |
| Images | Cloudinary (storage + preprocessing + CDN) — GridFS alternative |
| OCR | Mathpix (math OCR) — behind a swappable `OCRProvider` |
| AI | OpenAI (vision + reasoning) — behind a swappable `LLMProvider` |
| Verification | Layered `VerificationProvider`: Node numeric/JS-CAS → Python **SymPy** service → Wolfram (flag) |
| Animation | MathJax glyph paths + SVG/Canvas + GSAP timelines |
| Deploy | Render (Express web service + Python verifier service) |

## Monorepo layout

```
mathvision/
├─ client/     React + Vite + SASS PWA
├─ server/     Express + TypeScript API (also serves client/dist in prod)
├─ verifier/   Python + SymPy verification microservice
├─ package.json    npm workspaces (client, server)
└─ render.yaml     Render blueprint (added in DevOps step)
```

## Getting started

```bash
# 1. Install JS deps (root, installs client + server workspaces)
npm install

# 2. Configure env
cp .env.example .env   # then fill in values (Mongo URI, API keys)

# 3. Run client + server together (Vite proxies /api → Express)
npm run dev
#   client → http://localhost:5173
#   server → http://localhost:3000  (health: /api/health)
```

Python verifier (optional locally; required for symbolic Layer-2):

```bash
cd verifier
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

## Enabling cloud features

The app runs and solves linear/quadratic equations with **no keys**. To unlock the
rest, set these (in `.env` for local dev, and in Render's Environment for prod):

- **AI solving (any problem):** `OPENAI_API_KEY` — the key's OpenAI account needs **billing/credits**.
- **Sign in with Google:** `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, and register the redirect URI `${OAUTH_REDIRECT_BASE}/api/auth/google/callback` in Google Cloud Console (e.g. `http://localhost:5173/...` for dev, your Render URL for prod).
- **Saved history:** `MONGODB_URI` (MongoDB Atlas).
- **Image storage:** `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` — the **Cloud name** must match the key/secret pair.
- **Photo OCR:** `MATHPIX_APP_ID` / `MATHPIX_APP_KEY` (not yet wired into the UI).

Verify connections any time (prints status only, never secrets):

```bash
npm run check -w server
```

## Scripts (root)

| Command | Does |
|---|---|
| `npm run dev` | client + server in watch mode |
| `npm run build` | build client then server |
| `npm start` | run the production server (serves built client) |
| `npm run lint` | lint all workspaces |
| `npm test` | run all tests |

## Status

Phase 1 in progress — verified solving (linear/quadratic with no keys, plus AI for any
problem), Google sign-in, and saved history are wired. See `docs/SPEC.md`.

# MathVision Verifier (Layer-2)

A small private FastAPI + **SymPy** service that provides ground-truth symbolic
verification — the cases numeric sampling (Layer-1, in the Node backend) can't
*prove*: calculus, linear algebra, differential equations.

It implements the same contract as the Node `VerificationProvider`, so the two
layers are interchangeable and the backend can fall back from one to the other.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | liveness + SymPy version |
| POST | `/parse` | `{ expr }` → is it parseable? |
| POST | `/equivalent` | `{ a, b }` → is `a ≡ b`? (`simplify(a-b)==0`) |
| POST | `/verify-step` | alias of `/equivalent` (previous → current) |
| POST | `/simplify` | `{ expr }` → simplified form + LaTeX |

All POST routes require an `X-Service-Key` header matching `VERIFIER_SERVICE_KEY`.

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate            # Windows  (use: source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

## Deploy

Containerised via the `Dockerfile`; on Render this is a **private service** the
web service reaches over private networking. Keep it on a small always-warm
instance to avoid cold-start latency in the solve flow.

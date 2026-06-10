"""
MathVision verifier — Layer-2 symbolic correctness (SymPy).

A small private service the Node backend calls for ground-truth symbolic checks
(calculus, linear algebra, differential equations) that numeric sampling can't
*prove*. Implements the same contract as the Node `VerificationProvider`.

Run locally:  uvicorn app:app --reload --port 8000
Deploy:       see Dockerfile (Render private service).
"""

import os

import sympy as sp
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
)

app = FastAPI(title="MathVision Verifier", version="0.0.0")

SERVICE_KEY = os.environ.get("VERIFIER_SERVICE_KEY", "dev-only-change-me")
TRANSFORMS = standard_transformations + (implicit_multiplication_application,)


def _auth(key: str) -> None:
    if SERVICE_KEY and key != SERVICE_KEY:
        raise HTTPException(status_code=401, detail="invalid service key")


def _parse(expression: str) -> sp.Expr:
    return parse_expr(expression, transformations=TRANSFORMS, evaluate=True)


class ExprIn(BaseModel):
    expr: str


class EquivIn(BaseModel):
    a: str
    b: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "mathvision-verifier", "sympy": sp.__version__}


@app.post("/parse")
def parse(body: ExprIn, x_service_key: str = Header(default="")) -> dict:
    _auth(x_service_key)
    try:
        expr = _parse(body.expr)
        return {"passed": True, "kind": "parse", "sympy": str(expr)}
    except Exception as exc:  # noqa: BLE001 - report parse failure to caller
        return {"passed": False, "kind": "parse", "note": str(exc)}


@app.post("/equivalent")
def equivalent(body: EquivIn, x_service_key: str = Header(default="")) -> dict:
    """Symbolic equivalence: simplify(a - b) == 0."""
    _auth(x_service_key)
    try:
        diff = sp.simplify(_parse(body.a) - _parse(body.b))
        passed = diff == 0
        return {
            "passed": bool(passed),
            "kind": "symbolic",
            "confidence": 1.0 if passed else 0.0,
            "detail": str(diff),
        }
    except Exception as exc:  # noqa: BLE001
        return {"passed": False, "kind": "symbolic", "confidence": 0.0, "note": str(exc)}


# Step verification is equivalence between the previous and current expressions.
@app.post("/verify-step")
def verify_step(body: EquivIn, x_service_key: str = Header(default="")) -> dict:
    return equivalent(body, x_service_key)


@app.post("/simplify")
def simplify(body: ExprIn, x_service_key: str = Header(default="")) -> dict:
    _auth(x_service_key)
    try:
        expr = sp.simplify(_parse(body.expr))
        return {"result": str(expr), "latex": sp.latex(expr)}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc

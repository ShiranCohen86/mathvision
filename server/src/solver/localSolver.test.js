import { describe, it, expect } from 'vitest';
import { solveLocally } from './localSolver.js';

describe('solveLocally — linear equations', () => {
  it('solves 2x + 3 = 7', () => {
    const s = solveLocally('2x + 3 = 7');
    expect(s).not.toBeNull();
    expect(s.type).toBe('linear-equation');
    expect(s.verified).toBe(true);
    expect(s.finalAnswer).toBe('x = 2');
    expect(s.methods[0].steps.length).toBeGreaterThanOrEqual(3);
  });

  it('solves x/2 - 1 = 3', () => {
    const s = solveLocally('x/2 - 1 = 3');
    expect(s.type).toBe('linear-equation');
    expect(s.finalAnswer).toBe('x = 8');
    expect(s.verified).toBe(true);
  });
});

describe('solveLocally — quadratic equations', () => {
  it('solves x^2 - 5x + 6 = 0 → 3, 2', () => {
    const s = solveLocally('x^2 - 5x + 6 = 0');
    expect(s.type).toBe('quadratic-equation');
    expect(s.verified).toBe(true);
    expect(s.finalAnswer).toContain('3');
    expect(s.finalAnswer).toContain('2');
  });

  it('solves x^2 - 9 = 0 → ±3', () => {
    const s = solveLocally('x^2 - 9 = 0');
    expect(s.verified).toBe(true);
    expect(s.finalAnswer).toContain('3');
    expect(s.finalAnswer).toContain('-3');
  });

  it('handles a double root x^2 + 2x + 1 = 0 → -1', () => {
    const s = solveLocally('x^2 + 2x + 1 = 0');
    expect(s.finalAnswer).toBe('x = -1');
    expect(s.verified).toBe(true);
  });

  it('reports no real solutions for x^2 + 1 = 0', () => {
    const s = solveLocally('x^2 + 1 = 0');
    expect(s.noRealRoots).toBe(true);
    expect(s.finalAnswer).toBe('No real solutions');
  });
});

describe('solveLocally — out of scope returns null', () => {
  it('null for trigonometric equations', () => {
    expect(solveLocally('sin(x) = 0')).toBeNull();
  });
  it('null for two variables', () => {
    expect(solveLocally('x + y = 1')).toBeNull();
  });
  it('null when there is no equals sign', () => {
    expect(solveLocally('x^2 - 4')).toBeNull();
  });
});

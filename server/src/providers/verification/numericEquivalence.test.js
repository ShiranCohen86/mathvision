import { describe, it, expect } from 'vitest';
import { checkNumericEquivalence, detectVariables } from './numericEquivalence.js';

describe('detectVariables', () => {
  it('finds free variables and ignores functions/constants', () => {
    expect(detectVariables(['2*x + sin(y)'])).toEqual(['x', 'y']);
    expect(detectVariables(['pi*r^2'])).toEqual(['r']);
    expect(detectVariables(['2 + 2'])).toEqual([]);
  });
});

describe('checkNumericEquivalence — the seed of the CAS golden bank', () => {
  it('recognises equivalent algebraic expressions', () => {
    expect(checkNumericEquivalence('(x+1)^2', 'x^2 + 2*x + 1').equivalent).toBe(true);
    expect(checkNumericEquivalence('2*x', 'x + x').equivalent).toBe(true);
    expect(checkNumericEquivalence('x*x', 'x^2').equivalent).toBe(true);
    expect(checkNumericEquivalence('(x-3)*(x+3)', 'x^2 - 9').equivalent).toBe(true);
  });

  it('rejects non-equivalent expressions', () => {
    expect(checkNumericEquivalence('x^2', 'x^3').equivalent).toBe(false);
    expect(checkNumericEquivalence('x + 1', 'x + 2').equivalent).toBe(false);
    expect(checkNumericEquivalence('2*x', '3*x').equivalent).toBe(false);
  });

  it('handles pure constants', () => {
    expect(checkNumericEquivalence('2 + 2', '4').equivalent).toBe(true);
    expect(checkNumericEquivalence('1/2', '0.5').equivalent).toBe(true);
    expect(checkNumericEquivalence('2 + 2', '5').equivalent).toBe(false);
  });

  it('recognises a trig identity', () => {
    expect(checkNumericEquivalence('sin(x)^2 + cos(x)^2', '1').equivalent).toBe(true);
  });

  it('reports a parse error rather than throwing', () => {
    const r = checkNumericEquivalence('x +', 'x');
    expect(r.equivalent).toBe(false);
    expect(r.note).toContain('parse error');
  });
});

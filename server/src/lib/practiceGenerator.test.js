import { describe, it, expect } from 'vitest';
import { generateProblem, dailyProblem } from './practiceGenerator.js';
import { solveLocally } from '../solver/localSolver.js';

describe('practice generator', () => {
  it('every generated problem is solvable and verified by the local solver', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateProblem();
      const solution = solveLocally(problem);
      expect(solution, `unsolvable: ${problem}`).not.toBeNull();
      expect(solution.verified, `unverified: ${problem}`).toBe(true);
    }
  });

  it('can target a kind', () => {
    expect(solveLocally(generateProblem(Math.random, 'linear')).type).toBe('linear-equation');
    expect(solveLocally(generateProblem(Math.random, 'quadratic')).type).toBe('quadratic-equation');
  });

  it('daily problem is deterministic per date and solvable', () => {
    const a = dailyProblem('2026-06-11');
    const b = dailyProblem('2026-06-11');
    expect(a).toBe(b);
    expect(dailyProblem('2026-06-12')).not.toBe(undefined);
    expect(solveLocally(a).verified).toBe(true);
  });
});

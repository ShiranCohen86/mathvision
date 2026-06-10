import { create, all } from 'mathjs';
import { checkNumericEquivalence } from './numericEquivalence.js';

const math = create(all, {});

/**
 * Layer-1 verifier: fast, in-process, no external service. Confirms most
 * algebraic equivalence by numeric sampling. Hard symbolic cases (calculus,
 * linear algebra) will defer to a SymPy-backed provider sharing this contract:
 *   { name, checkEquivalence(a, b, variables?), checkParseable(expr) }
 */
export class NodeVerificationProvider {
  name = 'node-numeric';

  async checkEquivalence(exprA, exprB, variables) {
    const result = checkNumericEquivalence(
      exprA,
      exprB,
      variables ? { variables } : {},
    );
    return {
      passed: result.equivalent,
      kind: 'numeric',
      confidence: result.confidence,
      provider: this.name,
      note:
        result.note ??
        `${result.validSamples}/${result.checkedSamples} sample points agreed`,
    };
  }

  async checkParseable(expr) {
    try {
      math.parse(expr);
      return { passed: true, kind: 'parse', confidence: 1, provider: this.name };
    } catch (err) {
      return {
        passed: false,
        kind: 'parse',
        confidence: 0,
        provider: this.name,
        note: err.message,
      };
    }
  }
}

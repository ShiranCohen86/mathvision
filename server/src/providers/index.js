import { NodeVerificationProvider } from './verification/NodeVerificationProvider.js';
import { MathpixOcrProvider } from './ocr/MathpixOcrProvider.js';
import { OpenAiLlmProvider } from './llm/OpenAiLlmProvider.js';

let cached = null;

/**
 * The single place where concrete providers are chosen. Swapping a provider
 * (e.g. SymPy verification, a different LLM) is a one-line change here.
 *
 * @returns {{ verification: NodeVerificationProvider, ocr: MathpixOcrProvider, llm: OpenAiLlmProvider }}
 */
export function getProviders() {
  if (!cached) {
    cached = {
      verification: new NodeVerificationProvider(),
      ocr: new MathpixOcrProvider(),
      llm: new OpenAiLlmProvider(),
    };
  }
  return cached;
}

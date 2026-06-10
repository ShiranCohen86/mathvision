import { env } from '../../config/env.js';

/**
 * OpenAI chat completions. Implements the LlmProvider contract:
 *   { name, configured, complete(messages, options) -> string }
 * Wired and ready; throws a clear error until a key is provided. Model is a
 * constructor parameter so it can be swapped/upgraded freely.
 */
export class OpenAiLlmProvider {
  name = 'openai';

  constructor(apiKey = env.OPENAI_API_KEY, model = 'gpt-4o') {
    this.apiKey = apiKey;
    this.model = model;
  }

  get configured() {
    return Boolean(this.apiKey);
  }

  async complete(messages, options = {}) {
    if (!this.configured) {
      throw new Error('OpenAI is not configured (set OPENAI_API_KEY).');
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.2,
        ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
        ...(options.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(`OpenAI error: ${json.error?.message ?? res.status}`);
    }
    return json.choices?.[0]?.message?.content ?? '';
  }
}

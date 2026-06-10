import { env } from '../../config/env.js';

/**
 * Mathpix math OCR. Implements the OcrProvider contract:
 *   { name, configured, recognize(image) -> { provider, problems, raw } }
 * Wired and ready; throws a clear error until credentials are provided. Full
 * multi-problem segmentation + preprocessing lands in Phase 1.
 */
export class MathpixOcrProvider {
  name = 'mathpix';

  constructor(appId = env.MATHPIX_APP_ID, appKey = env.MATHPIX_APP_KEY) {
    this.appId = appId;
    this.appKey = appKey;
  }

  get configured() {
    return Boolean(this.appId && this.appKey);
  }

  async recognize(image) {
    if (!this.configured) {
      throw new Error('Mathpix is not configured (set MATHPIX_APP_ID and MATHPIX_APP_KEY).');
    }

    const source =
      image.kind === 'url'
        ? { url: image.data }
        : { src: `data:${image.mimeType ?? 'image/jpeg'};base64,${image.data}` };

    const res = await fetch('https://api.mathpix.com/v3/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        app_id: this.appId,
        app_key: this.appKey,
      },
      body: JSON.stringify({
        ...source,
        formats: ['latex_styled', 'data'],
        math_inline_delimiters: ['$', '$'],
      }),
    });

    if (!res.ok) throw new Error(`Mathpix request failed: ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(`Mathpix error: ${json.error}`);

    return {
      provider: this.name,
      problems: json.latex_styled
        ? [{ latex: json.latex_styled, confidence: json.confidence ?? 0 }]
        : [],
      raw: json,
    };
  }
}

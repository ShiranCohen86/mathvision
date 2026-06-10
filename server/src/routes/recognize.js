import { Router } from 'express';
import { getProviders } from '../providers/index.js';

export const recognizeRouter = Router();

recognizeRouter.post('/', async (req, res) => {
  const image = req.body?.image;
  const { ocr } = getProviders();

  if (!ocr.configured) {
    return res.status(422).json({
      error: 'ocr-not-configured',
      message:
        'Photo recognition needs a Mathpix key (MATHPIX_APP_ID / MATHPIX_APP_KEY). For now, type the problem manually.',
    });
  }

  if (!image?.data) {
    return res.status(400).json({ error: 'Provide an "image" { kind, data, mimeType }.' });
  }

  try {
    const result = await ocr.recognize(image);
    return res.json({ source: ocr.name, ...result });
  } catch (err) {
    return res.status(502).json({ error: 'ocr-failed', message: err.message });
  }
});

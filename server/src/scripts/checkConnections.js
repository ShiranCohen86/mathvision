/* Verifies external integrations without ever printing secret values.
 * Run: npm run check -w server  */
import { env } from '../config/env.js';
import { connectDb, disconnectDb } from '../db/mongoose.js';
import { cloudinaryConfigured, pingCloudinary } from '../lib/cloudinary.js';

const flag = (ok) => (ok ? 'configured' : 'not set');

async function main() {
  console.log('--- MathVision integration check ---');
  console.log('MongoDB URI :', env.MONGODB_URI ? 'present' : 'missing');
  console.log('Cloudinary  :', flag(cloudinaryConfigured()));
  console.log('Google OAuth:', flag(Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)));
  console.log('Mathpix     :', flag(Boolean(env.MATHPIX_APP_ID && env.MATHPIX_APP_KEY)));
  console.log('OpenAI      :', flag(Boolean(env.OPENAI_API_KEY)));
  console.log('------------------------------------');

  try {
    await connectDb();
    console.log('Mongo connect   : OK');
  } catch (err) {
    console.log('Mongo connect   : FAILED —', err.message);
  } finally {
    await disconnectDb().catch(() => {});
  }

  if (cloudinaryConfigured()) {
    try {
      const res = await pingCloudinary();
      console.log('Cloudinary ping :', res?.status ?? JSON.stringify(res));
    } catch (err) {
      const msg =
        err?.error?.message || err?.message || err?.http_code || JSON.stringify(err);
      console.log('Cloudinary ping : FAILED —', msg);
    }
  }

  process.exit(0);
}

main();

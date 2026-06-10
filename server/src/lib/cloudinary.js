import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

let configured = false;

export function cloudinaryConfigured() {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
  );
}

function ensureConfigured() {
  if (!cloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured (set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).',
    );
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
}

/** Liveness check for credentials. Returns Cloudinary's ping result. */
export async function pingCloudinary() {
  ensureConfigured();
  return cloudinary.api.ping();
}

/**
 * Upload an image (data URI like "data:image/png;base64,..." or a remote URL).
 * Returns the stored secure URL and public id.
 */
export async function uploadImage(source, { folder = 'mathvision/problems' } = {}) {
  ensureConfigured();
  const res = await cloudinary.uploader.upload(source, {
    folder,
    resource_type: 'image',
  });
  return {
    url: res.secure_url,
    publicId: res.public_id,
    width: res.width,
    height: res.height,
  };
}

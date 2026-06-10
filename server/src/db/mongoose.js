import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

function redact(uri) {
  return uri.replace(/\/\/([^@]+)@/, '//***@');
}

export async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  logger.info(`MongoDB connected: ${redact(env.MONGODB_URI)}`);
}

export async function disconnectDb() {
  await mongoose.disconnect();
}

export function dbState() {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    default:
      return 'disconnected';
  }
}

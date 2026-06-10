/* Minimal structured-ish logger. Swap for pino/winston later if needed. */

function emit(level, message, meta) {
  const time = new Date().toISOString();
  const line = `[${time}] ${level.toUpperCase()} ${message}`;
  if (level === 'error') console.error(line, meta ?? '');
  else if (level === 'warn') console.warn(line, meta ?? '');
  else console.log(line, meta ?? '');
}

export const logger = {
  info: (message, meta) => emit('info', message, meta),
  warn: (message, meta) => emit('warn', message, meta),
  error: (message, meta) => emit('error', message, meta),
};

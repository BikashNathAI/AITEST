import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.resolve('logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

type Level = 'info' | 'warn' | 'error' | 'debug';

function write(level: Level, message: string, meta?: Record<string, unknown>): void {
  const ts      = new Date().toISOString();
  const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
  const line    = `${ts} [${level.toUpperCase()}] ${message}${metaStr}`;
  const colours: Record<Level, string> = {
    info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m', debug: '\x1b[90m',
  };
  console.log(`${colours[level]}${line}\x1b[0m`);
  fs.appendFileSync(path.join(LOG_DIR, 'aitest.log'), line + '\n');
}

export const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => write('info',  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => write('warn',  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write('error', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (process.env.LOG_LEVEL === 'debug') write('debug', msg, meta);
  },
};

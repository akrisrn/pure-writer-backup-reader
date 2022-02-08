import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
});
dotenv.config();

function isTrue(value: string | undefined) {
  return !!(value && ['true', 'enable'].includes(value.toLowerCase()));
}

function parseNum(value: string | undefined, defaultValue: number) {
  if (!value) {
    return defaultValue;
  }
  const num = parseInt(value);
  return isNaN(num) ? defaultValue : num;
}

export const BACKUPS_PATH = process.env.BACKUPS_PATH || '/PureWriter/Backups';
export const TARGET_PATH = process.env.TARGET_PATH || 'PureWriter';
export const WATCH = isTrue(process.env.WATCH);
export const INTERVAL = parseNum(process.env.INTERVAL, 1000 * 60 * 10);
export const ENABLE_GIT = isTrue(process.env.ENABLE_GIT);
export const WEB_DAV = isTrue(process.env.WEB_DAV);
export const WEB_DAV_URL = process.env.WEB_DAV_URL || '';
export const WEB_DAV_USERNAME = process.env.WEB_DAV_USERNAME || '';
export const WEB_DAV_PASSWORD = process.env.WEB_DAV_PASSWORD || '';

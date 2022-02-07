import dotenv from 'dotenv';

dotenv.config();

function parseNum(value: string | undefined, defaultValue: number) {
  if (!value) {
    return defaultValue;
  }
  const num = parseInt(value);
  return isNaN(num) ? defaultValue : num;
}

export const BACKUPS_PATH = process.env.BACKUPS_PATH || '/PureWriter/Backups';
export const TARGET_PATH = process.env.TARGET_PATH || 'PureWriter';
export const WATCH = !!process.env.WATCH;
export const INTERVAL = parseNum(process.env.INTERVAL, 1000 * 60 * 10);
export const ENABLE_GIT = !!process.env.ENABLE_GIT;
export const WEB_DAV = !!process.env.WEB_DAV;
export const WEB_DAV_URL = process.env.WEB_DAV_URL || '';
export const WEB_DAV_USERNAME = process.env.WEB_DAV_USERNAME || '';
export const WEB_DAV_PASSWORD = process.env.WEB_DAV_PASSWORD || '';

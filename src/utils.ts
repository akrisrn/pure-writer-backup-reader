import fs from 'fs';
import watch from 'node-watch';
import path from 'path';

export function log(message?: any, ...optionalParams: any[]) {
  console.log(`[${ new Date().toJSON() }]`, message, ...optionalParams);
}

export function error(message?: any, ...optionalParams: any[]) {
  log('[error]', message, ...optionalParams);
}

export async function sleep(timeout: number) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

export function* yieldFilePath(dirPath: string, match: RegExp) {
  for (const dirent of fs.readdirSync(dirPath, {
    withFileTypes: true,
  })) {
    if (!dirent.isDirectory() && match.test(dirent.name)) {
      yield path.join(dirPath, dirent.name);
    }
  }
}

type EventType = 'update' | 'remove';
type Callback = (eventType?: EventType, filePath?: string) => any;

export function watchDir(dirPath: string, match: RegExp, callback: Callback) {
  return watch(dirPath, {
    filter(file) {
      return match.test(file);
    },
  }, callback);
}

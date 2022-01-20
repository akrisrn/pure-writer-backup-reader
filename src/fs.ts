import { log } from '@/utils';
import fs from 'fs';

export function mkdir(dirPath: string) {
  log('mkdir', dirPath);
  fs.mkdirSync(dirPath, {
    recursive: true,
  });
}

export function write(path: string, data: string, isAppend = false) {
  log(isAppend ? 'append' : 'write', 'to', path);
  fs.writeFileSync(path, data);
}

export function remove(path: string) {
  log('remove', path);
  fs.rmSync(path, {
    recursive: true,
    force: true,
  });
}

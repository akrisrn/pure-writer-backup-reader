import { INTERVAL } from '@/env';
import { log, sleep, watchDir, yieldFilePath } from '@/utils';
import fs from 'fs';
import unzipper from 'unzipper';
import { WebDAVClient } from 'webdav';

interface SimpleFile {
  path: string;
  mtime: number;
}

async function getBackupPath(dirPath: string, match: RegExp, client?: WebDAVClient) {
  const files: SimpleFile[] = [];
  if (client) {
    log('load backups from WebDav:', dirPath);
    let contents = await client.getDirectoryContents(dirPath);
    if (!Array.isArray(contents)) {
      contents = contents.data;
    }
    contents.forEach(item => {
      if (item.type === 'file' && match.test(item.basename)) {
        files.push({
          path: item.filename,
          mtime: new Date(item.lastmod).getTime(),
        });
      }
    });
  } else {
    log('load backups from', dirPath);
    for (const filePath of yieldFilePath(dirPath, match)) {
      files.push({
        path: filePath,
        mtime: fs.statSync(filePath).mtimeMs,
      });
    }
  }
  if (files.length === 0) {
    log('no backup in', dirPath);
    return;
  }
  return files.sort((a, b) => b.mtime - a.mtime)[0].path;
}

export async function* yieldBackupPath(dirPath: string, match: RegExp, once = false, client?: WebDAVClient): AsyncGenerator<string> {
  let filePath = await getBackupPath(dirPath, match, client);
  if (filePath) {
    log('yield', filePath);
    yield filePath;
  }
  if (once) {
    return;
  }
  let isReady = false;
  const ready = (newFilePath?: string) => {
    if (newFilePath && newFilePath !== filePath) {
      isReady = true;
      filePath = newFilePath;
    }
  };
  if (!client) {
    watchDir(dirPath, match, (eventType, newFilePath) => {
      if (eventType === 'update') {
        ready(newFilePath);
      }
    });
  }
  while (true) {
    await sleep(INTERVAL);
    if (client) {
      ready(await getBackupPath(dirPath, match, client));
    }
    if (isReady && filePath) {
      isReady = false;
      log('yield', filePath);
      yield filePath;
    }
  }
}

export async function extractBackup(filePath: string, match: RegExp, outPath: string, client?: WebDAVClient) {
  log('extract', outPath);
  await new Promise((resolve, reject) => {
    (client || fs).createReadStream(filePath)
      .pipe(unzipper.ParseOne(match))
      .pipe(fs.createWriteStream(outPath))
      .on('finish', resolve)
      .on('error', reject);
  });
}

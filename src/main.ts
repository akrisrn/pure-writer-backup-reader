import { extractBackup, yieldBackupPath } from '@/backup';
import { closeDB, initSQL, openDB } from '@/db';
import {
  BACKUPS_PATH,
  ENABLE_GIT,
  TARGET_PATH,
  WATCH,
  WEB_DAV,
  WEB_DAV_PASSWORD,
  WEB_DAV_URL,
  WEB_DAV_USERNAME,
} from '@/env';
import { commitAll } from '@/git';
import { error, getRelative } from '@/utils';
import { writeData } from '@/write';
import { createClient, WebDAVClient } from 'webdav';

const XML_FILE_PATH = './mapper.xml';
const DB_FILE_PATH = './dist/PureWriterBackup.db';

const BACKUP_FILE_REGEXP = /\.pwb$/;
const DB_FILE_REGEXP = /\.db$/;

(async () => {
  const sqls = initSQL(XML_FILE_PATH);
  if (!sqls) {
    return;
  }

  let client: WebDAVClient | undefined;
  if (WEB_DAV) {
    client = createClient(
      WEB_DAV_URL,
      {
        username: WEB_DAV_USERNAME,
        password: WEB_DAV_PASSWORD,
      },
    );
    if (!await client.exists(BACKUPS_PATH)) {
      error(BACKUPS_PATH, 'not exist in', WEB_DAV_URL);
      return;
    }
  }

  for await (const filePath of yieldBackupPath(BACKUPS_PATH, BACKUP_FILE_REGEXP, !WATCH, client)) {
    await extractBackup(filePath, DB_FILE_REGEXP, DB_FILE_PATH, client);

    const db = await openDB(DB_FILE_PATH);

    const stmts = await Promise.all(sqls.map(sql => db.prepare(sql)));
    await writeData(TARGET_PATH, stmts);
    await Promise.all(stmts.map(stmt => stmt.finalize()));

    await closeDB(db);

    if (ENABLE_GIT) {
      commitAll(TARGET_PATH, getRelative(filePath, BACKUPS_PATH));
    }
  }
})();

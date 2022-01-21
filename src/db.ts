import { error, log } from '@/utils';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';

interface XMLData {
  mapper: {
    select: {
      id: string
      text: string
    }[]
  };
}

const xmlParser = new XMLParser({
  attributeNamePrefix: '',
  textNodeName: 'text',
  ignoreAttributes: false,
});

function parseXML(filePath: string) {
  log('[db]', 'parse', filePath);
  const xmlData: XMLData = xmlParser.parse(fs.readFileSync(filePath, {
    encoding: 'utf-8',
  }));
  const dict: Record<string, string> = {};
  xmlData.mapper.select.forEach(select => {
    dict[select.id] = select.text.replaceAll(/\s+/g, ' ');
  });
  return dict;
}

const selectIds = ['queryFolder', 'queryCategory', 'queryArticle'];

export function initSQL(filePath: string) {
  const sqls = [];
  const dict = parseXML(filePath);
  for (const id of selectIds) {
    const sql = dict[id];
    if (!sql) {
      error('[db]', `no '${ id }' SQL`);
      return;
    }
    sqls.push(sql);
  }
  return sqls;
}

export async function openDB(filePath: string) {
  log('[db]', 'opening');
  const db = await open({
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
    filename: filePath,
  });
  db.on('trace', (data: string) => log('[db]', data));
  return db;
}

export async function closeDB(db: Database) {
  await db.close();
  log('[db]', 'closed');
}

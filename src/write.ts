import { mkdir, remove, write } from '@/fs';
import { getRelative } from '@/utils';
import fs from 'fs';
import { dump } from 'js-yaml';
import path from 'path';
import { Statement } from 'sqlite';

interface PWFolder {
  id: string;
  name: string;
  desc: string | null;
  created: number;
  rank: number;
}

interface PWArticle {
  id: string;
  title: string;
  content: string;
  ext: string;
  count: number;
  created: number;
  updated: number;
  rank: number;
}

function padZero(num: number, len = 2) {
  return `${ num }`.padStart(len, '0');
}

function formatDate(value: number) {
  const date = new Date(value);
  const dateList = [
    date.getFullYear().toString(),
  ];
  [
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ].forEach(num => {
    dateList.push(padZero(num));
  });
  dateList.push(padZero(date.getMilliseconds(), 3));

  let timezone = 'Z';
  const offset = date.getTimezoneOffset();
  if (offset !== 0) {
    const absOffset = Math.abs(offset);
    const tzHour = Math.floor(absOffset / 60);
    const tzMinute = absOffset % 60;
    timezone = [
      offset < 0 ? '+' : '-',
      padZero(tzHour),
      ':',
      padZero(tzMinute),
    ].join('');
  }
  return `${ dateList.slice(0, 3).join('-') }T${ dateList.slice(3, 6).join(':') }.${ dateList[6] }${ timezone }`;
}

function createLink(text: string, href: string) {
  if (!text) {
    text = href;
  }
  return `- [${ text }](${ href })`;
}

function dumpProps(props: {
  key: string;
  value: any;
}[]) {
  return [
    '---',
    props.map(prop => dump({
      [prop.key]: prop.value,
    })).join('').trimEnd(),
    '---',
  ].join('\n');
}

function writeIndex(dirPath: string, data: string, overwrite = true) {
  data += '\n';
  const indexPath = path.join(dirPath, 'README.md');
  if (overwrite || !fs.existsSync(indexPath)) {
    write(indexPath, data);
    return indexPath;
  }
  const indexData = fs.readFileSync(indexPath, {
    encoding: 'utf-8',
  });
  write(indexPath, indexData + data, true);
  return indexPath;
}

function writeFolder(dirPath: string, folder: PWFolder) {
  const folderPath = path.join(dirPath, folder.id);
  mkdir(folderPath);
  const indexData = [
    dumpProps([{
      key: 'created',
      value: formatDate(folder.created),
    }]),
    `# ${ folder.name }`,
  ];
  if (folder.desc) {
    indexData.push(`> ${ folder.desc }`);
  }
  const indexPath = writeIndex(folderPath, indexData.join('\n\n') + '\n');
  writeIndex(dirPath, createLink(folder.name, getRelative(indexPath, dirPath)), false);
  return folderPath;
}

function writeArticle(dirPath: string, article: PWArticle) {
  const filePath = path.join(dirPath, `${ article.id }.${ article.ext }`);
  const fileData = [];
  fileData.push(dumpProps([{
    key: 'count',
    value: article.count,
  }, {
    key: 'created',
    value: formatDate(article.created),
  }, {
    key: 'updated',
    value: formatDate(article.updated),
  }]));
  if (article.title) {
    fileData.push(`${ article.ext === 'md' ? '# ' : '' }${ article.title }`);
  }
  fileData.push(article.content);
  write(filePath, fileData.join('\n\n'));
  writeIndex(dirPath, createLink(article.title, getRelative(filePath, dirPath)), false);
}

export async function writeData(dirPath: string, stmts: Statement[]) {
  if (fs.existsSync(dirPath)) {
    remove(dirPath);
  }
  mkdir(dirPath);
  writeIndex(dirPath, `# PureWriter\n`);

  const [folderStmt, categoryStmt, articleStmt] = stmts;
  for (const folder of await folderStmt.all<PWFolder[]>()) {
    const categories = await categoryStmt.all<PWFolder[]>({
      '@folderId': folder.id,
    });
    let index = 0;
    let category = categories[index];
    let rank = categories.length !== 0 ? category.rank : Infinity;

    const folderPath = writeFolder(dirPath, folder);
    let categoryPath = folderPath;

    await articleStmt.each<PWArticle>({
      '@folderId': folder.id,
    }, (err, article) => {
      if (article.rank < rank) {
        writeArticle(categoryPath, article);
        return;
      }
      categoryPath = writeFolder(folderPath, category);
      writeArticle(categoryPath, article);

      category = categories[++index];
      rank = index < categories.length ? category.rank : Infinity;
    });
  }
}

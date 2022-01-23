import { dump } from 'js-yaml';

function formatDate(value: number) {
  return new Date(value).toJSON();
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

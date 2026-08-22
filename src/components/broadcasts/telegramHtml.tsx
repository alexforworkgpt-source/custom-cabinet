import type { ReactNode } from 'react';

type Token =
  | { kind: 'text'; value: string }
  | { kind: 'open'; tag: string; href?: string }
  | { kind: 'close'; tag: string }
  | { kind: 'br' };

const TG_TAGS = new Set([
  'b',
  'strong',
  'i',
  'em',
  'u',
  'ins',
  's',
  'strike',
  'del',
  'code',
  'pre',
  'a',
  'tg-spoiler',
  'span',
]);

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /<(\/?)([a-z][a-z0-9-]*)(\s+[^>]*)?>|<br\s*\/?>/gi;
  const matches = [...input.matchAll(pattern)];
  let lastIdx = 0;
  for (const match of matches) {
    const idx = match.index || 0;
    if (idx > lastIdx) tokens.push({ kind: 'text', value: input.slice(lastIdx, idx) });
    if (match[0].toLowerCase().startsWith('<br')) {
      tokens.push({ kind: 'br' });
    } else {
      const isClose = match[1] === '/';
      const tag = match[2].toLowerCase();
      if (!TG_TAGS.has(tag)) {
        tokens.push({ kind: 'text', value: match[0] });
      } else if (isClose) {
        tokens.push({ kind: 'close', tag });
      } else {
        let href: string | undefined;
        if (tag === 'a' && match[3]) {
          const hrefMatch = match[3].match(/href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'/i);
          href = hrefMatch ? hrefMatch[1] || hrefMatch[2] : undefined;
        }
        tokens.push({ kind: 'open', tag, href });
      }
    }
    lastIdx = idx + match[0].length;
  }
  if (lastIdx < input.length) tokens.push({ kind: 'text', value: input.slice(lastIdx) });
  return tokens;
}

function renderText(value: string, key: number): ReactNode {
  const parts = value.split(/\n/);
  return parts.flatMap((part, index) =>
    index === 0 ? [part] : [<br key={`nl-${key}-${index}`} />, part],
  );
}

type Frame = { tag: string | null; href?: string; children: ReactNode[] };

function wrap(frame: Frame, key: number): ReactNode {
  const elementKey = `el-${key}`;
  switch (frame.tag) {
    case 'b':
    case 'strong':
      return <b key={elementKey}>{frame.children}</b>;
    case 'i':
    case 'em':
      return <i key={elementKey}>{frame.children}</i>;
    case 'u':
    case 'ins':
      return <u key={elementKey}>{frame.children}</u>;
    case 's':
    case 'strike':
    case 'del':
      return <s key={elementKey}>{frame.children}</s>;
    case 'code':
      return (
        <code key={elementKey} className="rounded bg-dark-950/30 px-1 font-mono text-[0.92em]">
          {frame.children}
        </code>
      );
    case 'pre':
      return (
        <pre key={elementKey} className="my-1 rounded bg-dark-950/30 p-2 font-mono text-[0.92em]">
          {frame.children}
        </pre>
      );
    case 'a': {
      const safeHref =
        frame.href && /^(https?:|tg:|mailto:|tel:)/i.test(frame.href) ? frame.href : '#';
      return (
        <a
          key={elementKey}
          href={safeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          {frame.children}
        </a>
      );
    }
    case 'tg-spoiler':
    case 'span':
      return <span key={elementKey}>{frame.children}</span>;
    default:
      return <span key={elementKey}>{frame.children}</span>;
  }
}

export function renderTelegramHtml(input: string): ReactNode {
  const root: Frame = { tag: null, children: [] };
  const stack: Frame[] = [root];
  let textKey = 0;
  let elementKey = 0;

  for (const token of tokenize(input)) {
    const top = stack[stack.length - 1] ?? root;
    if (token.kind === 'text') {
      top.children.push(<span key={`t-${textKey++}`}>{renderText(token.value, textKey)}</span>);
    } else if (token.kind === 'br') {
      top.children.push(<br key={`br-${elementKey++}`} />);
    } else if (token.kind === 'open') {
      stack.push({ tag: token.tag, href: token.href, children: [] });
    } else {
      let foundIndex = -1;
      for (let index = stack.length - 1; index >= 1; index--) {
        if (stack[index].tag === token.tag) {
          foundIndex = index;
          break;
        }
      }
      if (foundIndex === -1) continue;
      while (stack.length > foundIndex) {
        const closed = stack.pop();
        if (!closed) break;
        const parent = stack[stack.length - 1] ?? root;
        parent.children.push(wrap(closed, elementKey++));
      }
    }
  }

  while (stack.length > 1) {
    const closed = stack.pop();
    if (!closed) break;
    const parent = stack[stack.length - 1] ?? root;
    parent.children.push(wrap(closed, elementKey++));
  }

  return root.children;
}

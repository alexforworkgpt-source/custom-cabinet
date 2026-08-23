import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const RENDERERS = [
  'src/pages/Support.tsx',
  'src/pages/AdminTickets.tsx',
  'src/components/admin/userDetail/TicketsTab.tsx',
];

const MESSAGE_BODY_RE =
  /className="([^"]*)"\s*(?:\/\/[^\n]*\s*)*dangerouslySetInnerHTML=\{\{\s*__html:\s*linkifyText\(msg\.message_text\)/g;

function messageBodyClasses(file: string): string[] {
  const source = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
  return [...source.matchAll(MESSAGE_BODY_RE)].map((match) => match[1]);
}

describe.each(RENDERERS)('%s', (file) => {
  it('renders sanitized and linkified ticket message bodies', () => {
    expect(messageBodyClasses(file).length).toBeGreaterThan(0);
  });

  it('wraps long unbroken message tokens', () => {
    for (const classes of messageBodyClasses(file)) {
      expect(classes).toContain('whitespace-pre-wrap');
      expect(classes).toContain('break-words');
    }
  });
});

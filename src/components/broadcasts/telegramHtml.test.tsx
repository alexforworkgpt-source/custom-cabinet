import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { renderTelegramHtml } from './telegramHtml';

describe('renderTelegramHtml', () => {
  it('renders supported Telegram formatting and safe links', () => {
    const html = renderToStaticMarkup(
      renderTelegramHtml('<strong>Bold</strong><br><a href="https://example.com">Link</a>'),
    );

    expect(html).toBe(
      '<b><span>Bold</span></b><br/><a href="https://example.com" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline"><span>Link</span></a>',
    );
  });

  it('safely closes an unclosed Telegram formatting tag', () => {
    const html = renderToStaticMarkup(renderTelegramHtml('Start <b>bold'));

    expect(html).toBe('<span>Start </span><b><span>bold</span></b>');
  });

  it('recovers from crossed tags and blocks unsafe links', () => {
    const html = renderToStaticMarkup(
      renderTelegramHtml('<b>bold <i>both</b> tail <a href="javascript:alert(1)">bad</a>'),
    );

    expect(html).toBe(
      '<b><span>bold </span><i><span>both</span></i></b><span> tail </span><a href="#" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline"><span>bad</span></a>',
    );
  });
});

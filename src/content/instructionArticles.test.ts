import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getInstructionArticle } from './instructionArticles';
import {
  getInstructionImageAlt,
  getInstructionImageData,
  instructionImageCount,
} from './instructionImages';
import { getInstructionNavigation, resolveInstructionActionRoute } from './instructionNavigation';
import { instructionContentPack, instructionSummaries } from './instructions';

describe('cabinet instruction catalog', () => {
  it('opens every published instruction with its declared number of steps', () => {
    expect(instructionSummaries).toHaveLength(13);
    expect(instructionSummaries.reduce((total, item) => total + item.stepCount, 0)).toBe(69);
    expect(instructionImageCount).toBe(69);

    for (const item of instructionSummaries) {
      const article = getInstructionArticle(item.slug);
      expect(article, item.slug).toBeDefined();
      expect(article?.steps, item.slug).toHaveLength(item.stepCount);

      const stepIds = article?.steps.map((step) => step.id) ?? [];
      expect(new Set(stepIds).size, `${item.slug} step ids`).toBe(stepIds.length);

      article?.steps.forEach((step, index) => {
        const image = getInstructionImageData(item.slug, index);
        expect(image, `${item.slug}/${step.id}`).toBeDefined();
        expect(getInstructionImageAlt(step.heading)).not.toHaveLength(0);

        if (!image) return;
        const file = readFileSync(join(process.cwd(), 'public', image.src.slice(1)));
        expect(file.subarray(1, 4).toString(), image.src).toBe('PNG');
        expect(file.readUInt32BE(16), `${image.src} width`).toBe(image.width);
        expect(file.readUInt32BE(20), `${image.src} height`).toBe(image.height);
      });
    }
  });

  it('uses reviewed metadata, safe actions, and valid acyclic related links', () => {
    expect(instructionContentPack).toEqual({
      locale: 'ru',
      sourceBatch: 'batch-r2.4-codex-0831-refresh1',
      lastReviewed: '2026-09-01',
    });

    const publishedSlugs = new Set(instructionSummaries.map((item) => item.slug));
    instructionSummaries.forEach((item, index) => {
      const navigation = getInstructionNavigation(item.slug);
      expect(navigation, item.slug).toBeDefined();
      if (!navigation) return;

      expect(resolveInstructionActionRoute(navigation.action)).toMatch(/^\/(?!\/)/);
      for (const relatedSlug of navigation.relatedSlugs) {
        expect(publishedSlugs.has(relatedSlug), `${item.slug} -> ${relatedSlug}`).toBe(true);
        expect(
          instructionSummaries.findIndex((related) => related.slug === relatedSlug),
          `${item.slug} -> ${relatedSlug} must move forward`,
        ).toBeGreaterThan(index);
      }
    });
  });

  it('keeps subscription sharing as two exclusive content scenarios', () => {
    const article = getInstructionArticle('share-subscription');
    expect(article?.scenarios?.map((scenario) => scenario.id)).toEqual([
      'sender',
      'recipient-android',
    ]);
    expect(article?.steps.filter((step) => step.group === 'sender')).toHaveLength(3);
    expect(article?.steps.filter((step) => step.group === 'recipient-android')).toHaveLength(9);
  });
});

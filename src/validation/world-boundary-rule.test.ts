import { describe, expect, test } from 'bun:test';
import { createWorldBoundaryRule } from './world-boundary-rule';
import type { PromptAnalyzer } from '../analysis/prompt-analyzer';

const createMockAnalyzer = (anachronisms: string[]): PromptAnalyzer => ({
    analyze: async () => ({ entityReferences: [], anachronisms }),
});

describe('WorldBoundaryRule', () => {
    test('returns no violations for empty prompt', async () => {
        const rule = createWorldBoundaryRule({
            analyzer: createMockAnalyzer([]),
            worldSetting: 'medieval fantasy',
        });

        const violations = await rule.check('');

        expect(violations).toEqual([]);
    });

    test('returns no violations when LLM says term fits', async () => {
        const rule = createWorldBoundaryRule({
            analyzer: createMockAnalyzer([]),
            worldSetting: 'medieval fantasy',
        });

        const violations = await rule.check('I walked to the castle.');

        expect(violations).toEqual([]);
    });

    test('returns violation when LLM says term does not fit', async () => {
        const rule = createWorldBoundaryRule({
            analyzer: createMockAnalyzer(['snorkeling']),
            worldSetting: 'medieval fantasy',
        });

        const violations = await rule.check('I went snorkeling.');

        expect(violations).toHaveLength(1);
        expect(violations[0].term).toBe('snorkeling');
        expect(violations[0].type).toBe('world-boundary');
    });
});

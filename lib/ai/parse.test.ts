import { describe, it, expect } from 'vitest';
import { parseSuggestResponse } from '@/lib/ai/parse';

const validIds = new Set(['t1', 'b1', 's1', 'o1', 'a1']);

describe('parseSuggestResponse', () => {
  it('parses a clean JSON object', () => {
    const raw = JSON.stringify({
      outfits: [
        {
          items: [
            { slot: 'ao', itemId: 't1' },
            { slot: 'quan', itemId: 'b1' },
            { slot: 'giay', itemId: 's1' },
          ],
          reason: 'Crisp and casual.',
        },
      ],
    });
    const out = parseSuggestResponse(raw, validIds);
    expect(out).toHaveLength(1);
    expect(out[0].reason).toBe('Crisp and casual.');
  });

  it('strips markdown code fences before parsing', () => {
    const raw =
      '```json\n{"outfits":[{"items":[{"slot":"ao","itemId":"t1"},{"slot":"quan","itemId":"b1"},{"slot":"giay","itemId":"s1"}],"reason":"ok"}]}\n```';
    expect(parseSuggestResponse(raw, validIds)).toHaveLength(1);
  });

  it('drops outfits referencing unknown item ids', () => {
    const raw = JSON.stringify({
      outfits: [
        { items: [
          { slot: 'ao', itemId: 't1' },
          { slot: 'quan', itemId: 'b1' },
          { slot: 'giay', itemId: 'GHOST' },
        ], reason: 'x' },
      ],
    });
    expect(parseSuggestResponse(raw, validIds)).toEqual([]);
  });

  it('drops outfits missing a required slot', () => {
    const raw = JSON.stringify({
      outfits: [
        { items: [
          { slot: 'ao', itemId: 't1' },
          { slot: 'quan', itemId: 'b1' },
        ], reason: 'no shoes' },
      ],
    });
    expect(parseSuggestResponse(raw, validIds)).toEqual([]);
  });

  it('drops refs with an invalid slot but keeps the outfit if still valid', () => {
    const raw = JSON.stringify({
      outfits: [
        { items: [
          { slot: 'ao', itemId: 't1' },
          { slot: 'quan', itemId: 'b1' },
          { slot: 'giay', itemId: 's1' },
          { slot: 'hat', itemId: 'a1' },
        ], reason: 'x' },
      ],
    });
    const out = parseSuggestResponse(raw, validIds);
    expect(out).toHaveLength(1);
    expect(out[0].items.find((r) => r.slot === 'hat' as never)).toBeUndefined();
  });

  it('returns [] for non-JSON garbage', () => {
    expect(parseSuggestResponse('I cannot help with that', validIds)).toEqual([]);
  });

  it('returns [] when outfits is missing or not an array', () => {
    expect(parseSuggestResponse('{"foo":1}', validIds)).toEqual([]);
    expect(parseSuggestResponse('{"outfits":"nope"}', validIds)).toEqual([]);
  });
});

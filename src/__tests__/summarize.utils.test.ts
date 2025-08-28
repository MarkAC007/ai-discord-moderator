import { parseRange } from '../utils/timeRange';
import { chunkText } from '../utils/chunk';
import { buildCorpus } from '../utils/corpus';

describe('summarize utils', () => {
  test('parseRange returns correct windows', () => {
    const now = 1_700_000_000_000; // fixed time
    const oneHour = parseRange('1h', now);
    expect(oneHour.to).toBe(now);
    expect(oneHour.from).toBe(now - 60 * 60 * 1000);

    const threeDays = parseRange('3d', now);
    expect(threeDays.from).toBe(now - 3 * 24 * 60 * 60 * 1000);
  });

  test('chunkText splits into reasonable chunks', () => {
    const text = 'a'.repeat(5000) + '\n' + 'b'.repeat(5000);
    const chunks = chunkText(text, { maxCharsPerChunk: 4000 });
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks[0]!.length).toBeLessThanOrEqual(4000);
  });

  test('buildCorpus normalizes and truncates messages', () => {
    const mk = (content: string, ts: number, username = 'u', bot = false) => ({
      author: { username, bot } as any,
      createdTimestamp: ts,
      cleanContent: content,
      content,
    }) as any;

    const messages = [
      mk('hello\nworld', 1000),
      mk('x'.repeat(2000), 2000),
      mk('', 3000), // skipped empty
    ];

    const res = buildCorpus(messages as any, { maxMessageLength: 100 });
    expect(res.totalMessages).toBe(3);
    expect(res.truncatedCount).toBe(1);
    expect(res.corpus.split('\n').length).toBe(2); // one skipped
    expect(res.corpus).toContain('hello world');
  });
});



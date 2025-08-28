import { Message } from 'discord.js';

export interface CorpusBuildOptions {
  maxMessageLength: number; // truncate individual message content
}

export interface CorpusResult {
  corpus: string; // newline-separated lines
  totalMessages: number;
  truncatedCount: number;
}

export function buildCorpus(messages: Message[], options: CorpusBuildOptions): CorpusResult {
  const lines: string[] = [];
  let truncatedCount = 0;

  for (const msg of messages) {
    const author = msg.author ? (msg.author.bot ? `${msg.author.username} [bot]` : msg.author.username) : 'Unknown';
    const ts = new Date(msg.createdTimestamp).toISOString();

    // Prefer textual content; fall back to embeds/attachments/system info when missing
    let content = (msg.cleanContent || msg.content || '').trim();

    if (!content) {
      // Try to extract meaningful text from embeds
      if (msg.embeds && msg.embeds.length > 0) {
        const first = msg.embeds[0];
        if (first) {
          const parts: string[] = [];
          if (first.title) parts.push(first.title);
          if (first.description) parts.push(first.description);
          if (first.fields && first.fields.length) {
            for (const f of first.fields.slice(0, 2)) {
              if (f.name) parts.push(f.name);
              if (f.value) parts.push(f.value);
            }
          }
          if (parts.length) {
            content = `embed: ${parts.join(' | ')}`;
          }
        }
      }
    }

    if (!content && msg.attachments && msg.attachments.size > 0) {
      const names = Array.from(msg.attachments.values()).map(a => a.name).filter(Boolean).join(', ');
      if (names) content = `attachments: ${names}`;
    }

    if (!content) {
      // As a last resort, record the message type
      content = `event: ${msg.type}`;
    }

    if (content.length > options.maxMessageLength) {
      content = content.slice(0, options.maxMessageLength) + '…';
      truncatedCount++;
    }

    // Collapse whitespace to one line
    content = content.replace(/\s+/g, ' ').trim();

    lines.push(`[${ts}] ${author}: ${content}`);
  }

  return {
    corpus: lines.join('\n'),
    totalMessages: messages.length,
    truncatedCount,
  };
}



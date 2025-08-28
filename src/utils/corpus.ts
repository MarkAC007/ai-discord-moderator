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
    let content = (msg.cleanContent || msg.content || '').trim();

    if (!content) {
      // Skip pure attachments/embeds without textual content
      continue;
    }

    if (content.length > options.maxMessageLength) {
      content = content.slice(0, options.maxMessageLength) + '…';
      truncatedCount++;
    }

    // Collapse newlines to keep one line per message
    content = content.replace(/\s+/g, ' ').trim();

    lines.push(`[${ts}] ${author}: ${content}`);
  }

  return {
    corpus: lines.join('\n'),
    totalMessages: messages.length,
    truncatedCount,
  };
}



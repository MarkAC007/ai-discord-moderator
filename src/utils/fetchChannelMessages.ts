import { AnyThreadChannel, GuildTextBasedChannel, Message } from 'discord.js';

export type TextLikeChannel = GuildTextBasedChannel | AnyThreadChannel;

export interface FetchOptions {
  fromTimestamp: number; // inclusive lower bound
  toTimestamp: number;   // exclusive upper bound (typically now)
  maxMessages: number;   // hard cap (100–5000)
  includeBots: boolean;  // include messages authored by bots
}

export interface FetchedMessages {
  messages: Message[];
  uniqueAuthorIds: Set<string>;
}

export async function fetchMessagesInWindow(
  channel: TextLikeChannel,
  opts: FetchOptions
): Promise<FetchedMessages> {
  const messages: Message[] = [];
  const uniqueAuthorIds = new Set<string>();

  let beforeId: string | undefined = undefined;
  const limitPerPage = 100;

  while (messages.length < opts.maxMessages) {
    const remaining = opts.maxMessages - messages.length;
    const fetchLimit = Math.min(limitPerPage, remaining);

    const fetchOptions: { limit: number; before?: string } = { limit: fetchLimit };
    if (beforeId) {
      fetchOptions.before = beforeId;
    }
    const page = await channel.messages.fetch(fetchOptions);
    if (page.size === 0) break;

    let reachedOlderThanWindow = false;

    for (const msg of page.values()) {
      const created = msg.createdTimestamp;

      if (created >= opts.toTimestamp) {
        // newer than window upper bound (should be rare when paginating backwards)
        continue;
      }
      if (created < opts.fromTimestamp) {
        // we've gone past the lower bound; stop paginating
        reachedOlderThanWindow = true;
        continue;
      }

      const authorId = msg.author?.id;
      const isBot = !!msg.author?.bot;
      if (!opts.includeBots && isBot) continue;

      messages.push(msg);
      if (authorId) uniqueAuthorIds.add(authorId);

      if (messages.length >= opts.maxMessages) {
        break;
      }
    }

    if (messages.length >= opts.maxMessages) break;

    // prepare for next page (older than the oldest we just saw)
    const oldest = page.last();
    beforeId = oldest?.id;

    if (!beforeId || reachedOlderThanWindow) {
      break;
    }
  }

  return { messages, uniqueAuthorIds };
}



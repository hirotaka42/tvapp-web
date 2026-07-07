import { AbemaChannel, AbemaShelf, AbemaSlot } from '@/types/abema/view';

function channelNameFor(channels: AbemaChannel[], channelId: string): string {
  return channels.find((channel) => channel.id === channelId)?.name || channelId;
}

function uniqueById(slots: AbemaSlot[]): AbemaSlot[] {
  const seen = new Set<string>();
  return slots.filter((slot) => {
    if (seen.has(slot.id)) return false;
    seen.add(slot.id);
    return true;
  });
}

export function deriveShelves(slots: AbemaSlot[], channels: AbemaChannel[], now = Date.now()): AbemaShelf[] {
  const futureAndLive = slots
    .filter((slot) => slot.endMs > now)
    .sort((left, right) => left.startMs - right.startMs);

  const live = futureAndLive.filter((slot) => slot.startMs <= now && now < slot.endMs).slice(0, 8);
  const soon = futureAndLive.filter((slot) => slot.startMs > now).slice(0, 8);
  const anime = futureAndLive
    .filter((slot) => `${channelNameFor(channels, slot.channelId)} ${slot.title} ${slot.labels.join(' ')}`.toLowerCase().includes('anime')
      || `${channelNameFor(channels, slot.channelId)} ${slot.title} ${slot.labels.join(' ')}`.includes('アニメ'))
    .slice(0, 8);

  const source: Array<[string, string, AbemaSlot[]]> = [
    ['live', '生放送中', live],
    ['soon', 'まもなく放送', soon],
    ['anime', 'アニメの本日の番組', anime],
  ];

  const shelves = source
    .map(([key, title, items]) => ({
      key,
      title,
      note: '番組表より抽出',
      items: uniqueById(items),
    }))
    .filter((shelf) => shelf.items.length > 0);

  if (shelves.length > 0) return shelves;

  return [{
    key: 'today',
    title: '本日のピックアップ',
    note: '番組表より抽出',
    items: uniqueById(slots.slice(0, 8)),
  }].filter((shelf) => shelf.items.length > 0);
}

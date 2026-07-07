import { AbemaChannel, AbemaEpgGrid, AbemaSlot } from '@/types/abema/view';
import { deriveNowPercent } from './deriveNowPercent';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

function formatHour(ms: number): string {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).format(new Date(ms));
}

export function deriveEpgGrid(
  channels: AbemaChannel[],
  slots: AbemaSlot[],
  now: number,
  windowHours = 5,
  slotMinutes = 30,
): AbemaEpgGrid {
  const slotMs = slotMinutes * MINUTE_MS;
  const startMs = Math.floor((now - 30 * MINUTE_MS) / slotMs) * slotMs;
  const endMs = startMs + windowHours * HOUR_MS;
  const columnCount = Math.ceil((endMs - startMs) / slotMs);
  const columns = Array.from({ length: columnCount }, (_, index) => {
    const columnStart = startMs + index * slotMs;
    return { label: formatHour(columnStart), startMs: columnStart };
  });

  const rows = channels.map((channel) => {
    const cells = slots
      .filter((slot) => slot.channelId === channel.id && slot.endMs > startMs && slot.startMs < endMs)
      .sort((left, right) => left.startMs - right.startMs)
      .map((slot) => {
        const clippedStart = Math.max(slot.startMs, startMs);
        const clippedEnd = Math.min(slot.endMs, endMs);
        return {
          slot,
          colStart: Math.floor((clippedStart - startMs) / slotMs) + 2,
          colSpan: Math.max(1, Math.ceil((clippedEnd - clippedStart) / slotMs)),
          isLive: slot.startMs <= now && now < slot.endMs,
        };
      });

    return { channel, cells };
  }).filter((row) => row.cells.length > 0);

  return {
    window: { startMs, endMs },
    columns,
    rows,
    nowPercent: deriveNowPercent({ startMs, endMs }, now),
  };
}

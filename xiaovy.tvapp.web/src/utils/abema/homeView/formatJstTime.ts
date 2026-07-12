const JST_TIME = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Tokyo',
});

export function formatJstTime(ms: number): string {
  return JST_TIME.format(new Date(ms));
}

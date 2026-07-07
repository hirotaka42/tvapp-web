import { describe, expect, it } from 'vitest';
import { parseComingIcs } from '../src/icsParser.mjs';

describe('parseComingIcs', () => {
  it('unfolds lines and maps VEVENT fields', () => {
    const rows = parseComingIcs(`BEGIN:VCALENDAR
BEGIN:VEVENT
UID:eiga.com_103487
DTSTART;VALUE=DATE:20260718
SUMMARY:サンプル映画
DESCRIPTION:劇場公開作品です。\\nhttps://eiga.com/movie/103487/
END:VEVENT
BEGIN:VEVENT
UID:eiga.com_103488
DTSTART;VALUE=DATE:20260801
SUMMARY:配信だけの映画
DESCRIPTION:配信で公開されます。
 https://eiga.com/movie/103488/
END:VEVENT
END:VCALENDAR`);

    expect(rows).toEqual([
      {
        title: 'サンプル映画',
        releaseDate: '2026-07-18',
        datePrecision: 'day',
        source: 'eiga_com',
        sourceKey: 'eiga.com_103487',
        sourceUrl: 'https://eiga.com/movie/103487/',
        isStreamingOnly: false,
      },
      {
        title: '配信だけの映画',
        releaseDate: '2026-08-01',
        datePrecision: 'day',
        source: 'eiga_com',
        sourceKey: 'eiga.com_103488',
        sourceUrl: 'https://eiga.com/movie/103488/',
        isStreamingOnly: true,
      },
    ]);
  });
});

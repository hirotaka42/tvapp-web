import { AbemaEpgGrid } from '@/types/abema/view';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { abemaSlotPlaybackPath } from '@/utils/abema/playbackUrl';

function shortCode(name: string): string {
  return name.replace(/\s+/g, '').slice(0, 8).toUpperCase();
}

interface AbemaEpgProps {
  grid: AbemaEpgGrid;
  liveCount: number;
  nowLabel: string;
}

export function AbemaEpg({ grid, liveCount, nowLabel }: AbemaEpgProps) {
  return (
    <section className="ab-epg" id="ab-epg" aria-label="番組表">
      <div className="ab-epg-h">
        <h2>いま放送中 - 番組表</h2>
        <span className="now"><i aria-hidden="true" />{nowLabel} 現在・{liveCount}ch 生放送中</span>
        <a href="https://abema.tv/timetable" target="_blank" rel="noopener noreferrer">ABEMA番組表 →</a>
      </div>
      <div className="ab-epg-sc">
        <div className="ab-grid" style={{ '--ab-now': `${grid.nowPercent}%`, '--ab-cols': grid.columns.length } as CSSProperties}>
          <div className="ab-nowln" aria-hidden="true" />
          <div className="ab-trow hdr">
            <div />
            {grid.columns.map((column) => (
              <div className="ab-tc ab-cnd" key={column.startMs}>{column.label}</div>
            ))}
          </div>
          {grid.rows.map((row) => (
            <div className="ab-trow" key={row.channel.id}>
              <div className="ab-chl"><b>{row.channel.name}</b><span>{shortCode(row.channel.id)}</span></div>
              {row.cells.map((cell) => (
                <Link
                  className={`ab-pg ${cell.isLive ? 'on' : ''}`}
                  href={abemaSlotPlaybackPath(cell.slot)}
                  key={cell.slot.id}
                  style={{ gridColumn: `${cell.colStart} / span ${cell.colSpan}` }}
                >
                  <b>{cell.slot.title}</b>
                  <span>{cell.slot.highlight || cell.slot.detailHighlight || 'ABEMAで開く'}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

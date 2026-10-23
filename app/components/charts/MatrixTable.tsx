'use client';
import { CSS, maxOf } from '@/lib/tokens';

export type MatrixRowData = { key: string; cells: (number | null)[]; counts: number[] };

/* <table> tay, nền ô pha 5% → 29%. ĐỪNG dùng 8% → 48%: ô cao nhất thành ô khó đọc nhất,
   và ở dark mode đảo thành ô sáng nhất. Chỉ số nghịch (rời bỏ, DT mất) pha bằng --bad.
   Ô có dưới 10 khách hiện mờ — ít khách thì tỷ lệ dao động mạnh (G30). */
export function MatrixTable({ rows, cols, width, height, inverse, format }: {
  rows: MatrixRowData[];
  cols: string[];
  width: number;
  height: number;
  inverse: boolean;
  format: (v: number) => string;
}) {
  const all = rows.flatMap((r) => r.cells).filter((v): v is number => v != null);
  const hi = maxOf(all);
  const lo = Math.min(...all, 0);
  const tint = (v: number) => {
    const t = (v - lo) / (hi - lo || 1);
    return `color-mix(in srgb, ${inverse ? CSS('--bad') : CSS('--ink')} ${5 + t * 24}%, transparent)`;
  };
  const cell = { padding: '6px 2px', fontSize: 11 } as const;

  return (
    <div className="tscroll" style={{ width, height, overflowY: 'auto' }}>
      <table style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 82 }} />
          {cols.map((c) => <col key={c} />)}
        </colgroup>
        <thead>
          <tr>
            <th style={{ ...cell, paddingLeft: 6 }}>Gói</th>
            {cols.map((c) => <th key={c} style={{ ...cell, textAlign: 'center' }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td style={{ ...cell, paddingLeft: 6, fontSize: 12 }}>{r.key}</td>
              {r.cells.map((v, i) => {
                const few = r.counts[i] < 10;
                return (
                  <td key={cols[i]} style={{ ...cell, textAlign: 'center' }}
                      title={`${r.key} · ${cols[i]} · ${r.counts[i]} khách${few ? ' — ít khách, dễ dao động' : ''}`}>
                    <span className="heat"
                          style={{ background: v == null ? 'transparent' : tint(v), minWidth: 0, width: '100%',
                                   textAlign: 'center', padding: '6px 0', color: few ? 'var(--ink2)' : 'var(--ink)',
                                   fontWeight: few ? 400 : 500 }}>
                      {v == null ? '—' : format(v)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

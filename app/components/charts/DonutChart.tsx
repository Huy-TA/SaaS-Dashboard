'use client';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { ChartTip } from '@/components/ChartCard';
import { CSS } from '@/lib/tokens';

export type Slice = { name: string; value: number; color: string };

/* Tỷ trọng một số tiền (MRR hoặc doanh thu đã mất). Legend do ChartCard vẽ phía trên,
   chiều cao truyền vào đã trừ LGD2 = 44. Tổng ở giữa vòng. */
export function DonutChart({ width, height, data, total, centerLabel, format, onSelect }: {
  width: number;
  height: number;
  data: Slice[];
  total: string;
  centerLabel: string;
  format: (v: number) => string;
  onSelect?: (name: string) => void;
}) {
  const r = Math.min(width, height) / 2 - 4;
  const sum = data.reduce((s, d) => s + d.value, 0);
  const pct = (v: number) => (sum ? `${((v / sum) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '—');

  return (
    <div style={{ position: 'relative', width, height }}>
      <PieChart width={width} height={height}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
             innerRadius={r * 0.66} outerRadius={r} paddingAngle={1.2}
             stroke={CSS('--card')} strokeWidth={1.5} isAnimationActive={false}
             onClick={(_, i) => onSelect?.(data[i].name)}
             style={{ cursor: onSelect ? 'pointer' : 'default' }}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip content={(p) => <ChartTip {...p} format={(v) => `${format(v)} · ${pct(v)}`} />} />
      </PieChart>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em' }}>{total}</div>
        <div style={{ fontSize: 10.5, color: 'var(--ink2)' }}>{centerLabel}</div>
      </div>
    </div>
  );
}

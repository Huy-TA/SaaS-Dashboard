'use client';
import { Bar, BarChart, Cell, LabelList, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTip, axisTick } from '@/components/ChartCard';
import { CSS, maxOf } from '@/lib/tokens';

export type RankItem = { name: string; value: number; color: string };

/* Thanh ngang, tên nhóm nằm cạnh thanh ⇒ không cần legend. Giá trị in ở cuối thanh. */
export function RankBarChart({ width, height, data, format, onSelect }: {
  width: number;
  height: number;
  data: RankItem[];
  format: (v: number) => string;
  onSelect?: (name: string) => void;
}) {
  const hi = maxOf(data.map((d) => d.value));
  const barSize = Math.min(26, Math.floor((height - 8) / Math.max(data.length, 1) * 0.55));

  return (
    <BarChart width={width} height={height} data={data} layout="vertical"
              margin={{ top: 4, right: 64, bottom: 4, left: 0 }}>
      <XAxis type="number" hide domain={[0, hi]} />
      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={96}
             tick={axisTick(-1, 'y')} />
      <Bar dataKey="value" name="Giá trị" barSize={barSize} radius={[0, 4, 4, 0]}
           background={{ fill: CSS('--sub2'), radius: 4 }} isAnimationActive={false}
           onClick={(_, i) => onSelect?.(data[i].name)}
           style={{ cursor: onSelect ? 'pointer' : 'default' }}>
        {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        <LabelList dataKey="value" position="right" offset={8}
                   formatter={(v) => (typeof v === 'number' ? format(v) : '')}
                   style={{ fontSize: 11.5, fontWeight: 600, fill: CSS('--ink'), fontVariantNumeric: 'tabular-nums' }} />
      </Bar>
      <Tooltip cursor={{ fill: CSS('--sub') }}
               content={(p) => <ChartTip {...p} format={format} title={(l) => l} />} />
    </BarChart>
  );
}

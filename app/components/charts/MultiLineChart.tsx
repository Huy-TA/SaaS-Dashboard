'use client';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTip, axisTick, niceTicks } from '@/components/ChartCard';
import { CSS, maxOf } from '@/lib/tokens';

export type LineSeries = { name: string; color: string };
export type LinePoint = { label: string } & Record<string, number | null | string>;

/* ≤ 5 đường. Legend 1 hàng do ChartCard vẽ; chiều cao truyền vào đã trừ LGD1 = 24. */
export function MultiLineChart({ width, height, data, series, format, axisFormat }: {
  width: number;
  height: number;
  data: LinePoint[];
  series: LineSeries[];
  format: (v: number) => string;
  axisFormat: (v: number) => string;
}) {
  const all = data.flatMap((d) => series.map((s) => d[s.name])).filter((v): v is number => typeof v === 'number');
  const yTicks = niceTicks(maxOf(all));

  return (
    <LineChart width={width} height={height} data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
      <CartesianGrid stroke={CSS('--fill4')} vertical={false} />
      <XAxis dataKey="label" interval={0} axisLine={false} tickLine={false}
             tick={axisTick(data.length - 1)} height={20} />
      <YAxis domain={[0, yTicks[yTicks.length - 1]]} ticks={yTicks} tickFormatter={axisFormat}
             axisLine={false} tickLine={false}
             tick={axisTick(-1, 'y')} width={48} />
      {series.map((s) => (
        <Line key={s.name} type="monotone" dataKey={s.name} name={s.name} stroke={s.color}
              strokeWidth={1.75} dot={{ r: 2, fill: s.color, strokeWidth: 0 }} activeDot={{ r: 3.5 }}
              connectNulls isAnimationActive={false} />
      ))}
      <Tooltip cursor={{ stroke: CSS('--line') }}
               content={(p) => <ChartTip {...p} format={format} />} />
    </LineChart>
  );
}

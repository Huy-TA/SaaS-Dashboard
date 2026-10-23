'use client';
import { Area, AreaChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTip, axisTick, niceTicks } from '@/components/ChartCard';
import { CSS, maxOf } from '@/lib/tokens';

export type TrendPoint = { label: string; value: number | null };

/* Một chuỗi theo kỳ đăng ký. Không legend — tiêu đề card đã nói đang vẽ gì.
   `threshold` (nếu có) là đường cảnh báo gạch ngang, mực nhạt. */
export function TrendAreaChart({ width, height, data, name, format, axisFormat, threshold }: {
  width: number;
  height: number;
  data: TrendPoint[];
  name: string;
  format: (v: number) => string;
  axisFormat: (v: number) => string;
  threshold?: number;
}) {
  const yTicks = niceTicks(maxOf(data.map((d) => d.value ?? 0).concat(threshold ?? 0)));
  const step = Math.max(1, Math.ceil(data.length / 12));
  const ticks = data.filter((_, i) => i % step === 0 || i === data.length - 1).map((d) => d.label);

  return (
    <AreaChart width={width} height={height} data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
      <CartesianGrid stroke={CSS('--fill4')} vertical={false} />
      <XAxis dataKey="label" ticks={ticks} interval={0} axisLine={false} tickLine={false}
             tick={axisTick(ticks.length - 1)} height={20} />
      <YAxis domain={[0, yTicks[yTicks.length - 1]]} ticks={yTicks} tickFormatter={axisFormat}
             axisLine={false} tickLine={false}
             tick={axisTick(-1, 'y')} width={48} />
      {threshold != null && (
        <ReferenceLine y={threshold} stroke={CSS('--ink3')} strokeDasharray="4 4" ifOverflow="extendDomain" />
      )}
      <Area type="monotone" dataKey="value" name={name} connectNulls
            stroke={CSS('--focus')} fill={CSS('--focus')} fillOpacity={0.08}
            strokeWidth={1.75} dot={false} isAnimationActive={false} />
      <Tooltip cursor={{ stroke: CSS('--line') }} content={(p) => <ChartTip {...p} format={format} />} />
    </AreaChart>
  );
}

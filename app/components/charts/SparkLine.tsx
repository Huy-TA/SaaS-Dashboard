'use client';
import { CSS, maxOf } from '@/lib/tokens';
import type { Level } from '@/lib/types';

/* SVG tay — Recharts ReferenceLine kéo theo hệ trục và lề, không vừa hộp 30px.
   Đường chuẩn gạch ngang là BẮT BUỘC: ngưỡng nghiệp vụ, hoặc trung bình kỳ. */
export function SparkLine({ values, baseline, width, height, tone = null }: {
  values: (number | null)[];
  baseline: number;
  width: number;
  height: number;
  tone?: Level | null;     // null = giữ mực (KPI không có ngưỡng)
}) {
  const pts = values.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v != null);
  if (pts.length < 2) return <svg width={width} height={height} />;

  const pad = 2;
  const hi = Math.max(maxOf(pts.map((p) => p.v)), baseline);
  const lo = Math.min(...pts.map((p) => p.v), baseline, 0);
  const span = hi - lo || 1;
  const x = (i: number) => (i / Math.max(values.length - 1, 1)) * width;
  const y = (v: number) => pad + (1 - (v - lo) / span) * (height - pad * 2);

  const line = pts.map((p) => `${x(p.i)},${y(p.v)}`).join(' ');
  const stroke = tone ? CSS(`--${tone}`) : CSS('--ink2');

  return (
    <svg width={width} height={height} aria-hidden="true">
      <line x1={0} x2={width} y1={y(baseline)} y2={y(baseline)}
            stroke={CSS('--ink3')} strokeWidth={1} strokeDasharray="3 3" />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth={1.5}
                strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

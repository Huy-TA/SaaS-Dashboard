'use client';
import type { ReactNode } from 'react';
import type { BaseTickContentProps, TooltipContentProps } from 'recharts';
import { CSS } from '@/lib/tokens';

/* Thứ tự bắt buộc: tiêu đề (chead 43px) → legend → vùng vẽ. Padding 14 = CARD_PAD. */
export function ChartCard({ width, title, subtitle, subtitleTip, control, legend, children }: {
  width: number;
  title: string;
  subtitle?: string;
  subtitleTip?: string;      // cách tính — hiện khi rê chuột lên dòng phụ
  control?: ReactNode;
  legend?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="card" style={{ width, flex: `0 0 ${width}px` }}>
      <div className="chead">
        {/* Tiêu đề là câu trả lời, dài ngắn theo dữ liệu ⇒ một dòng, cắt gọn, đủ câu ở tooltip.
            Xuống dòng sẽ phá khối chead 43px. */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="ct" title={title}
               style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          {subtitle && <div className="cs" title={subtitleTip ?? subtitle}
                            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>}
        </div>
        {control}
      </div>
      {legend}
      <div className="plot">{children}</div>
    </div>
  );
}

/* Nhãn trục: 10.5px, --ink2 (G23). Nhãn cuối text-anchor="end" để không bị xén mép phải. */
export function axisTick(lastIndex: number, axis: 'x' | 'y' = 'x') {
  function Tick(p: BaseTickContentProps & { x?: number | string; y?: number | string }) {
    const x = Number(p.x ?? 0), y = Number(p.y ?? 0);
    const anchor = axis === 'y' ? 'end' : p.index === lastIndex ? 'end' : p.index === 0 ? 'start' : 'middle';
    const text = p.tickFormatter ? p.tickFormatter(p.payload.value, p.index) : p.payload.value;
    return (
      <text x={x} y={axis === 'y' ? y + 3.5 : y + 12} textAnchor={anchor} fontSize={10.5} fill={CSS('--ink2')}>
        {String(text)}
      </text>
    );
  }
  return Tick;
}

/* Mốc trục cách đều, bước tròn (1 · 2 · 5 × 10ⁿ), khoảng 4 khoảng — không phải max × 1,1 lẻ. */
export function niceTicks(v: number): number[] {
  if (!(v > 0)) return [0, 1];
  const raw = v / 4;
  const p = 10 ** Math.floor(Math.log10(raw));
  const n = raw / p;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  const count = Math.ceil(v / step - 1e-9);
  return Array.from({ length: count + 1 }, (_, i) => Number((i * step).toPrecision(12)));
}

/* Tooltip dùng đúng class .tip của globals.css (hiển thị tĩnh thay vì position:fixed). */
export function ChartTip({ active, payload, label, format, title }: TooltipContentProps & {
  format: (v: number) => string;
  title?: (label: string) => string;
}) {
  if (!active || !payload?.length) return null;
  const head = title ? title(String(label ?? payload[0]?.name ?? '')) : String(label ?? '');
  return (
    <div className="tip" style={{ position: 'static', opacity: 1 }}>
      {head && <b>{head}</b>}
      {payload.map((p) => (
        <div className="r" key={String(p.dataKey ?? p.name)}>
          <i style={{ background: String(p.payload?.color ?? p.color ?? CSS('--ink2')) }} />
          {String(p.name)}
          <span>{typeof p.value === 'number' ? format(p.value) : '—'}</span>
        </div>
      ))}
    </div>
  );
}

'use client';
import { useId, useState, type SyntheticEvent } from 'react';
import { Icon } from '@/components/Icon';
import { tipPosition } from '@/components/Shell';
import { SparkLine } from '@/components/charts/SparkLine';
import type { Level } from '@/lib/types';

const TIP_W = 270;

/* 26 nhãn + 32 số/pill + 60 sparkline = 118 = băng KPI.
   Không có dòng chân (người dùng bỏ, 2026-10-23): sparkline lấy luôn 26px của dòng chân.
   Chỉ KPI có ngưỡng mới truyền `level` → chấm màu và sparkline đổi màu; giải thích ở tooltip.
   KPI không có ngưỡng giữ mực. */
const SPARK_BOX = 60;

export function KpiCard({ label, help, value, delta, points = false, inverse, level, spark, baseline, width }: {
  label: string;
  help: string;
  value: string;
  delta: number | null;      // null = không có kỳ trước
  points?: boolean;          // true: delta là chênh lệch tuyệt đối của một tỷ lệ ⇒ ghi "điểm %",
                             // vì "↑ 170%" của một tỷ lệ rất dễ đọc nhầm
  inverse: boolean;          // chỉ số nghịch: tăng là xấu
  level: Level | null;
  spark: (number | null)[];
  baseline: number;
  width: number;
}) {
  /* Tooltip mở bằng chuột (hover) hoặc bàn phím (Tab tới nhãn) */
  const [tip, setTip] = useState<{ left: number; top: number } | null>(null);
  const tipId = useId();
  const showTip = (e: SyntheticEvent<HTMLDivElement>) => setTip(tipPosition(e.currentTarget, TIP_W));

  let cls = 'n', arrow: 'arrow-up' | 'arrow-down' | null = null, text = '';
  if (delta != null && Number.isFinite(delta)) {
    const good = inverse ? delta < 0 : delta > 0;
    cls = Math.abs(delta) < 0.002 ? 'n' : good ? 'u' : 'd';
    arrow = delta >= 0 ? 'arrow-up' : 'arrow-down';
    const n = Math.abs(delta * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
    text = points ? `${n} điểm` : `${n}%`;
  }

  return (
    <div className="card kpi">
      <div className="kl" tabIndex={0} aria-describedby={tip ? tipId : undefined}
           onMouseEnter={showTip} onMouseLeave={() => setTip(null)}
           onFocus={showTip} onBlur={() => setTip(null)} style={{ cursor: 'help' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', flex: '0 0 7px',
                       background: level ? `var(--${level})` : 'var(--ink)' }} />
        {label}
      </div>
      {tip && (
        <div className="tip" role="tooltip" id={tipId}
             style={{ left: tip.left, top: tip.top, width: TIP_W, opacity: 1, whiteSpace: 'normal', lineHeight: 1.5 }}>
          <b>{label}</b>
          {help}
        </div>
      )}
      <div className="kv">
        {value}
        {/* Không có kỳ trước (khoảng "Toàn bộ") thì không hiện pill — một dấu "—" không nói gì */}
        {delta != null && (
          <span className={`del ${cls}`}
                title={`So với nhóm khách đăng ký trong kỳ liền trước, cùng độ dài${points ? ' — chênh lệch tính bằng điểm phần trăm' : ''}`}>
            {arrow && <Icon name={arrow} className="lu" />}{text}
          </span>
        )}
      </div>
      <div className="kspark" style={{ height: SPARK_BOX, flex: `0 0 ${SPARK_BOX}px`, paddingBottom: 8 }}>
        <SparkLine values={spark} baseline={baseline} width={width - 28} height={SPARK_BOX - 8} tone={level} />
      </div>
    </div>
  );
}

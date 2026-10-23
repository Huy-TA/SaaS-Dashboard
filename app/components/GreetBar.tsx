'use client';
import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/Icon';
import { PARAMS, fmtDate, greetVN, todayVN } from '@/lib/aggregate';
import type { Filters } from '@/lib/types';

function subscribeClock(cb: () => void) {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
}

type Chip = { key: string; label: string; clear: Partial<Filters> };

const PRESET_LABEL: Record<string, string> = { '2023': 'Năm 2023', '2024': 'Năm 2024', '2025': 'Năm 2025' };

export function GreetBar({ filters, onClear, onClearAll, onPickMetric }: {
  filters: Filters;
  onClear: (patch: Partial<Filters>) => void;
  onClearAll: () => void;
  onPickMetric: () => void;
}) {
  /* Đồng hồ là nguồn bên ngoài React: đọc theo nhịp 30 giây bằng useSyncExternalStore.
     Server trả null ⇒ không lệch HTML giữa server và trình duyệt. Giờ tính theo UTC+7. */
  const tick = useSyncExternalStore(subscribeClock, () => Math.floor(Date.now() / 30_000), () => null);
  const now = tick == null ? null : new Date(tick * 30_000);

  const chips: Chip[] = [];
  if (filters.preset !== 'all') {
    chips.push({
      key: 'date',
      label: `Đăng ký ${PRESET_LABEL[filters.preset] ?? `${fmtDate(filters.from)} – ${fmtDate(filters.to)}`}`,
      clear: { preset: 'all' },
    });
  }
  /* Nhiều giá trị thì gọn thành "3 khu vực" — chip phải vừa một hàng. */
  const list = (xs: string[], word: string) => (xs.length > 2 ? `${xs.length} ${word}` : xs.join(', '));
  if (filters.plans.length) chips.push({ key: 'plan', label: `Gói: ${list(filters.plans, 'gói')}`, clear: { plans: [] } });
  if (filters.regions.length) chips.push({ key: 'region', label: `Khu vực: ${list(filters.regions, 'khu vực')}`, clear: { regions: [] } });
  if (filters.status !== 'all') chips.push({ key: 'status', label: filters.status, clear: { status: 'all' } });

  const param = PARAMS.find((p) => p.key === filters.param)!;

  return (
    <div id="greet">
      <div style={{ flex: '1 1 0', minWidth: 0 }}>
        <div className="ghi">{now ? greetVN(now) : 'Xin chào'}</div>
        {/* Chữ nằm thẳng trên sàn --page: dùng --ink (design.md §4, G23) */}
        <div className="gday" style={{ color: 'var(--ink)' }}
             title={filters.status !== 'all' ? 'Bộ lọc trạng thái chỉ áp cho số khách, bảng và xuất dữ liệu' : undefined}>
          {filters.status === 'all' && now && `${todayVN(now)} · giờ Việt Nam · `}
          {/* Bộ chọn chỉ số nằm trong drawer (luật của skill); chữ này là lối tắt mở nó */}
          <button onClick={onPickMetric} title="Đổi chỉ số đang xem"
                  style={{ fontSize: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3,
                           display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            Đang xem: <b style={{ marginLeft: 3 }}>{param.label}</b>
            <Icon name="chevron-down" className="lu lu-xs" />
          </button>
          {filters.status !== 'all' && <> · <b>KPI không đổi theo bộ lọc trạng thái</b></>}
        </div>
      </div>

      <div className="chips" style={{ flex: '0 1 auto', minWidth: 0 }}>
        {chips.length === 0 && <span className="chip">Tất cả khách hàng</span>}
        {chips.map((c) => (
          <span className="chip" key={c.key}>
            {c.label}
            <button onClick={() => onClear(c.clear)} aria-label={`Bỏ lọc ${c.label}`}>
              <Icon name="x" className="lu lu-xs" />
            </button>
          </span>
        ))}
        {chips.length > 1 && <button className="chip" onClick={onClearAll}>Xoá tất cả</button>}
      </div>
    </div>
  );
}

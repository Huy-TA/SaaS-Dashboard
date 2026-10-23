'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import {
  DEFAULT_FILTERS, PARAMS, PLAN_ORDER, REGION_ORDER, applyScope, applyStatus, fmtInt, presetRange,
} from '@/lib/aggregate';
import type { Filters, Preset, Row, StatusFilter } from '@/lib/types';

const PRESETS: { key: Preset; label: string }[] = [
  { key: '2023', label: '2023' }, { key: '2024', label: '2024' },
  { key: '2025', label: '2025' }, { key: 'all', label: 'Toàn bộ' },
];
const STATUSES: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' }, { key: 'Active', label: 'Active' }, { key: 'Churned', label: 'Churned' },
];

/* Sửa trong drawer là NHÁP — chỉ ghi vào state thật khi bấm Áp dụng.
   Mở/đóng do #stage.drawer điều khiển (globals.css); đóng thì visibility:hidden. */
export function FilterDrawer({ open, filters, rows, bounds, onApply, onClose }: {
  open: boolean;
  filters: Filters;
  rows: Row[];
  bounds: { min: string; max: string };
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  /* Mỗi lần mở drawer, nháp chép lại từ bộ lọc thật — đồng bộ ngay trong render. */
  const [draft, setDraft] = useState<Filters>(filters);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(structuredClone(filters));
  }

  const set = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }));
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  /* Số khách cạnh mỗi lựa chọn tính theo các bộ lọc KHÁC trong nháp — gồm cả trạng thái. */
  const countBy = (patch: Partial<Filters>, keyOf: (r: Row) => string) => {
    const m = new Map<string, number>();
    const f = { ...draft, ...patch };
    for (const r of applyStatus(applyScope(rows, f), f)) m.set(keyOf(r), (m.get(keyOf(r)) ?? 0) + 1);
    return m;
  };
  const planCount = countBy({ plans: [] }, (r) => r.plan);
  const regionCount = countBy({ regions: [] }, (r) => r.region);

  const setPreset = (p: Preset) => set({ preset: p, ...presetRange(p, bounds) });

  return (
    <>
      <div id="scrim" onClick={onClose} />
      <aside id="drawer" aria-label="Bộ lọc" aria-hidden={!open}>
        <div className="dh">
          <b>Bộ lọc</b>
          <button className="ibtn icon" onClick={onClose} aria-label="Đóng bộ lọc"><Icon name="x" /></button>
        </div>

        <div className="fl">Chỉ số theo dõi</div>
        <div className="seg" role="radiogroup" aria-label="Chỉ số theo dõi">
          {PARAMS.map((p) => (
            <button key={p.key} className={draft.param === p.key ? 'on' : ''} title={p.label}
                    onClick={() => set({ param: p.key })} style={{ flex: 1, padding: '0 6px' }}>
              {p.short}
            </button>
          ))}
        </div>

        <div className="fl">Khách đăng ký trong khoảng</div>
        <div className="seg" role="radiogroup" aria-label="Khoảng ngày đăng ký">
          {PRESETS.map((p) => (
            <button key={p.key} className={draft.preset === p.key ? 'on' : ''}
                    onClick={() => setPreset(p.key)} style={{ flex: 1 }}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="dates">
          <label>Từ ngày
            <input type="date" value={draft.from} min={bounds.min} max={draft.to || bounds.max}
                   onChange={(e) => e.target.value && set({ preset: 'custom', from: e.target.value })} />
          </label>
          <label>Đến ngày
            <input type="date" value={draft.to} min={draft.from || bounds.min} max={bounds.max}
                   onChange={(e) => e.target.value && set({ preset: 'custom', to: e.target.value })} />
          </label>
        </div>

        <div className="fl">Gói</div>
        {PLAN_ORDER.map((p) => {
          const on = draft.plans.length === 0 || draft.plans.includes(p);
          return (
            <button key={p} className="cbx" role="checkbox" aria-checked={on}
                    onClick={() => setDraft((d) => ({ ...d, plans: toggle(d.plans.length ? d.plans : PLAN_ORDER, p) }))}>
              <span className={`box${on ? ' on' : ''}`}><Icon name="check" className="lu" /></span>
              {p}<span className="n">{fmtInt(planCount.get(p) ?? 0)}</span>
            </button>
          );
        })}

        <div className="fl">Khu vực</div>
        {REGION_ORDER.map((r) => {
          const on = draft.regions.length === 0 || draft.regions.includes(r);
          return (
            <button key={r} className="cbx" role="checkbox" aria-checked={on}
                    onClick={() => setDraft((d) => ({ ...d, regions: toggle(d.regions.length ? d.regions : REGION_ORDER, r) }))}>
              <span className={`box${on ? ' on' : ''}`}><Icon name="check" className="lu" /></span>
              {r}<span className="n">{fmtInt(regionCount.get(r) ?? 0)}</span>
            </button>
          );
        })}

        <div className="fl">Trạng thái</div>
        <div className="seg" role="radiogroup" aria-label="Trạng thái">
          {STATUSES.map((s) => (
            <button key={s.key} className={draft.status === s.key ? 'on' : ''}
                    onClick={() => set({ status: s.key })} style={{ flex: 1 }}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="cs" style={{ marginTop: 7 }}>Chỉ áp cho số khách, bảng và xuất dữ liệu.</div>

        <div className="dfoot">
          <button className="dbtn ghost"
                  onClick={() => setDraft({ ...DEFAULT_FILTERS, param: draft.param, ...presetRange('all', bounds) })}>
            Xoá hết
          </button>
          <button className="dbtn pri" onClick={() => onApply(normalize(draft))}>Áp dụng</button>
        </div>
      </aside>
    </>
  );
}

/* Chọn đủ mọi giá trị = không lọc. Giữ mảng rỗng để chip "Tất cả" hiện đúng. */
function normalize(f: Filters): Filters {
  return {
    ...f,
    plans: f.plans.length === PLAN_ORDER.length ? [] : f.plans,
    regions: f.regions.length === REGION_ORDER.length ? [] : f.regions,
  };
}

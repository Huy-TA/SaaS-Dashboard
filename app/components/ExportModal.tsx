'use client';
import { useMemo, useState } from 'react';
import { Icon } from '@/components/Icon';
import { dataBounds, fmtDate, fmtInt } from '@/lib/aggregate';
import type { Row } from '@/lib/types';

type Scope = 'filter' | 'all' | 'custom';
type Sep = ';' | ',';
type Col = { key: string; label: string; get: (r: Row, sep: Sep) => string | number };

/* 9 cột gốc của Sheet. Với dấu chấm phẩy (Excel bản Việt) số thập phân dùng dấu phẩy. */
const COLS: Col[] = [
  { key: 'customer_id',     label: 'customer_id',     get: (r) => r.id },
  { key: 'plan',            label: 'plan',            get: (r) => r.plan },
  { key: 'signup_date',     label: 'signup_date',     get: (r) => r.date },
  { key: 'region',          label: 'region',          get: (r) => r.region },
  { key: 'tenure_months',   label: 'tenure_months',   get: (r) => r.tenure },
  { key: 'monthly_revenue', label: 'monthly_revenue', get: (r, s) => (s === ';' ? String(r.revenue).replace('.', ',') : r.revenue) },
  { key: 'status',          label: 'status',          get: (r) => r.status },
  { key: 'churn',           label: 'churn',           get: (r) => (r.churned ? 'Yes' : 'No') },
  { key: 'Data_Flag',       label: 'Data_Flag',       get: (r) => r.flag },
];

/* Hai bước: mở bảng chọn → xem trước số dòng → mới tải. Không đụng bộ lọc dashboard. */
export function ExportModal({ open, filteredRows, allRows, bounds, onClose }: {
  open: boolean;
  filteredRows: Row[];      // ĐÚNG tập đang hiển thị (gồm cả bộ lọc trạng thái)
  allRows: Row[];
  bounds: { min: string; max: string };
  onClose: () => void;
}) {
  const [scope, setScope] = useState<Scope>('filter');
  const [from, setFrom] = useState(bounds.min);
  const [to, setTo] = useState(bounds.max);
  const [cols, setCols] = useState<string[]>(COLS.map((c) => c.key));
  const [sep, setSep] = useState<Sep>(';');

  /* Mỗi lần mở bảng xuất, khoảng ngày tuỳ chỉnh về lại toàn bộ dữ liệu — đồng bộ trong render. */
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setFrom(bounds.min); setTo(bounds.max); }
  }

  const customRows = useMemo(() => allRows.filter((r) => r.date >= from && r.date <= to), [allRows, from, to]);
  const rows = scope === 'filter' ? filteredRows : scope === 'all' ? allRows : customRows;
  const picked = COLS.filter((c) => cols.includes(c.key));
  const range = dataBounds(rows);
  const canDownload = rows.length > 0 && picked.length > 0;

  function download() {
    const cell = (v: string | number): string => {
      const s = String(v);
      return /["\n]/.test(s) || s.includes(sep) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [picked.map((c) => c.label).join(sep),
                 ...rows.map((r) => picked.map((c) => cell(c.get(r, sep))).join(sep))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `saas-churn_${range.min || 'empty'}_${range.max || 'empty'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div id="modal" onClick={(e) => e.target === e.currentTarget && onClose()} aria-hidden={!open}>
      <div className="sheet" role="dialog" aria-label="Xuất dữ liệu">
        <div className="sh">
          <b>Xuất dữ liệu</b>
          <button className="ibtn icon" onClick={onClose} aria-label="Đóng"><Icon name="x" /></button>
        </div>

        <div className="sb">
          <div className="fl">Phạm vi dòng</div>
          {([
            ['filter', 'Theo bộ lọc dashboard', filteredRows.length],
            ['all', 'Toàn bộ dữ liệu', allRows.length],
            ['custom', 'Tuỳ chỉnh theo ngày đăng ký', customRows.length],
          ] as const).map(([k, label, n]) => (
            <button key={k} className={`rad${scope === k ? ' on' : ''}`} role="radio" aria-checked={scope === k}
                    onClick={() => setScope(k)}>
              <span className="dot" />{label}<span className="n">{fmtInt(n)} dòng</span>
            </button>
          ))}
          {scope === 'custom' && (
            <div className="dates">
              <label>Từ ngày
                <input type="date" value={from} min={bounds.min} max={to}
                       onChange={(e) => e.target.value && setFrom(e.target.value)} />
              </label>
              <label>Đến ngày
                <input type="date" value={to} min={from} max={bounds.max}
                       onChange={(e) => e.target.value && setTo(e.target.value)} />
              </label>
            </div>
          )}

          <div className="fl" style={{ display: 'flex', alignItems: 'center' }}>
            Cột xuất
            <button className="chip" style={{ marginLeft: 'auto', textTransform: 'none', letterSpacing: 0 }}
                    onClick={() => setCols(cols.length === COLS.length ? [] : COLS.map((c) => c.key))}>
              {cols.length === COLS.length ? 'Bỏ tất cả' : 'Chọn tất cả'}
            </button>
          </div>
          <div className="cols">
            {COLS.map((c) => {
              const on = cols.includes(c.key);
              return (
                <button key={c.key} className="cbx" role="checkbox" aria-checked={on}
                        onClick={() => setCols(on ? cols.filter((x) => x !== c.key) : [...cols, c.key])}>
                  <span className={`box${on ? ' on' : ''}`}><Icon name="check" className="lu" /></span>
                  <span className="mono">{c.label}</span>
                </button>
              );
            })}
          </div>

          <div className="fl">Định dạng</div>
          <button className={`rad${sep === ';' ? ' on' : ''}`} role="radio" aria-checked={sep === ';'} onClick={() => setSep(';')}>
            <span className="dot" />CSV dấu chấm phẩy — mở thẳng bằng Excel bản Việt
          </button>
          <button className={`rad${sep === ',' ? ' on' : ''}`} role="radio" aria-checked={sep === ','} onClick={() => setSep(',')}>
            <span className="dot" />CSV dấu phẩy
          </button>
        </div>

        <div className="sf">
          <div className="cs">
            {canDownload
              ? <>Sẽ xuất <b>{fmtInt(rows.length)}</b> dòng × <b>{picked.length}</b> cột · {fmtDate(range.min)} → {fmtDate(range.max)}</>
              : rows.length === 0 ? 'Không có dòng nào trong phạm vi này.' : 'Chưa chọn cột nào.'}
          </div>
          <button className="dbtn ghost" onClick={onClose}>Huỷ</button>
          <button className="dbtn pri" onClick={download} disabled={!canDownload}
                  style={canDownload ? undefined : { opacity: 0.4, cursor: 'not-allowed' }}>
            <Icon name="download" className="lu lu-sm" />Tải xuống
          </button>
        </div>
      </div>
    </div>
  );
}

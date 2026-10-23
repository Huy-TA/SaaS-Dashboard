'use client';
import { useState, type SyntheticEvent } from 'react';
import { Icon } from '@/components/Icon';
import { tipPosition } from '@/components/Shell';
import { APP_NAME, clockVN, fmtInt } from '@/lib/aggregate';
import type { IconName } from '@/lib/icons';
import type { PageId } from '@/lib/types';

export const PAGES: { id: PageId; label: string; icon: IconName }[] = [
  { id: 'home',   label: 'Tổng quan',     icon: 'layout-dashboard' },
  { id: 'plan',   label: 'Theo gói',      icon: 'coins' },
  { id: 'region', label: 'Theo khu vực',  icon: 'chart-pie' },
  { id: 'source', label: 'Nguồn dữ liệu', icon: 'database' },
];

export function Sidebar({ page, rail, onPage, onToggleRail, rowCount, fetchedAt }: {
  page: PageId;
  rail: boolean;
  onPage: (p: PageId) => void;
  onToggleRail: () => void;
  rowCount: number;
  fetchedAt: string;
}) {
  /* Thu gọn (58px) thì nhãn ẩn ⇒ hiện tên trang bằng tooltip .tip bên phải icon */
  const [tip, setTip] = useState<{ label: string; left: number; top: number } | null>(null);
  const showTip = (label: string) => (e: SyntheticEvent<HTMLButtonElement>) => {
    const pos = rail ? tipPosition(e.currentTarget, 0, 'right') : null;
    setTip(pos ? { label, ...pos } : null);
  };

  const navButton = (p: (typeof PAGES)[number]) => (
    <button key={p.id} className={`nav${page === p.id ? ' on' : ''}`} onClick={() => onPage(p.id)}
            aria-label={p.label} onMouseEnter={showTip(p.label)} onMouseLeave={() => setTip(null)}
            onFocus={showTip(p.label)} onBlur={() => setTip(null)}>
      <span className="ic"><Icon name={p.icon} /></span>
      <span className="nvt">{p.label}</span>
    </button>
  );
  return (
    <aside id="side">
      <div className="brand">
        <span className="mark"><Icon name="activity" /></span>
        <span className="brandtxt"><b>{APP_NAME}</b></span>
        <button id="collapse" onClick={onToggleRail} aria-label="Thu gọn / mở thanh bên">
          <Icon name="chevron-left" />
        </button>
      </div>

      <nav id="nav">
        <div className="lbl">Theo dõi</div>
        {PAGES.slice(0, 3).map(navButton)}
        <div className="lbl">Dữ liệu</div>
        {PAGES.slice(3).map(navButton)}
      </nav>
      {tip && rail && (
        <div className="tip" role="tooltip" style={{ left: tip.left, top: tip.top, opacity: 1, whiteSpace: 'nowrap' }}>
          {tip.label}
        </div>
      )}

      <div className="sfoot">
        <div className="usage">
          <div className="uhd"><Icon name="database" className="lu lu-xs" />Google Sheets · <b>{fmtInt(rowCount)}</b> khách</div>
          <div className="unote">{fetchedAt ? `Đọc lúc ${clockVN(fetchedAt)} · làm mới 15 phút` : 'Đang kết nối…'}</div>
        </div>
      </div>
    </aside>
  );
}

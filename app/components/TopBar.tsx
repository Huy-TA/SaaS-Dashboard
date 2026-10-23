'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { Icon } from '@/components/Icon';
import { PAGES } from '@/components/Sidebar';
import { clockVN, fmtPct } from '@/lib/aggregate';
import type { Alert, PageId, SessionUser } from '@/lib/types';

const ALERT_TEXT: Record<Alert['metric'], { label: string; limit: string }> = {
  churnRate: { label: 'tỷ lệ rời bỏ', limit: 'cảnh báo > 15%' },
  lostPct:   { label: '% doanh thu mất', limit: 'cảnh báo > 10%' },
};

export function TopBar({
  page, fetchedAt, busy, alerts, filterCount, theme, user,
  onRefresh, onAlert, onExport, onToggleTheme, onOpenFilters,
}: {
  page: PageId;
  user: SessionUser | null;
  fetchedAt: string;
  busy: boolean;
  alerts: Alert[];
  filterCount: number;
  theme: 'light' | 'dark';
  onRefresh: () => void;
  onAlert: (a: Alert) => void;
  onExport: () => void;
  onToggleTheme: () => void;
  onOpenFilters: () => void;
}) {
  const [pop, setPop] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const current = PAGES.find((p) => p.id === page)!;

  useEffect(() => {
    if (!pop) return;
    const close = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setPop(false);
    };
    addEventListener('mousedown', close);
    return () => removeEventListener('mousedown', close);
  }, [pop]);

  return (
    <header id="top">
      <div className="htitle">
        <Icon name={current.icon} />
        <b>{current.label}</b>
      </div>

      <div className="topright">
        <span className="sync">
          <i className={`led${busy ? ' busy' : ''}`} />
          Cập nhật <b>{fetchedAt ? clockVN(fetchedAt) : '--:--'}</b>
        </span>
        <button className={`ibtn icon${busy ? ' spin' : ''}`} onClick={onRefresh} aria-label="Tải lại dữ liệu">
          <Icon name="refresh-cw" />
        </button>

        <div className="wrap" ref={wrap}>
          <button className="ibtn icon" onClick={() => setPop((v) => !v)} aria-label="Cảnh báo">
            <Icon name="bell" />
            {alerts.length > 0 && <s>{alerts.length}</s>}
          </button>
          {pop && (
            <div className="pop">
              <div className="h">Cảnh báo vượt ngưỡng</div>
              {alerts.length === 0 && (
                <div className="r"><Icon name="circle-check" />Không có nhóm nào vượt ngưỡng</div>
              )}
              {alerts.map((a) => (
                <button key={`${a.kind}-${a.key}-${a.metric}`} className="r"
                        title={`${ALERT_TEXT[a.metric].limit} · bấm để xem`}
                        onClick={() => { setPop(false); onAlert(a); }}>
                  <i style={{ background: 'var(--bad)' }} />
                  <span>{a.key} · {ALERT_TEXT[a.metric].label}</span>
                  <b>{fmtPct(a.value)}</b>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="ibtn" onClick={onExport}>
          <Icon name="download" className="lu lu-sm" />Xuất dữ liệu
        </button>
        <button className="ibtn icon" onClick={onToggleTheme}
                aria-label={theme === 'light' ? 'Chuyển giao diện tối' : 'Chuyển giao diện sáng'}>
          <Icon name={theme === 'light' ? 'moon' : 'sun'} />
        </button>
        <button className="ibtn pri" onClick={onOpenFilters}>
          <Icon name="sliders-horizontal" className="lu lu-sm" />
          Bộ lọc{filterCount ? ` (${filterCount})` : ''}
        </button>
        {user && <UserCorner user={user} />}
      </div>
    </header>
  );
}

/* Góc tài khoản: ảnh đại diện Google + tên + nút Đăng xuất. Ngăn với nhóm nút bằng hairline. */
function UserCorner({ user }: { user: SessionUser }) {
  const [broken, setBroken] = useState(false);
  const name = user.name || user.email || '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4, paddingLeft: 11,
                  borderLeft: '1px solid var(--line)', height: 29 }}
         title={user.email ?? undefined}>
      {user.image && !broken
        ? <Image src={user.image} alt="" width={26} height={26} unoptimized referrerPolicy="no-referrer"
                 onError={() => setBroken(true)}
                 style={{ borderRadius: '50%', flex: '0 0 26px', border: '1px solid var(--line)' }} />
        : <span className="av" style={{ width: 26, height: 26, flex: '0 0 26px' }}>{name.charAt(0).toUpperCase()}</span>}
      <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)', maxWidth: 140,
                     overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <button className="ibtn" onClick={() => void signOut({ callbackUrl: '/' })}>
        <Icon name="log-out" className="lu lu-sm" />Đăng xuất
      </button>
    </div>
  );
}

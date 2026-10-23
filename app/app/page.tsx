import { Suspense } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';
import { fetchSheetValues } from '@/lib/google-sheets';
import { APP_NAME, clockVN, fmtInt } from '@/lib/aggregate';

/* Trang giới thiệu — cùng Shell, cùng token với dashboard. Một nút brand duy nhất. */
export default function HomePage() {
  return (
    <Shell>
      <div style={{ margin: 'auto', width: 520, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 14, textAlign: 'center' }}>
        <span className="lmark" style={{ width: 40, height: 40, flex: '0 0 40px', borderRadius: 11 }}>
          <Icon name="activity" />
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-.03em' }}>{APP_NAME}</h1>
        <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6 }}>
          Theo dõi tỷ lệ khách rời bỏ và doanh thu tháng (MRR) theo gói, khu vực và thời gian sử dụng —
          để thấy sớm nhóm khách nào đang mất và mất bao nhiêu doanh thu.
        </p>
        <Link className="ibtn pri" href="/dashboard" style={{ height: 36, padding: '0 18px', fontSize: 13 }}>
          Mở dashboard<Icon name="chevron-right" className="lu lu-sm" />
        </Link>
        <Suspense fallback={<span className="chip"><span className="spin" style={{ width: 11, height: 11, flex: '0 0 11px' }} />Đang kiểm tra kết nối…</span>}>
          <DataStatus />
        </Suspense>
      </div>
    </Shell>
  );
}

async function DataStatus() {
  let status: { n: number; fetchedAt: string } | null = null;
  try {
    const { values, fetchedAt } = await fetchSheetValues();
    status = { n: values.slice(1).filter((r) => r[0]).length, fetchedAt };
  } catch {
    status = null;
  }

  if (!status) {
    return (
      <span className="chip" style={{ color: 'var(--bad)' }}>
        <Icon name="triangle-alert" className="lu lu-xs" />Chưa kết nối được Google Sheets
      </span>
    );
  }
  return (
    <span className="chip">
      <Icon name="database" className="lu lu-xs" />Google Sheets · <b>{fmtInt(status.n)}</b> khách · đọc lúc {clockVN(status.fetchedAt)}
    </span>
  );
}

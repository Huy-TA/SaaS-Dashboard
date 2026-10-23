import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { fetchSheetValues, TAB } from '@/lib/google-sheets';
import { AUTH_ENV, authOptions, isAllowed } from '@/lib/auth';
import { REGION_UNKNOWN } from '@/lib/aggregate';
import type { ApiData, Row } from '@/lib/types';

const SHEET_ENV = ['GOOGLE_SHEETS_SPREADSHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY'] as const;

/* Chỉ báo biến nào ĐÃ CÓ — không bao giờ trả giá trị. */
function envStatus(): Record<string, boolean> {
  return Object.fromEntries([...SHEET_ENV, ...AUTH_ENV].map((k) => [k, Boolean(process.env[k])]));
}

/* Nơi DUY NHẤT chạm credential Google Sheets. Trả về dòng đã ép kiểu — không trả khoá.
   Lớp chặn thứ hai: tự kiểm tra phiên đăng nhập, không chỉ dựa vào proxy. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAllowed(session?.user?.email)) {
    return NextResponse.json({ error: 'Chưa đăng nhập hoặc không có quyền.' }, { status: 401 });
  }

  try {
    const { values, fetchedAt } = await fetchSheetValues();
    if (values.length < 2) {
      return NextResponse.json<ApiData>(
        { error: 'Sheet rỗng hoặc chỉ có dòng tiêu đề.', rows: [], count: 0, tab: TAB, fetchedAt, env: envStatus() },
        { status: 200 }
      );
    }

    const body = values.slice(1).filter((r) => r[0]);   // bỏ dòng trống cuối

    const rows: Row[] = body.map((r) => {
      const status = String(r[6]) === 'Churned' ? 'Churned' : 'Active';
      return {
        id:      String(r[0]),
        plan:    String(r[1] ?? ''),
        date:    String(r[2] ?? ''),                     // chữ ISO 'yyyy-mm-dd' trên Sheet
        region:  String(r[3] ?? '').trim() || REGION_UNKNOWN,
        tenure:  Number(r[4]) || 0,
        revenue: Number(r[5]) || 0,
        status,
        churned: String(r[7]) === 'Yes',
        flag:    String(r[8] ?? ''),
      };
    });

    return NextResponse.json<ApiData>({ rows, count: rows.length, tab: TAB, fetchedAt, env: envStatus() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Lỗi không xác định';
    return NextResponse.json<ApiData>(
      { error: msg, rows: [], count: 0, tab: TAB, fetchedAt: new Date().toISOString(), env: envStatus() },
      { status: 500 }
    );
  }
}

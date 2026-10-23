import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { fetchSheetValues, SHEET_TAG, TAB } from '@/lib/google-sheets';
import { AUTH_ENV, authOptions, isAllowed } from '@/lib/auth';
import { REGION_UNKNOWN } from '@/lib/aggregate';
import type { ApiData, ApiErrorCode, Row } from '@/lib/types';

const SHEET_ENV = ['GOOGLE_SHEETS_SPREADSHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY'] as const;

/* Chỉ báo biến nào ĐÃ CÓ — không bao giờ trả giá trị. */
function envStatus(): Record<string, boolean> {
  return Object.fromEntries([...SHEET_ENV, ...AUTH_ENV].map((k) => [k, Boolean(process.env[k])]));
}

/* Đổi lỗi Google/mạng thành mã ngắn. Câu lỗi gốc (có tên tab, tên biến…) chỉ ghi log server. */
function errorCode(e: unknown): ApiErrorCode {
  const err = (e ?? {}) as { message?: string; code?: unknown; status?: unknown };
  const msg = String(err.message ?? '');
  const status = Number(err.status ?? err.code);
  if (msg === 'missing_env') return 'missing_env';
  if (/invalid_grant|DECODER|PEM|private key/i.test(msg) || status === 401) return 'bad_credentials';
  if (status === 403 || /permission/i.test(msg)) return 'no_access';
  if (status === 404 || /not found|Unable to parse range/i.test(msg)) return 'not_found';
  if (status === 429 || /quota|rate limit/i.test(msg)) return 'quota';
  if (status >= 500 || /ENOTFOUND|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|fetch failed|socket/i.test(msg)) return 'network';
  return 'unknown';
}

function fail(code: ApiErrorCode, status: number, fetchedAt = new Date().toISOString()) {
  return NextResponse.json<ApiData>(
    { error: code, rows: [], count: 0, tab: TAB, title: '', fetchedAt, env: envStatus() },
    { status }
  );
}

/* Kiểm phiên; lỗi khi kiểm (vd. thiếu AUTH_SECRET) trả JSON có mã, không để Next trả trang HTML. */
async function checkSession(): Promise<NextResponse | null> {
  try {
    const session = await getServerSession(authOptions);
    if (isAllowed(session?.user?.email)) return null;
    return NextResponse.json({ error: 'Chưa đăng nhập hoặc không có quyền.' }, { status: 401 });
  } catch (e) {
    console.error('[api/data] Kiểm tra phiên lỗi:', e);
    return fail('auth_check', 500);
  }
}

/* Nơi DUY NHẤT chạm credential Google Sheets. Trả về dòng đã ép kiểu — không trả khoá.
   Lớp chặn thứ hai: tự kiểm tra phiên đăng nhập, không chỉ dựa vào proxy. */
export async function GET() {
  const denied = await checkSession();
  if (denied) return denied;

  try {
    const { values, title, fetchedAt } = await fetchSheetValues();
    if (values.length < 2) return fail('empty', 200, fetchedAt);   // Sheet rỗng hoặc chỉ có dòng tiêu đề

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

    return NextResponse.json<ApiData>({ rows, count: rows.length, tab: TAB, title, fetchedAt, env: envStatus() });
  } catch (e) {
    console.error('[api/data] Đọc Google Sheets lỗi:', e);
    return fail(errorCode(e), 500);
  }
}

/* Nút "Tải lại": bỏ cache 15 phút để lần GET kế tiếp đọc Sheet ngay (expire 0 ⇒ không trả số cũ). */
export async function POST() {
  const denied = await checkSession();
  if (denied) return denied;
  try {
    revalidateTag(SHEET_TAG, { expire: 0 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/data] Xoá cache lỗi:', e);
    return fail('unknown', 500);
  }
}

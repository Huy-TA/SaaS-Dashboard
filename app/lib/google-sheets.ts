import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { google } from 'googleapis';

export const TAB = 'cleaned_subscription_saas';
const RANGE = `${TAB}!A:I`;
/* Nút "Tải lại" xoá cache theo tag này (POST /api/data) để đọc Sheet ngay, không chờ 15 phút. */
export const SHEET_TAG = 'sheet';

export type SheetValues = { values: unknown[][]; title: string; fetchedAt: string };

/* Đọc Sheet, cache 15 phút.
   Project bật `cacheComponents`, nên KHÔNG dùng `export const revalidate = 900`
   ở route (Next 16 báo lỗi) — thay bằng 'use cache' + cacheLife ở đây. */
export async function fetchSheetValues(): Promise<SheetValues> {
  'use cache';
  cacheLife({ revalidate: 900 });
  cacheTag(SHEET_TAG);

  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
  const email      = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '';
  const sheetId    = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? '';

  if (!privateKey || !email || !sheetId) {
    // Thông điệp là MÃ lỗi: route đổi thành câu tiếng Việt, tên biến chỉ ghi ở log server
    console.error('[sheets] Thiếu GOOGLE_SHEETS_SPREADSHEET_ID / GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY');
    throw new Error('missing_env');
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const [res, meta] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: RANGE,
      valueRenderOption: 'UNFORMATTED_VALUE',
    }),
    sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: 'properties.title' }),
  ]);

  return {
    values: (res.data.values ?? []) as unknown[][],
    title: meta.data.properties?.title ?? '',
    fetchedAt: new Date().toISOString(),
  };
}

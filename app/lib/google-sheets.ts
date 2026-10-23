import 'server-only';
import { cacheLife } from 'next/cache';
import { google } from 'googleapis';

export const TAB = 'cleaned_subscription_saas';
const RANGE = `${TAB}!A:I`;

export type SheetValues = { values: unknown[][]; fetchedAt: string };

/* Đọc Sheet, cache 15 phút.
   Project bật `cacheComponents`, nên KHÔNG dùng `export const revalidate = 900`
   ở route (Next 16 báo lỗi) — thay bằng 'use cache' + cacheLife ở đây. */
export async function fetchSheetValues(): Promise<SheetValues> {
  'use cache';
  cacheLife({ revalidate: 900 });

  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
  const email      = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '';
  const sheetId    = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? '';

  if (!privateKey || !email || !sheetId) {
    throw new Error(
      'Thiếu biến môi trường. Cần GOOGLE_SHEETS_SPREADSHEET_ID, ' +
      'GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY trong .env.local'
    );
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: RANGE,
    valueRenderOption: 'UNFORMATTED_VALUE',
  });

  return { values: (res.data.values ?? []) as unknown[][], fetchedAt: new Date().toISOString() };
}

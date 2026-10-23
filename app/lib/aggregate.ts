/* Toàn bộ toán tổng hợp. Không import gì phía server — file này chạy ở cả client.
   Công thức theo docs/1-spec/specification.md §5, §8: mọi tỷ lệ là SUM/SUM,
   tính lại từ tổng, không bao giờ là trung bình của tỷ lệ. */
import { THRESHOLD } from '@/lib/tokens';
import type {
  Aggregate, Alert, ApiErrorCode, Filters, Grain, Level, ParamKey, Preset, Row,
} from '@/lib/types';

export const APP_NAME = 'SaaS Churn & MRR';
export const REGION_UNKNOWN = 'Chưa rõ khu vực';
export const PLAN_ORDER = ['Basic', 'Pro', 'Enterprise'];
export const REGION_ORDER = ['APAC', 'EMEA', 'Americas', REGION_UNKNOWN];
export const TENURE_GROUPS = ['0–6 tháng', '7–12 tháng', '13–24 tháng', '25–36 tháng'];

export const PARAMS: { key: ParamKey; label: string; short: string }[] = [
  { key: 'mrr',       label: 'MRR',                   short: 'MRR' },
  { key: 'customers', label: 'Số khách',              short: 'Số khách' },
  { key: 'churnRate', label: 'Tỷ lệ khách đã rời bỏ', short: 'Tỷ lệ rời bỏ' },
  { key: 'lostMrr',   label: 'Doanh thu tháng đã mất', short: 'DT đã mất' },
];

export const DEFAULT_FILTERS: Filters = {
  param: 'churnRate', preset: 'all', from: '', to: '',
  plans: [], regions: [], status: 'all',
};

/* ── Lọc ────────────────────────────────────────────────────────────────── */

/* `scope` = ngày đăng ký · gói · khu vực. Bộ lọc trạng thái KHÔNG nằm ở đây:
   5 KPI, chỉ số tiền / tỷ lệ, donut và bảng đầy đủ bỏ qua nó (spec §6.1). */
export function applyScope(rows: Row[], f: Filters): Row[] {
  return rows.filter((r) =>
    (!f.from || r.date >= f.from) &&
    (!f.to || r.date <= f.to) &&
    (f.plans.length === 0 || f.plans.includes(r.plan)) &&
    (f.regions.length === 0 || f.regions.includes(r.region))
  );
}

export function applyStatus(rows: Row[], f: Filters): Row[] {
  return f.status === 'all' ? rows : rows.filter((r) => r.status === f.status);
}

/* Tập dòng mà một chỉ số được vẽ trên đó: chỉ `Số khách` theo bộ lọc trạng thái. */
export function rowsForParam(scoped: Row[], f: Filters): Row[] {
  return f.param === 'customers' ? applyStatus(scoped, f) : scoped;
}

/* ── Tổng hợp ───────────────────────────────────────────────────────────── */

export function agg(rows: Row[]): Aggregate {
  let active = 0, churned = 0, mrr = 0, lostMrr = 0;
  for (const r of rows) {
    if (r.churned) { churned += 1; lostMrr += r.revenue; }
    else           { active  += 1; mrr     += r.revenue; }
  }
  const customers = rows.length;
  return {
    customers, active, churned, mrr, lostMrr,
    churnRate: customers ? churned / customers : null,
    lostPct:   mrr + lostMrr ? lostMrr / (mrr + lostMrr) : null,
    arpa:      active ? mrr / active : null,
  };
}

export function metricOf(a: Aggregate, p: ParamKey): number | null {
  if (p === 'mrr') return a.mrr;
  if (p === 'customers') return a.customers;
  if (p === 'lostMrr') return a.lostMrr;
  return a.churnRate;
}

export function tenureGroup(t: number): string {
  if (t <= 6) return TENURE_GROUPS[0];
  if (t <= 12) return TENURE_GROUPS[1];
  if (t <= 24) return TENURE_GROUPS[2];
  return TENURE_GROUPS[3];
}

export type GroupRow = Aggregate & { key: string };

/* Nhóm theo dimension, giữ đủ mọi nhóm của `order` (kể cả nhóm không có khách). */
export function group(rows: Row[], keyOf: (r: Row) => string, order: string[]): GroupRow[] {
  const m = new Map<string, Row[]>(order.map((k) => [k, []]));
  for (const r of rows) {
    const k = keyOf(r);
    (m.get(k) ?? m.set(k, []).get(k)!).push(r);
  }
  return [...m.entries()].map(([key, rs]) => ({ key, ...agg(rs) }));
}

/* ── Gom theo kỳ đăng ký ────────────────────────────────────────────────── */

function mondayOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);              // UTC — không trôi múi giờ
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export function periodKey(iso: string, grain: Grain): string {
  if (grain === 'month') return iso.slice(0, 7);                         // yyyy-mm
  if (grain === 'quarter') return `${iso.slice(0, 4)}-Q${Math.floor((Number(iso.slice(5, 7)) - 1) / 3) + 1}`;
  return mondayOf(iso);
}

/* Danh sách kỳ liên tục từ `from` tới `to`, để kỳ không có khách vẫn có chỗ trên trục. */
export function periodRange(from: string, to: string, grain: Grain): string[] {
  if (!from || !to || from > to) return [];
  const out: string[] = [];
  const d = new Date(`${from}T00:00:00Z`);
  const end = periodKey(to, grain);
  if (grain === 'week') d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  else d.setUTCDate(1);
  for (let k = periodKey(d.toISOString().slice(0, 10), grain); ; ) {
    if (out[out.length - 1] !== k) out.push(k);
    if (k === end || out.length > 400) break;
    if (grain === 'week') d.setUTCDate(d.getUTCDate() + 7);
    else d.setUTCMonth(d.getUTCMonth() + (grain === 'quarter' ? 3 : 1));
    k = periodKey(d.toISOString().slice(0, 10), grain);
  }
  return out;
}

export type PeriodRow = Aggregate & { key: string };

export function byGrain(rows: Row[], grain: Grain, from: string, to: string): PeriodRow[] {
  const keys = periodRange(from, to, grain);
  const m = new Map<string, Row[]>(keys.map((k) => [k, []]));
  for (const r of rows) m.get(periodKey(r.date, grain))?.push(r);
  return keys.map((key) => ({ key, ...agg(m.get(key) ?? []) }));
}

export function periodLabel(key: string, grain: Grain): string {
  if (grain === 'quarter') return `${key.slice(5)}·${key.slice(2, 4)}`;    // Q1·23
  if (grain === 'month') return `${key.slice(5, 7)}/${key.slice(2, 4)}`;  // 03/24
  return `${key.slice(8, 10)}/${key.slice(5, 7)}/${key.slice(2, 4)}`;     // 04/03/24
}

/* ── Khoảng ngày ────────────────────────────────────────────────────────── */

export function dataBounds(rows: Row[]): { min: string; max: string } {
  let min = '', max = '';
  for (const r of rows) {
    if (!min || r.date < min) min = r.date;
    if (!max || r.date > max) max = r.date;
  }
  return { min, max };
}

export function presetRange(p: Preset, b: { min: string; max: string }): { from: string; to: string } {
  if (p === '2023' || p === '2024' || p === '2025') {
    return { from: `${p}-01-01` < b.min ? b.min : `${p}-01-01`, to: `${p}-12-31` > b.max ? b.max : `${p}-12-31` };
  }
  return { from: b.min, to: b.max };
}

const DAY = 86_400_000;
const toMs = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const toIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/* Kỳ liền trước cùng độ dài. "Toàn bộ" không có kỳ trước (spec §5, G10). */
export function previousRange(f: Filters): { from: string; to: string } | null {
  if (f.preset === 'all' || !f.from || !f.to) return null;
  const len = (toMs(f.to) - toMs(f.from)) / DAY + 1;
  return { from: toIso(toMs(f.from) - len * DAY), to: toIso(toMs(f.from) - DAY) };
}

/* ── Ngưỡng ─────────────────────────────────────────────────────────────── */
/* Tỷ lệ rời bỏ dùng THRESHOLD.roas/target dưới dạng tỷ lệ giữ chân (1 − rời bỏ). */

export function churnLevel(rate: number | null): Level | null {
  if (rate == null) return null;
  const keep = 1 - rate;
  if (keep < THRESHOLD.roas) return 'bad';
  if (keep > THRESHOLD.target) return 'ok';
  return 'warn';
}

export function lostLevel(pct: number | null): Level | null {
  if (pct == null) return null;
  if (pct > THRESHOLD.cpl) return 'bad';
  if (pct < THRESHOLD.budget) return 'ok';
  return 'warn';
}

export const CHURN_WARN = 1 - THRESHOLD.roas;     // 0,15
export const LOST_WARN = THRESHOLD.cpl;           // 0,10

/* Cảnh báo: chỉ mức `bad`, tính trên khoảng ngày đang lọc với MỌI gói / khu vực
   (bỏ qua bộ lọc gói, khu vực, trạng thái — components.md §8, G26–G27). */
export function alerts(rowsInDateRange: Row[]): Alert[] {
  const out: Alert[] = [];
  const scan = (kind: Alert['kind'], groups: GroupRow[]) => {
    for (const g of groups) {
      if (!g.customers) continue;
      if (churnLevel(g.churnRate) === 'bad') out.push({ kind, key: g.key, metric: 'churnRate', value: g.churnRate! });
      if (lostLevel(g.lostPct) === 'bad') out.push({ kind, key: g.key, metric: 'lostPct', value: g.lostPct! });
    }
  };
  scan('plan', group(rowsInDateRange, (r) => r.plan, PLAN_ORDER));
  scan('region', group(rowsInDateRange, (r) => r.region, REGION_ORDER));
  return out;
}

/* ── Ma trận gói × quý ──────────────────────────────────────────────────── */

export type MatrixRow = { key: string; cells: (number | null)[]; counts: number[] };

export function matrix(rows: Row[], p: ParamKey, from: string, to: string): { cols: string[]; rows: MatrixRow[] } {
  const cols = periodRange(from, to, 'quarter');
  const out = PLAN_ORDER.map((plan) => {
    const rs = rows.filter((r) => r.plan === plan);
    const per = byGrain(rs, 'quarter', from, to);
    return { key: plan, cells: per.map((x) => metricOf(x, p)), counts: per.map((x) => x.customers) };
  });
  return { cols, rows: out };
}

/* ── Kiểm tra chất lượng dữ liệu (trang Nguồn dữ liệu) ─────────────────── */

export type QualityCheck = { label: string; value: string; ok: boolean };

export function qualityChecks(rows: Row[]): QualityCheck[] {
  const ids = new Set(rows.map((r) => r.id));
  const badDate = rows.filter((r) => !/^\d{4}-\d{2}-\d{2}$/.test(r.date)).length;
  const mismatch = rows.filter((r) => (r.status === 'Churned') !== r.churned).length;
  const nonPositive = rows.filter((r) => !(r.revenue > 0)).length;
  const unknown = rows.filter((r) => r.region === REGION_UNKNOWN).length;
  const flags = new Map<string, number>();
  for (const r of rows) if (r.flag) flags.set(r.flag, (flags.get(r.flag) ?? 0) + 1);
  return [
    { label: 'Mã khách trùng', value: fmtInt(rows.length - ids.size), ok: rows.length === ids.size },
    { label: 'Ngày đăng ký sai định dạng', value: fmtInt(badDate), ok: badDate === 0 },
    { label: 'Trạng thái lệch cột churn', value: fmtInt(mismatch), ok: mismatch === 0 },
    { label: 'Doanh thu ≤ 0', value: fmtInt(nonPositive), ok: nonPositive === 0 },
    { label: `Khu vực trống → "${REGION_UNKNOWN}"`, value: fmtInt(unknown), ok: true },
    ...[...flags.entries()].map(([k, v]) => ({ label: `Data_Flag · ${k}`, value: fmtInt(v), ok: true })),
  ];
}

/* ── Câu báo lỗi cho người xem (mã từ /api/data) ─────────────────────── */

const ERROR_TEXT: Record<ApiErrorCode, string> = {
  missing_env:     'Dashboard chưa được cấu hình kết nối dữ liệu. Liên hệ Admin.',
  bad_credentials: 'Khoá kết nối Google không hợp lệ. Liên hệ Admin.',
  no_access:       'Dashboard chưa được cấp quyền xem Google Sheet. Liên hệ Admin.',
  not_found:       'Không tìm thấy Google Sheet hoặc tab dữ liệu. Liên hệ Admin.',
  empty:           'Google Sheet đang trống. Liên hệ Admin.',
  quota:           'Google đang giới hạn số lần đọc. Thử lại sau 1 phút.',
  network:         'Không kết nối được tới Google. Kiểm tra mạng rồi thử lại.',
  auth_check:      'Không kiểm tra được phiên đăng nhập. Tải lại trang hoặc đăng nhập lại.',
  bad_response:    'Máy chủ trả về phản hồi không hợp lệ. Thử lại sau ít phút.',
  unknown:         'Có lỗi không mong muốn khi đọc dữ liệu. Thử lại sau ít phút.',
};

export const isErrorCode = (v: unknown): v is ApiErrorCode => typeof v === 'string' && v in ERROR_TEXT;
export const errorText = (code: ApiErrorCode) => ERROR_TEXT[code];

/* ── Định dạng số kiểu Việt Nam (design.md §4) ──────────────────────────── */

const nf0 = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const fmtInt = (v: number) => nf0.format(v);
export const fmtUsd = (v: number) => `${nf0.format(v)} USD`;
export const fmtUsdShort = (v: number) => (Math.abs(v) >= 100_000 ? `${nf1.format(v / 1000)}K USD` : fmtUsd(v));
export const fmtPct = (v: number | null) => (v == null ? '—' : `${nf1.format(v * 100)}%`);
export const fmtDate = (iso: string) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—');

export function fmtParam(v: number | null, p: ParamKey, short = false): string {
  if (v == null) return '—';
  if (p === 'churnRate') return fmtPct(v);
  if (p === 'customers') return fmtInt(v);
  return short ? fmtUsdShort(v) : fmtUsd(v);
}

/* Nhãn trục gọn: 509K · 14% · 2.574 */
export function fmtAxis(v: number, p: ParamKey): string {
  if (p === 'churnRate') return `${Math.round(v * 100)}%`;
  if (p === 'customers') return fmtInt(v);
  return Math.abs(v) >= 1000 ? `${nf0.format(v / 1000)}K` : nf0.format(v);
}

/* ── Giờ Việt Nam (UTC+7), không theo giờ máy ───────────────────────────── */

const VN = 'Asia/Ho_Chi_Minh';

export function hourVN(now = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: VN }).format(now));
}

export function greetVN(now = new Date()): string {
  const h = hourVN(now);
  if (h >= 5 && h < 11) return 'Chào buổi sáng';
  if (h >= 11 && h < 13) return 'Chào buổi trưa';
  if (h >= 13 && h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

export function todayVN(now = new Date()): string {
  const s = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: VN,
  }).format(now);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function clockVN(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: VN }).format(d);
}

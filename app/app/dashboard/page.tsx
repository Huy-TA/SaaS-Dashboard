'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { GreetBar } from '@/components/GreetBar';
import { KpiCard } from '@/components/KpiCard';
import { ChartCard } from '@/components/ChartCard';
import { Legend } from '@/components/Legend';
import { FilterDrawer } from '@/components/FilterDrawer';
import { ExportModal } from '@/components/ExportModal';
import { Icon } from '@/components/Icon';
import { DonutChart } from '@/components/charts/DonutChart';
import { TrendAreaChart } from '@/components/charts/TrendAreaChart';
import { MultiLineChart } from '@/components/charts/MultiLineChart';
import { RankBarChart } from '@/components/charts/RankBarChart';
import { MatrixTable } from '@/components/charts/MatrixTable';
import { LGD1, LGD2, SIDE_RAIL, SIDE_WIDE, layout, seriesColor, type Layout } from '@/lib/tokens';
import {
  CHURN_WARN, DEFAULT_FILTERS, LOST_WARN, PARAMS, PLAN_ORDER, REGION_ORDER, TENURE_GROUPS,
  agg, alerts as findAlerts, applyScope, applyStatus, byGrain, churnLevel, clockVN, dataBounds,
  fmtAxis, fmtDate, fmtInt, fmtParam, fmtPct, fmtUsd, fmtUsdShort, group, lostLevel, matrix,
  metricOf, periodLabel, periodRange, presetRange, previousRange, qualityChecks, rowsForParam,
  tenureGroup, type GroupRow,
} from '@/lib/aggregate';
import type { Aggregate, Alert, ApiData, Filters, Grain, Level, PageId, ParamKey, Row, SessionUser } from '@/lib/types';

type LoadState = 'loading' | 'error' | 'ready' | 'signedOut';
type Theme = 'light' | 'dark';

const GRAINS: { key: Grain; label: string }[] = [
  { key: 'week', label: 'Tuần' }, { key: 'month', label: 'Tháng' }, { key: 'quarter', label: 'Quý' },
];
const GRAIN_WORD: Record<Grain, string> = { week: 'tuần', month: 'tháng', quarter: 'quý' };

/* Theme sống ở localStorage (nguồn bên ngoài React) ⇒ đọc bằng useSyncExternalStore. */
const THEME_EVENT = 'themechange';
function readTheme(): Theme {
  try { return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
}
function subscribeTheme(cb: () => void) {
  addEventListener(THEME_EVENT, cb);
  addEventListener('storage', cb);
  return () => { removeEventListener(THEME_EVENT, cb); removeEventListener('storage', cb); };
}

export default function DashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState('');
  const [refreshError, setRefreshError] = useState('');
  const loaded = useRef(false);   // đã có số ít nhất một lần ⇒ lỗi tải lại không xoá dashboard
  const [fetchedAt, setFetchedAt] = useState('');
  const [sheet, setSheet] = useState({ title: '', tab: '' });
  const router = useRouter();
  const [env, setEnv] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<SessionUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState<PageId>('home');
  // Quý: mỗi tháng chỉ vài chục khách đăng ký nên tỷ lệ theo tháng dao động mạnh, dễ đọc thành khủng hoảng
  const [grain, setGrain] = useState<Grain>('quarter');
  const [rail, setRail] = useState(false);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => 'light' as Theme);
  const [drawer, setDrawer] = useState(false);
  const [modal, setModal] = useState(false);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  // Phiên hết hạn hoặc email bị gỡ khỏi ALLOWED_EMAILS ⇒ quay về màn đăng nhập
  useEffect(() => { if (state === 'signedOut') router.replace('/'); }, [state, router]);
  useEffect(() => {
    void load();
    fetch('/api/auth/session')
      .then((r) => r.json() as Promise<{ user?: SessionUser }>)
      .then((s) => setUser(s.user ?? null))
      .catch(() => setUser(null));
  }, []);

  /* fresh = người dùng bấm Tải lại / Thử lại ⇒ xoá cache 15 phút trước rồi mới đọc. */
  async function load(fresh = false): Promise<void> {
    setBusy(true);
    try {
      if (fresh) {
        const r = await fetch('/api/data', { method: 'POST' });
        if (r.status === 401) { setState('signedOut'); return; }
      }
      const res = await fetch('/api/data');
      if (res.status === 401) { setState('signedOut'); return; }
      const json = (await res.json()) as ApiData;
      setEnv(json.env ?? {});
      if (json.error) throw new Error(json.error);
      setRows(json.rows);
      setFetchedAt(json.fetchedAt);
      setSheet({ title: json.title ?? '', tab: json.tab });
      setRefreshError('');
      const b = dataBounds(json.rows);
      // Mặc định "Toàn bộ": từ ngày nhỏ nhất tới lớn nhất TRONG DỮ LIỆU, không tính từ hôm nay
      setFilters((f) => (f.from ? f : { ...f, ...presetRange('all', b) }));
      loaded.current = true;
      setState('ready');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Lỗi không xác định';
      // Đang có số thì giữ nguyên dashboard, chỉ báo lỗi nhỏ ở thanh trên
      if (loaded.current) { setRefreshError(msg); return; }
      setError(msg);
      setState('error');
    } finally {
      setBusy(false);
    }
  }

  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;   // trước khi render lại: chart đọc token lúc render
    try { localStorage.setItem('theme', next); } catch {}
    dispatchEvent(new Event(THEME_EVENT));
  }

  const bounds = useMemo(() => dataBounds(rows), [rows]);
  const scoped = useMemo(() => applyScope(rows, filters), [rows, filters]);
  const filtered = useMemo(() => applyStatus(scoped, filters), [scoped, filters]);
  const paramRows = useMemo(() => rowsForParam(scoped, filters), [scoped, filters]);
  const alertList = useMemo(
    () => findAlerts(applyScope(rows, { ...filters, plans: [], regions: [] })),
    [rows, filters],
  );
  const L = useMemo(() => fitCardBorder(layout(rail ? SIDE_RAIL : SIDE_WIDE)), [rail]);

  const filterCount = (filters.preset !== 'all' ? 1 : 0) + (filters.plans.length ? 1 : 0)
    + (filters.regions.length ? 1 : 0) + (filters.status !== 'all' ? 1 : 0);

  function patchFilters(patch: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...patch, ...(patch.preset === 'all' ? presetRange('all', bounds) : {}) }));
  }
  function clearAll() {
    setFilters((f) => ({ ...DEFAULT_FILTERS, param: f.param, ...presetRange('all', bounds) }));
  }
  function openAlert(a: Alert) {
    setFilters((f) => (a.kind === 'plan' ? { ...f, plans: [a.key], regions: [] } : { ...f, regions: [a.key], plans: [] }));
    setPage(a.kind === 'plan' ? 'plan' : 'region');
  }

  const stageClass = [rail && 'rail', drawer && 'drawer', modal && 'modal'].filter(Boolean).join(' ');

  return (
    <Shell stageClass={stageClass}>
      <Sidebar page={page} rail={rail} onPage={setPage} onToggleRail={() => setRail((v) => !v)}
               rowCount={rows.length} fetchedAt={fetchedAt} />

      <main id="main">
        <TopBar page={page} fetchedAt={fetchedAt} busy={busy} refreshError={refreshError} alerts={alertList} user={user}
                filterCount={filterCount} theme={theme}
                onRefresh={() => void load(true)} onAlert={openAlert} onExport={() => setModal(true)}
                onToggleTheme={toggleTheme} onOpenFilters={() => setDrawer(true)} />

        <div id="body" className={page === 'source' ? 'nokpi' : ''} key={theme}>
          <GreetBar filters={filters} onClear={patchFilters} onClearAll={clearAll} onPickMetric={() => setDrawer(true)} />

          {state === 'loading' && (
            <div className="card" style={{ flex: 1 }}>
              <div className="empty" style={{ flexDirection: 'row', gap: 10 }}><span className="spin" />Đang tải dữ liệu từ Google Sheets…</div>
            </div>
          )}

          {state === 'error' && (
            <div className="card" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <div className="err" style={{ width: 520, marginTop: 0 }}>
                <b>Không đọc được dữ liệu</b>
                {error}
                <br />
                <button onClick={() => void load(true)}><Icon name="rotate-ccw" className="lu lu-xs" /> Thử lại</button>
              </div>
            </div>
          )}

          {state === 'ready' && page === 'source' && (
            <SourcePage rows={rows} sheet={sheet} fetchedAt={fetchedAt} bounds={bounds} env={env} L={L} />
          )}

          {state === 'ready' && page !== 'source' && (
            filtered.length === 0
              ? (
                <div className="card" style={{ flex: 1 }}>
                  <div className="empty">
                    <b>Không có khách nào khớp bộ lọc</b>
                    Thử chọn &quot;Toàn bộ&quot; thời gian hoặc thêm gói / khu vực.
                    <button className="chip" style={{ marginTop: 12 }} onClick={clearAll}>Xoá tất cả bộ lọc</button>
                  </div>
                </div>
              )
              : (
                <>
                  <KpiBand rows={rows} scoped={scoped} filters={filters} bounds={bounds} L={L} />
                  {page === 'home' && (
                    <HomePage scoped={scoped} paramRows={paramRows} filters={filters} grain={grain}
                              onGrain={setGrain} L={L}
                              onPlan={(p) => patchFilters({ plans: [p] })} />
                  )}
                  {page === 'plan' && (
                    <DimPage key="plan" dim="plan" scoped={scoped} filtered={filtered} paramRows={paramRows} filters={filters} L={L}
                             onPick={(p) => patchFilters({ plans: [p] })} />
                  )}
                  {page === 'region' && (
                    <DimPage key="region" dim="region" scoped={scoped} filtered={filtered} paramRows={paramRows} filters={filters} L={L}
                             onPick={(r) => patchFilters({ regions: [r] })} />
                  )}
                </>
              )
          )}
        </div>
      </main>

      <FilterDrawer open={drawer} filters={filters} rows={rows} bounds={bounds}
                    onApply={(f) => { setFilters(f); setDrawer(false); }} onClose={() => setDrawer(false)} />
      <ExportModal open={modal} filteredRows={filtered} allRows={rows} bounds={bounds}
                   onClose={() => setModal(false)} />
    </Shell>
  );
}

/* layout() (tokens.ts) chỉ trừ CARD_PAD, nhưng .card (globals.css) còn viền 1px mỗi bên ⇒
   vùng vẽ thật hẹp và thấp hơn 2px. Hai file đó là asset chép nguyên văn, không sửa —
   bù ở đây để overflow:hidden của card không xén mép phải/dưới của chart. */
function fitCardBorder(L: Layout): Layout {
  const fit = (p: Layout['p2a']) => ({ w: p.w - 2, h: p.h - 2 });
  return { ...L, p2a: fit(L.p2a), p2b: fit(L.p2b), p3c: fit(L.p3c), p3d: fit(L.p3d) };
}

/* ── Màu chuỗi: một luật cho mọi dimension ────────────────────────────────
   Chỉ khi chỉ số là tỷ lệ rời bỏ mới có ngưỡng trên chuỗi: truyền tỷ lệ giữ chân
   vào `roas` để seriesColor() tô --bad khi rời bỏ > 15%. */
function colorOf(p: ParamKey, g: Aggregate, rank: number): string {
  return seriesColor({ roas: p === 'churnRate' && g.churnRate != null ? 1 - g.churnRate : null }, rank);
}

function ranked<T extends { v: number }>(items: T[]): (T & { rank: number })[] {
  const order = [...items].sort((a, b) => b.v - a.v);
  return items.map((it) => ({ ...it, rank: order.indexOf(it) }));
}

const paramLabel = (p: ParamKey) => PARAMS.find((x) => x.key === p)!.label;
const fmtFor = (p: ParamKey) => (v: number) => fmtParam(v, p);
const axisFor = (p: ParamKey) => (v: number) => fmtAxis(v, p);

/* ── Tiêu đề = câu hỏi nghiệp vụ ─────────────────────────────────────────
   Câu hỏi cố định, KHÔNG chứa số: dữ liệu cập nhật liên tục nên câu hỏi không bao giờ cũ,
   chart + tooltip trả lời bằng số mới nhất (người dùng chốt 2026-10-23).
   Câu hỏi đổi theo chỉ số đang xem. Dòng phụ nói chart vẽ gì. */
const Q_TREND: Record<ParamKey, string> = {
  churnRate: 'Khách đăng ký gần đây có rời bỏ nhiều hơn không?',
  mrr: 'MRR đang đến từ nhóm khách đăng ký kỳ nào?',
  customers: 'Số khách đăng ký mới đang tăng hay giảm?',
  lostMrr: 'Doanh thu mất đến từ nhóm khách đăng ký kỳ nào?',
};
const Q_TENURE: Record<ParamKey, string> = {
  churnRate: 'Khách rời bỏ nhiều nhất ở giai đoạn nào?',
  mrr: 'MRR tập trung ở khách dùng bao lâu?',
  customers: 'Khách hàng đang ở giai đoạn sử dụng nào?',
  lostMrr: 'Doanh thu mất đến từ khách dùng bao lâu?',
};
const Q_MATRIX: Record<ParamKey, string> = {
  churnRate: 'Gói nào, đăng ký kỳ nào đang rời bỏ cao?',
  mrr: 'Gói nào, đăng ký kỳ nào đóng góp MRR nhiều?',
  customers: 'Gói nào, kỳ nào thu hút nhiều khách mới?',
  lostMrr: 'Gói nào, đăng ký kỳ nào làm mất nhiều doanh thu?',
};
function qRank(p: ParamKey, word: string): string {
  if (p === 'churnRate') return `${word} nào đang vượt ngưỡng rời bỏ 15%?`;
  if (p === 'lostMrr') return `${word} nào làm mất nhiều doanh thu nhất?`;
  return `${word} nào dẫn đầu về ${p === 'mrr' ? 'MRR' : 'số khách'}?`;
}
function qLine(p: ParamKey, word: string): string {
  return p === 'churnRate' || p === 'lostMrr'
    ? `${word} nào đang xấu đi nhanh nhất?`
    : `${word} nào đang tăng trưởng?`;
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ── Dòng phụ = tên chỉ số (đơn vị) · chiều phân tích ─────────────────────
   Như dashboard chuẩn: nói chart đang đo chỉ số gì, đơn vị gì, theo chiều nào.
   Công thức nằm ở tooltip của dòng phụ — không chiếm chỗ trên màn hình. */
const UNIT: Record<ParamKey, string> = { churnRate: '%', mrr: 'USD', customers: 'khách', lostMrr: 'USD' };
const FORMULA: Record<ParamKey, string> = {
  churnRate: 'số khách đã rời ÷ tổng số khách',
  mrr: 'tổng phí hằng tháng của khách đang dùng',
  customers: 'số khách',
  lostMrr: 'tổng phí hằng tháng của khách đã rời',
};
const metricLine = (p: ParamKey, by: string) => `${paramLabel(p)} (${UNIT[p]}) · ${by}`;
const formulaTip = (p: ParamKey) => `Cách tính: ${paramLabel(p)} = ${FORMULA[p]}`;

/* ── Băng KPI ─────────────────────────────────────────────────────────── */

/* Phạm vi thời gian của tỷ lệ — điều sếp dễ hiểu sai nhất (cộng dồn, không phải theo tháng).
   Chỉ dùng trong tooltip; đổi theo bộ lọc ngày. */
function rangeText(f: Filters, b: { min: string; max: string }): string {
  if (f.preset === 'all') return `khách đăng ký từ ${fmtDate(b.min)} đến thời điểm dữ liệu`;
  if (f.preset === 'custom') return `khách đăng ký từ ${fmtDate(f.from)} đến ${fmtDate(f.to)}`;
  return `khách đăng ký trong năm ${f.preset}`;
}

function KpiBand({ rows, scoped, filters, bounds, L }: {
  rows: Row[]; scoped: Row[]; filters: Filters; bounds: { min: string; max: string }; L: Layout;
}) {
  const a = agg(scoped);
  const prevRange = previousRange(filters);
  const prevRows = prevRange ? applyScope(rows, { ...filters, ...prevRange }) : [];
  const prev = prevRows.length ? agg(prevRows) : null;
  const months = byGrain(scoped, 'month', filters.from, filters.to);

  const delta = (now: number | null, before: number | null | undefined) =>
    now == null || before == null || before === 0 ? null : (now - before) / before;
  /* Tỷ lệ so với tỷ lệ: chênh lệch tuyệt đối (điểm %), không phải % thay đổi */
  const diff = (now: number | null, before: number | null | undefined) =>
    now == null || before == null ? null : now - before;
  const mean = (xs: (number | null)[]) => {
    const v = xs.filter((x): x is number => x != null);
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0;
  };

  const churnLv = churnLevel(a.churnRate);
  const lostLv = lostLevel(a.lostPct);
  /* Mức ngưỡng nói bằng chữ trong tooltip — trên thẻ chỉ còn màu, nên chữ phải có ở đâu đó */
  const levelWord = (l: Level | null) => (l === 'bad' ? 'Cảnh báo' : l === 'warn' ? 'Theo dõi' : 'Đạt mục tiêu');
  const range = rangeText(filters, bounds);

  const cards = [
    {
      label: 'Doanh thu tháng hiện tại (MRR)', value: fmtUsdShort(a.mrr), d: delta(a.mrr, prev?.mrr), inverse: false,
      level: null, spark: months.map((m) => m.mrr),
      help: `Tổng phí hằng tháng của khách đang dùng, trong số ${range}. Trung bình ${a.arpa == null ? '—' : fmtUsd(a.arpa)} / khách đang dùng (ARPA).`,
    },
    {
      label: 'Khách đang dùng', value: fmtInt(a.active), d: delta(a.active, prev?.active), inverse: false,
      level: null, spark: months.map((m) => m.active),
      help: `Số khách còn trạng thái Active, trong số ${range}.`,
    },
    {
      label: 'Tỷ lệ khách đã rời bỏ', value: fmtPct(a.churnRate), d: diff(a.churnRate, prev?.churnRate), points: true, inverse: true,
      level: churnLv, spark: months.map((m) => m.churnRate), baseline: CHURN_WARN,
      help: `${levelWord(churnLv)}. Số khách đã rời bỏ chia tổng số ${range} — cộng dồn, không phải churn theo tháng. Mục tiêu dưới 10%, cảnh báo trên 15% (đường gạch).`,
    },
    {
      label: 'Doanh thu tháng đã mất do khách rời', value: fmtUsdShort(a.lostMrr), d: delta(a.lostMrr, prev?.lostMrr), inverse: true,
      level: null, spark: months.map((m) => m.lostMrr),
      help: `Tổng phí hằng tháng của khách đã rời bỏ, trong số ${range} — tính theo mức phí lúc họ rời.`,
    },
    {
      label: '% doanh thu đã mất', value: fmtPct(a.lostPct), d: diff(a.lostPct, prev?.lostPct), points: true, inverse: true,
      level: lostLv, spark: months.map((m) => m.lostPct), baseline: LOST_WARN,
      help: `${levelWord(lostLv)}. Doanh thu tháng đã mất chia tổng doanh thu tháng từng có (MRR hiện tại + đã mất) của ${range}. Mục tiêu dưới 5%, cảnh báo trên 10% (đường gạch).`,
    },
  ];

  return (
    <div id="kpis">
      {cards.map((c) => (
        <KpiCard key={c.label} label={c.label} help={c.help} value={c.value} delta={c.d} points={c.points} inverse={c.inverse}
                 level={c.level} spark={c.spark} baseline={c.baseline ?? mean(c.spark)} width={L.kpiW} />
      ))}
    </div>
  );
}

/* ── Trang 1 · Tổng quan ──────────────────────────────────────────────── */

function HomePage({ scoped, paramRows, filters, grain, onGrain, L, onPlan }: {
  scoped: Row[]; paramRows: Row[]; filters: Filters; grain: Grain;
  onGrain: (g: Grain) => void; L: Layout; onPlan: (p: string) => void;
}) {
  const p = filters.param;

  const mrrByPlan = ranked(group(scoped, (r) => r.plan, PLAN_ORDER).map((g) => ({ name: g.key, v: g.mrr })))
    .map((x) => ({ name: x.name, value: x.v, color: seriesColor({ roas: null }, x.rank) }));

  const trend = byGrain(paramRows, grain, filters.from, filters.to)
    .map((x) => ({ label: periodLabel(x.key, grain), value: metricOf(x, p) }));

  const tenure = group(paramRows, (r) => tenureGroup(r.tenure), TENURE_GROUPS);
  const tenureRanked = ranked(tenure.map((g) => ({ g, v: metricOf(g, p) ?? 0 })));
  const tenureBars = tenureRanked.map((x) => ({ name: x.g.key, value: x.v, color: colorOf(p, x.g, x.rank) }));

  const m = matrix(paramRows, p, filters.from, filters.to);
  const mCols = m.cols.map((c) => periodLabel(c, 'quarter'));

  return (
    <>
      <div id="row2">
        <ChartCard width={L.a} title="Gói nào tạo ra nhiều MRR nhất?"
                   subtitle="Tỷ trọng MRR (%) · theo gói"
                   subtitleTip="Cách tính: tỷ trọng = MRR của gói ÷ tổng MRR. MRR = tổng phí hằng tháng của khách đang dùng"
                   legend={<Legend two items={mrrByPlan} />}>
          <DonutChart width={L.p2a.w} height={L.p2a.h - LGD2} data={mrrByPlan}
                      total={fmtUsdShort(mrrByPlan.reduce((s, d) => s + d.value, 0))} centerLabel="MRR"
                      format={fmtUsd} onSelect={onPlan} />
        </ChartCard>
        <ChartCard width={L.b} title={Q_TREND[p]}
                   subtitle={metricLine(p, `theo ${GRAIN_WORD[grain]} đăng ký`)}
                   subtitleTip={`${formulaTip(p)}. Mỗi điểm là nhóm khách đăng ký trong ${GRAIN_WORD[grain]} đó`}
                   control={
                     <div className="seg sm">
                       {GRAINS.map((g) => (
                         <button key={g.key} className={grain === g.key ? 'on' : ''} onClick={() => onGrain(g.key)}>{g.label}</button>
                       ))}
                     </div>
                   }>
          <TrendAreaChart width={L.p2b.w} height={L.p2b.h} data={trend} name={paramLabel(p)}
                          format={fmtFor(p)} axisFormat={axisFor(p)}
                          threshold={p === 'churnRate' ? CHURN_WARN : undefined} />
        </ChartCard>
      </div>
      <div id="row3">
        <ChartCard width={L.c} title={Q_TENURE[p]} subtitle={metricLine(p, 'theo thời gian sử dụng')}
                   subtitleTip={`${formulaTip(p)}, trong mỗi nhóm số tháng đã dùng`}>
          <RankBarChart width={L.p3c.w} height={L.p3c.h} data={tenureBars} format={fmtFor(p)} />
        </ChartCard>
        <ChartCard width={L.d} title={Q_MATRIX[p]} subtitle={metricLine(p, 'gói × quý đăng ký · ô mờ: dưới 10 khách')}
                   subtitleTip={`${formulaTip(p)}. Mỗi ô là khách cùng gói, cùng quý đăng ký`}>
          <MatrixTable width={L.p3d.w} height={L.p3d.h} cols={mCols}
                       rows={m.rows} inverse={p === 'churnRate' || p === 'lostMrr'}
                       format={p === 'churnRate' ? fmtPct : axisFor(p)} />
        </ChartCard>
      </div>
    </>
  );
}

/* ── Trang 2, 3 · Theo gói / khu vực — cùng bố cục, đổi dimension ──────── */

function DimPage({ dim, scoped, filtered, paramRows, filters, L, onPick }: {
  dim: 'plan' | 'region'; scoped: Row[]; filtered: Row[]; paramRows: Row[]; filters: Filters; L: Layout;
  onPick: (k: string) => void;
}) {
  const [view, setView] = useState<'sum' | 'rows'>('sum');
  const p = filters.param;
  const keyOf = (r: Row) => (dim === 'plan' ? r.plan : r.region);
  const order = dim === 'plan' ? PLAN_ORDER : REGION_ORDER;
  const word = dim === 'plan' ? 'gói' : 'khu vực';

  const groups = group(paramRows, keyOf, order).filter((g) => g.customers > 0);
  const rk = ranked(groups.map((g) => ({ g, v: metricOf(g, p) ?? 0 })));
  const color = new Map(rk.map((x) => [x.g.key, colorOf(p, x.g, x.rank)]));
  const bars = [...rk].sort((a, b) => a.rank - b.rank).map((x) => ({ name: x.g.key, value: x.v, color: color.get(x.g.key)! }));

  const quarters = periodRange(filters.from, filters.to, 'quarter');
  const perGroup = new Map(groups.map((g) => [g.key, byGrain(paramRows.filter((r) => keyOf(r) === g.key), 'quarter', filters.from, filters.to)]));
  const lines = quarters.map((q, i) => {
    const pt: Record<string, number | null | string> = { label: periodLabel(q, 'quarter') };
    for (const g of groups) pt[g.key] = metricOf(perGroup.get(g.key)![i], p);
    return pt as { label: string } & Record<string, number | null | string>;
  });
  const series = bars.map((b) => ({ name: b.name, color: b.color }));

  const full = group(scoped, keyOf, order).filter((g) => g.customers > 0);
  const lost = ranked(full.map((g) => ({ name: g.key, v: g.lostMrr })))
    .map((x) => ({ name: x.name, value: x.v, color: seriesColor({ roas: null }, x.rank) }));

  const listRows = [...filtered].sort((a, b) => b.revenue - a.revenue);
  const Word = cap(word);

  return (
    <>
      <div id="row2">
        <ChartCard width={L.a} title={qRank(p, Word)}
                   subtitle={metricLine(p, `theo ${word}`)} subtitleTip={`${formulaTip(p)}. Bấm thanh để lọc`}>
          <RankBarChart width={L.p2a.w} height={L.p2a.h} data={bars} format={fmtFor(p)} onSelect={onPick} />
        </ChartCard>
        <ChartCard width={L.b} title={qLine(p, Word)}
                   subtitle={metricLine(p, `theo ${word}, quý đăng ký`)}
                   subtitleTip={`${formulaTip(p)}. Mỗi điểm là khách của ${word} đó đăng ký trong quý`}
                   legend={<Legend items={series} />}>
          <MultiLineChart width={L.p2b.w} height={L.p2b.h - LGD1} data={lines} series={series}
                          format={fmtFor(p)} axisFormat={axisFor(p)} />
        </ChartCard>
      </div>
      <div id="row3">
        <ChartCard width={L.c} title={`Doanh thu mất tập trung ở ${word} nào?`}
                   subtitle={`Doanh thu tháng đã mất (USD) · theo ${word}`}
                   subtitleTip={`Cách tính: ${FORMULA.lostMrr}, cộng theo ${word}`}
                   legend={<Legend two items={lost} />}>
          <DonutChart width={L.p3c.w} height={L.p3c.h - LGD2} data={lost}
                      total={fmtUsdShort(lost.reduce((s, d) => s + d.value, 0))} centerLabel="đã mất"
                      format={fmtUsd} onSelect={onPick} />
        </ChartCard>
        <ChartCard width={L.d}
                   title={view === 'sum' ? `${Word} nào mất nhiều doanh thu nhất?` : 'Khách nào cần chăm sóc trước?'}
                   subtitle={view === 'sum'
                     ? `Chỉ số đầy đủ (USD, %) · theo ${word}`
                     : `${fmtInt(listRows.length)} khách khớp bộ lọc · xếp theo MRR giảm dần${listRows.length > LIST_CAP ? ` · hiện ${LIST_CAP} khách đầu, xuất CSV để xem đủ` : ''}`}
                   subtitleTip={view === 'sum'
                     ? 'Cách tính: tỷ lệ rời bỏ = đã rời ÷ khách · % DT mất = DT mất ÷ (MRR + DT mất) · ARPA = MRR ÷ khách đang dùng'
                     : undefined}
                   control={
                     <div className="seg sm">
                       <button className={view === 'sum' ? 'on' : ''} onClick={() => setView('sum')}>Tổng hợp</button>
                       <button className={view === 'rows' ? 'on' : ''} onClick={() => setView('rows')}>Từng khách</button>
                     </div>
                   }>
          {view === 'sum'
            ? <FullTable groups={full} width={L.p3d.w} height={L.p3d.h} first={dim === 'plan' ? 'Gói' : 'Khu vực'} />
            : <CustomerTable rows={listRows} width={L.p3d.w} height={L.p3d.h} />}
        </ChartCard>
      </div>
    </>
  );
}

function LevelPill({ level, text }: { level: Level | null; text: string }) {
  if (!level) return <>{text}</>;
  return (
    <span style={{ background: `var(--${level}-bg)`, color: `var(--${level})`, fontWeight: 600,
                   borderRadius: 'var(--r-pill)', padding: '1px 7px' }}>{text}</span>
  );
}

function FullTable({ groups, width, height, first }: { groups: GroupRow[]; width: number; height: number; first: string }) {
  const sorted = [...groups].sort((a, b) => b.lostMrr - a.lostMrr);
  const td = { padding: '7px 7px', fontSize: 12 } as const;
  return (
    <div className="tscroll" style={{ width, height }}>
      <table>
        <thead>
          <tr>
            {[first, 'Khách', 'Đang dùng', 'Đã rời', 'Tỷ lệ rời bỏ', 'MRR', 'DT đã mất', '% DT mất', 'ARPA'].map((h) => (
              <th key={h} style={{ padding: '6px 7px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((g) => (
            <tr key={g.key}>
              <td style={td}>{g.key}</td>
              <td style={td}>{fmtInt(g.customers)}</td>
              <td style={td}>{fmtInt(g.active)}</td>
              <td style={td}>{fmtInt(g.churned)}</td>
              <td style={td}><LevelPill level={churnLevel(g.churnRate)} text={fmtPct(g.churnRate)} /></td>
              <td style={td}>{fmtInt(g.mrr)}</td>
              <td style={td}>{fmtInt(g.lostMrr)}</td>
              <td style={td}><LevelPill level={lostLevel(g.lostPct)} text={fmtPct(g.lostPct)} /></td>
              <td style={td}>{g.arpa == null ? '—' : fmtInt(g.arpa)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Danh sách từng khách theo bộ lọc hiện tại (gồm cả bộ lọc trạng thái).
   Giới hạn số dòng vẽ để bảng cuộn mượt; muốn đủ thì xuất CSV. */
const LIST_CAP = 200;

function CustomerTable({ rows, width, height }: { rows: Row[]; width: number; height: number }) {
  const td = { padding: '6px 7px', fontSize: 12 } as const;
  return (
    <div className="tscroll" style={{ width, height }}>
      <table>
        <thead>
          <tr>
            {['Mã khách', 'Gói', 'Khu vực', 'Ngày đăng ký', 'Tháng dùng', 'MRR (USD)', 'Trạng thái'].map((h) => (
              <th key={h} style={{ padding: '6px 7px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, LIST_CAP).map((r) => (
            <tr key={r.id}>
              <td style={td}><span className="mono">{r.id}</span></td>
              <td style={td}>{r.plan}</td>
              <td style={td}>{r.region}</td>
              <td style={td}>{fmtDate(r.date)}</td>
              <td style={td}>{fmtInt(r.tenure)}</td>
              <td style={td}>{r.revenue.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style={{ ...td, color: r.churned ? 'var(--ink)' : 'var(--ink2)', fontWeight: r.churned ? 600 : 400 }}>
                {r.churned ? 'Đã rời' : 'Đang dùng'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Trang 4 · Nguồn dữ liệu — không băng KPI, hai hàng giãn (#body.nokpi) ── */

const SCHEMA: [string, string, string, string][] = [
  ['customer_id', 'text', 'METRIC · đếm số khách', 'CUS-2802'],
  ['plan', 'text', 'PRIMARY_DIM', 'Pro'],
  ['signup_date', 'text ISO', 'DATE', '2023-10-12'],
  ['region', 'text', 'SECONDARY_DIM', 'APAC · trống'],
  ['tenure_months', 'number', 'SECONDARY_DIM · gom 4 nhóm', '27'],
  ['monthly_revenue', 'number (USD)', 'METRIC', '101.22'],
  ['status', 'text', 'SECONDARY_DIM · bộ lọc', 'Active'],
  ['churn', 'text', 'METRIC · đếm khách rời', 'No'],
  ['Data_Flag', 'text', 'ATTRIBUTE · cờ chất lượng', 'CHURN_RELABELED'],
];

/* Tên biến + dùng cho việc gì. Trạng thái có/không lấy từ /api/data — không bao giờ có giá trị. */
const ENV: [string, string][] = [
  ['GOOGLE_SHEETS_SPREADSHEET_ID', 'Đọc Sheet'],
  ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'Đọc Sheet'],
  ['GOOGLE_PRIVATE_KEY', 'Đọc Sheet'],
  ['AUTH_SECRET', 'Mã hoá phiên đăng nhập'],
  ['AUTH_GOOGLE_ID', 'Đăng nhập Google (OAuth Client)'],
  ['AUTH_GOOGLE_SECRET', 'Đăng nhập Google (OAuth Client)'],
  ['ALLOWED_EMAILS', 'Danh sách email được vào'],
];

function SourcePage({ rows, sheet, fetchedAt, bounds, env, L }: {
  rows: Row[]; sheet: { title: string; tab: string }; fetchedAt: string; bounds: { min: string; max: string }; env: Record<string, boolean>; L: Layout;
}) {
  const info: [string, string][] = [
    ['Nguồn', 'Google Sheets'],
    ['Spreadsheet', sheet.title || '—'],
    ['Tab', sheet.tab],
    ['Số dòng', `${fmtInt(rows.length)} khách`],
    ['Ngày đăng ký', `${fmtDate(bounds.min)} → ${fmtDate(bounds.max)}`],
    ['Quyền', 'Chỉ đọc · service account'],
    ['Làm mới', 'Mỗi 15 phút'],
    ['Đọc lúc', fetchedAt ? `${clockVN(fetchedAt)} · ${fmtDate(fetchedAt.slice(0, 10))}` : '—'],
  ];
  const checks = qualityChecks(rows);
  const td = { padding: '7px 9px' } as const;

  return (
    <>
      <div id="row2">
        <div className="card" style={{ width: L.a, flex: `0 0 ${L.a}px` }}>
          <div className="chead"><div><div className="ct">Thông tin kết nối</div><div className="cs">Dữ liệu dashboard đang đọc</div></div></div>
          <div className="tscroll">
            <table><tbody>
              {info.map(([k, v]) => <tr key={k}><td style={td}>{k}</td><td style={{ ...td, whiteSpace: 'normal' }}>{v}</td></tr>)}
            </tbody></table>
          </div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="chead"><div><div className="ct">Schema và vai trò từng cột</div><div className="cs">Theo docs/1-spec/specification.md §7</div></div></div>
          <div className="tscroll">
            <table>
              <thead><tr>{['Cột', 'Kiểu', 'Vai trò', 'Ví dụ'].map((h) => <th key={h} style={{ textAlign: 'left' }}>{h}</th>)}</tr></thead>
              <tbody>
                {SCHEMA.map(([c, t, r, e]) => (
                  <tr key={c}>
                    <td style={td}><span className="mono">{c}</span></td>
                    <td style={{ ...td, textAlign: 'left' }}>{t}</td>
                    <td style={{ ...td, textAlign: 'left' }}><span className="role">{r}</span></td>
                    <td style={{ ...td, textAlign: 'left' }}><span className="mono">{e}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div id="row3">
        <div className="card" style={{ width: L.c, flex: `0 0 ${L.c}px` }}>
          <div className="chead"><div><div className="ct">Biến môi trường</div><div className="cs">Chỉ tên — giá trị nằm ở .env.local và Vercel</div></div></div>
          <div className="tscroll">
            <table><tbody>
              {ENV.map(([k, use]) => (
                <tr key={k}>
                  <td style={td}><span className="mono" style={{ fontWeight: 400 }}>{k}</span><div className="cs" style={{ marginTop: 2 }}>{use}</div></td>
                  <td style={td}>{env[k]
                    ? <span className="ok"><Icon name="circle-check" className="lu lu-xs" />Đã có</span>
                    : <span style={{ color: 'var(--ink2)' }}>Chưa có</span>}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="chead"><div><div className="ct">Kiểm tra chất lượng dữ liệu</div><div className="cs">Tính trực tiếp trên {fmtInt(rows.length)} dòng vừa đọc</div></div></div>
          <div className="tscroll">
            <table><tbody>
              {checks.map((c) => (
                <tr key={c.label}>
                  <td style={td}>{c.label}</td>
                  <td style={td}>{c.value}</td>
                  <td style={{ ...td, width: 90 }}>{c.ok
                    ? <span className="ok"><Icon name="circle-check" className="lu lu-xs" />Đạt</span>
                    : <span style={{ color: 'var(--bad)', fontWeight: 600 }}>Cần xem</span>}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
      </div>
    </>
  );
}

/* Kiểu dữ liệu dùng chung. Một dòng = một khách hàng (snapshot cấp khách hàng).
   Nguồn: Google Sheets `cleaned_subscription_saas` — xem docs/1-spec/specification.md §7. */

export type Status = 'Active' | 'Churned';

export type Row = {
  id: string;           // customer_id
  plan: string;         // PRIMARY_DIM — Basic · Pro · Enterprise
  date: string;         // signup_date, GIỮ NGUYÊN chuỗi ISO 'yyyy-mm-dd'
  region: string;       // SECONDARY_DIM — ô trống đã đổi thành REGION_UNKNOWN
  tenure: number;       // tenure_months — chỉ gom nhóm, KHÔNG SUM
  revenue: number;      // monthly_revenue, USD/tháng
  status: Status;
  churned: boolean;     // churn = 'Yes' (đồng nghĩa status = Churned)
  flag: string;         // Data_Flag — chỉ dùng ở trang Nguồn dữ liệu
};

export type PageId = 'home' | 'plan' | 'region' | 'source';
export type Grain = 'week' | 'month' | 'quarter';
export type ParamKey = 'mrr' | 'customers' | 'churnRate' | 'lostMrr';
export type StatusFilter = 'all' | Status;
export type Preset = '2023' | '2024' | '2025' | 'all' | 'custom';

export type Filters = {
  param: ParamKey;
  preset: Preset;
  from: string;         // ISO 'yyyy-mm-dd' — so sánh chuỗi ISO an toàn, không dính múi giờ
  to: string;
  plans: string[];      // rỗng = tất cả
  regions: string[];    // rỗng = tất cả
  status: StatusFilter;
};

export type Aggregate = {
  customers: number;    // COUNT(customer_id)
  active: number;       // COUNT WHERE Active
  churned: number;      // COUNT(churn = Yes)
  mrr: number;          // SUM(revenue) WHERE Active
  lostMrr: number;      // SUM(revenue) WHERE Churned
  churnRate: number | null;  // churned / customers — null khi không có khách
  lostPct: number | null;    // lostMrr / (mrr + lostMrr)
  arpa: number | null;       // mrr / active
};

export type Level = 'ok' | 'warn' | 'bad';

export type Alert = {
  kind: 'plan' | 'region';
  key: string;
  metric: 'churnRate' | 'lostPct';
  value: number;
};

export type ApiData = {
  rows: Row[];
  count: number;
  tab: string;
  title: string;        // tên file Google Sheet (đọc từ API, không viết cứng)
  fetchedAt: string;    // ISO thời điểm đọc Sheet (theo cache 15 phút)
  env: Record<string, boolean>;   // tên biến môi trường → đã có hay chưa (KHÔNG có giá trị)
  error?: string;
};

export type SessionUser = { name?: string | null; email?: string | null; image?: string | null };


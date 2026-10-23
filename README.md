# SaaS Churn & MRR Dashboard

Dashboard theo dõi **tỷ lệ khách rời bỏ (churn)** và **doanh thu tháng (MRR)** của một sản phẩm SaaS bán gói thuê bao — theo gói, khu vực và thời gian sử dụng. Dữ liệu đọc trực tiếp từ Google Sheets, làm mới mỗi 15 phút.

## Cấu trúc

```text
Dashboard/
├── docs/                      tài liệu thiết kế đã chốt (nguồn sự thật)
│   ├── 1-spec/specification.md
│   └── 2-design/{design,layout,components}.md
├── app/                       ứng dụng Next.js (App Router, TypeScript, Recharts)
│   ├── app/                   trang: / (đăng nhập) · /dashboard · /api/data
│   ├── components/            khung app, thẻ KPI, drawer bộ lọc, bảng xuất, chart
│   └── lib/                   đọc Google Sheets (server) · tổng hợp số liệu · token thiết kế
└── .claude/skills/            skill dùng để thiết kế và dựng dashboard
```

## Chạy ở máy local

Cần Node.js 20 trở lên.

```bash
cd app
npm install
cp .env.example .env.local     # rồi điền các biến bên dưới
npm run dev                    # mở http://localhost:3000 → đăng nhập Google
```

Biến môi trường (`app/.env.local`, **không commit**):

| Biến | Lấy ở đâu |
|---|---|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | đoạn giữa `/d/` và `/edit` trong link Google Sheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` trong file JSON key của service account |
| `GOOGLE_PRIVATE_KEY` | `private_key` trong file JSON key, giữ trên một dòng với `\n` |
| `AUTH_SECRET` | chuỗi ngẫu nhiên: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `AUTH_GOOGLE_ID` · `AUTH_GOOGLE_SECRET` | Google Cloud → Credentials → OAuth client ID (Web application). Redirect URI: `http://localhost:3000/api/auth/callback/google` |
| `ALLOWED_EMAILS` | email được vào, phân tách bằng dấu phẩy; `@congty.vn` cho cả tên miền |
| `NEXTAUTH_URL` | chỉ khi deploy: địa chỉ thật của dashboard |

Service account cần được **share quyền Viewer** trên Google Sheet. Tab dữ liệu: `cleaned_subscription_saas`.

## Build

```bash
cd app
npm run build
npm start
```

## Bảo mật

- Credential chỉ nằm ở `app/.env.local` (local) và Environment Variables của nơi deploy — đã chặn bằng `.gitignore` ở cả gốc repo lẫn `app/`.
- Khoá Google chỉ được đọc ở server (`app/lib/google-sheets.ts`, `app/app/api/data/route.ts`, có `import 'server-only'`); trình duyệt chỉ nhận dữ liệu đã tổng hợp.
- Đăng nhập Google, chỉ email trong `ALLOWED_EMAILS` xem được dashboard; chặn ở `proxy.ts` và tự kiểm tra lại trong `/api/data`.

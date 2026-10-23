# SaaS Churn & MRR Dashboard

Dashboard theo dõi **tỷ lệ khách rời bỏ (churn)** và **doanh thu tháng (MRR)** của một sản phẩm SaaS bán gói thuê bao — theo gói, khu vực và thời gian sử dụng. Dữ liệu đọc trực tiếp từ Google Sheets, làm mới mỗi 15 phút.

## Cấu trúc

```text
Dashboard/
├── docs/                      tài liệu thiết kế đã chốt (nguồn sự thật)
│   ├── 1-spec/specification.md
│   └── 2-design/{design,layout,components}.md
├── app/                       ứng dụng Next.js (App Router, TypeScript, Recharts)
│   ├── app/                   trang: / (giới thiệu) · /dashboard · /api/data
│   ├── components/            khung app, thẻ KPI, drawer bộ lọc, bảng xuất, chart
│   └── lib/                   đọc Google Sheets (server) · tổng hợp số liệu · token thiết kế
└── .claude/skills/            skill dùng để thiết kế và dựng dashboard
```

## Chạy ở máy local

Cần Node.js 20 trở lên.

```bash
cd app
npm install
cp .env.example .env.local     # rồi điền 3 biến Google Sheets
npm run dev                    # mở http://localhost:3000
```

Biến môi trường (`app/.env.local`, **không commit**):

| Biến | Lấy ở đâu |
|---|---|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | đoạn giữa `/d/` và `/edit` trong link Google Sheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` trong file JSON key của service account |
| `GOOGLE_PRIVATE_KEY` | `private_key` trong file JSON key, giữ trên một dòng với `\n` |

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
- Dashboard **không có đăng nhập**. Trước khi deploy công khai (ví dụ Vercel), bật một lớp bảo vệ như Vercel Deployment Protection.

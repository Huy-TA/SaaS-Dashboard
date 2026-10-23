# MEMORY.md — Dashboard

> Kiến thức riêng của Project/dataset này. Luật làm việc nằm ở `CLAUDE.md`.

## Trạng thái project — nhật ký (mới nhất ở trên)

- **2026-10-23 · Sửa sau đợt soi xử lý lỗi:** `/api/data` chỉ trả **mã lỗi** (`ApiErrorCode` trong `lib/types.ts`: `missing_env` · `bad_credentials` · `no_access` · `not_found` · `empty` · `quota` · `network` · `auth_check` · `bad_response` · `unknown`); câu tiếng Việt ở `errorText()` (`lib/aggregate.ts`); chi tiết kỹ thuật chỉ `console.error` ở server. Kiểm phiên trong route bọc `try` (lỗi ⇒ JSON `auth_check`, không ra trang HTML). Xoá cache hỏng ⇒ báo lỗi thay vì lặng lẽ trả số cũ. Nút Tải lại khoá khi đang tải (+ chặn gọi chồng bằng ref). Không đọc được phiên vẫn còn nút Đăng xuất. Màn đăng nhập bỏ tên biến / `.env.local` / mã lỗi thô; nút Google mở khoá lại nếu `signIn` lỗi mạng. Test HTTP thật đạt; phân loại mã lỗi chỉ kiểm bằng đọc code. Còn để sau: email lấy từ URL ở màn từ chối.

- **2026-10-23 · Sửa sau đợt soi chức năng (chưa commit):** (1) nút Tải lại / Thử lại gọi `POST /api/data` → `revalidateTag('sheet', { expire: 0 })` rồi mới GET, nên đọc Sheet ngay thay vì trả số cache 15 phút — đã test: GET lặp lại trả cùng giờ, sau POST ra giờ mới; POST không đăng nhập → 401. (2) Tải lại lỗi khi đã có số thì **giữ dashboard**, thanh trên đổi thành chấm đỏ "Tải lại lỗi · số lúc HH:MM" (lỗi chi tiết ở tooltip) — mới kiểm bằng đọc code. (3) Trang Nguồn dữ liệu: dòng Spreadsheet đọc tên file thật từ API (`spreadsheets.get`), không viết cứng. (4) Thay `favicon.ico` mặc định bằng `app/icon.svg` (logo activity), xoá 5 SVG mẫu trong `public/`, sửa README (`/` = đăng nhập). Còn để sau: hộp lỗi hiện nguyên văn lỗi kỹ thuật; mất nút Đăng xuất nếu không đọc được phiên.

- **2026-10-23 · Đã đẩy lên GitHub:** repo `https://github.com/Huy-TA/SaaS-Dashboard` (nhánh `main`), commit `843e503` (đăng nhập Google) trên `fadb344` (bản đầu); 73 file. Trước khi commit đã quét nội dung với 7 giá trị thật trong `.env.local` (cả 3 biến đăng nhập người dùng đã điền): **0 chỗ lộ**; trên GitHub chỉ có `app/.env.example`, không có `.env.local` hay file key. Các mục "chưa commit / chưa đẩy" bên dưới đã xong.

- **2026-10-23 · Đăng nhập Google làm lại (theo yêu cầu mới):** NextAuth v4 + Google; `/` là màn đăng nhập, chưa đăng nhập vào `/dashboard` → về `/`; chỉ email trong `ALLOWED_EMAILS` (hỗ trợ `@tenmien`), người khác thấy "Bạn không có quyền truy cập vui lòng liên hệ Admin"; góc phải header có ảnh đại diện + tên + "Đăng xuất". Biến: `AUTH_SECRET` (đã **tự sinh** vào `.env.local`), `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ALLOWED_EMAILS` (3 biến này **đang trống — người dùng cần điền**). Test bằng giá trị thử nghiệm trong tiến trình: 10/10 bài HTTP + trình duyệt đạt; build production đạt. Thay đổi này **chưa commit**.

- **2026-10-23 · Quản lý mã nguồn:** đã `git init` repo ở `Dashboard/`, commit đầu `fadb344` (70 file) gồm `docs/`, `app/`, `.claude/skills/`, `README.md`, `app/.env.example`. `.gitignore` ở gốc và `app/` chặn `.env*`, file key, `node_modules`, `.next`. Quét nội dung 70 file với 3 giá trị thật trong `.env.local`: **0 chỗ lộ**. **Chưa đẩy lên GitHub** — đang chờ người dùng tạo repo trống (khuyến nghị Private) và gửi link; máy chưa có GitHub CLI, có Git Credential Manager.
- **2026-10-23 · Build production:** `npm run build` thành công, không lỗi; TypeScript và ESLint sạch. Dashboard chạy local ở `http://localhost:3000`.
- **2026-10-23 · Review đối chiếu code ↔ 4 tài liệu:** chức năng và số liệu build đúng — khớp toàn bộ số tham chiếu `specification.md` §11; 0 lỗi console; bố cục đúng ở sidebar mở/thu gọn, sáng/tối, cửa sổ 16:9 và 1400×1000. Đã sửa 4 điểm nhỏ (số khách trong drawer tính cả bộ lọc trạng thái · tooltip `.tip` cho sidebar thu gọn · tooltip KPI mở bằng bàn phím · ARPA tổng trong tooltip thẻ MRR) và cập nhật 4 tài liệu cho khớp code.
- **2026-10-23 · Vấn đề còn lại:** (1) chưa đẩy code lên GitHub; (2) **không có đăng nhập** → trước khi deploy Vercel cần lớp bảo vệ khác (gợi ý Vercel Deployment Protection), chưa chốt; (3) 4 ngưỡng (rời bỏ 10% / 15%, % DT mất 5% / 10%) chưa xác nhận với đội Growth/Finance; (4) G18 ("khâu tốn thời gian nhất") chưa có thông tin; (5) dọn dẹp chưa làm: package `next-auth` không còn dùng, `app/AGENTS.md` bản mặc định.
- **2026-10-23 · Đăng nhập:** đã làm Google login (NextAuth + danh sách email), test đạt, rồi **bỏ theo yêu cầu người dùng**. Đã xoá `lib/auth.ts`, route `/api/auth`, `proxy.ts`; `/` là trang giới thiệu, `/dashboard` mở trực tiếp.
- **2026-10-23 · Dashboard đã build trong `app/`:** theo skill `dashboard-build` và 4 tài liệu đã chốt; các điều chỉnh sau build đều do người dùng chọn và đã ghi vào `docs/` (xem mục "Build" bên dưới).
- **2026-10-23 · Kết nối Google Sheets:** service account đọc file/tab `cleaned_subscription_saas` (3.000 dòng) qua 3 biến trong `app/.env.local`; chỉ đọc ở server, cache 15 phút. Sheet đã sửa locale `en_US` và ghi lại dữ liệu sạch (khớp từng ô với CSV).
- **2026-10-23 · Môi trường Next.js trong `app/`:** Next 16.4.2 · React 19.3 · TypeScript · Tailwind 4 · App Router · không `src/`; đã cài `googleapis`, `recharts`, `next-auth`, `server-only`. Node 24.20.0 cài bản portable ở `%LOCALAPPDATA%\Programs\nodejs` (không cần admin).
- **2026-10-23 · Tài liệu thiết kế:** `specification.md`, `design.md`, `layout.md`, `components.md` viết từ dataset thật trên Google Sheet, người dùng review và chốt (chấp nhận G1–G30; G28 về đăng nhập sau đó hết hiệu lực).
- **2026-10-23 · Phạm vi hiện tại:** dashboard **theo dõi** churn & MRR — 4 trang (Tổng quan · Theo gói · Theo khu vực · Nguồn dữ liệu), 5 KPI, 4 bộ lọc (ngày đăng ký · gói · khu vực · trạng thái), 4 lựa chọn chỉ số, cảnh báo vượt ngưỡng, bảng Tổng hợp / Từng khách, xuất CSV, sáng/tối. **Ngoài phạm vi:** dự đoán khách sắp churn / revenue at risk, churn theo tháng, MoM/YoY MRR (dữ liệu là snapshot), đăng nhập.

## Dataset

- **Nội dung:** khách hàng của một sản phẩm SaaS bán gói thuê bao hằng tháng.
- **Dạng:** snapshot cấp khách hàng — mỗi khách hàng một dòng.
- **Business flow:** `signup_date` → dùng sản phẩm (tích lũy `tenure_months`, trả `monthly_revenue`) → `status` = Active | Churned.
- **Bản đã clean:** `../saas-analysis/data/cleaned/cleaned_subscription_saas.csv` — 3.000 dòng. Chi tiết cleaning ở `../saas-analysis/log/cleaning_log.md`.
- **Google Sheets:** file và tab cùng tên `cleaned_subscription_saas`, kết nối qua `app/.env.local` đã chạy được.
- **Bẫy locale:** import CSV vào Sheet locale `vi_VN` làm hỏng `monthly_revenue` — số thành chữ (`"101.22"`), và số dạng `31.07` bị hiểu thành **ngày** (serial ~46000). Lần import đầu hỏng 129 dòng như vậy.
- **Đã sửa 2026-10-23:** Sheet locale `en_US`, 3.000 dòng ghi lại bằng API (`RAW`), khớp từng ô với CSV. Trên Sheet: `tenure_months`, `monthly_revenue` là **số**; `signup_date` là **chữ ISO `YYYY-MM-DD`** → code đọc phải parse chuỗi này, không phải serial date.
- **File CSV clean đã bị Excel lưu lại (2026-10-23 10:30):** số liệu không đổi, nhưng `signup_date` giờ là `M/D/YYYY` (ví dụ `10/12/2023` = 12/10/2023) và xuống dòng CRLF. Không import file này vào Sheet locale `vi_VN` — ngày sẽ bị đảo tháng/ngày.

- **Kiểm tra chất lượng trên Sheet (2026-10-23): đạt.** Không trùng `customer_id`, không ô sai kiểu, `status` khớp `churn` 100%, doanh thu nằm trong khung giá từng gói (Basic 20–50 · Pro 80–150 · Enterprise 300–2.000), không outlier cực đoan. Còn lại có chủ đích: `region` trống 150 dòng → "Chưa rõ khu vực".
- **Đặc điểm, không phải lỗi:** 379 dòng (12,6%) có doanh thu đúng bằng mức sàn/trần của gói (nhiều nhất Basic = 50: 157 dòng). 2 cặp khách khác mã nhưng trùng mọi cột khác (CUS-1160/1653, CUS-1399/1729) — giữ, vì khác khách.

## Data Dictionary

| Cột | Kiểu | Ý nghĩa | Giá trị / Đơn vị | Ghi chú |
|---|---|---|---|---|
| `customer_id` | string | Mã khách hàng | `CUS-1001` | Khóa định danh |
| `plan` | string | Gói thuê bao | Basic, Pro, Enterprise | Dimension chính, có thứ tự |
| `signup_date` | date | Ngày đăng ký | `2023-02-10` | Dùng cho cohort / signups theo tháng |
| `region` | string | Khu vực | APAC, EMEA, Americas | |
| `tenure_months` | int | Số tháng đã dùng | Tháng | |
| `monthly_revenue` | float | MRR của khách | USD/tháng | |
| `status` | string | Trạng thái | Active, Churned | |
| `churn` | string | Đã churn? | Yes / No | Đồng nghĩa `status = Churned` |
| `Data_Flag` | string | Cờ do bước cleaning thêm | trống · `CHURN_RELABELED` (151) · `REVENUE_SIGN_FIXED` (15) | Không có trong brief gốc |

## Ràng buộc của dữ liệu

- **Không có dòng theo từng tháng** → không có churn rate theo tháng, không so sánh MoM/YoY MRR, không forecast MRR theo chuỗi thời gian.
- **Chiều thời gian duy nhất là `signup_date`** — dùng cho số đăng ký mới theo tháng và phân tích cohort.
- **MRR chỉ phân tích ở dạng tổng / theo segment.**

## Quyết định đã chốt với người dùng

### Bộ lọc
- **Mặc định "Tất cả"** ở mọi bộ lọc — mở dashboard là thấy bức tranh toàn cảnh.
- Bốn bộ lọc: **khoảng ngày đăng ký** · **gói** (`plan`) · **khu vực** (`region`) · **trạng thái** (`status`: Tất cả / Active / Churned).
- Bộ lọc thời gian dựa trên `signup_date` → nhãn phải ghi rõ "Khách đăng ký trong khoảng…", không phải doanh thu trong khoảng đó.
- **Bộ lọc trạng thái là ngoại lệ so với hợp đồng drawer của skill** (skill chỉ có ngày · dim 1 · dim 2 · chỉ số). Người dùng đã chọn giữ — `dashboard-design` phải ghi ngoại lệ này vào tài liệu.

- `region` trống ở 150 dòng (5%) → hiển thị và lọc được dưới tên **"Chưa rõ khu vực"**, vẫn tính vào tổng.

### Quy tắc bộ lọc trạng thái
- **5 thẻ KPI bỏ qua bộ lọc trạng thái**, chỉ theo ngày · gói · khu vực. Lý do: mỗi KPI đã có định nghĩa cố định theo trạng thái; lọc theo trạng thái sẽ cho 0% / 100% / MRR = 0, sai về kinh doanh.
- Bộ lọc trạng thái áp dụng cho **chart phân bổ, bảng khách hàng và xuất dữ liệu**.
- Khi bộ lọc trạng thái khác "Tất cả", thanh chào hiện chú thích "KPI không đổi theo bộ lọc trạng thái".

### Khác
- **Có màn đăng nhập Google** — bỏ rồi làm lại theo yêu cầu người dùng (2026-10-23). Xem nhật ký đầu file.
- **Tần suất làm mới data:** theo template của skill `dashboard-build`.
- **`Data_Flag`:** chỉ hiển thị ở trang Nguồn dữ liệu (số dòng theo từng cờ); không làm bộ lọc, không đưa vào chart theo dõi.

### Tài liệu thiết kế
- **4 file trong `docs/` đã chốt 2026-10-23** — người dùng chấp nhận toàn bộ giả định G1–G30. Nguồn sự thật cho build là `docs/`, không phải mục này.
- **Đăng nhập:** Google, chỉ email trong `ALLOWED_EMAILS` (`components.md` §11).
- **Tiêu chí người dùng nhấn mạnh khi build: đẹp và dễ đọc** — ưu tiên khi phải chọn giữa nhiều cách trình bày.

### Build (2026-10-23)
- **Đăng nhập (2026-10-23):** làm → người dùng xoá → người dùng yêu cầu làm lại với biến kiểu Auth.js (`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) + `ALLOWED_EMAILS`. Code dùng next-auth **v4** nên `secret` truyền tay từ `AUTH_SECRET` (v4 không tự đọc tên này). 3 file ngoài danh sách đóng: `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `proxy.ts`. Ảnh đại diện dùng `next/image` `unoptimized` + `referrerPolicy="no-referrer"` (ảnh Google hay chặn khi có referrer).
- Đã cài thêm `server-only` (người dùng đồng ý).
- **Rà soát sau build (2026-10-23):** người dùng chọn theo tiêu chí "sếp đọc dễ hơn" — chú thích KPI 3, 5 ghi phạm vi thời gian và đổi theo bộ lọc · tooltip `.tip` trên nhãn KPI · chart xu hướng mặc định Quý. Bar tenure không lọc khi bấm; nút ở header; nút xác nhận trong drawer/bảng xuất màu mực — đã sửa tài liệu cho khớp code.
- **Đối chiếu yêu cầu chấm điểm (2026-10-23):** tiêu đề chart = **câu hỏi nghiệp vụ cố định, không chứa số** (người dùng bỏ tiêu đề dạng kết luận tự tính vì data cập nhật liên tục), **bỏ hẳn dòng chú thích dưới thẻ KPI** (người dùng: data cập nhật liên tục, chữ dưới thẻ rối — giải thích chỉ ở tooltip), ẩn pill khi không có kỳ trước, tỷ lệ so kỳ ghi "điểm %", lối tắt "Đang xem ▾" mở drawer, nút `Tổng hợp | Từng khách` ở bảng trang 2, 3. Người dùng không thích chữ lặp ý trên màn hình, và thấy câu công thức trên màn hình "không chuyên nghiệp" → dòng phụ chỉ ghi `Tên chỉ số (đơn vị) · chiều`, công thức để trong tooltip.
- **Bẫy đã gặp, đừng làm lại:**
  - `export const revalidate = 900` (template skill) **lỗi** khi `cacheComponents: true` → dùng `'use cache'` + `cacheLife({ revalidate: 900 })` trong `lib/google-sheets.ts`.
  - Dev server tự reload vô hạn trên máy này do `logging.browserToTerminal` (log trình duyệt → `.next/dev/logs` → Turbopack biên dịch lại) → đã tắt trong `next.config.ts`.
  - `layout()` (tokens.ts) không trừ viền 1px của `.card` (globals.css) → chart rộng/cao hơn vùng chứa 2px. Bù ở `dashboard/page.tsx` (`fitCardBorder`), không sửa asset.
  - `THRESHOLD` giữ tên khoá cũ (`roas`, `cpl`…) vì `seriesColor()` không được sửa; ngưỡng rời bỏ viết dạng tỷ lệ giữ chân (1 − rời bỏ).
  - `ui-components.md` của skill ghi sai tên class (`.btn`, `.ctitle`, bảo thiếu `.cbx/.tip`) — `globals.css` mới đúng: `.ibtn`, `.dbtn`, `.ct`, `.del`, có đủ `.cbx/.rad/.dates/.tip`.

## Định nghĩa chỉ số (chốt)

Data là snapshot → mọi tỷ lệ là **cộng dồn từ 2023 đến nay**, không phải theo tháng. Không dùng chữ "lũy kế" trên giao diện. Thẻ KPI **không có dòng chú thích dưới**; ý nghĩa và phạm vi nằm ở tooltip trên nhãn thẻ.

### 5 thẻ KPI

| # | Tên hiển thị | Cách tính |
|---|---|---|
| 1 | Doanh thu tháng hiện tại (MRR) | Σ `monthly_revenue` của khách Active |
| 2 | Khách đang dùng | Đếm khách Active |
| 3 | Tỷ lệ khách đã rời bỏ | Số khách Churned / tổng số khách |
| 4 | Doanh thu tháng đã mất do khách rời | Σ `monthly_revenue` của khách Churned |
| 5 | % doanh thu đã mất | (4) / ((1) + (4)) |

### Chỉ số phụ
- **Doanh thu trung bình mỗi khách (ARPA)** = (1) / (2). ARPA tổng nằm trong tooltip thẻ MRR; ARPA từng nhóm ở bảng Tổng hợp. Không lên thẻ KPI.
- **Nhóm thời gian sử dụng:** 0–6 · 7–12 · 13–24 · 25–36 tháng. Phân tích tenure bằng **tỷ lệ rời bỏ theo nhóm**, không so tenure trung bình Active vs Churned (tenure của khách Active còn tăng tiếp).
- **Nhóm khách theo kỳ đăng ký:** theo quý của `signup_date`, đo tỷ lệ rời bỏ của từng nhóm.
- **4 lựa chọn chỉ số trong drawer:** MRR · số khách · tỷ lệ khách đã rời bỏ · doanh thu tháng đã mất.

### Ngưỡng đề xuất (mốc chung = 14,2%)
| Chỉ số | Tốt | Theo dõi | Cảnh báo |
|---|---|---|---|
| Tỷ lệ khách đã rời bỏ | < 10% | 10–15% | > 15% |
| % doanh thu đã mất | < 5% | 5–10% | > 10% |

### Giả định chưa kiểm chứng được
- `monthly_revenue` của khách Churned = MRR **tại lúc rời**. Brief không nói rõ.
- Thời điểm snapshot ≈ cuối 12/2025: với khách Active, `tenure_months` = số tháng từ `signup_date` đến 12/2025–01/2026.

## Số liệu tham chiếu (file clean, không lọc) — dùng để kiểm dashboard sau khi build

| Chỉ số | Toàn bộ | Basic | Pro | Enterprise |
|---|---|---|---|---|
| Số khách | 3.000 | 1.660 | 880 | 460 |
| Tỷ lệ khách đã rời bỏ | 14,2% | 18,8% | 10,1% | 5,4% |
| MRR (USD) | 509.737 | 47.938 | 89.539 | 372.260 |
| Doanh thu tháng đã mất (USD) | 41.316 | 10.875 | 9.750 | 20.691 |
| % doanh thu đã mất | 7,5% | 18,5% | 9,8% | 5,3% |

- Khách đang dùng 2.574 · ARPA 198 USD.
- Theo khu vực, tỷ lệ rời bỏ: APAC 15,5% · EMEA 14,0% · Americas 12,8% · Chưa rõ 12,0%.
- Theo nhóm tenure: 0–6 tháng 35,2% · 7–12: 15,0% · 13–24: 8,7% · 25–36: 4,5%.
- Theo năm đăng ký: 2023: 4,8% · 2024: 9,5% · 2025: 25,8% — khách mới rời nhiều hơn dù dùng ít thời gian hơn.

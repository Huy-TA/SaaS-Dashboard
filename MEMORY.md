# MEMORY.md — Dashboard

> Kiến thức riêng của Project/dataset này. Luật làm việc nằm ở `CLAUDE.md`.

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
- Khi bộ lọc trạng thái khác "Tất cả", cạnh hàng KPI có chú thích "Chỉ số tổng không đổi theo bộ lọc trạng thái".

### Khác
- ~~Có màn đăng nhập~~ → **đã bỏ** (2026-10-23, xem mục Build bên dưới).
- **Tần suất làm mới data:** theo template của skill `dashboard-build`.
- **`Data_Flag`:** chỉ hiển thị ở trang Nguồn dữ liệu (số dòng theo từng cờ); không làm bộ lọc, không đưa vào chart theo dõi.

### Tài liệu thiết kế
- **4 file trong `docs/` đã chốt 2026-10-23** — người dùng chấp nhận toàn bộ giả định G1–G30. Nguồn sự thật cho build là `docs/`, không phải mục này.
- **Đăng nhập:** Google, chỉ email trong danh sách cho phép (lưu ở biến môi trường, người dùng tự điền).
- **Tiêu chí người dùng nhấn mạnh khi build: đẹp và dễ đọc** — ưu tiên khi phải chọn giữa nhiều cách trình bày.

### Build (2026-10-23)
- **Đăng nhập: KHÔNG có (2026-10-23).** Đã làm NextAuth + Google allowlist, test đạt, rồi người dùng yêu cầu **xoá** (chưa muốn tạo OAuth Client). Đã xoá 3 file auth, `/` về trang giới thiệu, `/dashboard` mở trực tiếp. Package `next-auth` vẫn cài (thuộc bộ cài ban đầu). Rủi ro còn treo: deploy Vercel thì link công khai — nhắc người dùng trước khi deploy.
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

Data là snapshot → mọi tỷ lệ là **cộng dồn từ 2023 đến nay**, không phải theo tháng. Không dùng chữ "lũy kế" trên giao diện; ghi ý nghĩa vào tên và dòng chú thích.

### 5 thẻ KPI

| # | Tên hiển thị | Cách tính | Chú thích dưới thẻ |
|---|---|---|---|
| 1 | Doanh thu tháng hiện tại (MRR) | Σ `monthly_revenue` của khách Active | Tổng phí hằng tháng của khách đang dùng |
| 2 | Khách đang dùng | Đếm khách Active | |
| 3 | Tỷ lệ khách đã rời bỏ | Số khách Churned / tổng số khách | Trên tổng số khách từng đăng ký, từ 2023 đến nay |
| 4 | Doanh thu tháng đã mất do khách rời | Σ `monthly_revenue` của khách Churned | Tổng phí hằng tháng của các khách đã rời bỏ |
| 5 | % doanh thu đã mất | (4) / ((1) + (4)) | Phần doanh thu tháng đã mất trên tổng doanh thu từng có |

### Chỉ số phụ
- **Doanh thu trung bình mỗi khách (ARPA)** = (1) / (2). Dùng trong chart/bảng, không lên thẻ KPI.
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

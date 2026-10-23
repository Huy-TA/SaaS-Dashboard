# SaaS Churn & MRR — Đặc tả

Domain: SaaS thuê bao (dùng khuôn Marketing, thay chỉ số — xem G1) · Nguồn: Google Sheets `cleaned_subscription_saas` / tab `cleaned_subscription_saas`
Ngày lập: 2026-10-23 · Người duyệt: chủ project — **đã duyệt 2026-10-23**, chấp nhận toàn bộ G1–G30. Yêu cầu chung khi build: **đẹp và dễ đọc**.

## 1 · Mục tiêu

Chép nguyên mục đích người dùng đã xác nhận trong `Dashboard/CLAUDE.md`:

> Dashboard theo dõi **churn** và **MRR** của một sản phẩm SaaS bán gói thuê bao hằng tháng — giúp CEO và các cấp quản lý thấy sớm gói / khu vực nào đang mất khách và mất bao nhiêu doanh thu, để quyết định chăm sóc ở đâu trước.

## 2 · Người dùng

| Nhóm | Mở lúc nào | Quyết định việc gì |
|---|---|---|
| CEO | họp định kỳ, xem bức tranh toàn cảnh | ưu tiên nguồn lực giữ chân khách cho gói / khu vực nào |
| Các cấp quản lý liên quan | khi cần số cho mảng mình phụ trách | gói / khu vực của mình đang vượt ngưỡng rời bỏ hay chưa |
| Đội Growth / Finance | thường xuyên, đào sâu bằng bộ lọc | nhóm khách nào cần chăm sóc, bao nhiêu MRR đang mất |

## 3 · Vấn đề cần giải quyết

Cách làm hiện tại và chỗ tốn thời gian nhất:

- Hiện có báo cáo phân tích tĩnh (`saas-analysis/reports/SaaS_2023-2025_Descriptive-Diagnostic.md`), không lọc được theo gói / khu vực / thời gian.
- Khâu tốn thời gian nhất: chưa có thông tin từ người dùng — xem G18.
- Con số dễ bị hiểu sai: **tỷ lệ rời bỏ 14,2% là cộng dồn từ 2023 đến nay**, không phải churn theo tháng. Đem so với chuẩn ngành theo tháng sẽ kết luận sai.

Ba câu hỏi dashboard **bắt buộc** phải trả lời:

1. Tổng MRR và tỷ lệ khách đã rời bỏ hiện tại là bao nhiêu; khách hàng và doanh thu phân bổ theo gói ra sao?
2. Gói nào, khu vực nào có tỷ lệ rời bỏ vượt ngưỡng — và mỗi nơi đã mất bao nhiêu doanh thu tháng?
3. Thời gian sử dụng (tenure) và kỳ đăng ký ảnh hưởng đến tỷ lệ rời bỏ thế nào?

## 4 · Bốn trang

| # | Trang | Trả lời câu hỏi gì | Có băng KPI |
|---|---|---|---|
| 1 | Tổng quan | Câu 1 + câu 3: hiện trạng, xu hướng theo kỳ đăng ký, rời bỏ theo nhóm tenure | có |
| 2 | Theo gói (`plan`) | Câu 2 theo gói: gói nào rời nhiều, gói nào mất nhiều tiền | có |
| 3 | Theo khu vực (`region`) | Câu 2 theo khu vực | có |
| 4 | Nguồn dữ liệu | Số liệu lấy từ đâu, đã xử lý gì, tin được tới đâu | **không** |

Cấu trúc bốn trang là cố định, không thương lượng. Chỉ nội dung từng trang là chốt theo người dùng.

### Chart từng trang

| Trang | Row 2 · 30% | Row 2 · 70% | Row 3 · 40% | Row 3 · 60% |
|---|---|---|---|---|
| 1 | Donut: tỷ trọng **MRR** theo gói | Area: chỉ số đang chọn theo kỳ đăng ký (Tuần/Tháng/Quý) | Bar: chỉ số đang chọn theo **nhóm thời gian sử dụng** (4 nhóm) | Ma trận tô nhiệt: gói × quý đăng ký (12 quý), giá trị = chỉ số đang chọn |
| 2 | Bar xếp hạng: chỉ số đang chọn theo gói (3) | Line nhiều đường: chỉ số đang chọn theo quý đăng ký, 3 đường = 3 gói | Donut: tỷ trọng **doanh thu tháng đã mất** theo gói | Bảng chỉ số đầy đủ theo gói |
| 3 | Bar xếp hạng: chỉ số đang chọn theo khu vực (4) | Line nhiều đường: chỉ số đang chọn theo quý đăng ký, 4 đường = 4 khu vực | Donut: tỷ trọng **doanh thu tháng đã mất** theo khu vực | Bảng chỉ số đầy đủ theo khu vực |
| 4 | Thông tin kết nối | Schema và vai trò từng cột | Danh sách biến môi trường (chỉ tên) | Bảng kiểm tra chất lượng dữ liệu |

Legend: chỉ donut (2 hàng) và line nhiều đường (1 hàng). Bar, area, bảng, sparkline không có legend.

**"Chỉ số theo kỳ đăng ký"** (Area, Line, ma trận, sparkline): mỗi điểm là chỉ số tính trên **nhóm khách đăng ký trong kỳ đó**, với cùng công thức ở §5, §8.

| Chỉ số đang chọn | Một điểm = |
|---|---|
| MRR | `SUM(monthly_revenue)` của khách Active đăng ký trong kỳ |
| Số khách | số khách đăng ký trong kỳ (theo bộ lọc trạng thái) |
| Tỷ lệ khách đã rời bỏ | khách rời / khách đăng ký trong kỳ |
| Doanh thu tháng đã mất | `SUM(monthly_revenue)` của khách Churned đăng ký trong kỳ |

Không cộng dồn qua các kỳ. Ma trận trang 1 tô nhiệt theo giá trị trong ô; ô có dưới 10 khách hiện số mờ kèm tooltip "ít khách, dễ dao động" (G30).

Bảng chỉ số đầy đủ (trang 2, 3) có đúng các cột: Nhóm · Số khách · Khách đang dùng · Khách đã rời · Tỷ lệ khách đã rời bỏ · MRR · Doanh thu tháng đã mất · % doanh thu đã mất · ARPA. Xếp theo Doanh thu tháng đã mất giảm dần.

Card bảng ở trang 2, 3 có nút chuyển **`Tổng hợp` | `Từng khách`** (chốt 2026-10-23). `Từng khách` là danh sách khách theo bộ lọc hiện tại — gồm cả bộ lọc trạng thái — xếp theo MRR giảm dần, cột: Mã khách · Gói · Khu vực · Ngày đăng ký · Tháng dùng · MRR · Trạng thái. Hiện tối đa 200 khách đầu, muốn đủ thì xuất CSV. Lọc `Churned` + `Từng khách` = danh sách khách lớn nhất đã rời.

### Tiêu đề chart là câu hỏi nghiệp vụ (chốt 2026-10-23)

Tiêu đề mỗi chart là **câu hỏi nghiệp vụ cố định, không chứa số**. Dữ liệu cập nhật liên tục nên tiêu đề không được ghi số hay kết luận — câu hỏi không bao giờ cũ, còn chart và tooltip trả lời bằng số mới nhất. Câu hỏi đổi theo chỉ số đang xem. Dòng phụ nói chart vẽ gì.

| Trang | Chart | Tỷ lệ rời bỏ (mặc định) | MRR | Số khách | Doanh thu đã mất |
|---|---|---|---|---|---|
| 1 | Donut | Gói nào tạo ra nhiều MRR nhất? | ← | ← | ← |
| 1 | Area | Khách đăng ký gần đây có rời bỏ nhiều hơn không? | MRR đang đến từ nhóm khách đăng ký kỳ nào? | Số khách đăng ký mới đang tăng hay giảm? | Doanh thu mất đến từ nhóm khách đăng ký kỳ nào? |
| 1 | Bar tenure | Khách rời bỏ nhiều nhất ở giai đoạn nào? | MRR tập trung ở khách dùng bao lâu? | Khách hàng đang ở giai đoạn sử dụng nào? | Doanh thu mất đến từ khách dùng bao lâu? |
| 1 | Ma trận | Gói nào, đăng ký kỳ nào đang rời bỏ cao? | Gói nào, đăng ký kỳ nào đóng góp MRR nhiều? | Gói nào, kỳ nào thu hút nhiều khách mới? | Gói nào, đăng ký kỳ nào làm mất nhiều doanh thu? |
| 2, 3 | Bar xếp hạng | [Gói / Khu vực] nào đang vượt ngưỡng rời bỏ 15%? | … nào dẫn đầu về MRR? | … nào dẫn đầu về số khách? | … nào làm mất nhiều doanh thu nhất? |
| 2, 3 | Line | [Gói / Khu vực] nào đang xấu đi nhanh nhất? | … nào đang tăng trưởng? | … nào đang tăng trưởng? | … nào đang xấu đi nhanh nhất? |
| 2, 3 | Donut | Doanh thu mất tập trung ở [gói / khu vực] nào? | ← | ← | ← |
| 2, 3 | Bảng · Tổng hợp | [Gói / Khu vực] nào mất nhiều doanh thu nhất? | ← | ← | ← |
| 2, 3 | Bảng · Từng khách | Khách nào cần chăm sóc trước? | ← | ← | ← |

`←` = giống cột bên trái (chart đó không đổi theo chỉ số). Tiêu đề quá dài thì cắt gọn trên một dòng, đủ câu ở tooltip.

**Dòng phụ = tên chỉ số (đơn vị) · chiều phân tích** (chốt 2026-10-23 — người dùng không muốn câu công thức trên màn hình vì trông không chuyên nghiệp). Ví dụ: `Tỷ lệ khách đã rời bỏ (%) · theo thời gian sử dụng`, `MRR (USD) · theo khu vực`, `Doanh thu tháng đã mất (USD) · theo gói`, `Chỉ số đầy đủ (USD, %) · theo gói`. Không chứa số liệu.

**Công thức** nằm trong tooltip khi rê chuột lên dòng phụ:

| Chỉ số | Đơn vị | Tooltip "Cách tính" |
|---|---|---|
| Tỷ lệ khách đã rời bỏ | % | số khách đã rời ÷ tổng số khách |
| MRR | USD | tổng phí hằng tháng của khách đang dùng |
| Số khách | khách | số khách |
| Doanh thu tháng đã mất | USD | tổng phí hằng tháng của khách đã rời |

Tooltip kèm phạm vi của mỗi điểm / ô (ví dụ "Mỗi ô là khách cùng gói, cùng quý đăng ký"). Donut MRR: tỷ trọng = MRR của gói ÷ tổng MRR. Bảng tổng hợp: tỷ lệ rời bỏ = đã rời ÷ khách · % DT mất = DT mất ÷ (MRR + DT mất) · ARPA = MRR ÷ khách đang dùng.

## 5 · Năm thẻ KPI

| # | Nhãn | Công thức | Chiều tốt | Đường chuẩn sparkline | Tô màu |
|---|---|---|---|---|---|
| 1 | Doanh thu tháng hiện tại (MRR) | `SUM(monthly_revenue) WHERE status = Active` | cao hơn tốt hơn | trung bình kỳ | không |
| 2 | Khách đang dùng | `COUNT(customer_id) WHERE status = Active` | cao hơn tốt hơn | trung bình kỳ | không |
| 3 | Tỷ lệ khách đã rời bỏ | `COUNT(churn = Yes) / COUNT(customer_id)` | **thấp hơn tốt hơn** | ngưỡng cảnh báo 15% | **có** |
| 4 | Doanh thu tháng đã mất do khách rời | `SUM(monthly_revenue) WHERE status = Churned` | **thấp hơn tốt hơn** | trung bình kỳ | không |
| 5 | % doanh thu đã mất | `KPI4 / (KPI1 + KPI4)` | **thấp hơn tốt hơn** | ngưỡng cảnh báo 10% | **có** |

**Thẻ KPI không có dòng chú thích dưới** (người dùng bỏ 2026-10-23 — dữ liệu cập nhật liên tục, chữ dưới thẻ gây rối). Thẻ gồm: nhãn + chấm màu · số lớn + pill so kỳ trước · sparkline có đường chuẩn (lấy luôn chỗ của dòng chú thích).

- **Mức ngưỡng** của KPI 3, 5 thể hiện bằng chấm màu cạnh nhãn, màu sparkline và đường ngưỡng gạch ngang.
- **Giải thích** nằm trong tooltip trên nhãn thẻ, tự đổi theo bộ lọc ngày: mức bằng chữ (`Đạt mục tiêu` / `Theo dõi` / `Cảnh báo`) + công thức bằng lời + phạm vi thời gian chính xác + mục tiêu / cảnh báo. Ví dụ thẻ 3: "Theo dõi. Số khách đã rời bỏ chia tổng số khách đăng ký từ 01/01/2023 đến thời điểm dữ liệu — cộng dồn, không phải churn theo tháng. Mục tiêu dưới 10%, cảnh báo trên 15% (đường gạch)."

Pill so kỳ trước **ẩn hẳn** khi không có kỳ trước (khoảng "Toàn bộ"). Với KPI 3 và 5 (tỷ lệ), pill ghi chênh lệch bằng **điểm phần trăm** (`↑ 16,2 điểm`), không ghi % thay đổi (`↑ 169,7%` của một tỷ lệ rất dễ đọc nhầm).

Hai luật:

1. **Đường chuẩn là bắt buộc.** Sparkline không có mốc chỉ cho thấy hình dáng, không cho biết đang trên hay dưới ngưỡng.
2. **Chỉ KPI có ngưỡng mới được tô màu.** Còn lại giữ mực. Tô màu một chỉ số chưa ai định nghĩa "thế nào là tốt" là nói dối người xem.

Chỉ số nghịch (KPI 3, 4, 5): **tăng là xấu**, mũi tên phải đảo màu.

**Sparkline** vẽ giá trị KPI của từng **tháng đăng ký** trong khoảng đang lọc (tối đa 36 điểm). **So kỳ trước**: so với nhóm khách đăng ký trong khoảng liền trước, cùng độ dài; khoảng "Toàn bộ" không có kỳ trước → **ẩn pill** (G10).

Tooltip thẻ MRR có thêm **ARPA tổng** (`Trung bình … USD / khách đang dùng`) — chỗ hiển thị ARPA tổng sau khi bỏ dòng chú thích. Tooltip mở bằng chuột hoặc bàn phím (Tab tới nhãn thẻ).

**5 KPI không đổi theo bộ lọc trạng thái** — chỉ theo khoảng ngày, gói, khu vực. Khi bộ lọc trạng thái khác "Tất cả", thanh chào (ngay trên băng KPI, cạnh chip bộ lọc) hiện chú thích "KPI không đổi theo bộ lọc trạng thái".

## 6 · Chức năng chính

| Chức năng | Mô tả | Ghi chú |
|---|---|---|
| Drawer bộ lọc | trượt từ phải, ẩn hoàn toàn khi đóng | chứa **4 lựa chọn chỉ số**; mọi bộ lọc mặc định **Tất cả** |
| Bốn lựa chọn chỉ số | `MRR` · `Số khách` · `Tỷ lệ khách đã rời bỏ` · `Doanh thu tháng đã mất`, mặc định `Tỷ lệ khách đã rời bỏ` | nằm **trong drawer**, không trên màn hình chính. Lối tắt: chữ `Đang xem: [chỉ số] ▾` ở thanh chào bấm được, mở drawer |
| Khoảng ngày đăng ký | preset `2023` · `2024` · `2025` · `Toàn bộ` + 2 ô ngày, mặc định `Toàn bộ` | nhãn ghi rõ **"Khách đăng ký trong khoảng…"** |
| Bộ lọc gói | checkbox Basic · Pro · Enterprise, kèm số khách mỗi gói | |
| Bộ lọc khu vực | checkbox APAC · EMEA · Americas · Chưa rõ khu vực, kèm số khách | `region` trống → "Chưa rõ khu vực", vẫn tính vào tổng |
| Bộ lọc trạng thái | segmented `Tất cả` · `Active` · `Churned`, mặc định `Tất cả` | người dùng chốt giữ; phạm vi tác động ở §6.1 |
| Xuất dữ liệu hai bước | mở bảng chọn → xem trước số dòng → mới tải | chỉ xuất dữ liệu, không PNG/PDF |
| Thanh chào | ngày + lời chào theo **UTC+7** | không theo giờ máy |
| Sáng/tối | chuyển được, cả hai chế độ đều phải kiểm | |
| Cảnh báo | bấm vào → lọc tới nhóm đó + nhảy trang | 4 loại, xem §9 và `components.md` §8 |
| Đăng nhập | **có** — Google, chỉ email trong `ALLOWED_EMAILS`; người khác thấy "Bạn không có quyền truy cập vui lòng liên hệ Admin" (làm lại 2026-10-23) | chưa đăng nhập vào `/dashboard` → về màn đăng nhập. Chi tiết `components.md` §11 |

### 6.1 Bộ lọc trạng thái tác động tới đâu

| Thành phần | Theo bộ lọc trạng thái? | Lý do |
|---|---|---|
| 5 thẻ KPI | **không** | mỗi KPI đã cố định trạng thái trong công thức; lọc thêm cho ra 0% / 100% / MRR = 0 |
| Chart khi chỉ số đang chọn là `Số khách` | **có** | đếm riêng khách Active hoặc Churned là câu hỏi hợp lệ |
| Chart khi chỉ số là `MRR`, `Doanh thu tháng đã mất`, `Tỷ lệ khách đã rời bỏ` | **không** | cùng lý do với KPI |
| Donut tỷ trọng (MRR / doanh thu đã mất) | **không** | trạng thái đã cố định trong chỉ số |
| Bảng chỉ số đầy đủ (`Tổng hợp`) | **không** | bảng so sánh nhóm, phải đủ cả hai trạng thái |
| Danh sách `Từng khách` | **có** | xem riêng khách đang dùng hoặc khách đã rời là câu hỏi hợp lệ |
| Xuất dữ liệu "theo bộ lọc dashboard" | **có** | xuất đúng tập khách đang lọc |

## 7 · Dữ liệu và vai trò từng cột

Nguồn: `cleaned_subscription_saas` / `cleaned_subscription_saas` · Số dòng: 3.000 · Khoảng ngày đăng ký: 2023-01-01 → 2025-12-31 · Hạt dữ liệu: 1 dòng = 1 khách hàng (snapshot, ước cuối 12/2025)

| # | Cột | Kiểu | Vai trò | Ví dụ |
|---|---|---|---|---|
| 1 | `customer_id` | text | `METRIC` — đếm `COUNT` ra số khách | `CUS-2802` |
| 2 | `plan` | text | `PRIMARY_DIM` | `Pro` |
| 3 | `signup_date` | text ISO `YYYY-MM-DD` | `DATE` | `2023-10-12` |
| 4 | `region` | text | `SECONDARY_DIM` (trang 3) | `APAC` · trống |
| 5 | `tenure_months` | number | `SECONDARY_DIM` — gom 4 nhóm, **không SUM** | `27` |
| 6 | `monthly_revenue` | number (USD/tháng) | `METRIC` | `101.22` |
| 7 | `status` | text | `SECONDARY_DIM` (bộ lọc trạng thái) | `Active` |
| 8 | `churn` | text | `METRIC` — đếm `COUNT(churn = Yes)` ra số khách rời | `No` |
| 9 | `Data_Flag` | text | `ATTRIBUTE` — cờ chất lượng, chỉ dùng ở trang 4 | trống · `CHURN_RELABELED` |

Mỗi cột đúng **một** vai trò. Số lượng: `DATE` 1 · `PRIMARY_DIM` 1 · `SECONDARY_DIM` 3 · `METRIC` 3 · `ATTRIBUTE` 1.

Nhóm thời gian sử dụng (từ `tenure_months`): `0–6` · `7–12` · `13–24` · `25–36` tháng.

Lưu ý đọc dữ liệu: trên Sheet, `signup_date` là **chữ** dạng `YYYY-MM-DD`, không phải serial date; `tenure_months` và `monthly_revenue` là số. Sheet đặt locale `en_US`.

### Cột ATTRIBUTE — không được SUM

| Cột | Cách tổng hợp | Lý do |
|---|---|---|
| `Data_Flag` | `COUNT` theo từng giá trị cờ, chỉ ở trang 4 | là nhãn ghi lại bước cleaning, không phải số đo kinh doanh |

Cột số không cộng được: `tenure_months` — tenure của khách Active còn tăng tiếp, của khách Churned đã dừng. **Không** so tenure trung bình Active với Churned; phân tích tenure bằng tỷ lệ rời bỏ theo nhóm.

## 8 · Chỉ số phái sinh

| Chỉ số | Công thức đúng | Cách tính sai cần tránh |
|---|---|---|
| Tỷ lệ khách đã rời bỏ | `COUNT(churn = Yes) / COUNT(customer_id)` | `AVG(tỷ lệ rời bỏ từng tháng đăng ký)` |
| % doanh thu đã mất | `SUM(revenue WHERE Churned) / SUM(revenue)` | `AVG(% từng gói)` |
| ARPA | `SUM(revenue WHERE Active) / COUNT(Active)` | `AVG(monthly_revenue)` trên cả khách Churned |
| Tỷ lệ rời bỏ theo nhóm tenure | `COUNT(Yes trong nhóm) / COUNT(khách trong nhóm)` | so `AVG(tenure)` của Active với Churned |

Ghi cả cột "cách tính sai" vì đây là lỗi im lặng. Tháng đăng ký có 5 khách / 2 rời cho 40%, đứng ngang hàng với tháng có 120 khách / 6 rời cho 5%; trung bình ra 22,5%, không phản ánh gì cả.

Mọi tỷ lệ là **cộng dồn từ ngày đăng ký đến thời điểm snapshot**. Không có churn theo tháng, không có MoM/YoY của MRR.

## 9 · Bốn ngưỡng nghiệp vụ

```
Tỷ lệ khách đã rời bỏ — cảnh báo   >  15%
Tỷ lệ khách đã rời bỏ — mục tiêu   <  10%
% doanh thu đã mất    — cảnh báo   >  10%
% doanh thu đã mất    — mục tiêu   <   5%
```

| Ngưỡng | Giá trị | Nguồn | Dùng ở đâu |
|---|---|---|---|
| Rời bỏ cảnh báo (đóng vai "ngưỡng lỗ") | > 15% | chuyên gia đề xuất từ mốc chung 14,2%, người dùng giao quyền — chưa xác nhận với đội | KPI 3, màu `--bad` cho chuỗi, cảnh báo |
| Rời bỏ mục tiêu | < 10% | như trên | KPI 3 xanh `--ok`; 10–15% là `--warn` |
| % DT mất cảnh báo | > 10% | như trên, mốc chung 7,5% | KPI 5, cảnh báo |
| % DT mất mục tiêu | < 5% | như trên | KPI 5 xanh; 5–10% là `--warn` |

Khuôn bốn ngưỡng của skill (chi phí đơn vị, lỗ, mục tiêu, cạn nguồn lực) không khớp domain này: không có cột chi phí, không có cột ngân sách/công suất. Bốn ngưỡng trên thay thế theo cặp cảnh báo/mục tiêu cho hai tỷ lệ có ý nghĩa kinh doanh.

## 10 · Phạm vi phiên bản đầu

| Có trong v1 | Để lại sau |
|---|---|
| 4 trang, 5 KPI, 4 bộ lọc, xuất dữ liệu, cảnh báo, đăng nhập Google | Dự đoán khách sắp churn, revenue at risk (người dùng đã loại khỏi phạm vi) |
| Đọc Google Sheets qua service account | Churn theo tháng, MoM/YoY MRR (cần dữ liệu theo tháng) |

Không có trong v1, và không thương lượng: trang phân tích thêm (phễu chuyển đổi, ma trận thời gian, cohort) · chatbox AI · ô tìm kiếm toàn cục · xuất PNG/PDF.

## 11 · Số liệu tham chiếu để tự kiểm

Sau khi build xong, ở trạng thái mặc định (mọi bộ lọc "Tất cả"), các số này phải khớp:

| Hạng mục | Giá trị kỳ vọng |
|---|---|
| Tổng số dòng đọc được | 3.000 |
| Khoảng ngày đăng ký | 2023-01-01 → 2025-12-31 |
| KPI 1 · MRR | 509.737 USD (chính xác 509.737,38) |
| KPI 2 · Khách đang dùng | 2.574 |
| KPI 3 · Tỷ lệ khách đã rời bỏ | 14,2% (426 / 3.000) |
| KPI 4 · Doanh thu tháng đã mất | 41.316 USD (chính xác 41.315,73) |
| KPI 5 · % doanh thu đã mất | 7,5% |
| ARPA | 198 USD (trong tooltip thẻ MRR) |
| Số nhóm trong `plan` | 3 |
| Số nhóm trong `region` | 4 (gồm "Chưa rõ khu vực": 150 khách) |

Theo gói:

| Gói | Số khách | Đang dùng | Tỷ lệ rời bỏ | MRR | DT đã mất | % DT mất | ARPA |
|---|---|---|---|---|---|---|---|
| Basic | 1.660 | 1.348 | 18,8% | 47.938 | 10.875 | 18,5% | 35,6 |
| Pro | 880 | 791 | 10,1% | 89.539 | 9.750 | 9,8% | 113,2 |
| Enterprise | 460 | 435 | 5,4% | 372.260 | 20.691 | 5,3% | 855,8 |

Theo khu vực:

| Khu vực | Số khách | Đang dùng | Tỷ lệ rời bỏ | MRR | DT đã mất | % DT mất |
|---|---|---|---|---|---|---|
| APAC | 1.140 | 963 | 15,5% | 187.292 | 15.887 | 7,8% |
| EMEA | 1.012 | 870 | 14,0% | 170.114 | 14.979 | 8,1% |
| Americas | 698 | 609 | 12,8% | 125.016 | 9.833 | 7,3% |
| Chưa rõ khu vực | 150 | 132 | 12,0% | 27.316 | 616 | 2,2% |

Tỷ lệ rời bỏ theo nhóm tenure: 0–6: 35,2% · 7–12: 15,0% · 13–24: 8,7% · 25–36: 4,5%.
Theo năm đăng ký: 2023: 4,8% · 2024: 9,5% · 2025: 25,8%. Quý 2025-Q4: 39,2% (268 khách).
`Data_Flag`: `CHURN_RELABELED` 151 · `REVENUE_SIGN_FIXED` 15 · trống 2.834.

Lệch nghĩa là sai ở khâu đọc hoặc tổng hợp dữ liệu, **không phải** ở chart.

## 12 · Giả định cần bạn xác nhận

> **Trạng thái: đã xác nhận 2026-10-23** — người dùng chấp nhận toàn bộ đề xuất. Giữ danh sách dưới đây để biết sửa ở đâu nếu sau này đổi ý. G18 vẫn thiếu thông tin, không chặn build.

```
G1. [Cao] Domain: không khớp playbook nào; dùng khuôn Marketing, thay toàn bộ chỉ số bằng chỉ số SaaS (MRR, rời bỏ).
    Vì: không có cột chi phí (`spend`, `cost`) để khớp Marketing/Sales/Finance; HR có "tỷ lệ nghỉ việc" gần giống tỷ lệ rời bỏ nhưng dựa trên headcount theo ngày — dataset này là snapshot cấp khách hàng.
    Nếu sai: đổi ở specification.md dòng Domain + §5, §8, §9; chạy lại components.md §2.

G2. [Cao] PRIMARY_DIM = `plan` (3 giá trị) thay vì `region` (4 giá trị gồm "Chưa rõ").
    Vì: brief ghi `plan` là "dimension chính, có thứ tự"; gói khác nhau ~24 lần về ARPA nên là trục quyết định tiền; ít nhóm hơn.
    Nếu sai: đổi chỗ trang 2 ↔ trang 3 ở specification.md §4, §7; layout.md §6; components.md §8.

G3. [Cao] Vai trò cột: `customer_id` và `churn` là METRIC dạng đếm; `tenure_months` là SECONDARY_DIM gom 4 nhóm (không SUM); `status` là SECONDARY_DIM cho bộ lọc; `Data_Flag` là ATTRIBUTE chỉ dùng ở trang 4.
    Vì: dataset chỉ có 1 cột số cộng được (`monthly_revenue`); số khách và số khách rời là hai đại lượng cộng được còn lại. Tenure cộng lại vô nghĩa.
    Nếu sai: đổi ở specification.md §7, §8; kéo theo trang 1 Row 3 · 40% ở §4.

G4. [Cao] DATE = `signup_date`; mọi trục thời gian, mọi "kỳ" và bộ lọc ngày đều là **kỳ đăng ký**, không phải kỳ phát sinh doanh thu.
    Vì: đây là cột ngày duy nhất; dataset là snapshot, không có dòng theo tháng.
    Nếu sai (nếu sau này có dữ liệu theo tháng): viết lại §5 (sparkline, so kỳ trước), §6 (khoảng ngày), §8.

G5. [Cao] Ngưỡng cảnh báo tỷ lệ khách đã rời bỏ = 15%.
    Vì: mốc chung hiện tại 14,2%; đặt cảnh báo ngay trên mốc để nhóm nào xấu hơn mức chung thì đỏ. Ngưỡng do chuyên gia đề xuất theo uỷ quyền của người dùng, chưa xác nhận với đội Growth/Finance.
    Nếu sai: đổi ở specification.md §9; kéo theo THRESHOLD trong build, components.md §2 (KPI 3) và §8.

G6. [Cao] Mục tiêu tỷ lệ khách đã rời bỏ = dưới 10%.
    Vì: Pro (10,1%) và Enterprise (5,4%) quanh/dưới mức này; tạo vùng "theo dõi" 10–15%.
    Nếu sai: đổi ở specification.md §9 và components.md §2.

G7. [Cao] Ngưỡng cảnh báo % doanh thu đã mất = 10%.
    Vì: mốc chung 7,5%; chừa biên để chỉ nhóm thật sự mất nhiều tiền mới đỏ (Basic 18,5%).
    Nếu sai: đổi ở specification.md §9; kéo theo components.md §2 (KPI 5) và §8.

G8. [Cao] Mục tiêu % doanh thu đã mất = dưới 5%.
    Vì: Enterprise 5,3% là nhóm giữ tiền tốt nhất; mục tiêu đặt ngay dưới mức tốt nhất hiện có.
    Nếu sai: đổi ở specification.md §9 và components.md §2.

G9. [Cao] `monthly_revenue` của khách Churned = MRR tại lúc rời.
    Vì: brief không nói rõ; đây là cách duy nhất để "doanh thu tháng đã mất" có nghĩa.
    Nếu sai: KPI 4, KPI 5 và mọi donut "doanh thu đã mất" phải bỏ hoặc đổi tên — sửa §5, §4, §11.

G10. [Vừa] Sparkline vẽ KPI theo từng tháng đăng ký; "so kỳ trước" = so với nhóm khách đăng ký trong khoảng liền trước cùng độ dài; khoảng "Toàn bộ" ẩn pill (đổi từ `—`, 2026-10-23).
     Vì: không có chuỗi thời gian thật; kỳ đăng ký là trục thời gian duy nhất.
     Nếu sai: sửa §5 và components.md §2.

G11. [Vừa] Thứ tự 5 KPI: MRR → Khách đang dùng → Tỷ lệ rời bỏ → DT đã mất → % DT đã mất.
     Vì: luật đầu ra → hiệu quả; hai chỉ số đang có (tiền, khách) trước, ba chỉ số mất mát sau.
     Nếu sai: đổi thứ tự ở §5 và components.md §2.

G12. [Vừa] 4 lựa chọn chỉ số: MRR · Số khách · Tỷ lệ khách đã rời bỏ · Doanh thu tháng đã mất; mặc định Tỷ lệ khách đã rời bỏ.
     Vì: không có playbook; luật "2 METRIC tổng lớn + 2 chỉ số có ngưỡng", mặc định là chỉ số có ngưỡng "lỗ". % DT mất không vào vì đã có ở KPI 5 và bảng.
     Nếu sai: sửa §6 và components.md §6.

G13. [Vừa] Donut trang 1 vẽ tỷ trọng MRR theo gói; donut trang 2, 3 vẽ tỷ trọng doanh thu tháng đã mất.
     Vì: tỷ lệ không cộng thành tỷ trọng được nên donut phải dùng số tiền; "tiền đang nằm ở đâu" (trang 1) và "tiền mất nằm ở đâu" (trang 2, 3) là hai câu khác nhau, tránh lặp donut.
     Nếu sai: sửa §4 và components.md §4.

G14. [Vừa] Phạm vi tác động của bộ lọc trạng thái như bảng §6.1 — chỉ áp cho chỉ số `Số khách` và xuất dữ liệu.
     Vì: người dùng chốt có bộ lọc và chốt KPI không đổi theo nó; mở rộng cùng logic cho chart để không chart nào ra 0% / 100%.
     Nếu sai: sửa §6.1 và components.md §6.

G15. [Vừa] Trang 1 Row 3 · 40% là bar theo nhóm thời gian sử dụng, không phải bar theo khu vực.
     Vì: khu vực đã có trang 3; câu hỏi "tenure ảnh hưởng churn" không có chỗ nào khác để trả lời, và đây là tín hiệu mạnh nhất (0–6 tháng: 35,2%).
     Nếu sai: sửa §4 và layout.md §6.

G16. [Vừa] Hạt thời gian: Area trang 1 có Tuần/Tháng/Quý (mặc định **Quý**, đổi 2026-10-23) thay vì Ngày/Tuần/Tháng; Line trang 2, 3 cố định theo Quý.
     Vì: trung bình ~2,7 khách đăng ký mỗi ngày — tỷ lệ theo ngày chỉ là nhiễu; theo tháng thì cuối 2025 nhảy 50–80% vì mỗi tháng ít khách, sếp dễ đọc thành khủng hoảng. Theo quý vẫn thấy rõ xu hướng (4,5% → 39%).
     Nếu sai: sửa §4 và components.md §3.

G17. [Vừa] Preset khoảng ngày: 2023 · 2024 · 2025 · Toàn bộ (mặc định Toàn bộ), thay cho 7/30/90 ngày.
     Vì: lọc theo ngày đăng ký; "7 ngày gần nhất" chỉ còn ~20 khách và không có nghĩa với snapshot đã kết thúc 12/2025.
     Nếu sai: sửa §6 và components.md §6.

G18. [Thấp] §3 chưa có thông tin "khâu tốn thời gian nhất" của cách làm hiện tại.
     Vì: không suy ra được từ dữ liệu, không bịa.
     Nếu sai: người dùng bổ sung vào §3; không ảnh hưởng mục khác.

G19. [Thấp] Tên dashboard: "SaaS Churn & MRR".
     Vì: hai chỉ số trọng tâm của brief.
     Nếu sai: đổi tiêu đề ở cả bốn file và thanh header.

G30. [Thấp] Ô ma trận có dưới 10 khách hiện số mờ (`--ink2`) kèm tooltip "ít khách, dễ dao động".
     Vì: Enterprise có ~38 khách mỗi quý đăng ký; khi lọc hẹp, tỷ lệ của ô vài khách nhảy rất mạnh và dễ bị đọc là tín hiệu.
     Nếu sai: bỏ đoạn cuối §4 "Chỉ số theo kỳ đăng ký"; không ảnh hưởng bố cục.
```

## 13 · Dashboard này KHÔNG trả lời được gì

- **"Tháng này mất bao nhiêu khách / bao nhiêu MRR?"** — không có ngày rời bỏ và không có dữ liệu theo tháng; mọi tỷ lệ là cộng dồn từ ngày đăng ký.
- **"MRR tăng hay giảm so với tháng trước / năm trước?"** — không có chuỗi MRR theo thời gian; chỉ có MRR tại thời điểm snapshot.
- **"Khách nào sắp rời bỏ? Bao nhiêu doanh thu đang có rủi ro?"** — bài dự đoán, người dùng đã loại khỏi phạm vi.
- **"Vì sao khách rời bỏ?"** — không có cột lý do rời, mức sử dụng, ticket hỗ trợ hay giá trước/sau.
- **Chỗ dễ hiểu sai — tỷ lệ 14,2%:** là cộng dồn, không so được với chuẩn ngành churn theo tháng.
- **Chỗ dễ hiểu sai — lọc ngày:** chọn "2024" nghĩa là *khách đăng ký năm 2024*, không phải doanh thu năm 2024.
- **Chỗ dễ hiểu sai — kỳ đăng ký gần đây:** khách 2025 rời 25,8% dù mới dùng ít tháng — đây là tín hiệu thật, không phải do "chưa đủ thời gian"; nhưng cũng chưa đủ dữ liệu để nói nguyên nhân.
- **Chỗ dễ hiểu sai — giá chạm sàn/trần:** 379 khách (12,6%) có doanh thu đúng bằng mức thấp nhất hoặc cao nhất của gói.

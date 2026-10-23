# SaaS Churn & MRR — Component

Mọi component dưới đây có trong `component-catalog.md` của skill `dashboard-design`. Không có component mới.

## 1 · Khung app

| Component | Vai trò | Nội dung hiển thị | Trạng thái | Quy tắc dùng |
|---|---|---|---|---|
| Shell | Tấm bo `--r-shell` nổi trên mặt bàn | toàn bộ app | — | Có `--sh-shell`, bo góc thấy được cả bốn phía, **không** tràn sát mép màn hình |
| Sidebar | Điều hướng chính | tên dashboard "SaaS Churn & MRR" + 4 mục trang + nút thu gọn | mở 206 · thu gọn 58 | Ngăn bằng 1px hairline, không bằng bóng |
| Header | Thanh 46px | breadcrumb (tên trang) · giờ đọc dữ liệu + nút đồng bộ · chuông cảnh báo · nút `Xuất dữ liệu` · chuyển sáng/tối · nút `Bộ lọc` (brand) | — | Cố định, không mờ dần khi cuộn. Hai nút hành động đặt ở header theo template của skill (chốt 2026-10-23). Giờ đọc dữ liệu kèm chấm trạng thái `.led` (xanh = sẵn sàng, vàng = đang tải) |
| Thanh chào | 52px | lời chào + ngày theo **UTC+7** + `Đang xem: [chỉ số] ▾` (bấm được → mở drawer, lối tắt tới bộ chọn chỉ số) · bên phải: chip bộ lọc đang áp | — | Tính theo giờ Việt Nam, không theo giờ máy. Khi bộ lọc trạng thái khác "Tất cả": dòng phụ thành `KPI không đổi theo bộ lọc trạng thái` (`--ink`, vì nằm trên sàn `--page`) |

Lời chào theo giờ UTC+7: `Chào buổi sáng` (05:00–10:59) · `Chào buổi trưa` (11:00–12:59) · `Chào buổi chiều` (13:00–17:59) · `Chào buổi tối` (18:00–04:59). Ngày viết `Thứ Năm, 23/10/2026`.

### Mục điều hướng

Ba trạng thái: thường · hover · đang chọn.

Mục đang chọn tô nền `--sub2` + chữ `--ink`, **không** tô brand. Brand để dành cho đúng một nút hành động trên mỗi màn.

Khi sidebar thu gọn, nhãn biến thành tooltip `.tip` hiện bên phải icon (rê chuột hoặc Tab tới); icon giữ nguyên vị trí. Sidebar mở thì không hiện tooltip.

| Mục | Icon |
|---|---|
| Tổng quan | `i-layout-dashboard` |
| Theo gói | `i-coins` |
| Theo khu vực | `i-chart-pie` |
| Nguồn dữ liệu | `i-database` |

## 2 · Thẻ KPI

Băng 118px, 5 thẻ, mỗi thẻ 259px khi sidebar mở (289px khi thu gọn).

| Phần | Nội dung hiển thị |
|---|---|
| Nhãn + chấm màu | tên chỉ số |
| Số lớn | 23px / 600 / `tabular-nums` (theo `globals.css` `.kv`) |
| So kỳ trước | `↑ 12,4%` (thẻ tỷ lệ: `↑ 16,2 điểm`), tự đảo chiều tốt/xấu với chỉ số nghịch; **ẩn** khi không có kỳ trước |
| Sparkline | khối 60px (lấy luôn chỗ dòng chú thích đã bỏ), vẽ cao 52px, rộng `kpiW − 28` (231 / 261), kèm **đường chuẩn gạch ngang** |
| ~~Chú thích~~ | **bỏ** (người dùng chốt 2026-10-23) — giải thích nằm ở tooltip trên nhãn |

26 nhãn + 32 số + 60 sparkline = 118 = băng KPI.

Trạng thái: đang tải · lỗi · có dữ liệu · không dòng nào khớp bộ lọc.

Quy tắc dùng:

1. **Đường chuẩn là bắt buộc.** Mốc = ngưỡng nghiệp vụ nếu có, còn lại là trung bình kỳ.
2. **Chỉ KPI có ngưỡng mới được tô màu.** Còn lại giữ mực.
3. Chỉ số nghịch (tỷ lệ rời bỏ, doanh thu đã mất, % doanh thu đã mất): tăng là **xấu**, phải đảo màu mũi tên.
4. **Không đổi theo bộ lọc trạng thái** — chỉ theo khoảng ngày, gói, khu vực.

Năm thẻ của dashboard này — khớp với `specification.md` §5:

| # | Nhãn | Số mặc định | Chiều tốt | Đường chuẩn | Chấm màu / tô màu |
|---|---|---|---|---|---|
| 1 | Doanh thu tháng hiện tại (MRR) | 509,7K USD | tăng tốt | trung bình kỳ | mực `--ink`, không tô |
| 2 | Khách đang dùng | 2.574 | tăng tốt | trung bình kỳ | mực `--ink`, không tô |
| 3 | Tỷ lệ khách đã rời bỏ | 14,2% | **giảm tốt** | ngưỡng 15% | `--ok` < 10% · `--warn` 10–15% · `--bad` > 15% → mặc định `--warn` |
| 4 | Doanh thu tháng đã mất do khách rời | 41.316 USD | **giảm tốt** | trung bình kỳ | mực `--ink`, không tô |
| 5 | % doanh thu đã mất | 7,5% | **giảm tốt** | ngưỡng 10% | `--ok` < 5% · `--warn` 5–10% · `--bad` > 10% → mặc định `--warn` |

Tooltip `.tip` hiện ngay khi rê chuột lên nhãn thẻ **hoặc Tab tới nhãn** (bàn phím), tự đổi theo bộ lọc ngày: mức bằng chữ (thẻ 3, 5) + công thức bằng lời + phạm vi chính xác + mục tiêu / cảnh báo. Thẻ 1 (MRR) có thêm ARPA tổng: "Trung bình 198 USD / khách đang dùng (ARPA)". Ví dụ thẻ 3: "Theo dõi. Số khách đã rời bỏ chia tổng số khách đăng ký từ 01/01/2023 đến thời điểm dữ liệu — cộng dồn, không phải churn theo tháng. Mục tiêu dưới 10%, cảnh báo trên 15% (đường gạch)."

## 3 · Card chart

```
┌─ card ──────────────────────────┐
│ chead  tiêu đề · điều khiển     │  43px
│ ┌ lgd  legend (tuỳ chart) ────┐ │  24 hoặc 44px
│ └─────────────────────────────┘ │
│ ┌ plot  vùng vẽ svg ──────────┐ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘   padding 14px
```

Điều khiển ảnh hưởng riêng card này đặt ở `chead`, căn phải. Dashboard này chỉ có một: segmented `Tuần` · `Tháng` · `Quý` ở card Area trang 1 (mặc định `Quý`). Line trang 2, 3 cố định theo quý, không có điều khiển. Điều khiển ảnh hưởng cả trang đặt trong drawer.

**Tiêu đề card là câu hỏi nghiệp vụ cố định, không chứa số** — danh sách ở `specification.md` §4 (chốt 2026-10-23; dữ liệu cập nhật liên tục nên tiêu đề không ghi kết luận). Dòng phụ là **tên chỉ số (đơn vị) · chiều phân tích**. Cách tính hiện ở tooltip khi rê chuột lên dòng phụ — bảng ở `specification.md` §4. Cả hai một dòng, quá dài thì cắt gọn, đủ câu ở tooltip.

Card bảng ở trang 2, 3 có thêm điều khiển riêng ở `chead`: segmented `Tổng hợp` · `Từng khách`.

Dòng phụ cụ thể (`[Chỉ số]` = tên chỉ số đang chọn kèm đơn vị, ví dụ `Tỷ lệ khách đã rời bỏ (%)`, `MRR (USD)`):

| Trang | Vị trí | Dòng phụ |
|---|---|---|
| 1 | R2 · 30% | Tỷ trọng MRR (%) · theo gói |
| 1 | R2 · 70% | [Chỉ số] · theo [tuần/tháng/quý] đăng ký |
| 1 | R3 · 40% | [Chỉ số] · theo thời gian sử dụng |
| 1 | R3 · 60% | [Chỉ số] · gói × quý đăng ký · ô mờ: dưới 10 khách |
| 2, 3 | R2 · 30% | [Chỉ số] · theo gói / khu vực |
| 2, 3 | R2 · 70% | [Chỉ số] · theo gói / khu vực, quý đăng ký |
| 2, 3 | R3 · 40% | Doanh thu tháng đã mất (USD) · theo gói / khu vực |
| 2, 3 | R3 · 60% · Tổng hợp | Chỉ số đầy đủ (USD, %) · theo gói / khu vực |
| 2, 3 | R3 · 60% · Từng khách | [n] khách khớp bộ lọc · xếp theo MRR giảm dần (· hiện 200 khách đầu, xuất CSV để xem đủ) |

## 4 · Sáu loại visual

| Loại | Legend | Dùng khi | Dùng ở trang |
|---|---|---|---|
| Donut | có, 2 hàng (44px) | tỷ trọng, ≤ 6 nhóm | 1 (MRR theo gói) · 2 (DT đã mất theo gói) · 3 (DT đã mất theo khu vực) |
| Area một chuỗi | không | xu hướng một chỉ số qua thời gian | 1 |
| Line nhiều đường | có, 1 hàng (24px) | so sánh ≤ 5 nhóm qua thời gian | 2 (3 đường) · 3 (4 đường) |
| Bar xếp hạng | không | top N, tên nhóm nằm ngay cạnh thanh | 1 (nhóm tenure) · 2 (gói) · 3 (khu vực) |
| Bảng ma trận tô nhiệt | không | nhóm × kỳ | 1 (gói × 12 quý đăng ký) |
| Sparkline | không | chỉ trong thẻ KPI | 1, 2, 3 |

Bar không cần legend vì tên nhóm đã nằm cạnh thanh. Area một chuỗi không cần vì tiêu đề card đã nói rõ đang vẽ gì.

Legend nằm **trên chart, căn trái**, chỉ hiện **màu ↔ tên nhóm**, không kèm số liệu. Số liệu đã có trong chart và trong tooltip.

### Màu chuỗi

Theo thứ tự ở `design.md` §5, đọc từ trên xuống, gặp là dừng:

```
1. dưới ngưỡng lỗ   →  --bad      chỉ khi chỉ số đang chọn là Tỷ lệ khách đã rời bỏ và giá trị > 15%
2. hạng 1           →  --focus
3. còn lại          →  --series-2, --series-3, --series-4 theo hạng (nhiều nhất 4 nhóm)
```

Hạng xếp theo giá trị của chỉ số trên chính chart đó, giảm dần. Riêng bar nhóm tenure giữ thứ tự 0–6 → 25–36; hạng vẫn tính theo giá trị để chọn màu.

Ví dụ trạng thái mặc định (chỉ số = Tỷ lệ khách đã rời bỏ): bar trang 2 — Basic 18,8% `--bad`, Pro 10,1% `--series-2`, Enterprise 5,4% `--series-3`. Không có gói nào là `--focus` vì hạng 1 đã bị ngưỡng chiếm.

Donut luôn vẽ số tiền (không có ngưỡng trên chuỗi) nên chỉ dùng bước 2 và 3.

Bảng chỉ số đầy đủ: ô Tỷ lệ khách đã rời bỏ và % doanh thu đã mất có **pill ngưỡng** — nền `--ok-bg` / `--warn-bg` / `--bad-bg`, chữ `--ok` / `--warn` / `--bad` (viết thẳng bằng token, vì `globals.css` không có class `.bdg` dùng chung ngoài sidebar); các ô khác giữ mực.

### Hai cạm bẫy đã trả giá

- **Ô nhiệt pha quá mạnh** thì ô giá trị cao nhất lại là ô khó đọc nhất, và ở dark mode nó đảo ngược thành sáng nhất. Khoảng đã kiểm chứng: `5% + t × 24%`. Đừng dùng `8% + t × 40%`.
- **Nhãn trục cuối bị cắt**: nhãn x cuối nằm sát mép phải, `overflow: hidden` của card sẽ xén. Đặt `text-anchor="end"` cho điểm cuối.

Nhãn trục, chữ legend, chữ trong ô nhiệt dùng `--ink2`, không dùng `--ink3` (`design.md` §4).

## 5 · Điều khiển

| Component | Class | Vai trò | Trạng thái | Quy tắc dùng |
|---|---|---|---|---|
| Segmented control | `.seg` | chọn 1 trong N | thường · chọn · disabled | vỏ `--sub2`, mục chọn là viên nổi. Dùng cho: 4 chỉ số, bộ lọc trạng thái, Tuần/Tháng/Quý |
| Chip lọc | `.chip` | hiện / bỏ một bộ lọc đang áp | — | chip bộ lọc đang áp ở thanh chào (có nút `x`), `Xoá tất cả`, `Chọn / Bỏ tất cả` cột khi xuất. Preset khoảng ngày dùng `.seg`, không dùng chip (`globals.css` không có `.chip.on`) |
| Nút chính màn hình | `.ibtn.pri` | hành động chính của dashboard | thường · hover | **duy nhất** mang `--brand` trên màn chính: `Bộ lọc`. Trang giới thiệu: `Mở dashboard` |
| Nút chính trong drawer / bảng xuất | `.dbtn.pri` | xác nhận trong lớp phủ | thường · hover · disabled | **Mực**, không brand (theo `globals.css` — brand đã dành cho `Bộ lọc`, chốt 2026-10-23): `Áp dụng` · `Tải xuống` |
| Nút phụ | `.ibtn` `.dbtn.ghost` | hành động phụ | thường · hover · disabled | `Xuất dữ liệu`, `Xoá hết`, `Huỷ`, đồng bộ, chuyển theme, thu gọn sidebar |
| Checkbox | `.cbx` `.box` | chọn nhiều | bỏ · tick | gói, khu vực, chọn cột khi xuất. Tick tô **mực** `--ink` (theo `globals.css`: chọn / không chọn không phải tốt / xấu) |
| Radio | `.rad` | chọn một | bỏ · chọn | phạm vi dòng và dấu phân tách trong bảng xuất |
| Switch | `.sw` | bật/tắt | tắt · bật | không dùng ở dashboard này |
| Ô ngày | `.dates` | khoảng ngày | thường · lỗi | hai ô có `min`/`max` giao nhau, giới hạn 2023-01-01 → 2025-12-31 |
| Popover | `.pop` | menu nổi | đóng · mở | danh sách cảnh báo từ chuông. Dùng `--sh-pop` |
| Tooltip | `.tip` | nhãn khi thu gọn sidebar, giải thích chỉ số | ẩn · hiện | nhãn trang khi sidebar thu gọn; công thức bằng lời trên nhãn thẻ KPI; giá trị khi rê chuột lên chart. Mở bằng chuột hoặc bàn phím |
| Pill ngưỡng / chấm trạng thái | pill viết bằng token · `.led` | tình trạng so ngưỡng / trạng thái tải | ok · warn · bad | chỉ mang `--ok/--warn/--bad`; pill ở bảng chỉ số đầy đủ, chấm đỏ ở dòng cảnh báo, `.led` cạnh giờ đọc dữ liệu |

Quy tắc số một cho nút: **một màn hình chỉ có một nút brand.** Có hai nút brand nghĩa là chưa quyết được đâu là hành động chính.

## 6 · Drawer bộ lọc

Trượt từ phải, nền sau tối đi, **ẩn hoàn toàn khi đóng** (`visibility: hidden`, và `translateX` phải cộng cả lề lẫn bóng).

Chứa, từ trên xuống:

1. **4 lựa chọn chỉ số** (`.seg`): `MRR` · `Số khách` · `Tỷ lệ khách đã rời bỏ` · `Doanh thu tháng đã mất` — mặc định `Tỷ lệ khách đã rời bỏ`
2. Khoảng ngày — tiêu đề **"Khách đăng ký trong khoảng"**, preset `2023` · `2024` · `2025` · `Toàn bộ` + 2 ô ngày — mặc định `Toàn bộ`
3. Gói (`.cbx`): Basic (1.660) · Pro (880) · Enterprise (460) — mặc định chọn hết
4. Khu vực (`.cbx`): APAC (1.140) · EMEA (1.012) · Americas (698) · Chưa rõ khu vực (150) — mặc định chọn hết
5. Trạng thái (`.seg`): `Tất cả` · `Active` · `Churned` — mặc định `Tất cả`; dưới có chú thích "Chỉ áp cho số khách, bảng và xuất dữ liệu"
6. Chân: `Xoá hết` (nút phụ) · `Áp dụng` (nút chính)

Số khách cạnh mỗi checkbox tính theo các bộ lọc khác đang chọn trong nháp.

Bốn lựa chọn chỉ số nằm **ở đây**, không nằm trên màn hình chính.

Sửa trong drawer là **nháp** — chỉ áp dụng khi bấm `Áp dụng`. `Xoá hết` đưa mọi bộ lọc về mặc định trong nháp, không cần xác nhận.

Phạm vi bộ lọc trạng thái theo `specification.md` §6.1: chỉ tác động lên chỉ số `Số khách` và xuất dữ liệu; 5 KPI, các chỉ số tiền / tỷ lệ, donut và bảng chỉ số đầy đủ không đổi.

Danh sách dài cuộn trong khối của nó, chiều cao là bội số của chiều cao một hàng. Ở đây dài nhất 4 hàng nên không cuộn.

## 7 · Bảng xuất dữ liệu — hai bước

Bấm nút `Xuất dữ liệu` **không tải file ngay**:

1. Mở bảng chọn:
   - Phạm vi dòng (`.rad`): **theo bộ lọc dashboard** (mặc định) · toàn bộ (3.000) · tuỳ chỉnh — kèm số dòng mỗi lựa chọn
   - Khoảng ngày đăng ký riêng (chỉ khi chọn "tuỳ chỉnh")
   - Chọn cột (`.cbx`), có nút chọn/bỏ tất cả: 9 cột gốc — `customer_id` · `plan` · `signup_date` · `region` · `tenure_months` · `monthly_revenue` · `status` · `churn` · `Data_Flag`
   - Định dạng (`.rad`): CSV **dấu chấm phẩy** cho Excel bản Việt (mặc định) · CSV dấu phẩy
2. **Xem trước**: `Sẽ xuất [n] dòng × [m] cột`.
3. Nút `Tải xuống`, mờ đi khi không có dòng hoặc chưa chọn cột.

Tên file kèm khoảng ngày: `saas-churn_2023-01-01_2025-12-31.csv`. `signup_date` xuất dạng `YYYY-MM-DD`. Với định dạng dấu chấm phẩy, `monthly_revenue` viết số thập phân bằng dấu phẩy (`101,22`) để Excel bản Việt đọc thành số.

Hai luật:

- "Theo bộ lọc dashboard" phải trả về **đúng** tập dòng đang hiển thị — gồm cả bộ lọc trạng thái — không lọc lại từ đầu theo ngày và dimension. Sai ở đây là người dùng mang số sai đi họp.
- Sửa trong bảng xuất **không được** đụng tới bộ lọc dashboard — hai ngữ cảnh khác nhau.

Xuất dữ liệu chỉ là xuất dữ liệu. Không xuất PNG, không xuất PDF.

## 8 · Cảnh báo

Sinh từ ngưỡng ở `specification.md` §9, tính trên khoảng ngày đang lọc với mọi gói / khu vực (không theo bộ lọc gói, khu vực, trạng thái — để không bỏ sót nhóm đang bị lọc ẩn).

| Loại | Điều kiện | Màu | Bấm vào |
|---|---|---|---|
| Gói rời bỏ cao | tỷ lệ khách đã rời bỏ của một gói > 15% | `--bad` | trang 2, lọc sẵn gói đó |
| Gói mất nhiều doanh thu | % doanh thu đã mất của một gói > 10% | `--bad` | trang 2, lọc sẵn gói đó |
| Khu vực rời bỏ cao | tỷ lệ khách đã rời bỏ của một khu vực > 15% | `--bad` | trang 3, lọc sẵn khu vực đó |
| Khu vực mất nhiều doanh thu | % doanh thu đã mất của một khu vực > 10% | `--bad` | trang 3, lọc sẵn khu vực đó |

Ở trạng thái mặc định có 3 cảnh báo: Basic rời bỏ 18,8% · Basic mất 18,5% doanh thu · APAC rời bỏ 15,5%.

Hiển thị: số đếm trên chuông ở header; bấm chuông mở popover danh sách, mỗi dòng có chấm `--bad` + câu ngắn + số, ví dụ `Basic · tỷ lệ rời bỏ   18,8%`; ngưỡng (`cảnh báo > 15%`) nằm ở tooltip của dòng. Không có cảnh báo → dòng `Không có nhóm nào vượt ngưỡng`. Mức `--warn` không sinh cảnh báo — chỉ hiện bằng pill (G27).

Bấm vào một cảnh báo thì lọc thẳng tới nhóm đó và nhảy sang trang tương ứng.

## 9 · Bốn trạng thái runtime

Mọi vùng dữ liệu phải có đủ — 5 thẻ KPI, 4 card chart mỗi trang, 4 khối trang Nguồn dữ liệu, danh sách cảnh báo, bảng xuất:

| Trạng thái | Class | Hiển thị |
|---|---|---|
| Đang tải | `.busy` `.spin` | skeleton hoặc spinner |
| Lỗi | `.err` | thông báo + **nút thử lại** (`i-rotate-ccw`). Chỉ hiện câu tiếng Việt kèm việc cần làm ("Liên hệ Admin" / "Thử lại sau…"); `/api/data` trả **mã lỗi** (`missing_env`, `no_access`, `quota`…), chi tiết kỹ thuật chỉ ghi log server. Tải lại lỗi khi đã có số ⇒ giữ dashboard, chấm đỏ ở thanh trên; nút Tải lại khoá khi đang tải |
| Có dữ liệu | | |
| **Không dòng nào khớp bộ lọc** | `.empty` | thông báo + **gợi ý nới lọc**, ví dụ "Không có khách nào khớp. Thử chọn `Toàn bộ` thời gian hoặc thêm gói / khu vực." |

Trạng thái thứ tư hay bị quên. Lọc chặt tay là chart trắng trơn không kèm lời giải thích, người dùng tưởng hỏng.

## 10 · Icon

Bộ **33 icon đã nhúng sẵn** trong skill: `assets/icon-sprite.html`. Dán nguyên khối đó sau `<body>`, gọi bằng `<use href="#i-<tên>"/>`. Ba cỡ: `.lu` · `.lu-sm` · `.lu-xs`.

**Không tự vẽ path theo trí nhớ.** Lỗi đã xảy ra: 5/14 icon viết tay sai, và sai kiểu không ai nhận ra bằng mắt (`m21 21-4.3-4.3` thay vì `-4.34-4.34`). Cần icon chưa có thì thay bằng icon đã có, hoặc dùng chữ.

Không dùng emoji làm icon.

Danh sách icon dùng trong dashboard này:

| Icon | Dùng ở đâu |
|---|---|
| `i-layout-dashboard` | nav Tổng quan |
| `i-coins` | nav Theo gói |
| `i-chart-pie` | nav Theo khu vực |
| `i-database` | nav Nguồn dữ liệu |
| `i-activity` | logo trong sidebar, trang giới thiệu |
| `i-chevron-left` | nút thu gọn / mở sidebar (xoay 180° khi thu gọn, theo `globals.css`) |
| `i-chevron-right` | nút `Mở dashboard` ở trang giới thiệu |
| `i-refresh-cw` | nút đồng bộ ở header |
| `i-bell` | chuông cảnh báo |
| `i-triangle-alert` | trạng thái lỗi; chip "Chưa kết nối được Google Sheets" ở trang giới thiệu |
| `i-sun` · `i-moon` | chuyển sáng / tối |
| `i-sliders-horizontal` | nút `Bộ lọc` |
| `i-download` | nút `Xuất dữ liệu`, `Tải xuống` |
| `i-x` | đóng drawer, đóng bảng xuất, bỏ chip bộ lọc |
| `i-check` | dấu tick trong checkbox |
| `i-arrow-up` · `i-arrow-down` | so kỳ trước trên thẻ KPI |
| `i-chevron-down` | lối tắt `Đang xem: [chỉ số] ▾` ở thanh chào |
| `i-log-out` | nút `Đăng xuất` ở góc phải header |
| `i-rotate-ccw` | nút thử lại khi lỗi |
| `i-circle-check` | "Đạt" / "Đã có" ở trang 4; dòng "Không có nhóm nào vượt ngưỡng" trong popover cảnh báo |

Giờ đọc dữ liệu dùng chấm `.led`, không dùng icon đồng hồ.

## 11 · Đăng nhập

**Có màn đăng nhập Google** (người dùng yêu cầu làm lại 2026-10-23, thay quyết định bỏ trước đó).

- **Màn đăng nhập ở `/`**: logo + tên "SaaS Churn & MRR", một câu mô tả, nút **"Đăng nhập bằng Google"** theo chuẩn nhận diện Google (`#gbtn`, logo G bốn màu — không phải nút brand), ghi chú "Chỉ dành cho người được cấp quyền". Cùng `Shell` 1600×900, `#login` nền `--sub`, card ở giữa. Đã đăng nhập thì vào thẳng `/dashboard`.
- **Chặn truy cập**: chưa đăng nhập vào `/dashboard` → tự chuyển về `/`. Hai lớp: `proxy.ts` (trang → `/`, API → 401) và `/api/data` tự kiểm tra phiên.
- **Ai được vào**: chỉ email trong `ALLOWED_EMAILS` (phân tách bằng dấu phẩy; `@congty.vn` cho cả tên miền). Danh sách rỗng ⇒ không ai vào. Email ngoài danh sách → thông báo **"Bạn không có quyền truy cập vui lòng liên hệ Admin"** + email bị từ chối + nút "Đăng nhập bằng tài khoản khác". Gỡ email khỏi danh sách có hiệu lực ở lần tải dữ liệu kế tiếp. Phiên kéo dài 8 giờ.
- **Góc phải header**: ảnh đại diện Google (26px, tròn; lỗi ảnh → chữ cái đầu trên nền `--brand`) + tên + nút `.ibtn` "Đăng xuất" (`i-log-out`), ngăn với nhóm nút bằng hairline. Không đọc được phiên vẫn giữ nút Đăng xuất.

Trang 4 liệt kê biến môi trường — chỉ tên, trạng thái có/không lấy từ server, **không bao giờ hiện giá trị**:

| Biến | Dùng cho |
|---|---|
| `GOOGLE_SHEETS_SPREADSHEET_ID` · `GOOGLE_SERVICE_ACCOUNT_EMAIL` · `GOOGLE_PRIVATE_KEY` | đọc Sheet |
| `AUTH_SECRET` | mã hoá phiên đăng nhập (sinh ngẫu nhiên) |
| `AUTH_GOOGLE_ID` · `AUTH_GOOGLE_SECRET` | OAuth Client của Google |
| `ALLOWED_EMAILS` | danh sách email / tên miền được vào |

File thêm ngoài danh sách đóng của skill `dashboard-build`: `lib/auth.ts` · `app/api/auth/[...nextauth]/route.ts` · `proxy.ts`.

## 12 · Giả định cần bạn xác nhận

> **Trạng thái: đã xác nhận 2026-10-23** — chấp nhận toàn bộ G25–G29. **G28 không còn hiệu lực**: đăng nhập đã làm rồi bỏ theo yêu cầu người dùng (xem §11).

```
G25. [Vừa] Xuất CSV mặc định dấu chấm phẩy, vẫn cho đổi sang dấu phẩy trong bảng xuất.
     Vì: Excel bản Việt đọc dấu phẩy thành một cột duy nhất.
     Nếu sai: đổi mặc định ở components.md §7.

G26. [Vừa] Cảnh báo tính trên toàn bộ gói / khu vực trong khoảng ngày đang lọc, bỏ qua bộ lọc gói, khu vực, trạng thái.
     Vì: cảnh báo là để không bỏ sót; nếu đang lọc chỉ Enterprise thì Basic vượt ngưỡng vẫn phải hiện.
     Nếu sai: sửa components.md §8.

G27. [Vừa] Chỉ mức `--bad` (vượt ngưỡng cảnh báo) sinh cảnh báo; mức `--warn` chỉ hiện bằng badge.
     Vì: ở mặc định, mức warn sẽ sinh cảnh báo cho gần như mọi nhóm (Pro, EMEA, Americas…), chuông mất tác dụng.
     Nếu sai: sửa components.md §8 và bảng điều kiện.

G28. [Vừa] ~~Đăng nhập bằng tài khoản Google, chỉ email trong danh sách cho phép~~ — KHÔNG CÒN HIỆU LỰC (đã làm rồi bỏ 2026-10-23, xem §11). Giữ lại làm lịch sử.
     Vì: người dùng chốt "có màn đăng nhập"; skill build dựng nút đăng nhập Google qua NextAuth. Không chặn theo danh sách thì ai có tài khoản Google cũng vào được.
     Nếu sai (ví dụ muốn cho cả tên miền công ty): sửa components.md §11; bước build cần thêm biến môi trường cho đăng nhập — người dùng tự cập nhật `.env.local` và Vercel.

G29. [Thấp] Lời chào chia 4 khung giờ (sáng / trưa / chiều / tối) theo UTC+7.
     Vì: cách chào quen thuộc với người Việt.
     Nếu sai: sửa components.md §1.
```

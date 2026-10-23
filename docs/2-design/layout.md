# SaaS Churn & MRR — Bố cục

Mọi số trong file này chép từ `layout-contract.md` của skill `dashboard-design`. Không có số nào tự nghĩ.

## 1 · Canvas cố định 1600×900

Toàn bộ dashboard vẽ trên khung **1600×900 px cứng**, rồi thu vừa cửa sổ:

```js
scale = Math.min(innerWidth / 1600, innerHeight / 900)
```

Hai thứ đạt được cùng lúc: **không bao giờ phải cuộn**, và **mọi máy ra cùng một pixel** — không có breakpoint nào để sai.

Không `ResponsiveContainer`, không đọc `clientWidth`, không `ResizeObserver`. Mọi chart nhận **số px cứng**.

Hệ quả: không có gì để cuộn, nên không có hiệu ứng header mờ dần khi lướt. Header là thanh cố định 46px.

Dashboard **không tràn sát mép màn hình**: khung app là một tấm bo `--r-shell: 20px`, có `--sh-shell`, nổi trên nền `--page`, thấy được bo góc và lề ở **cả bốn phía**. `#viewport` mang nền `--page`; `#stage` (1600×900) mang nền `--shell`, bo góc và bóng. Trang giới thiệu `/` dùng chung `Shell` — cùng hộp 1600×900 và hệ số scale.

## 2 · Hằng số bố cục

```js
const SIDE_BORDER = 1, HDR = 46, BODY_PAD_X = 24, BODY_PAD_Y = 20,
      GAP = 14, KPI_GAP = 12;
const BAND = { greet: 52, kpi: 118, row2: 301, row3: 301 };
const CARD_PAD = 14, CHEAD = 43;     // CHEAD = khối tiêu đề trong card
const LGD1 = 24, LGD2 = 44;          // dải chú giải: 1 hàng · 2 hàng
let SIDE = 206;                      // 58 khi thu gọn
```

## 3 · Phép kiểm tổng chiều cao — phải đúng 900

```
46  header
20  body padding trên
52  thanh chào
14  gap
118 băng KPI
14  gap
301 row 2
14  gap
301 row 3
20  body padding dưới
─────
900  ✓
```

## 4 · Phép kiểm tổng bề rộng — phải đúng 1600

```
206  sidebar
1    hairline
24   body padding trái
1345 vùng nội dung
24   body padding phải
─────
1600 ✓
```

Sidebar thu gọn: `58 + 1 + 24 + 1493 + 24 = 1600` ✓

Hai phép cộng này không phải trang trí. Người sửa spacing về sau sẽ dùng đúng chúng để biết mình vừa làm vỡ cái gì.

`row2 === row3 === 301` là **bắt buộc**: bốn card chart phải cao bằng nhau, nếu không mắt sẽ đọc thành "hàng trên quan trọng hơn" — một thông điệp không ai chủ ý gửi.

## 5 · Suy ra kích thước chart

Mọi kích thước tính từ **một biến duy nhất** là `SIDE`:

```js
function LAY() {
  const mainW  = 1600 - SIDE - SIDE_BORDER;
  const innerW = mainW - BODY_PAD_X * 2;

  const a = Math.floor((innerW - GAP) * 0.30),  b = innerW - GAP - a;   // Row 2 = 30/70
  const c = Math.floor((innerW - GAP) * 0.40),  d = innerW - GAP - c;   // Row 3 = 40/60

  const plot = (w, bandH) => ({
    w: w - CARD_PAD * 2,
    h: bandH - CARD_PAD * 2 - CHEAD
  });

  return {
    mainW, innerW, a, b, c, d,
    kpiW: Math.floor((innerW - KPI_GAP * 4) / 5),
    p2a: plot(a, BAND.row2),  p2b: plot(b, BAND.row2),
    p3c: plot(c, BAND.row3),  p3d: plot(d, BAND.row3)
  };
}
```

### Bảng kích thước suy ra — cả hai trạng thái sidebar

| | Sidebar mở (206) | Sidebar thu gọn (58) |
|---|---|---|
| `mainW` | 1393 | 1541 |
| `innerW` | 1345 | 1493 |
| Row 2 · trái (30%) | 399 | 443 |
| Row 2 · phải (70%) | 932 | 1036 |
| Row 3 · trái (40%) | 532 | 591 |
| Row 3 · phải (60%) | 799 | 888 |
| Bề rộng thẻ KPI | 259 | 289 |
| **Chiều cao vẽ của cả 4 chart** | **230** | **230** |

Bề rộng vẽ = bề rộng card − `CARD_PAD × 2` = − 28. Chiều cao vẽ = `301 − 28 − 43` = **230**, giống nhau ở mọi card vì `row2 === row3`.

| Vùng vẽ | Sidebar mở (206) | Sidebar thu gọn (58) |
|---|---|---|
| Row 2 · trái | 371 | 415 |
| Row 2 · phải | 904 | 1008 |
| Row 3 · trái | 504 | 563 |
| Row 3 · phải | 771 | 860 |
| Sparkline KPI (`kpiW − 28`) | 231 | 261 |

Không có số nào được hardcode riêng cho trạng thái thu gọn. Đổi `SIDE`, cả bảng tính lại.

### Card có legend — trừ trước khi vẽ

| Chart | Trừ khỏi 230 | Còn lại |
|---|---|---|
| Donut / pie | `LGD2` = 44 | 186 |
| Line nhiều đường | `LGD1` = 24 | 206 |
| Bar, area một chuỗi, bảng, sparkline | 0 | 230 |

Quên trừ thì card tràn — và tràn ở đây không báo lỗi, chỉ xén mất phần dưới chart.

## 6 · Bố cục bốn trang

### Trang 1 · Tổng quan

| Vị trí | Chart | Vùng vẽ (sidebar 206) | Legend |
|---|---|---|---|
| Row 2 · 30% | Donut tỷ trọng **MRR** theo gói (3 nhóm) | 371 × 186 | 2 hàng (44) |
| Row 2 · 70% | Area xu hướng chỉ số đang chọn theo kỳ đăng ký | 904 × 230 | không |
| Row 3 · 40% | Bar chỉ số đang chọn theo nhóm thời gian sử dụng (4 nhóm: 0–6 · 7–12 · 13–24 · 25–36 tháng) | 504 × 230 | không |
| Row 3 · 60% | Bảng ma trận gói × quý đăng ký (3 hàng × 12 cột), tô nhiệt | 771 × 230 | không |

Điều khiển riêng: Tuần/Tháng/Quý ở header card Area (mặc định Quý).
Tương tác: bấm donut → lọc theo gói đó. Bar nhóm tenure **không** lọc khi bấm — không có bộ lọc tenure, và thông điệp đã đọc được ngay trên chart (chốt 2026-10-23). Bar ở trang 2, 3 bấm vào thì lọc theo gói / khu vực đó.

Bar theo nhóm tenure giữ thứ tự tự nhiên 0–6 → 25–36 (không xếp theo giá trị), vì câu hỏi là "tenure tăng thì rời bỏ thay đổi thế nào".

### Trang 2 · Theo gói

| Vị trí | Chart | Vùng vẽ (sidebar 206) | Legend |
|---|---|---|---|
| Row 2 · 30% | Bar xếp hạng chỉ số đang chọn theo gói | 371 × 230 | không |
| Row 2 · 70% | Line nhiều đường theo quý đăng ký, 3 đường (cả 3 gói ≤ trần 5) | 904 × 206 | 1 hàng (24) |
| Row 3 · 40% | Donut tỷ trọng **doanh thu tháng đã mất** theo gói | 504 × 186 | 2 hàng (44) |
| Row 3 · 60% | Bảng chỉ số đầy đủ theo gói (3 hàng × 9 cột) | 771 × 230 | không |

Trần 5 đường là giới hạn đọc được. Nhiều hơn thì các đường mực dính vào nhau.

### Trang 3 · Theo khu vực

Cùng bố cục trang 2, đổi dimension sang `region`. Số lấy top: bar **4** (tất cả) · donut **4** (tất cả) · line **4** đường. "Chưa rõ khu vực" luôn có mặt như một nhóm.

| Vị trí | Chart | Vùng vẽ (sidebar 206) | Legend |
|---|---|---|---|
| Row 2 · 30% | Bar xếp hạng chỉ số đang chọn theo khu vực | 371 × 230 | không |
| Row 2 · 70% | Line nhiều đường theo quý đăng ký, 4 đường | 904 × 206 | 1 hàng (24) |
| Row 3 · 40% | Donut tỷ trọng **doanh thu tháng đã mất** theo khu vực | 504 × 186 | 2 hàng (44) |
| Row 3 · 60% | Bảng chỉ số đầy đủ theo khu vực (4 hàng × 9 cột) | 771 × 230 | không |

### Trang 4 · Nguồn dữ liệu

| Vị trí | Nội dung |
|---|---|
| Row 2 · 30% | Thông tin kết nối: tên spreadsheet, tab, số dòng (3.000), khoảng ngày đăng ký, quyền (chỉ đọc), nhịp làm mới (15 phút), thời điểm đọc gần nhất |
| Row 2 · 70% | Bảng schema: cột · kiểu · vai trò · ví dụ (9 cột, theo `specification.md` §7) |
| Row 3 · 40% | Danh sách biến môi trường (**chỉ tên, không giá trị**) |
| Row 3 · 60% | Bảng kiểm tra chất lượng dữ liệu, gồm số dòng theo từng `Data_Flag` |

Trang 4 **không có băng KPI** và không có chỉ số đang chọn. Khi ẩn băng đó, row2 và row3 phải giãn lấp chỗ trống — nếu không sẽ để lại một dải trắng 132px ở đáy:

```css
#body.nokpi #row2,
#body.nokpi #row3 { flex: 1 1 0; height: auto }
```

Chỉ trang này mới bỏ px cứng. Ba trang theo dõi vẫn khoá pixel.

## 7 · Sidebar

| Trạng thái | Bề rộng | Hiện gì |
|---|---|---|
| Mở | 206px | icon + nhãn |
| Thu gọn | 58px | chỉ icon, nhãn thành tooltip |

Mặc định khi vào: **mở** (G24).

Bốn mục: Tổng quan · Theo gói · Theo khu vực · Nguồn dữ liệu.

Ngăn với vùng nội dung bằng **1px hairline** `--line`, không bằng bóng, không bằng chênh nền.

Khi thu gọn, icon giữ nguyên vị trí — không được nhảy sang giữa.

## 8 · Drawer bộ lọc

Trượt từ phải, nền sau tối đi, **ẩn hoàn toàn khi đóng**.

Thứ tự nội dung từ trên xuống:

1. Chỉ số theo dõi — segmented control **4 lựa chọn**: MRR · Số khách · Tỷ lệ khách đã rời bỏ · Doanh thu tháng đã mất
2. Khoảng thời gian — tiêu đề "Khách đăng ký trong khoảng", preset `2023` · `2024` · `2025` · `Toàn bộ` + 2 ô chọn ngày
3. Gói — checkbox Basic · Pro · Enterprise, kèm số khách mỗi gói
4. Khu vực — checkbox APAC · EMEA · Americas · Chưa rõ khu vực, kèm số khách
5. Bộ lọc trạng thái — segmented `Tất cả` · `Active` · `Churned`
6. Chân: `Xoá hết` · `Áp dụng`

Hai ô ngày đặt `min`/`max` giao nhau để trình duyệt tự chặn khoảng ngược. Giới hạn ngoài: `min = 2023-01-01`, `max = 2025-12-31`.

Danh sách dài cuộn **trong khối của nó**, chiều cao là **bội số của chiều cao một hàng** — cắt giữa hàng trông như lỗi render. Ví dụ đã kiểm: hàng 28px thì `max-height: 140px` (đúng 5 hàng), không phải 150px. Ở dashboard này danh sách dài nhất là 4 hàng (khu vực) nên không cần cuộn.

## 9 · Quy tắc đặt điều khiển

| Loại | Đặt ở đâu |
|---|---|
| Ảnh hưởng **một chart** (Tuần/Tháng/Quý) | Header của chính card Area trang 1, căn phải |
| Ảnh hưởng **cả trang** (khoảng ngày, gói, khu vực, trạng thái, chỉ số) | Trong drawer bộ lọc |

Không bao giờ đặt hai bản sao của cùng một điều khiển ở hai card. Chúng ghi vào cùng một biến, người dùng sẽ tưởng là hai thiết lập riêng.

## 10 · Ba cạm bẫy padding

1. **Padding card do JS quyết định, không do thang spacing quyết định.** `LAY()` tính kích thước `<svg>` bằng `CARD_PAD = 14`. Đặt `.card { padding: 16px }` cho "đúng thang spacing" là hộp chứa hẹp hơn svg 4px mỗi bên ⇒ `overflow: hidden` **cắt mép phải cả 4 chart**. Sparkline KPI còn nặng hơn vì bề rộng của nó tính bằng `kpiW − 28`. Muốn đổi thì đổi `CARD_PAD` trong JS, CSS theo sau.
2. **`.card { padding: X }` đặt sau `.kpi { padding: 0 }`** sẽ thắng (cùng độ đặc hiệu, đứng sau), làm thẻ KPI phình ra khỏi băng 118px và cắt mất hàng chân. Viết `.card:not(.kpi)` hoặc thêm lại `.card.kpi { padding: 0 }`.
3. **Drawer đặt `right: 14px` mà đẩy đi bằng `translateX(100%)`** sẽ vẫn lòi ra đúng 14px. Phải cộng cả khoảng cách mép lẫn bóng: `translateX(calc(100% + 34px))`, kèm `visibility: hidden` khi đóng để nó không bắt chuột.

## 11 · Giả định cần bạn xác nhận

> **Trạng thái: đã xác nhận 2026-10-23.**

```
G24. [Thấp] Sidebar mặc định mở (206px).
     Vì: nhãn đầy đủ giúp người mới định hướng; thu gọn là lựa chọn của người dùng.
     Nếu sai: đổi ở layout.md §7; LAY() tự tính lại, không mục nào khác phải sửa.
```

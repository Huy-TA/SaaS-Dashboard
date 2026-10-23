# Hợp đồng bố cục

Mọi con số ở đây trích từ bản chuẩn `prototype/design-systems/_base.html` và đã chạy thật. **Không tự nghĩ số mới.** Đổi một số là phải tính lại cả cột.

---

## Canvas cố định 1600×900

Toàn bộ dashboard vẽ trên khung **1600×900 px cứng**, rồi thu vừa cửa sổ:

```js
scale = Math.min(innerWidth / 1600, innerHeight / 900)
```

Hai thứ đạt được cùng lúc:

1. **Không bao giờ phải cuộn** — luôn vừa một màn hình.
2. **Mọi máy ra cùng một pixel** — không có breakpoint nào để sai.

Không dùng `ResponsiveContainer`, không đọc `clientWidth`, không `ResizeObserver`. Mọi chart nhận **số px cứng**.

Hệ quả cần biết: không có gì để cuộn, nên không có hiệu ứng header mờ dần khi lướt. Header là thanh cố định 46px.

---

## Shell nổi trên mặt bàn

Dashboard **không tràn sát mép màn hình**. Nó là một tấm bo `--r-shell: 20px`, có `--sh-shell`, nổi trên nền `--page`.

Cách làm trong bản chuẩn: `#stage` là khung 1600×900 mang nền `--shell`, bo góc và đổ bóng; phần tử cha `#viewport` mang nền `--page`. Lề quanh shell sinh ra từ việc thu nhỏ thêm một hệ số ngoài `scale` của `fit()`.

Nếu dựng lại bằng framework khác, điều **phải giữ** là: có một vùng nền tối hơn bao quanh khung app, và khung app có bo góc nhìn thấy được ở cả bốn phía.

---

## Hằng số bố cục

```js
const SIDE_BORDER = 1, HDR = 46, BODY_PAD_X = 24, BODY_PAD_Y = 20,
      GAP = 14, KPI_GAP = 12;
const BAND = { greet: 52, kpi: 118, row2: 301, row3: 301 };
const CARD_PAD = 14, CHEAD = 43;     // CHEAD = khối tiêu đề trong card
const LGD1 = 24, LGD2 = 44;          // dải chú giải: 1 hàng · 2 hàng
let SIDE = 206;                      // 58 khi thu gọn
```

### Kiểm tra chiều cao — phải đúng 900

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

### Kiểm tra bề rộng — phải đúng 1600

```
206  sidebar
1    hairline
24   body padding trái
1345 vùng nội dung
24   body padding phải
─────
1600 ✓
```

`row2 === row3` là **bắt buộc**: bốn card chart phải cao bằng nhau, nếu không mắt sẽ đọc thành "hàng trên quan trọng hơn".

---

## Suy ra kích thước chart

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

### Số cụ thể khi sidebar mở (206)

| | px |
|---|---|
| `mainW` | 1393 |
| `innerW` | 1345 |
| Row 2 · trái (30%) | 399 |
| Row 2 · phải (70%) | 932 |
| Row 3 · trái (40%) | 532 |
| Row 3 · phải (60%) | 799 |
| Bề rộng thẻ KPI | 259 |
| **Chiều cao vẽ của cả 4 chart** | **230** |

Sidebar thu gọn còn **58** → `innerW` thành 1493, mọi thứ tính lại từ đúng một biến. Không có số nào được hardcode riêng cho trạng thái thu gọn.

### Card có legend

Chiều cao legend là số cứng và **phải trừ khỏi chiều cao chart** khi gọi hàm vẽ, nếu không card sẽ tràn:

| Chart | Trừ |
|---|---|
| Donut / pie | `LGD2` = 44 |
| Line nhiều đường | `LGD1` = 24 |
| Bar, area một chuỗi, bảng, sparkline | 0 |

---

## Cạm bẫy padding — đọc trước khi đổi spacing

`LAY()` tính kích thước `<svg>` bằng hằng số **`CARD_PAD = 14`**. Nếu CSS đặt `.card { padding: 16px }` cho "đúng thang spacing", hộp chứa hẹp hơn svg 4px mỗi bên ⇒ `overflow: hidden` **cắt mép phải cả 4 chart**. Sparkline KPI còn nặng hơn vì bề rộng của nó tính bằng `kpiW − 28`.

Quy tắc: **padding của card do JS quyết định, không do thang spacing quyết định.** Muốn đổi thì đổi `CARD_PAD` trong JS, rồi CSS theo sau.

Bẫy thứ hai, cùng loại: `.card { padding: X }` đặt **sau** `.kpi { padding: 0 }` trong stylesheet sẽ thắng (cùng độ đặc hiệu, đứng sau), làm thẻ KPI phình ra khỏi băng 118px và cắt mất hàng chân. Viết `.card:not(.kpi)` hoặc thêm lại `.card.kpi { padding: 0 }`.

---

## Bố cục bốn trang

### Trang 1 · Tổng quan
```
Row 2:  30%  Donut tỷ trọng theo PRIMARY_DIM       [legend 2 hàng]
        70%  Area xu hướng chỉ số đang chọn        [Ngày/Tuần/Tháng]
Row 3:  40%  Bar top SECONDARY_DIM
        60%  Bảng ma trận theo kỳ, tô nhiệt
```

### Trang 2 · Theo PRIMARY_DIM
```
Row 2:  30%  Bar xếp hạng
        70%  Line nhiều đường qua thời gian, top 5  [legend 1 hàng]
Row 3:  40%  Donut tỷ trọng                         [legend 2 hàng]
        60%  Bảng chỉ số đầy đủ
```

### Trang 3 · Theo SECONDARY_DIM
Cùng bố cục trang 2, đổi dimension.

### Trang 4 · Nguồn dữ liệu
```
Row 2:  30%  Thông tin kết nối
        70%  Schema và vai trò từng cột
Row 3:  40%  Danh sách biến môi trường
        60%  Bảng kiểm tra chất lượng dữ liệu
```

Trang 4 **không có băng KPI**. Khi ẩn băng đó, row2 và row3 phải giãn ra lấp chỗ trống — nếu không sẽ để lại một dải trắng 132px ở đáy:

```css
#body.nokpi #row2,
#body.nokpi #row3 { flex: 1 1 0; height: auto }
```

---

## Sidebar

| Trạng thái | Bề rộng | Hiện gì |
|---|---|---|
| Mở | 206px | icon + nhãn |
| Thu gọn | 58px | chỉ icon, nhãn thành tooltip |

Ngăn với vùng nội dung bằng **1px hairline** `--line`, không bằng bóng, không bằng chênh nền.

---

## Drawer bộ lọc

Trượt từ phải, nền sau tối đi.

Cạm bẫy: drawer đặt `right: 14px` mà đẩy đi bằng `translateX(100%)` sẽ **vẫn lòi ra đúng 14px**. Phải cộng cả khoảng cách mép lẫn bóng đổ: `translateX(calc(100% + 34px))`. Thêm `visibility: hidden` khi đóng để nó không bắt chuột.

Danh sách dài bên trong drawer cuộn **trong khối của nó**, và chiều cao phải là bội số của chiều cao một hàng — cắt giữa hàng trông như lỗi render. Ví dụ đã kiểm: hàng 28px thì `max-height: 140px` (đúng 5 hàng), không phải 150px.

---

## Điều khiển đặt ở đâu

| Loại | Đặt ở đâu |
|---|---|
| Ảnh hưởng **một chart** (Ngày/Tuần/Tháng) | Header của chính card đó, căn phải |
| Ảnh hưởng **cả trang** (khoảng ngày, kênh, chỉ số) | Trong drawer bộ lọc |

Không bao giờ đặt hai bản sao của cùng một điều khiển ở hai card. Chúng ghi vào cùng một biến, người dùng sẽ tưởng là hai thiết lập riêng.

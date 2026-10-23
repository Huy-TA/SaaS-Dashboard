# Bố cục và kiểm tra

Mọi số ở đây trích từ `assets/tokens.ts`. Đổi một số là phải tính lại cả cột.

---

## Hằng số

```ts
SIDE_BORDER = 1    HDR = 46    BODY_PAD_X = 24    BODY_PAD_Y = 20
GAP = 14           KPI_GAP = 12
BAND = { greet: 52, kpi: 118, row2: 301, row3: 301 }
CARD_PAD = 14      CHEAD = 43      LGD1 = 24      LGD2 = 44
SIDE_WIDE = 206    SIDE_RAIL = 58
```

### Kiểm chiều cao — phải đúng 900

```
46 + 20 + 52 + 14 + 118 + 14 + 301 + 14 + 301 + 20 = 900  ✓
hdr  pad  greet gap  kpi  gap  row2  gap  row3  pad
```

### Kiểm bề rộng — phải đúng 1600

```
206 + 1 + 24 + 1345 + 24 = 1600  ✓
side  hr  pad  inner  pad
```

`row2 === row3` là **bắt buộc**: bốn card chart phải cao bằng nhau, nếu không mắt đọc thành "hàng trên quan trọng hơn".

---

## Kích thước suy ra

| | sidebar 206 | sidebar 58 |
|---|---|---|
| `mainW` | 1393 | 1541 |
| `innerW` | 1345 | 1493 |
| Row 2 (30/70) | 399 / 932 | 443 / 1036 |
| Row 3 (40/60) | 532 / 799 | 591 / 888 |
| `kpiW` | 259 | 289 |
| **Chiều cao vẽ 4 chart** | **230** | **230** |

Mọi số suy từ **một biến**: bề rộng sidebar. Không hardcode số riêng cho trạng thái thu gọn.

Card có legend trừ thêm `LGD1` (24) hoặc `LGD2` (44).

---

## Ba cạm bẫy đã trả giá

### 1. `.card{padding}` đè `.kpi{padding:0}`

Cùng độ đặc hiệu, đứng sau thì thắng. Thẻ KPI phình ra khỏi băng 118px và **cắt mất hàng chân** (dòng "so với … kỳ trước").

```css
.card { padding: 14px }
.card.kpi { padding: 12px 13px }   /* PHẢI đứng sau */
```

Hoặc viết `.card:not(.kpi)`.

### 2. `CARD_PAD` là hợp đồng giữa JS và CSS

`layout()` tính bề rộng `<svg>` bằng chính hằng số này. CSS đặt `padding: 16px` cho "đúng thang spacing" → hộp chứa hẹp hơn svg 4px mỗi bên → `overflow: hidden` **cắt mép phải cả 4 chart**.

Sparkline KPI nặng hơn: bề rộng tính bằng `kpiW − 28`, lệch là tràn ngay.

Muốn đổi nhịp đệm thì **đổi `CARD_PAD` trước**, CSS theo sau.

### 3. Drawer vẫn lòi ra sau khi đóng

Drawer đặt `right: 14px` mà đẩy bằng `translateX(100%)` sẽ còn lộ đúng 14px. Phải cộng cả lề lẫn bóng:

```css
#drawer { transform: translateX(calc(100% + 34px)); visibility: hidden }
```

`visibility: hidden` để nó không bắt chuột khi đóng.

---

## Shell nổi trên mặt bàn

Dashboard **không tràn sát mép màn hình**.

```css
#viewport { position: fixed; inset: 0; background: var(--page); scale: .94 }
#stage    { width: 1600px; height: 900px; background: var(--shell);
            border-radius: var(--r-shell); box-shadow: var(--sh-shell) }
```

Lề sinh bằng thuộc tính **`scale`** (rời), **không phải** `transform`. Lý do: hàm fit gán `transform: scale()` vào **style inline** của `#stage`, nên `transform` trong CSS bị đè. `scale` là thuộc tính độc lập, trình duyệt **nhân** nó với `transform` thay vì thay thế.

Ưu điểm so với padding cố định: lề co giãn theo cửa sổ nên không bao giờ âm.

## Trang Nguồn dữ liệu

Không có băng KPI. Nếu chỉ ẩn băng đó, sẽ để lại dải trống 132px ở đáy:

```css
#body.nokpi #kpis { display: none }
#body.nokpi #row2,
#body.nokpi #row3 { flex: 1 1 0; height: auto }
```

---

## Checklist trước khi báo xong

Phải **chạy dev server thật**, không suy luận từ code.

### Bố cục
- [ ] Tổng chiều cao đúng 900, tổng bề rộng đúng 1600
- [ ] Không có thanh cuộn trang ở bất kỳ cỡ cửa sổ nào
- [ ] Bốn card chart cao bằng nhau
- [ ] Card có legend đã trừ 24 hoặc 44
- [ ] Không chart nào bị xén mép phải
- [ ] Hàng chân 5 thẻ KPI hiện đủ (đếm đủ 5 dòng "so với…")
- [ ] Nhãn trục x cuối cùng không bị cắt

### Shell
- [ ] Shell có bo góc và lề ngoài ở **cả bốn phía**
- [ ] Kiểm ở **hai tỉ lệ**: 16:9 (1600×900) **và** một tỉ lệ khác (1400×1000) — lề phải còn ở cả hai
- [ ] `#body` có nền thấp hơn card một bậc; mép card nhìn thấy được

### Bốn trạng thái
- [ ] Sáng
- [ ] Tối
- [ ] Sidebar thu gọn
- [ ] Trang Nguồn dữ liệu (không để dải trống ở đáy)

Cả bốn đều phải **không lỗi console**.

### Màu
- [ ] Khối bí danh tương thích còn nguyên trong `:root`
- [ ] Không còn token màu thương hiệu nào (`--ch-*`)
- [ ] `--brand` không xuất hiện ở bất kỳ chuỗi dữ liệu nào
- [ ] `--ok` `--warn` `--bad` chỉ dùng khi có số so với ngưỡng
- [ ] Mọi dimension dùng chung thang `--series-*`; `--focus` không trùng bậc `--series-2..5` nào
- [ ] Thang `--series-*` qua phép thử grayscale (khoảng cách độ sáng hai bậc liền kề ≥ 0,04)

### Chữ
- [ ] Mọi chữ đạt 4,5:1, **kể cả nhãn trục 10.5px**
- [ ] Kiểm ở cả hai theme — màu đạt ở light có thể trượt ở dark

### Dữ liệu
- [ ] Đối chiếu **số liệu tham chiếu** trong `specification.md`
- [ ] Bốn trạng thái runtime đều hiện đúng (thử lọc chặt tay để ép ra trạng thái rỗng)
- [ ] "Theo bộ lọc dashboard" trong bảng xuất trả về đúng tập dòng đang hiển thị

Số không khớp thì lỗi ở khâu **đọc hoặc tổng hợp** dữ liệu — sửa ở đó, đừng chỉnh chart.

---

## Cách kiểm nhanh bằng headless Chrome

```bash
chrome --headless --disable-gpu --hide-scrollbars \
       --window-size=1600,900 --screenshot=out.png \
       --virtual-time-budget=4000 http://localhost:3000/dashboard
```

Bắt lỗi JS bằng cách ghi lỗi vào `document.title` rồi đọc qua `--dump-dom`:

```js
addEventListener('error', e => { document.title = 'ERR:' + e.message });
```

Hai điều đã học được khi làm việc này:

- **Xem ảnh, đừng chỉ đo.** Nhiều lỗi (chữ bị xén, màu chuỗi sai luật, hàng chân mất) chỉ lộ ra khi nhìn.
- **Kiểm ảnh có hợp lệ không.** Chrome đôi khi trả về ảnh trắng byte-identical nhau. Hai lần render khác tham số mà ra cùng `md5` nghĩa là render hỏng, không phải CSS đúng.

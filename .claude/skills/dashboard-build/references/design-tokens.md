# Token — tra cứu khi build

Bảng đầy đủ ở `dashboard-design/references/design-system.md`. File này chỉ nêu những gì người viết code cần biết.

Nguồn duy nhất là `assets/globals.css`. Tài liệu nào khác với nó thì **nó đúng**.

---

## Khối bí danh tương thích — ĐỪNG DỌN DẸP

Trong `:root` có khối này:

```css
--label:var(--ink);  --label2:var(--ink2);  --label3:var(--ink3);  --label4:var(--line);
--bg:var(--card);    --bg-grouped:var(--page);
--separator:var(--line);  --separator-opaque:var(--line);
--fill:#DCDDDF;  --fill2:var(--sub2);  --fill3:var(--sub2);  --fill4:var(--line2);
--blue:var(--brand);  --green:var(--ok);  --red:var(--bad);  --orange:var(--warn);
--gray:var(--ink3);  --gray3:var(--line);
--lift-sm:var(--sh-card);  --lift:var(--sh-pop);
```

Nó **trông như** code thừa của hệ cũ. Không phải.

Lớp vẽ chart đọc màu qua những tên đó (`CSS('--label2')`, `CSS('--fill4')`…). Xoá khối này là `getComputedStyle` trả **chuỗi rỗng** — SVG nhận `fill=""`, chart vẫn vẽ nhưng không màu, và **không có lỗi nào trong console**. Hỏng im lặng là loại hỏng tốn nhiều giờ nhất.

Đây cũng là cơ chế cho phép đổi cả design system mà không đụng một dòng JS: viết lại `:root` + `[data-theme="dark"]`, giữ nguyên bí danh.

**Code mới thì dùng tên mới** (`--ink2`, `--brand`, `--ok`). Bí danh chỉ tồn tại cho lớp chart cũ.

---

## Ba sắc độ nền — và cái bẫy của nó

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `--page` | `#E9E9EA` | `#0A0A0B` | mặt bàn ngoài shell **và** sàn `#body` |
| `--shell` | `#FFFFFF` | `#131315` | sidebar, header |
| `--card` | `#FFFFFF` | `#131315` | card |
| `--sub` | `#FAFAFA` | `#191A1C` | hover, ô nhập |
| `--sub2` | `#F4F4F5` | `#1F2023` | nav đang chọn, nút phụ |

Ở light, `--shell` và `--card` **bằng nhau** (`#FFFFFF`). Đó là lý do `#body` bắt buộc phải dùng `--page` chứ không dùng `--shell`: card trắng trên nền trắng sẽ mất mép.

```css
#body { background: var(--page) }   /* đúng */
#body { background: var(--shell) }  /* sai — card biến mất */
```

## Ba sắc độ mực

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `--ink` | `#191A1C` | `#F2F3F5` | chữ chính |
| `--ink2` | `#6C6E72` | `#9B9EA4` | chữ phụ |
| `--ink3` | `#A3A5AA` | `#6A6D73` | nhãn trục, placeholder |

`--ink3` là bậc mờ nhất **còn đạt 4,5:1**. Đừng pha nhạt thêm để "nhẹ nhàng hơn" — nhãn trục 10.5px là chữ, sàn tương phản áp cho nó y như chữ 13px.

## Brand và tín hiệu

| Token | Light | Dark | Chỉ dùng khi |
|---|---|---|---|
| `--brand` | `#3D5AFE` | `#7C90FF` | phần tử **bấm được** |
| `--ok` | `#128A54` | `#34C98A` | có một số **so với một ngưỡng** |
| `--warn` | `#B45309` | `#E5A93B` | nt |
| `--bad` | `#C62B3C` | `#FF7080` | nt |

Ba màu tín hiệu có nền đi kèm (`--ok-bg`, `--warn-bg`, `--bad-bg`) cho badge.

**Một màn hình chỉ có MỘT nút brand.** Hai nút xanh nghĩa là chưa quyết được đâu là hành động chính.

Mục nav đang chọn **không** tô brand — nó tô `--sub2` + chữ `--ink`.

---

## Chuỗi dữ liệu — 5 bậc mực

```
--series-1  #2E3033      --series-4  #AFB2B7
--series-2  #55585D      --series-5  #D3D5D8
--series-3  #83868C      --focus     #191A1C   (hạng 1)
```

Năm bậc chênh nhau về **độ sáng**, không về sắc.

Đây không phải thẩm mỹ mà là điều kiện đọc được: hai màu cùng độ sáng khác sắc sẽ **dính vào nhau** khi in đen trắng và với người mù màu. Phép thử: chuyển cả thang sang grayscale, khoảng cách độ sáng giữa hai bậc liền kề phải ≥ 0,04.

Dark đảo chiều: `--series-1` thành **sáng nhất**.

## Màu thương hiệu — không có

Dự án này **không** có token màu kênh. Mọi dimension — kênh, chiến dịch, sản phẩm — gọi `seriesColor()` giống nhau và lấy thang `--series-*`:

```ts
seriesColor(row, rank)
```

Cái giá: một kênh không giữ màu cố định xuyên chart, màu của nó nói **thứ hạng**. Danh tính do icon và nhãn chở. Cái được: đổi design system thì **cả** dashboard đổi theo.

## Thứ tự quyết định màu

`seriesColor()` đọc từ trên xuống, gặp là dừng:

| # | Điều kiện | Trả về |
|---|---|---|
| 1 | `roas < THRESHOLD.roas` | `--bad` |
| 2 | `rank === 0` | `--focus` |
| 3 | còn lại | `--series-N`, tối đa bậc 5 |

Ngưỡng đứng trên cùng là có chủ ý: một kênh đang lỗ phải đỏ kể cả khi nó đang đứng hạng 1.

> **`--focus` không được trùng bất kỳ bậc `--series-2..5` nào.** Hạng 1 lấy `--focus`, hạng 2 trở đi lấy `--series-2..5` — nên `--series-1` thực tế không bao giờ được vẽ. Đặt `--focus` vào giữa thang thì hai hạng khác nhau ra cùng một màu, và trên donut thì gần như không ai thấy.

---

## Bo góc và bóng

```
--r-shell:20px   --r-card:11px   --r-inner:9px
--r-menu:9px     --r-sm:7px      --r-sheet:14px   --r-pill:999px
```

Shell 20 → card 11 → phần tử trong card 9. Bo giảm dần theo độ sâu.

```
--sh-card   card nổi nhẹ trên sàn — gần như không thấy
--sh-pop    popover, drawer, modal
--sh-shell  ĐÚNG MỘT chỗ: shell nổi trên mặt bàn
```

Card tách khỏi sàn chủ yếu bằng **chênh nền**, bóng chỉ để xác nhận. Đừng tăng `--sh-card` cho "rõ hơn" — hệ này không phân lớp bằng bóng.

## Chữ

| Vai trò | Cỡ | Đậm |
|---|---|---|
| Lời chào | 22px | 600 |
| Số KPI | 28px | 600 |
| Tiêu đề card | 15px | 600 |
| Chữ thường | 13px | 400 |
| Chữ phụ / legend | 11.5px | 400–500 |
| Nhãn trục | 10.5px | 400 |

`font-variant-numeric: tabular-nums` bật ở `body` để cột số không nhảy khi cập nhật. Trả về `proportional-nums` cho câu văn nếu thấy chữ thưa bất thường.

---

## Đổi design system

1. Ghi quyết định vào `docs/2-design/design.md` **trước**.
2. Thay `:root` + `[data-theme="dark"]` trong `app/globals.css`.
3. **Giữ** khối bí danh tương thích.
4. Không đụng `lib/tokens.ts` — kích thước không đổi theo design system.

Kiểm sau khi đổi: bốn trạng thái không lỗi console; mọi chữ đạt 4,5:1; thang `--series-*` qua được phép thử grayscale.

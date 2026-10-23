# SaaS Churn & MRR — Thiết kế

## 1 · Hướng thị giác

Một bảng theo dõi tĩnh, đơn sắc, đọc được trong 10 giây: CEO mở ra là thấy ngay con số nào đang vượt ngưỡng nhờ màu đỏ/vàng, còn mọi thứ khác lùi về thang mực xám. Người xem ở `specification.md` §2 là cấp quản lý — họ cần biết **chỗ nào có vấn đề**, không cần đọc từng đường chart, nên màu chỉ được phép xuất hiện ở đúng chỗ có vấn đề.

Ba quyết định nền:

| Quyết định | Chọn gì | Vì sao |
|---|---|---|
| Tách lớp bằng gì | ba sắc độ nền + một hairline | không kính mờ, không gradient, không bóng trừ hai chỗ |
| Màu xuất hiện ở đâu | chỉ nơi màu mang nghĩa: so ngưỡng (tỷ lệ rời bỏ, % doanh thu đã mất) và thứ bấm được | gói / khu vực nào đỏ là đang vượt ngưỡng — không có màu nào khác cạnh tranh sự chú ý |
| Mật độ | canvas 1600×900 cố định, không cuộn, 5 KPI + 4 chart mỗi trang | xem trên màn hình họp hoặc laptop; cả trang vừa một khung nhìn |

## 2 · Design system đang dùng

**Monochrome Near-White Analytics Design System.**

Sáu bản thay thế đã dựng sẵn: Linear · Geist · Stripe · Raycast · Radix · Apple HIG. Chọn **giữ mặc định**, vì người dùng không nêu đích danh hệ nào (G20).

Nguyên tắc số một — **một mặt phẳng, không vật liệu**:

| Lớp | Token | Dùng cho |
|---|---|---|
| Mặt bàn | `--page` | nền ngoài shell — shell **nổi trên** nó |
| Khung app | `--shell` | sidebar + header + vùng nội dung |
| Sàn nội dung | `--page` | `#body` — card nổi trên sàn này |
| Card | `--card` | card KPI, card chart, bảng |

Hai điều dễ làm sai:

1. **Shell không tràn hết màn hình.** Nó là một tấm bo `--r-shell: 20px` nổi trên `--page`, có `--sh-shell`, thấy được bo góc và lề ở **cả bốn phía**. Dashboard tràn sát mép màn hình là dấu hiệu làm sai hệ này.
2. **`#body` không cùng màu với `--shell`.** Sàn phải thấp hơn card **một bậc**, nếu không card trắng trên nền trắng sẽ mất mép. Đó là lý do sàn dùng `--page` chứ không dùng `--shell`.

Khi tài liệu này và `assets/globals.css` của skill `dashboard-build` khác nhau, **`globals.css` đúng**.

## 3 · Bảng token

### Nền và mực

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `--page` | `#E9E9EA` | `#0A0A0B` | mặt bàn + sàn `#body` |
| `--shell` | `#FFFFFF` | `#131315` | khung app |
| `--card` | `#FFFFFF` | `#131315` | card |
| `--sub` | `#FAFAFA` | `#191A1C` | hover, ô nhập, đầu bảng |
| `--sub2` | `#F4F4F5` | `#1F2023` | nav đang chọn, nút phụ |
| `--line` | `#EBEBEC` | `#232427` | hairline |
| `--line2` | `#F2F2F3` | `#1C1D20` | hairline nhạt hơn |
| `--ink` | `#191A1C` | `#F2F3F5` | chữ chính |
| `--ink2` | `#6C6E72` | `#9B9EA4` | chữ phụ |
| `--ink3` | `#A3A5AA` | `#6A6D73` | placeholder, đường lưới — không dùng cho chữ (§4) |

### Brand và tín hiệu

| Token | Light | Dark |
|---|---|---|
| `--brand` | `#3D5AFE` | `#7C90FF` |
| `--brand-600` | `#2E48E0` | `#6478F5` |
| `--brand-50` | `#F0F2FF` | `#1A1E33` |
| `--on-brand` | `#FFFFFF` | `#0C1023` |
| `--ok` / `--ok-bg` | `#128A54` / `#E8F5EE` | `#34C98A` / `#0E2A1F` |
| `--warn` / `--warn-bg` | `#B45309` / `#FDF3E7` | `#E5A93B` / `#2A1E0B` |
| `--bad` / `--bad-bg` | `#C62B3C` / `#FBEBEC` | `#FF7080` / `#2C1517` |

Ý nghĩa tín hiệu trong dashboard này (ngưỡng ở `specification.md` §9):

| Token | Tỷ lệ khách đã rời bỏ | % doanh thu đã mất |
|---|---|---|
| `--ok` | < 10% | < 5% |
| `--warn` | 10–15% | 5–10% |
| `--bad` | > 15% | > 10% |

### Chuỗi dữ liệu — 5 bậc mực

| Token | Light | Dark | Hạng |
|---|---|---|---|
| `--focus` | `#191A1C` | `#F2F3F5` | hạng 1 |
| `--series-1` | `#2E3033` | `#E3E5E8` | đậm nhất (dự phòng, thực tế không vẽ) |
| `--series-2` | `#55585D` | `#B6B9BE` | hạng 2 |
| `--series-3` | `#83868C` | `#8A8D93` | hạng 3 |
| `--series-4` | `#AFB2B7` | `#63666B` | hạng 4 |
| `--series-5` | `#D3D5D8` | `#44464B` | hạng 5, nhạt nhất |

Ở dark, "đậm nhất" nghĩa là **gần chữ nhất** (sáng nhất) — thứ tự hạng giữ nguyên.

Đối chiếu: `--focus` không trùng bậc `--series-2..5` nào ở cả hai theme. ✓
Phép thử grayscale (độ sáng tương đối), mọi khoảng cách liền kề ≥ 0,04: ✓
- Light: `--focus` 0,010 · `--series-2` 0,097 · `--series-3` 0,238 · `--series-4` 0,444 · `--series-5` 0,664
- Dark: `--focus` 0,896 · `--series-2` 0,484 · `--series-3` 0,266 · `--series-4` 0,132 · `--series-5` 0,061

Dashboard này nhiều nhất 4 nhóm trên một chart (khu vực), nên chỉ dùng tới `--series-4`.

### Màu thương hiệu: không dùng

Không có token màu cho gói hay khu vực. Basic / Pro / Enterprise và APAC / EMEA / Americas / Chưa rõ khu vực đều tô theo thang `--series-*` theo **thứ hạng** trên chart đó. Một gói không giữ màu cố định xuyên các chart — danh tính do nhãn chở.

### Bo góc và bóng

```
--r-shell: 20px    --r-card: 11px    --r-inner: 9px
--r-menu:  9px     --r-sm:    7px    --r-sheet: 14px    --r-pill: 999px

--sh-card:  0 1px 2px rgba(18,20,24,.03)
--sh-pop:   0 14px 38px -10px rgba(18,20,24,.16), 0 2px 6px rgba(18,20,24,.05)
--sh-shell: 0 22px 56px -22px rgba(18,20,24,.22)
```

Shell 20 → card 11 → phần tử trong card 9. Bo giảm dần theo độ sâu; bằng nhau sẽ thấy méo ở góc.

Đúng ba bóng, không thêm. `--sh-card` gần như không thấy — card tách khỏi sàn chủ yếu bằng **chênh nền**. `--sh-pop` cho popover / drawer / modal xuất dữ liệu. `--sh-shell` cho đúng một thứ: shell nổi trên mặt bàn.

### Khối bí danh tương thích — không được xoá

```css
--label: var(--ink);   --label2: var(--ink2);   --label3: var(--ink3);
--bg: var(--card);     --separator: var(--line);
--blue: var(--brand);  --green: var(--ok);  --red: var(--bad);  --orange: var(--warn);
--fill4: var(--line2); --gray: var(--ink3); --lift-sm: var(--sh-card);
```

Lớp JS vẽ chart gọi `CSS('--label2')`, `CSS('--fill4')`… theo tên hệ cũ. Khối này ánh xạ chúng về hệ mới tại **một chỗ**.

Xoá khối này là 40+ lời gọi `getComputedStyle` trả về chuỗi rỗng — chart vẫn vẽ nhưng không màu, hỏng im lặng, không có thông báo lỗi nào. Nó cũng chính là cơ chế cho phép đổi cả design system mà không đụng một dòng JS.

## 4 · Typography

```
--sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif
--mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, 'JetBrains Mono', Consolas, monospace
```

| Vai trò | Cỡ | Đậm |
|---|---|---|
| Lời chào | 20px | 600 |
| Số KPI | 23px | 600 |
| Tiêu đề card | 13px | 600 |
| Chữ thường | 13px | 400 |
| Chữ phụ / legend / dòng phụ card | 11–11.5px | 400–500 |
| Nhãn trục | 10.5px | 400 |

Cỡ chữ theo `globals.css` của skill `dashboard-build` (asset thắng tài liệu, cập nhật 2026-10-23). Bản đầu ghi 22 / 28 / 15px theo `design-system.md` — đã chỉnh cho khớp code.

Mọi số dùng `font-variant-numeric: tabular-nums` để cột số không nhảy khi cập nhật.

### Màu chữ và độ tương phản (G23)

| Token | Trên `--card` light | Trên `--card` dark | Trên sàn `--page` light | Được dùng cho chữ? |
|---|---|---|---|---|
| `--ink` | 17,4:1 | 16,7:1 | 14,4:1 | có, ở mọi nền |
| `--ink2` | 5,1:1 | 6,9:1 | **4,2:1** | có trên card / shell — kể cả nhãn trục, chú thích KPI, legend. **Không** đặt trực tiếp trên sàn `--page` |
| `--ink3` | 2,5:1 | 3,6:1 | 2,0:1 | **không** — chỉ cho placeholder ô nhập, đường lưới, phần tử không phải chữ |

`--ink3` không đạt sàn 4,5:1 ở cả hai theme, nên mọi chữ thường dùng ở `--ink3` theo hệ mặc định (nhãn trục, chú thích) chuyển sang `--ink2`. Chữ nằm trực tiếp trên sàn `--page` (thanh chào, chú thích cạnh băng KPI) dùng `--ink`. Không thêm hex mới, không sửa token.

### Định dạng số (G21)

| Loại | Cách viết | Ví dụ |
|---|---|---|
| Tiền | phân cách nghìn bằng dấu chấm, đơn vị `USD` phía sau | `509.737 USD` |
| Tiền trên thẻ KPI | rút gọn `K` từ 100.000 trở lên | `509,7K USD` |
| Tỷ lệ | một chữ số thập phân, dấu phẩy | `14,2%` |
| Số khách | phân cách nghìn bằng dấu chấm | `2.574` |
| Ngày | `dd/mm/yyyy` trên giao diện | `12/10/2023` |

## 5 · Ba luật màu

**Luật 1 — `--brand` chỉ dành cho thứ bấm được.** Chỉ xuất hiện ở: nút chính, checkbox đã tick, viền focus, link. **Không bao giờ** làm màu chuỗi dữ liệu. Mục nav đang chọn cũng **không** tô brand — nó tô nền `--sub2` + chữ `--ink`. Brand để dành cho đúng một nút hành động trên mỗi màn.

**Luật 2 — `--ok` / `--warn` / `--bad` chỉ mang nghĩa ngưỡng.** Chỉ dùng khi có **một con số so với một ngưỡng**: đạt/không đạt, tăng/giảm, mức cảnh báo. Không bao giờ làm màu chuỗi dữ liệu. "TikTok tô đỏ vì là chuỗi thứ 3" nghĩa là lúc TikTok thật sự lỗ sẽ không ai nhận ra.

**Luật 3 — không có ngoại lệ nào.** Mọi màu đều là token của design system. Không có bảng màu thương hiệu. Mọi dimension đi chung một luật: màu nói **thứ hạng**, còn danh tính do icon và nhãn chở.

**Hệ quả — thứ tự quyết định màu chuỗi**, đọc từ trên xuống, gặp là dừng:

```
1. dưới ngưỡng lỗ   →  --bad      (trạng thái thắng tất cả)
2. hạng 1           →  --focus
3. còn lại          →  --series-N theo hạng, tối đa bậc 5
```

Ngưỡng đứng trên cùng là có chủ ý: một kênh đang lỗ phải đỏ **kể cả khi** nó là Facebook và lẽ ra mang màu xanh Facebook.

Trong dashboard này, "dưới ngưỡng lỗ" nghĩa là: **tỷ lệ khách đã rời bỏ > 15%** khi chỉ số đang chọn là Tỷ lệ khách đã rời bỏ. Ví dụ ở trạng thái mặc định: thanh Basic (18,8%) và APAC (15,5%) đỏ dù Basic là hạng 1. Với ba chỉ số còn lại (MRR, Số khách, Doanh thu tháng đã mất) không có ngưỡng trên chuỗi, nên chỉ dùng bước 2 và 3.

Năm bậc mực chênh nhau về **độ sáng**, không về sắc — điều kiện để phân biệt được khi in đen trắng và với người mù màu.

## 6 · Thứ bậc thị giác

| Bậc | Thành phần | Cách làm nổi |
|---|---|---|
| 1 | Số KPI | 23px/600, `--ink` |
| 2 | Chuỗi hạng 1 trong chart | `--focus` |
| 3 | Tiêu đề card | 13px/600 |
| 4 | Chuỗi còn lại | `--series-2..5` nhạt dần |
| 5 | Nhãn trục, chú thích | 10.5–11.5px, `--ink2` (không dùng `--ink3` cho chữ — §4) |

Làm nổi bằng **độ đậm và sắc độ mực**, không bằng màu. Màu đã bị ba luật ở mục 5 giữ chỗ hết rồi.

## 7 · Nguyên tắc tương tác

| Nguyên tắc | Nội dung |
|---|---|
| Một nút brand mỗi màn | Màn chính: `Bộ lọc` (G22). Trang giới thiệu: `Mở dashboard`. Drawer và bảng xuất là lớp phủ trên màn chính nên nút xác nhận (`Áp dụng`, `Tải xuống`) dùng **mực**, không brand — theo `globals.css` (chốt 2026-10-23) |
| Điều khiển một-chart ở header card đó | Căn phải trong `chead` — chỉ có Tuần/Tháng/Quý ở card Area trang 1 |
| Điều khiển cả-trang trong drawer | Khoảng ngày, gói, khu vực, trạng thái, chỉ số. Không đặt bản sao ở chỗ khác |
| Sửa trong drawer là nháp | Chỉ áp dụng khi bấm `Áp dụng` |
| Hành động phá huỷ phải xác nhận | `Xoá hết` bộ lọc **không** cần xác nhận — chỉ đưa mọi bộ lọc về "Tất cả", vẫn là nháp tới khi bấm `Áp dụng` |
| Bốn trạng thái runtime | đang tải · lỗi + nút thử lại · có dữ liệu · **không dòng nào khớp bộ lọc** + gợi ý nới lọc |
| Chú thích khi lọc trạng thái | Bộ lọc trạng thái khác "Tất cả" → ở thanh chào, cạnh chip bộ lọc, hiện `KPI không đổi theo bộ lọc trạng thái` (11px, `--ink` vì nằm trên sàn `--page`; không tô màu) |
| Tooltip mở bằng bàn phím | Nhãn thẻ KPI và mục sidebar (khi thu gọn) nhận focus bằng Tab; tooltip `.tip` hiện khi focus, ẩn khi rời |

## 8 · Light / dark

Cả hai chế độ đều phải viết vào tài liệu và đều phải kiểm, kể cả khi người dùng nói chỉ chạy sáng.

Dark **không phải đảo màu**. Nó là bảng riêng ở mục 3, và ba luật màu đảo được nguyên vẹn — đảo được thì mới chứng minh đó là một luật chứ không phải một bảng màu.

Kiểm sau khi đổi theme, bốn trạng thái: sáng · tối · thu gọn sidebar · trang Nguồn dữ liệu. Không lỗi console, và **mọi chữ đạt 4,5:1 ở cả hai theme** — kể cả nhãn trục 10.5px.

## 9 · Giả định cần bạn xác nhận

> **Trạng thái: đã xác nhận 2026-10-23** — chấp nhận toàn bộ G20–G23.

```
G20. [Vừa] Giữ design system mặc định Monochrome Near-White.
     Vì: người dùng không nêu đích danh Linear / Geist / Stripe / Raycast / Radix / Apple HIG.
     Nếu sai: ghi hệ mới vào design.md §2, §3; build thay khối :root + [data-theme="dark"], giữ nguyên khối bí danh.

G21. [Thấp] Định dạng số kiểu Việt Nam (509.737 USD · 14,2% · 12/10/2023), tiền giữ đơn vị USD không quy đổi.
     Vì: người xem là người Việt; dữ liệu gốc tính bằng USD.
     Nếu sai: sửa design.md §4 "Định dạng số"; không ảnh hưởng bố cục.

G22. [Thấp] Nút brand duy nhất trên màn chính là `Bộ lọc`; `Xuất dữ liệu` là nút phụ.
     Vì: lọc là hành động dùng nhiều nhất khi đào sâu; xuất dữ liệu ít dùng hơn.
     Nếu sai: đổi ở design.md §7 và components.md §5.

G23. [Vừa] Nhãn trục và chữ chú thích dùng `--ink2` thay vì `--ink3` như hệ mặc định.
     Vì: `--ink3` chỉ đạt 2,5:1 (light) và 3,6:1 (dark), trượt sàn 4,5:1 mà checklist bắt buộc cho mọi chữ, kể cả nhãn trục 10.5px. `--ink2` là token có sẵn, đạt trên card ở cả hai theme; trên sàn `--page` chỉ 4,2:1 nên chữ trên sàn dùng `--ink`.
     Nếu sai: đây là mâu thuẫn giữa design-system.md (nhãn trục = --ink3) và rules-checklist.md (mọi chữ ≥ 4,5:1) của chính skill. Nếu giữ --ink3 thì sửa design.md §4, §6 và chấp nhận trượt tiêu chí tương phản. Build không sửa globals.css — chỉ chọn token khi gọi màu chữ trong chart.
```

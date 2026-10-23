# Danh mục component

Trích từ bản chuẩn `prototype/design-systems/_base.html` — 113 class, gần như tất cả đều đang dùng. Đây là **tập đóng**: dựng dashboard theo hệ này thì không cần component nào ngoài danh sách, và thêm component mới là dấu hiệu đang trượt khỏi hệ.

Dùng file này khi viết `docs/2-design/components.md`.

---

## Khung app

| Component | Vai trò | Ghi chú |
|---|---|---|
| Shell | Tấm bo `--r-shell` nổi trên mặt bàn | Có `--sh-shell`. Không tràn sát mép màn hình |
| Sidebar | Điều hướng chính, 206px ↔ 58px | Ngăn bằng 1px hairline, không bằng bóng |
| Header | Thanh 46px: breadcrumb, đồng bộ, thông báo, chủ đề, tài khoản | Cố định, không mờ dần khi cuộn |
| Thanh chào | 52px: lời chào + ngày theo UTC+7 | Tính theo giờ Việt Nam, không theo giờ máy |

### Mục điều hướng

Ba trạng thái: thường · hover · đang chọn.

Mục đang chọn tô nền `--sub2` + chữ `--ink`, **không** tô brand. Brand để dành cho nút hành động chính.

Khi sidebar thu gọn, nhãn biến thành tooltip. Icon giữ nguyên vị trí — không được nhảy sang giữa.

---

## Thẻ KPI

Băng 118px, 5 thẻ, mỗi thẻ 259px (khi sidebar mở).

Cấu tạo, từ trên xuống:

| Phần | Nội dung |
|---|---|
| Nhãn + chấm màu | tên chỉ số |
| Số lớn | 28px, 600, `tabular-nums` |
| So kỳ trước | `↑ 12,4%`, tự đảo chiều tốt/xấu với chỉ số nghịch |
| Sparkline | cao ~30px, kèm **đường chuẩn gạch ngang** |
| Chú thích ngưỡng | ví dụ `mục tiêu 4,00x · đang thiếu 1,35x` |

Hai luật:

1. **Đường chuẩn là bắt buộc.** Sparkline không có mốc chỉ cho thấy hình dáng, không cho biết đang trên hay dưới ngưỡng. Mốc = ngưỡng nghiệp vụ nếu có, còn lại là trung bình kỳ.
2. **Chỉ KPI có ngưỡng mới được tô màu.** Còn lại giữ mực. Tô màu một chỉ số không có ngưỡng là nói dối người xem rằng nó tốt hay xấu.

Chỉ số nghịch (chi phí, CPL, tỷ lệ rời bỏ): tăng là **xấu**. Phải đảo màu mũi tên, đừng để mọi mũi tên lên đều xanh.

---

## Card chart

```
┌─ card ──────────────────────────┐
│ chead  tiêu đề · điều khiển     │  43px
│ ┌ lgd  legend (tuỳ chart) ────┐ │  24 hoặc 44px
│ └─────────────────────────────┘ │
│ ┌ plot  vùng vẽ svg ──────────┐ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘   padding 14px
```

Điều khiển ảnh hưởng riêng card này (Ngày/Tuần/Tháng) đặt ở `chead`, căn phải. Điều khiển ảnh hưởng cả trang đặt trong drawer.

---

## Sáu loại visual

| Loại | Legend | Dùng khi |
|---|---|---|
| Donut | ✅ 2 hàng (44px) | tỷ trọng, ≤ 6 nhóm |
| Area một chuỗi | ❌ | xu hướng một chỉ số qua thời gian |
| Line nhiều đường | ✅ 1 hàng (24px) | so sánh ≤ 5 nhóm qua thời gian |
| Bar xếp hạng | ❌ | top N, tên nhóm nằm ngay cạnh thanh |
| Bảng ma trận tô nhiệt | ❌ | nhóm × kỳ |
| Sparkline | ❌ | chỉ trong thẻ KPI |

Bar không cần legend vì tên nhóm đã nằm cạnh thanh. Area một chuỗi không cần vì tiêu đề card đã nói rõ đang vẽ gì.

### Ô nhiệt — cạm bẫy đã trả giá

Độ đậm ô nhiệt pha bằng mực. Nếu pha quá mạnh thì **ô giá trị cao nhất lại là ô khó đọc nhất**, và ở dark mode nó đảo ngược thành sáng nhất.

Khoảng đã kiểm chứng: `5% + t × 24%`. Đừng dùng `8% + t × 40%`.

### Nhãn trục cuối bị cắt

Nhãn x cuối cùng nằm sát mép phải, `overflow: hidden` của card sẽ xén. Đặt `text-anchor="end"` cho điểm cuối.

---

## Điều khiển

| Component | Class | Ghi chú |
|---|---|---|
| Segmented control | `.seg` | vỏ `--sub2`, mục chọn là viên nổi |
| Chip lọc | `.chip` | bật/tắt, dùng trong drawer |
| Nút chính | `.dbtn.pri` `.ubtn` | **duy nhất** được mang `--brand` |
| Nút phụ | `.ibtn` `.ghost` | nền `--sub2` hoặc trong suốt |
| Checkbox | `.cbx` `.box` | tick tô brand |
| Radio | `.rad` | |
| Switch | `.sw` | |
| Ô ngày | `.dates` | hai ô có `min`/`max` giao nhau |
| Popover | `.pop` | dùng `--sh-pop` |
| Tooltip | `.tip` | |
| Badge trạng thái | `.bdg` `.led` | chỉ mang `--ok/--warn/--bad` |

Quy tắc số một cho nút: **một màn hình chỉ có một nút brand.** Có hai nút xanh nghĩa là chưa quyết được đâu là hành động chính.

---

## Drawer bộ lọc

Trượt từ phải, nền sau tối đi, **ẩn hoàn toàn khi đóng** (`visibility: hidden`, và `translateX` phải cộng cả lề lẫn bóng).

Chứa: khoảng ngày (có preset) · chọn kênh · chọn chiến dịch · chọn chỉ số · nút xoá lọc · nút áp dụng.

Bốn lựa chọn chỉ số nằm **ở đây**, không nằm trên màn hình chính.

Danh sách dài cuộn trong khối của nó, chiều cao là bội số của chiều cao một hàng.

---

## Bảng xuất dữ liệu — hai bước

Bấm nút **không tải file ngay**:

1. Mở bảng chọn: phạm vi (tất cả / theo bộ lọc) · khoảng ngày · chọn cột · định dạng · dấu phân tách.
2. **Xem trước số dòng.**
3. Mới có nút tải thật.

Hai luật:
- "Theo bộ lọc dashboard" phải trả về **đúng** tập dòng đang hiển thị. Sai ở đây là người dùng mang số sai đi họp.
- Sửa trong bảng xuất **không được** đụng tới bộ lọc dashboard — hai ngữ cảnh khác nhau.

Xuất dữ liệu chỉ là xuất dữ liệu. Không xuất PNG, không xuất PDF.

---

## Bốn trạng thái runtime

Mọi vùng dữ liệu phải có đủ:

| Trạng thái | Class | Hiển thị |
|---|---|---|
| Đang tải | `.busy` `.spin` | |
| Lỗi | `.err` | kèm nút thử lại |
| Có dữ liệu | | |
| **Không dòng nào khớp bộ lọc** | `.empty` | kèm gợi ý nới lọc |

Trạng thái thứ tư hay bị quên. Lọc chặt tay là chart trắng trơn không kèm lời giải thích, người dùng tưởng hỏng.

---

## Icon

Bộ **33 icon đã nhúng sẵn** trong skill: `assets/icon-sprite.html`. Dán nguyên khối đó ngay sau `<body>`, rồi gọi `<svg class="lu"><use href="#i-search"/></svg>`. Không cài gì, không tải gì.

**Không tự vẽ path theo trí nhớ, kể cả một icon.** Đây là lỗi đã xảy ra trên chính dự án này: 5/14 icon viết tay sai, và sai kiểu không ai nhận ra bằng mắt (`m21 21-4.3-4.3` thay vì `-4.34-4.34`). Cần một icon chưa có trong sprite thì thay bằng icon đã có, hoặc dùng chữ.

Ba cỡ: `.lu` (mặc định) · `.lu-sm` · `.lu-xs`.

Không dùng emoji làm icon.

---

## Đăng nhập

Màn riêng trước khi vào dashboard: logo, tên sản phẩm, nút đăng nhập, ghi chú pháp lý. Cùng hệ token, cùng shell bo góc.

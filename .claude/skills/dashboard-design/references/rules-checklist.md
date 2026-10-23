# Checklist rà soát — bước 7

Rà **sau khi** đã viết cả bốn file, **trước khi** báo cáo cho người dùng. Sai một dòng thì sửa tài liệu, không viết một đoạn giải thích tại sao ngoại lệ này chấp nhận được.

Số trong checklist này trích từ `layout-contract.md` và `design-system.md`. Hai file đó là nguồn sự thật; checklist chỉ đi kiểm.

## Đầu ra

- [ ] Ra **đủ bốn file**, không phải một
- [ ] `docs/1-spec/specification.md` — đúng đường dẫn, đúng tên
- [ ] `docs/2-design/design.md`
- [ ] `docs/2-design/layout.md`
- [ ] `docs/2-design/components.md`
- [ ] Ghi thẳng cả bốn file trong **một lượt**, không in ra chat trước, không hỏi giữa chừng
- [ ] Mỗi file kết thúc bằng mục `## Giả định cần bạn xác nhận`
- [ ] Mỗi giả định có đủ ba phần: **quyết định gì · vì sao · sửa ở đâu nếu sai**
- [ ] Báo cáo cuối liệt kê bốn file kèm số dòng, nguồn dữ liệu đã đọc, và giả định xếp theo mức rủi ro

## Cấu trúc

- [ ] Đúng 4 trang — 3 trang theo dõi + 1 trang nguồn dữ liệu
- [ ] Không có trang phân tích thêm (phễu, ma trận thời gian, cohort)
- [ ] Đúng 5 thẻ KPI, mỗi thẻ có sparkline và đường chuẩn gạch ngang
- [ ] Đúng 4 chart trên mỗi trang theo dõi
- [ ] Đúng 4 lựa chọn chỉ số, đặt **trong drawer**, không nằm trên màn hình chính
- [ ] Trang 4 không có băng KPI, và có quy tắc giãn `#body.nokpi` để không hở 132px ở đáy

## Bố cục

- [ ] Canvas 1600×900, có công thức `scale = Math.min(innerWidth/1600, innerHeight/900)`
- [ ] `row2 === row3 === 301` — bốn chart cùng chiều cao vẽ **230**
- [ ] Phép kiểm **tổng chiều cao = 900** có trong `layout.md`, cộng ra đúng
- [ ] Phép kiểm **tổng bề rộng = 1600** có trong `layout.md`, cộng ra đúng
- [ ] Có bảng kích thước suy ra cho **cả sidebar 206 và 58**
- [ ] Mọi chart ghi kích thước bằng px cứng, không có `%`, `auto`, `ResponsiveContainer`
- [ ] Card có legend đã trừ 24 (line nhiều đường) hoặc 44 (donut) khỏi 230
- [ ] **Shell có bo góc `--r-shell: 20px` và lề ngoài ở cả bốn phía** — không tràn sát mép màn hình
- [ ] Ba cạm bẫy padding có trong `layout.md`: `CARD_PAD` do JS quyết định · `.card` đè `.kpi` · drawer `translateX` phải cộng cả lề lẫn bóng

> Vì sao kiểm shell: tràn sát mép là dấu hiệu nhận biết rõ nhất của việc làm sai hệ này. Shell phải **nổi trên** mặt bàn `--page`, có `--sh-shell`.

## Màu

- [ ] `--brand` không xuất hiện ở bất kỳ chuỗi dữ liệu nào
- [ ] `--brand` chỉ ở: nút chính, checkbox đã tick, viền focus, link
- [ ] Mục nav đang chọn tô `--sub2` + `--ink`, **không** tô brand
- [ ] Một màn hình chỉ có **một** nút brand
- [ ] `--ok` `--warn` `--bad` chỉ dùng khi có một con số so với một ngưỡng
- [ ] Chuỗi dữ liệu dùng **5 bậc mực** `--series-1..5` + `--focus` cho hạng 1
- [ ] Có bảng token đủ **cả light và dark**
- [ ] Không có hex nào ngoài bộ token
- [ ] **`#body` có nền thấp hơn card một bậc** — sàn dùng `--page`, không dùng `--shell`
- [ ] **Khối bí danh tương thích còn nguyên**: `--label` `--label2` `--label3` `--bg` `--separator` `--blue` `--green` `--red` `--orange` `--fill4` `--gray` `--lift-sm`
- [ ] **Không còn token màu thương hiệu nào** (`--ch-*`): mọi dimension đi chung thang mực
- [ ] `--focus` **không trùng** bất kỳ bậc `--series-2..5` nào — trùng là hai hạng ra cùng một màu
- [ ] Thứ tự quyết định màu chuỗi ghi đúng: ngưỡng lỗ → `--focus` → `--series-N`

> Vì sao kiểm `#body`: card trắng trên nền trắng thì mất mép — không thấy card nào cả, chỉ thấy một mảng trắng có chữ.
>
> Vì sao kiểm khối bí danh: xoá nó là 40+ lời gọi `getComputedStyle` trả về chuỗi rỗng. Chart vẫn vẽ nhưng không màu. Hỏng im lặng, không có thông báo lỗi nào.
>
> Vì sao tách kênh với chiến dịch: chiến dịch không có màu thương hiệu, và danh sách chiến dịch đổi theo bộ lọc — màu cố định gán cho một danh sách động là vô nghĩa.

## Tiếp cận

- [ ] **Thang `--series-*` qua được phép thử grayscale**: chuyển sang độ sáng, khoảng cách giữa hai bậc liền kề **≥ 0,04**
- [ ] **Mọi chữ đạt 4,5:1**, kể cả nhãn trục 10.5px và chữ phụ 11.5px
- [ ] Kiểm tương phản ở **cả hai theme**, không chỉ light
- [ ] Ô nhiệt pha trong khoảng `5% + t × 24%`, không dùng `8% + t × 40%`
- [ ] Không dùng riêng màu để truyền một thông tin — luôn kèm nhãn, vị trí, hoặc độ đậm

> Vì sao ≥ 0,04: hai bậc dính nhau thì khi in đen trắng chúng là **một** màu, và người mù màu không có cách nào tách ra. Cả thang mực dựa vào chênh độ sáng — mất chênh là mất luôn khả năng phân biệt chuỗi.
>
> Vì sao kiểm nhãn trục riêng: đây là chữ nhỏ nhất trên dashboard (10.5px, `--ink3`) và là chỗ dễ trượt xuống dưới 4,5:1 nhất. Bỏ kính mờ chính là để sàn 4,5:1 áp được cho **mọi** chữ — đừng phá đúng chỗ đó.

## Legend

- [ ] Chỉ pie/donut và line nhiều đường có legend
- [ ] Bar, area một chuỗi, bảng, sparkline **không** có legend
- [ ] Legend nằm trên chart, căn trái
- [ ] Legend chỉ có màu + tên nhóm, **không có số liệu**

## Dữ liệu

- [ ] Mỗi cột có đúng một vai trò
- [ ] Cột `ATTRIBUTE` được nêu rõ kèm cách tổng hợp `MAX` (hoặc ghi `Không có`)
- [ ] Cột ảnh chụp tại thời điểm (`headcount`, `stock_on_hand`) đã xử lý riêng, không SUM qua ngày
- [ ] Mọi tỷ lệ ghi rõ `SUM(tử)/SUM(mẫu)`, kèm cảnh báo không dùng `AVG` của tỷ lệ từng ngày
- [ ] **4 ngưỡng đều là số cụ thể** — không còn "cao", "thấp", "bất thường"
- [ ] Có mục số liệu tham chiếu để tự kiểm tra sau khi build
- [ ] Ngưỡng nào suy từ dữ liệu (không phải từ mục tiêu kinh doanh) đã ghi vào mục "Giả định cần bạn xác nhận", mức Cao

## Tương tác

- [ ] Drawer trượt từ phải, làm mờ nền, **ẩn hoàn toàn khi đóng**
- [ ] Hai ô ngày có `min`/`max` giao nhau
- [ ] Sửa trong drawer là nháp, chỉ áp dụng khi bấm `Áp dụng`
- [ ] Xuất dữ liệu **hai bước**, có xem trước số dòng trước khi có nút tải
- [ ] "Theo bộ lọc dashboard" trả về đúng tập dòng đang hiển thị
- [ ] Sửa trong bảng xuất không đụng tới bộ lọc dashboard
- [ ] Điều khiển một-chart nằm ở header card đó; không có bản sao ở card khác
- [ ] Bấm vào cảnh báo thì lọc và chuyển trang
- [ ] Bốn trạng thái runtime đủ cho mọi vùng dữ liệu: đang tải · lỗi + nút thử lại · có dữ liệu · **không dòng nào khớp bộ lọc** + gợi ý nới lọc

## Nội dung

- [ ] Thanh chào tính theo **UTC+7**, không theo giờ máy
- [ ] Có mục ghi rõ dashboard này **không** trả lời được câu hỏi gì, viết bằng câu hỏi thật
- [ ] Ghi rõ những chỗ dữ liệu dễ bị hiểu sai
- [ ] Mục "Giả định cần bạn xác nhận" đã liệt kê mọi chỗ tự quyết, mỗi dòng đủ ba phần

## Không được có

- [ ] Không chatbox AI
- [ ] Không ô tìm kiếm toàn cục
- [ ] Không emoji trong giao diện (icon lấy từ `assets/icon-sprite.html` trong skill)
- [ ] Không xuất PNG hay PDF — xuất dữ liệu chỉ là xuất dữ liệu
- [ ] Không component nào ngoài `component-catalog.md`

---

## Rà chéo bốn file

Checklist trên bắt lỗi **trong** từng file. Mục này bắt lỗi **giữa** các file — loại lỗi mà đọc từng file riêng sẽ không thấy.

- [ ] Tên KPI: `specification.md` ↔ nhãn thẻ KPI trong `components.md`
- [ ] Chart nào có legend: `specification.md` ↔ `layout.md` ↔ `components.md` — ba file, một sự thật
- [ ] Chiều cao vẽ trong `layout.md` đã trừ legend, và khớp loại chart mà `specification.md` chọn
- [ ] KPI được tô màu trong `components.md` đều có ngưỡng tương ứng trong `specification.md`
- [ ] Số lựa chọn chỉ số = 4 ở cả `specification.md` lẫn `components.md`
- [ ] Thang `--series-*` trong `design.md` khớp màu chuỗi mô tả ở `components.md`

### Ba loại vấn đề phải rà

- [ ] **Mâu thuẫn giữa các file** — cùng một thứ, hai file nói khác nhau. Đây là loại nặng nhất: `dashboard-build` sẽ chọn bừa một bên
- [ ] **Mơ hồ** — câu không kiểm tra được bằng máy ("hiển thị top các chiến dịch": top mấy, xếp theo gì)
- [ ] **Suy ra mà chưa ghi** — chỗ tự quyết nhưng quên đưa vào mục giả định

Hai loại đầu **tự sửa ngay**, vì tài liệu chưa qua tay người dùng nên không có gì để phá vỡ. Loại thứ ba thì bổ sung vào mục giả định.

Riêng **mâu thuẫn không tự giải được** (hai cách đều hợp lý, chọn sai là phải dựng lại) thì đưa lên đầu báo cáo dưới dạng câu hỏi, mức rủi ro Cao.

- [ ] Đã rà đủ ba loại trên cả bốn file
- [ ] Mọi giả định từ bốn file đã gom vào báo cáo cuối, xếp theo mức rủi ro Cao → Vừa → Thấp
- [ ] **Không tự chuyển sang `dashboard-build`** — đợi người dùng yêu cầu

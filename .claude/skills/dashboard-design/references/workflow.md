# Quy trình thiết kế dashboard

Bảy bước, bốn file đầu ra, **chạy liền một lượt**. Không nhảy bước, không gộp bước, không dừng giữa chừng để hỏi.

Đây **không phải một cuộc phỏng vấn**. Đọc dataset thật → suy ra mọi quyết định từ schema và giá trị → viết đủ bốn file → ghi mọi giả định ra để người dùng review sau. Một lượt hỏi đáp có giá bằng cả buổi học; hai mươi lượt thì không ai đi hết được.

| Bước | Làm gì | Ra file |
|---|---|---|
| 1 | Đọc dataset; suy ra mục tiêu, người dùng, câu hỏi nghiệp vụ | |
| 2 | Gán vai trò cho từng cột; chốt chỉ số phái sinh và 4 ngưỡng | |
| 3 | Chốt 4 trang, 5 KPI, 4 chart mỗi trang | `docs/1-spec/specification.md` |
| 4 | Chốt hệ thiết kế, màu, chữ, nguyên tắc tương tác | `docs/2-design/design.md` |
| 5 | Chốt bố cục từng trang kèm số đo px | `docs/2-design/layout.md` |
| 6 | Chốt danh mục component, trạng thái, quy tắc dùng | `docs/2-design/components.md` |
| 7 | Rà chéo bốn file, gom mọi giả định, báo cáo cuối | |

---

## Cách ghi giả định

Đổi lại quyền tự quyết là **nghĩa vụ ghi ra**. Mỗi tài liệu kết thúc bằng mục `## Giả định cần bạn xác nhận`, đánh số liên tục `G1, G2, …` xuyên suốt cả bốn file (không đánh lại từ 1 ở mỗi file — người review cần một dãy số duy nhất để trỏ tới).

Định dạng bắt buộc, đúng ba phần:

```
G3. Chọn `channel` làm PRIMARY_DIM (5 giá trị) thay vì `campaign` (12 giá trị).
    Vì: trục phân tích chính nên có 3–8 nhóm để donut đọc được.
    Nếu sai: đổi ở specification.md §4, rồi chạy lại layout.md §2.
```

| Phần | Viết gì | Viết sai kiểu nào |
|---|---|---|
| Dòng 1 — **quyết định gì** | một câu, có số, có tên cột thật | "chọn dimension phù hợp" (không kiểm được) |
| Dòng 2 — **vì sao** | luật đã dùng, không phải cảm tính | "vì nó hợp lý hơn" |
| Dòng 3 — **nếu sai thì sửa ở đâu** | tên file + số mục, và mục nào phải chạy lại theo | "cần xem xét lại" |

Dòng 3 là dòng quyết định giá trị của cả mục. Người review đọc giả định không phải để gật đầu, mà để biết **sửa một chỗ thì kéo theo những gì** — nếu không có nó, mỗi lần đổi ý là một lần dựng lại từ đầu.

### Ba mức rủi ro

| Mức | Nghĩa | Ví dụ |
|---|---|---|
| **Cao** | Sai là phải dựng lại spec | PRIMARY_DIM · METRIC/ATTRIBUTE · 4 ngưỡng · domain |
| **Vừa** | Sai là sửa một mục, các mục khác giữ nguyên | thứ tự 5 KPI · chọn SECONDARY_DIM khi có 2 ứng viên ngang nhau · 4 lựa chọn chỉ số |
| **Thấp** | Sai cũng không ảnh hưởng bố cục | tên dashboard · lời chào · nhãn hiển thị của một chỉ số |

Ghi mức ngay sau số: `G3. [Cao] Chọn channel làm PRIMARY_DIM…`.

Phân mức không phải để trang trí báo cáo. Ở bước 7 chúng được xếp theo mức, và người dùng chỉ có thời gian đọc kỹ nhóm **Cao** — nhóm ấy mà lẫn vào ba dòng về cách viết hoa nhãn thì coi như không ai đọc.

---

## Chỉ dừng lại hỏi khi nào

Đúng **ba** trường hợp. Ngoài ba cái này thì tự quyết và ghi giả định.

| Trường hợp | Dấu hiệu | Hỏi gì rồi dừng |
|---|---|---|
| **Không kết nối được dataset** | thiếu `.env.local`, sai credential, `The caller does not have permission`, không thấy file CSV | Nêu đúng lỗi đang gặp, hỏi đường dẫn/tên tab/quyền share. Không tự bịa schema |
| **Sheet rỗng** | đọc được nhưng trả về mảng rỗng, hoặc chỉ có header không có dòng nào | Hỏi đúng tab nào có dữ liệu. Không tự sinh dữ liệu mẫu |
| **Không có cột thời gian** | không cột nào parse được thành ngày | Hỏi cột nào là trục thời gian. Không lấy cột số tự tăng làm ngày |

Lý do đúng ba cái này: cả ba đều là thứ **không suy ra được từ những gì đang có**. Mọi quyết định còn lại — kể cả những quyết định lớn như PRIMARY_DIM hay ngưỡng lỗ — đều có tín hiệu trong dữ liệu để dựa vào, và đoán sai thì người dùng sửa được ở bước review. Còn đoán bừa một schema không tồn tại thì cả bốn file đều vô giá trị và không ai phát hiện ra cho tới lúc build.

Trường hợp cận biên đáng nêu riêng: **chỉ có danh sách cột, không có dòng sample**. Cái này **không** phải lý do dừng — vẫn chạy hết bảy bước, nhưng ghi ba giả định mức **Cao** theo `data-access.md`: phân biệt METRIC/ATTRIBUTE, số giá trị riêng của mỗi dimension, và độ lớn các chỉ số.

---

## Bước 1 — Đọc dataset, suy ra nghiệp vụ

**Mục tiêu:** biết dataset có gì, rồi suy ra dashboard này phục vụ ai để họ quyết định cái gì.

**Đọc trước:** `data-access.md` — **bắt buộc, làm đầu tiên**, trước cả `domain-playbooks.md`. Rồi `domain-playbooks.md` để khớp domain.

### 1.1 Đọc dataset trước khi nghĩ bất cứ điều gì

Theo `data-access.md`. Cần **header row + ít nhất 5 dòng sample**.

Không được suy ngược: đọc tên dashboard người dùng đặt rồi đoán cột. Tên cột thật là thứ duy nhất không phải giả định — bỏ qua nó để đoán là vứt đi lợi thế duy nhất có sẵn.

Đọc xong, ghi ngay bảng "Nguồn dữ liệu" theo mẫu cuối `data-access.md`: nguồn · số cột · số dòng đã xem · tổng số dòng · khoảng thời gian · cột thiếu giá trị.

### 1.2 Suy ra từ đâu

| Quyết định cần ra | Tín hiệu nào trong dữ liệu | Luật chọn |
|---|---|---|
| **Domain** | tổ hợp tên cột | Khớp phần "Nhận diện" của `domain-playbooks.md`. Lưỡng lự giữa hai domain → chọn cái mà **chỉ số phái sinh** khớp hơn, không phải cái mà tên cột khớp hơn |
| **Mục tiêu dashboard** | cặp cột chi phí ↔ kết quả | Có cả đầu vào tốn tiền lẫn đầu ra sinh tiền → dashboard hiệu quả. Chỉ có đầu ra → dashboard sản lượng |
| **Người xem** | hạt dữ liệu của PRIMARY_DIM | Hạt ở mức đội/kênh/kho → người vận hành trực tiếp. Hạt ở mức vùng/đơn vị kinh doanh → quản lý |
| **Ba câu hỏi nghiệp vụ** | chỉ số phái sinh có ngưỡng | Mỗi ngưỡng sinh một câu hỏi: "nhóm nào đang vượt ngưỡng", "xu hướng đang tiến hay lùi", "tiền đang đổ vào đâu" |
| **Điều dashboard KHÔNG trả lời** | cột **không có** trong dataset | Không có cột nguyên nhân (`reason`, `stage`, `source`) → không trả lời được "vì sao" |

Ví dụ đầy đủ, làm mẫu cho cách suy: dataset có `date` · `channel` · `campaign` · `spend` · `impressions` · `clicks` · `leads` · `revenue` · `campaign_budget`.

```
spend + revenue         → có cả chi phí lẫn kết quả  → dashboard hiệu quả marketing
channel (5 giá trị)     → hạt ở mức kênh              → người xem là người chạy quảng cáo
revenue/spend = ROAS    → tỷ lệ có điểm hoà vốn 1,0   → câu hỏi chính: "kênh nào đang lỗ"
không có cột `stage`    → không có phễu               → không trả lời được "lỗ ở khâu nào"
```

Bốn dòng đó ra thẳng §1, §2, §3 và §13 của `specification.md`. Không cần hỏi câu nào.

### 1.3 Khi dữ liệu không đủ để quyết

| Tình huống | Mặc định chọn gì | Giả định ghi ở mức |
|---|---|---|
| Không khớp playbook nào | Dùng khuôn **Marketing**, thay chỉ số theo cột thật. Cấu trúc 4 trang / 5 KPI / 4 chart giữ nguyên | **Cao** |
| Hai domain cùng khớp | Chọn cái có chỉ số phái sinh khớp hơn; nêu rõ cái bị loại trong giả định | **Cao** |
| Tên cột viết tắt, không đoán được nghĩa | Suy từ kiểu dữ liệu và khoảng giá trị trong sample; ghi nguyên văn điều đã suy | **Vừa** |
| Không có cột nào nói lên người xem | Mặc định người vận hành trực tiếp — dashboard theo dõi mặc định phục vụ người xử lý vấn đề, không phải người nghe báo cáo | **Thấp** |

### Ra khỏi bước 1 với

- Một câu mô tả mục tiêu dashboard, có tên cột thật trong đó.
- Danh sách người xem kèm việc mỗi nhóm cần quyết định.
- Ít nhất 3 câu hỏi nghiệp vụ cụ thể, mỗi câu gắn với một chỉ số đo được.
- Một domain đã chọn, kèm một câu lý do.
- Bảng "Nguồn dữ liệu" đã điền đủ sáu dòng.
- Các giả định đầu tiên đã đánh số `G1…`.

---

## Bước 2 — Vai trò cột, chỉ số phái sinh, ngưỡng

**Mục tiêu:** mỗi cột có đúng một vai trò; mọi tỷ lệ có công thức; bốn ngưỡng là bốn con số.

**Đọc trước:** `domain-playbooks.md` — mục của domain đã chọn ở bước 1.

### 2.1 Gán vai trò

| Vai trò | Số lượng | Điều kiện |
|---|---|---|
| `DATE` | đúng 1 | cột thời gian, hạt ngày |
| `PRIMARY_DIM` | đúng 1 | ít giá trị (3–8), là trục phân tích chính |
| `SECONDARY_DIM` | 1–3 | nhiều giá trị hơn, hoặc phân loại phụ |
| `METRIC` | ≥ 3 | số, **cộng được** |
| `ATTRIBUTE` | 0–2 | số nhưng **không cộng được** |

**Suy ra từ đâu:**

| Quyết định | Tín hiệu | Luật chọn |
|---|---|---|
| `DATE` | cột parse được thành ngày | Có nhiều cột ngày (`date`, `created_at`, `updated_at`) → chọn cột có mặt ở **mọi** dòng và không lặp bất thường. Cột `updated_at` là thời điểm ghi nhận, không phải thời điểm xảy ra sự việc — không dùng làm trục |
| `PRIMARY_DIM` | số giá trị riêng biệt | Cột text có **3–8** giá trị riêng. Nhiều ứng viên → chọn cột mà playbook của domain đã nêu; vẫn hoà → chọn cột có ít giá trị hơn, vì donut chỉ đọc được đến 6 nhóm |
| `SECONDARY_DIM` | số giá trị riêng biệt | Cột text có > 8 giá trị, hoặc là phân loại phụ. Lấy tối đa 3 |
| `METRIC` vs `ATTRIBUTE` | phép thử ở §2.2 | xem dưới |

PRIMARY_DIM chọn sai là hỏng cả trang 2, nên nó **luôn** là một giả định mức **Cao**, kể cả khi chỉ có đúng một ứng viên — người dùng cần thấy mình đã chọn gì và bỏ gì.

### 2.2 Phân biệt METRIC và ATTRIBUTE

Bước hay sai nhất, và sai thì mọi con số trên dashboard đều sai.

`METRIC` cộng được: `spend`, `revenue`, `clicks`, `orders`.

`ATTRIBUTE` là **thuộc tính của một thực thể, bị lặp lại ở mọi dòng của thực thể đó**: `campaign_budget`, `contract_value`, `warehouse_capacity`, `base_salary`.

Phép thử, tự đặt cho từng cột số:

> **"Nếu tôi lọc còn 3 ngày, giá trị này có nên đổi không?"**

- Có → `METRIC`
- Không → `ATTRIBUTE`, tổng hợp bằng `MAX` hoặc `FIRST`, **không bao giờ** `SUM`

Lý do phép thử hiệu nghiệm: nó buộc người trả lời nghĩ về **ngữ nghĩa** của con số chứ không nghĩ về kiểu dữ liệu. `campaign_budget` là kiểu số, cộng được về mặt kỹ thuật, và cộng ra một con số hoàn toàn vô nghĩa — ngân sách của một chiến dịch nhân lên bằng số ngày chiến dịch chạy.

**Suy ra từ đâu — dấu hiệu đọc được từ 5 dòng sample:**

| Tín hiệu trong sample | Kết luận |
|---|---|
| Giá trị **lặp y hệt** trên mọi dòng của cùng một `campaign` / `warehouse` / `employee` | `ATTRIBUTE` — `MAX` |
| Giá trị đổi theo từng dòng, tổng qua kỳ có nghĩa | `METRIC` |
| Đổi theo ngày nhưng là **ảnh chụp tại thời điểm** (`headcount`, `stock_on_hand`) | Không SUM qua ngày. Dùng giá trị ngày cuối kỳ hoặc trung bình, ghi rõ trong spec |
| Chỉ có tên cột, không có sample | Đoán theo tên: có `budget`/`capacity`/`quota`/`target`/`base_` → `ATTRIBUTE`. Giả định mức **Cao** |

Cột ảnh chụp tại thời điểm là cạm bẫy cùng loại nhưng khác cơ chế: nó có đổi theo ngày nên phép thử "lọc 3 ngày" trả lời "có", mà vẫn không cộng được. Nếu domain là HR hoặc tồn kho, kiểm riêng nhóm này trước khi chốt.

### 2.3 Chỉ số phái sinh

Liệt kê mọi chỉ số **không có sẵn** trong dataset kèm công thức. Với mỗi tỷ lệ, ghi song song hai dòng:

```
ĐÚNG :  SUM(tử) / SUM(mẫu)
SAI  :  AVG(tỷ lệ từng ngày)
```

Lý do phải ghi cả dòng SAI: ngày có mẫu số nhỏ mà tử số may mắn lớn sẽ kéo lệch hẳn trung bình. Một ngày có 2 click và 1 conversion cho tỷ lệ 50%, đứng ngang hàng với ngày có 2000 click và 40 conversion cho 2%. Trung bình hai ngày ra 26% — không phản ánh gì cả. Đây là lỗi im lặng: không có thông báo, không có ngoại lệ, chỉ có một con số sai trông rất bình thường.

**Suy ra từ đâu:** lấy nguyên khối công thức của domain trong `domain-playbooks.md`, giữ lại những công thức mà **mọi cột tham gia đều có mặt** trong dataset. Công thức thiếu cột thì bỏ, không thay bằng cột gần giống.

`SUM/SUM` là luật, không phải lựa chọn — viết thẳng vào spec, **không** ghi thành giả định. Đội nào đang tính bằng `AVG` theo ngày thì đó là số họ đang tính sai, và mục §13 "dashboard này KHÔNG trả lời được gì" là chỗ nêu rằng số trên dashboard sẽ lệch so với báo cáo cũ của họ.

### 2.4 Bốn ngưỡng nghiệp vụ

| Loại ngưỡng | Ví dụ marketing |
|---|---|
| Ngưỡng chi phí đơn vị | CPL > 250.000 |
| Ngưỡng lỗ | ROAS < 1,00x |
| Mục tiêu | ROAS ≥ 4,00x |
| Ngưỡng cạn nguồn lực | dùng > 80% ngân sách |

Ngưỡng phải là **số cụ thể**. "Cao", "thấp", "bất thường" không dùng được: chúng không so sánh được bằng máy, nên không tô màu được, nên KPI mất phần chú thích ngưỡng và sparkline mất đường chuẩn.

**Suy ra từ đâu — bốn luật, theo thứ tự ưu tiên:**

| # | Loại ngưỡng | Luật suy | Mức rủi ro |
|---|---|---|---|
| 1 | **Ngưỡng lỗ** | Điểm hoà vốn toán học của chính tỷ lệ đó: tỷ lệ doanh thu/chi phí → `< 1,0`; biên lợi nhuận → `< 0`; tỷ lệ đạt chỉ tiêu → `< 100%` | **Cao** |
| 2 | **Mục tiêu** | Phân vị 75 của chính chỉ số đó trong dữ liệu hiện có, làm tròn lên số đẹp. Chỉ số nghịch thì lấy phân vị 25, làm tròn xuống | **Cao** |
| 3 | **Ngưỡng chi phí đơn vị** | Trung vị × 1,25, làm tròn lên | **Cao** |
| 4 | **Ngưỡng cạn nguồn lực** | `80%` của cột `ATTRIBUTE` tương ứng (`budget`, `capacity`, `quota`) | **Cao** |

Cả bốn đều là giả định mức **Cao**, không có ngoại lệ. Lý do: ngưỡng suy từ dữ liệu mô tả **hiện trạng**, còn ngưỡng nghiệp vụ mô tả **mong muốn**. Một đội đang chạy kém đều thì phân vị 75 của họ vẫn là một con số kém — dashboard sẽ tô xanh cho mức mà lẽ ra phải báo động. Đây là kiểu sai không có cách nào phát hiện từ bên trong dữ liệu, nên bắt buộc phải đưa ra cho người dùng nhìn.

Ghi rõ trong giả định là ngưỡng **suy từ dữ liệu**, kèm con số thô đã dùng để suy:

```
G7. [Cao] Ngưỡng CPL cảnh báo = 312.000 (trung vị 250.000 × 1,25).
    Vì: chưa có mục tiêu chính thức, lấy trung vị làm mốc và chừa 25% biên.
    Nếu sai: đổi ở specification.md §9, kéo theo KPI CPL ở components.md §2 đổi đường chuẩn.
```

Playbook của domain có sẵn ngưỡng (marketing: CPL 250.000 · ROAS 1,0 / 4,0 · ngân sách 80%) thì **dùng ngưỡng của playbook**, vì đó là ngưỡng nghiệp vụ có thật chứ không phải suy từ dữ liệu — nhưng vẫn ghi giả định mức **Cao**, lý do đổi thành "lấy từ playbook của domain, chưa xác nhận với đội".

Không suy được vì thiếu dữ liệu (chỉ có tên cột, hoặc sample quá ít để có trung vị đáng tin): dùng ngưỡng playbook; không có playbook thì ghi ngưỡng là `[chưa xác định]` **và nêu rõ hệ quả** — KPI tương ứng mất chú thích ngưỡng, mất tô màu, sparkline lấy trung bình kỳ làm đường chuẩn.

### Ra khỏi bước 2 với

- Bảng vai trò đủ mọi cột, mỗi cột đúng một vai trò.
- Cột `ATTRIBUTE` nêu rõ kèm cách tổng hợp `MAX`, hoặc ghi `Không có`.
- Cột ảnh chụp tại thời điểm đã tách riêng nếu domain là HR / tồn kho.
- Mọi chỉ số phái sinh có công thức `SUM/SUM`.
- **Bốn ngưỡng đều là số**, không còn chữ, mỗi ngưỡng kèm con số thô đã dùng để suy.
- Giả định mức **Cao** cho PRIMARY_DIM, cho mọi cột ATTRIBUTE đoán theo tên, và cho cả bốn ngưỡng.

---

## Bước 3 — Trang, KPI, chart · ra `docs/1-spec/specification.md`

**Mục tiêu:** chốt nội dung dashboard, chưa động đến hình thức.

**Đọc trước:** `domain-playbooks.md` (5 KPI mẫu của domain) · `spec-output-template.md` (mục "specification.md").

### 3.1 Bốn trang — cấu trúc cố định

```
Trang 1  Tổng quan
Trang 2  Theo PRIMARY_DIM
Trang 3  Theo SECONDARY_DIM
Trang 4  Nguồn dữ liệu
```

Không thương lượng, và không phải chỗ để giả định — cấu trúc này là ràng buộc của skill, không phải suy luận từ dữ liệu. Thứ duy nhất cần quyết là **dimension nào lên trang 2, dimension nào lên trang 3**, đã chốt ở bước 2.

### 3.2 Năm thẻ KPI

Chọn 5 chỉ số trả lời được đúng một câu: *"hôm nay có gì cần xử lý không?"*

Cấu tạo mỗi thẻ, từ trên xuống:

| Phần | Nội dung |
|---|---|
| Nhãn + chấm màu | tên chỉ số |
| Số lớn | `tabular-nums` |
| So kỳ trước | `↑ 12,4%`, tự đảo chiều tốt/xấu với chỉ số nghịch |
| Sparkline | kèm **đường chuẩn gạch ngang** |
| Chú thích ngưỡng | ví dụ `mục tiêu 4,00x · đang thiếu 1,35x` |

Hai luật:

1. **Đường chuẩn là bắt buộc.** Sparkline không có mốc chỉ cho thấy hình dáng — lên hay xuống — chứ không cho biết đang trên hay dưới ngưỡng. Mốc = ngưỡng nghiệp vụ nếu có, còn lại là trung bình kỳ.
2. **Chỉ KPI có ngưỡng mới được tô màu.** Còn lại giữ mực. Tô màu một chỉ số không có ngưỡng là nói với người xem rằng nó tốt hay xấu trong khi chưa ai định nghĩa thế nào là tốt.

**Suy ra từ đâu:**

| Quyết định | Tín hiệu | Luật chọn |
|---|---|---|
| **Chọn 5 KPI nào** | bộ 5 KPI của domain trong `domain-playbooks.md` | Lấy nguyên bộ 5 của playbook, bỏ cái nào thiếu cột, thay bằng METRIC có tổng lớn nhất trong dataset. Đúng 5, không 4 không 6 |
| **Chiều tốt của từng KPI** | tên và loại chỉ số | Chi phí, CPL, CPA, CPC, CPM, tỷ lệ rời bỏ, tỷ lệ hoàn, tỷ lệ lỗi → **tăng là xấu**. Doanh thu, số đơn, conversion, ROAS, biên lợi nhuận, tỷ lệ đúng hẹn → tăng là tốt |
| **KPI nào được tô màu** | có ngưỡng ở §2.4 hay không | Có ngưỡng tương ứng → tô màu. Không có → giữ mực, đường chuẩn lấy trung bình kỳ |
| **Thứ tự 5 thẻ** | vai trò trong câu chuyện | Đầu vào (chi phí) → đầu ra (doanh thu, conversion) → hiệu quả (tỷ lệ có ngưỡng). Người đọc quét trái sang phải theo đúng dòng nhân quả |

Chỉ số nghịch phải **đảo màu mũi tên**. Để mọi mũi tên đi lên đều xanh là lỗi hay gặp và dẫn đến đọc ngược tình hình — chi phí tăng 12% hiện màu xanh thì người xem yên tâm đúng vào lúc đáng lo nhất.

**Khi dữ liệu không đủ để quyết:** chiều tốt của một chỉ số không nằm trong hai danh sách trên (ví dụ `đơn hàng hoàn tất một phần`) → mặc định **tăng là tốt**, ghi giả định mức **Vừa**. Sai chiều chỉ hỏng màu mũi tên của đúng một thẻ, không kéo theo mục nào khác.

### 3.3 Bốn chart mỗi trang

Nội dung chart theo `layout-contract.md`, mục "Bố cục bốn trang" — bố cục đó cố định, không suy ra. Ở bước này chỉ chốt **chart vẽ chỉ số nào**, số đo px để sang bước 5.

Trang 4 không có băng KPI và không có chỉ số đang chọn.

Một quyết định duy nhất cần suy: **donut trang 1 vẽ theo chỉ số nào**. Lấy METRIC có ý nghĩa phân bổ rõ nhất — thường là chi phí, vì "tiền đang đổ vào đâu" là câu hỏi mà tỷ trọng trả lời tốt nhất. Giả định mức **Vừa**.

### 3.4 Bốn lựa chọn chỉ số

Đúng bốn, đặt **trong drawer bộ lọc**, không trên màn hình chính.

**Suy ra từ đâu:** lấy bộ 4 lựa chọn của domain trong `domain-playbooks.md`. Không có playbook → chọn 2 METRIC có tổng lớn nhất + 2 chỉ số phái sinh có ngưỡng. Mặc định mở lên là chỉ số **có ngưỡng lỗ**, vì đó là chỉ số duy nhất trả lời được câu hỏi "có gì cần xử lý không" ngay khi mở dashboard. Giả định mức **Vừa**.

### 3.5 Viết file

Điền template `specification.md`. **Ghi thẳng file, không in ra chat trước.**

Kết thúc file bằng mục `## Giả định cần bạn xác nhận`, gom mọi `G*` đã phát sinh ở bước 1–3.

### Ra khỏi bước 3 với

- `docs/1-spec/specification.md` đã ghi, đủ 13 mục của template.
- Mục §12 / `## Giả định cần bạn xác nhận` đã có mọi giả định của bước 1–3, đúng định dạng ba phần, có mức rủi ro.
- Mục §13 "dashboard này KHÔNG trả lời được gì" có nội dung thật — suy từ **cột không có** trong dataset, không phải một câu lấp chỗ.
- Năm KPI đã chốt kèm chiều tốt và KPI nào được tô màu.

---

## Bước 4 — Hệ thiết kế · ra `docs/2-design/design.md`

**Mục tiêu:** chốt nguyên tắc thị giác trước khi chốt số đo. Tài liệu là nguồn sự thật, code là hệ quả.

**Đọc trước:** `design-system.md` — **bắt buộc, toàn bộ**.

### Suy ra từ đâu

| Quyết định | Tín hiệu | Luật chọn |
|---|---|---|
| **Design system** | — | Mặc định **Monochrome Near-White**. Sáu bản thay thế (Linear, Geist, Stripe, Raycast, Radix, Apple HIG) chỉ dùng khi người dùng nêu đích danh trong prompt. Không giả định, không hỏi |
| **Dark mode** | — | Luôn viết đủ cả hai bảng token. Không phải quyết định — `design-system.md` có sẵn cả hai cột, và `rules-checklist.md` kiểm tương phản ở cả hai theme |
| **Màu chuỗi dữ liệu** | — | Luôn là thang `--series-*` của design system. Không có bảng màu thương hiệu, không có ngoại lệ theo dimension. Không phải quyết định |

### Ba luật màu phải ghi nguyên vào `design.md`

**Luật 1 — `--brand` chỉ dành cho thứ bấm được.** Nút chính, checkbox đã tick, viền focus, link. **Không bao giờ** làm màu chuỗi dữ liệu. Mục nav đang chọn cũng **không** tô brand — nó tô nền `--sub2` + chữ `--ink`. Brand để dành cho đúng một nút hành động trên mỗi màn.

**Luật 2 — `--ok` / `--warn` / `--bad` chỉ mang nghĩa ngưỡng.** Chỉ dùng khi có một con số so với một ngưỡng. Không bao giờ làm màu chuỗi dữ liệu. "TikTok tô đỏ vì là chuỗi thứ 3" nghĩa là lúc TikTok thật sự lỗ sẽ không ai nhận ra.

**Luật 3 — không có ngoại lệ nào.** Mọi màu là token của design system; không có bảng màu thương hiệu. Mọi dimension đi chung một luật — màu nói thứ hạng, danh tính do icon và nhãn chở.

**Hệ quả:** chuỗi dữ liệu dùng **5 bậc mực** `--series-1..5` + `--focus` cho hạng 1. Năm bậc chênh nhau về độ sáng, không về sắc — điều kiện để phân biệt được khi in đen trắng và với người mù màu.

Thứ tự quyết định màu chuỗi, đọc từ trên xuống, gặp là dừng:

```
1. dưới ngưỡng lỗ   →  --bad      (trạng thái thắng tất cả)
2. hạng 1           →  --focus
4. còn lại          →  --series-N theo hạng, tối đa bậc 5
```

Ngưỡng đứng trên cùng là có chủ ý: một kênh đang lỗ phải đỏ **kể cả khi** nó là Facebook và lẽ ra mang màu xanh Facebook.

### Khối bí danh tương thích — nêu rõ trong `design.md`

`:root` có khối ánh xạ `--label`/`--label2`/`--label3`/`--bg`/`--separator`/`--blue`/`--green`/`--red`/`--orange`/`--fill4`/`--gray`/`--lift-sm` về token hệ mới. Lớp JS vẽ chart gọi tên cũ.

**Không xoá khối này.** Xoá là 40+ lời gọi `getComputedStyle` trả về chuỗi rỗng — chart vẫn vẽ nhưng không màu. Hỏng im lặng, không thông báo lỗi. Đây cũng chính là cơ chế cho phép đổi cả design system mà không đụng một dòng JS.

### Viết file

Ghi thẳng `docs/2-design/design.md`, không in ra chat. Kết thúc bằng `## Giả định cần bạn xác nhận` cho mọi `G*` phát sinh ở bước này.

### Ra khỏi bước 4 với

- Một design system đã chốt, có tên.
- Bảng token đủ cả sáng và tối.
- Ba luật màu ghi nguyên văn, không tóm tắt lại thành "dùng màu có ý nghĩa".
- Khối bí danh tương thích đã ghi nguyên trong tài liệu.
- `--focus` không trùng bậc `--series-2..5` nào — đã đối chiếu bằng mắt trên bảng token.

---

## Bước 5 — Bố cục · ra `docs/2-design/layout.md`

**Mục tiêu:** mọi kích thước trên dashboard là một con số px, suy ra được từ một biến duy nhất.

**Đọc trước:** `layout-contract.md` — **bắt buộc**. Mọi số lấy từ đó. **Không tự nghĩ số mới, không giả định số nào.**

Bước này gần như không có gì để suy: số đo là hợp đồng, không phải quyết định. Phần lớn công việc là **chép đúng**.

### Suy ra từ đâu

| Quyết định | Tín hiệu | Luật chọn |
|---|---|---|
| Trạng thái sidebar mặc định | — | **Mở (206px)**. Nhãn đầy đủ giúp người mới định hướng; thu gọn là lựa chọn của người dùng, không phải mặc định |
| Kích thước mọi thứ còn lại | `SIDE` | Suy máy móc bằng `LAY()` trong `layout-contract.md`. Không có chỗ nào để quyết |

Canvas luôn 1600×900 bất kể người dùng xem trên màn hình gì — đó là lý do chọn canvas cố định, nên loại màn hình không sinh ra quyết định nào.

### Những gì phải chép đúng, không diễn giải lại

```js
const SIDE_BORDER = 1, HDR = 46, BODY_PAD_X = 24, BODY_PAD_Y = 20,
      GAP = 14, KPI_GAP = 12;
const BAND = { greet: 52, kpi: 118, row2: 301, row3: 301 };
const CARD_PAD = 14, CHEAD = 43;
const LGD1 = 24, LGD2 = 44;
let SIDE = 206;                      // 58 khi thu gọn
```

Phép kiểm chiều cao (phải đúng 900) và bề rộng (phải đúng 1600) chép nguyên từ `layout-contract.md` vào `layout.md`. Chúng không phải trang trí: người sửa spacing về sau sẽ dùng đúng hai phép cộng này để biết mình vừa làm vỡ cái gì.

Số cụ thể khi sidebar mở (206): `mainW` 1393 · `innerW` 1345 · Row 2 chia 399/932 · Row 3 chia 532/799 · thẻ KPI 259 · **chiều cao vẽ của cả 4 chart = 230**.

`row2 === row3 === 301` là bắt buộc. Bốn card chart phải cao bằng nhau, nếu không mắt sẽ đọc thành "hàng trên quan trọng hơn" — một thông điệp không ai chủ ý gửi.

### Ba cạm bẫy phải ghi vào `layout.md`

1. **Padding card do JS quyết định.** `LAY()` tính kích thước `<svg>` bằng `CARD_PAD = 14`. Đặt `.card { padding: 16px }` cho "đúng thang spacing" là hộp chứa hẹp hơn svg 4px mỗi bên ⇒ `overflow: hidden` cắt mép phải cả 4 chart. Muốn đổi thì đổi `CARD_PAD` trong JS, CSS theo sau.
2. **`.card { padding: X }` đặt sau `.kpi { padding: 0 }`** sẽ thắng (cùng độ đặc hiệu, đứng sau) và làm thẻ KPI phình khỏi băng 118px, cắt mất hàng chân. Viết `.card:not(.kpi)` hoặc thêm lại `.card.kpi { padding: 0 }`.
3. **Drawer đặt `right: 14px` mà đẩy đi bằng `translateX(100%)`** sẽ vẫn lòi ra đúng 14px. Phải cộng cả khoảng cách mép lẫn bóng: `translateX(calc(100% + 34px))`, kèm `visibility: hidden` khi đóng để nó không bắt chuột.

### Legend phải trừ khỏi chiều cao chart

| Chart | Trừ |
|---|---|
| Donut / pie | `LGD2` = 44 |
| Line nhiều đường | `LGD1` = 24 |
| Bar, area một chuỗi, bảng, sparkline | 0 |

Quên trừ thì card tràn — và tràn ở đây không báo lỗi, chỉ xén mất phần dưới chart.

### Trang 4 giãn hai hàng

Trang Nguồn dữ liệu ẩn băng KPI ⇒ dư đúng 132px ở đáy. Hai hàng còn lại phải giãn lấp chỗ đó:

```css
#body.nokpi #row2,
#body.nokpi #row3 { flex: 1 1 0; height: auto }
```

Chỉ trang này mới bỏ px cứng. Ba trang theo dõi vẫn khoá pixel.

### Ra khỏi bước 5 với

- Phép kiểm 900 và 1600 đều khớp trong tài liệu.
- Bảng kích thước cho **cả hai** trạng thái sidebar (206 và 58).
- Bố cục bốn trang ghi đủ, kèm chart nào có legend và trừ bao nhiêu.
- Ba cạm bẫy padding đã ghi nguyên văn.
- Mục `## Giả định cần bạn xác nhận` — thường chỉ có một dòng (sidebar mặc định mở), mức **Thấp**. Nếu dài hơn thế, nhiều khả năng đang tự nghĩ số mới thay vì chép hợp đồng.

---

## Bước 6 — Component · ra `docs/2-design/components.md`

**Mục tiêu:** liệt kê tập component đóng, và trạng thái của từng cái.

**Đọc trước:** `component-catalog.md` — **bắt buộc**.

### Suy ra từ đâu

| Quyết định | Tín hiệu | Luật chọn |
|---|---|---|
| **Có màn đăng nhập riêng không** | dataset nằm sau credential | Nguồn là Google Sheets qua service account → **có** màn đăng nhập. CSV cục bộ → **không**, vào thẳng dashboard |
| **Định dạng xuất dữ liệu** | ngôn ngữ của tài liệu | Mặc định CSV **dấu chấm phẩy** cho người dùng Việt, vì Excel bản Việt đọc dấu phẩy thành một cột duy nhất. Vẫn để người dùng đổi được trong bảng xuất |
| **Cảnh báo bấm vào nhảy tới đâu** | ngưỡng nào gắn với dimension nào | Cảnh báo sinh từ ngưỡng trên PRIMARY_DIM → nhảy tới trang 2 và lọc sẵn nhóm đang vượt ngưỡng |
| **Nhãn từng component** | tên KPI ở `specification.md` | Chép nguyên tên KPI, không diễn đạt lại. Đổi chữ ở đây là sinh mâu thuẫn cho bước 7 bắt |

Ba quyết định đầu đều là giả định mức **Vừa** — sai thì sửa một mục trong `components.md`, không kéo theo spec hay layout.

### Nguyên tắc

**Danh mục là tập đóng.** Dựng dashboard theo hệ này thì không cần component nào ngoài danh sách. Cần thêm một component mới là dấu hiệu đang trượt khỏi hệ — dùng cái gần nhất trong danh mục và ghi giả định mức **Vừa**, không tự thêm component mới.

**Một màn hình chỉ có một nút brand.** Hai nút xanh nghĩa là chưa quyết được đâu là hành động chính.

**Bốn trạng thái runtime, mọi vùng dữ liệu phải có đủ:** đang tải · lỗi (kèm nút thử lại) · có dữ liệu · **không dòng nào khớp bộ lọc** (kèm gợi ý nới lọc). Trạng thái thứ tư hay bị quên; lọc chặt tay ra chart trắng trơn, người dùng tưởng hỏng.

**Icon lấy từ `assets/icon-sprite.html` đã nhúng sẵn trong skill — 33 hình, không cần cài hay tải gì.** Không tự vẽ path theo trí nhớ: lỗi đã xảy ra, 5/14 icon viết tay sai và sai kiểu không ai nhận ra bằng mắt (`m21 21-4.3-4.3` thay vì `-4.34-4.34`). Không dùng emoji làm icon.

**Xuất dữ liệu hai bước:** mở bảng chọn → xem trước số dòng → mới có nút tải. "Theo bộ lọc dashboard" phải trả về **đúng** tập dòng đang hiển thị; sai ở đây là người dùng mang số sai đi họp. Sửa trong bảng xuất **không được** đụng tới bộ lọc dashboard.

### Ra khỏi bước 6 với

- Mọi component trong `components.md` đều có trong `component-catalog.md`.
- Mỗi component có: vai trò · nội dung hiển thị · trạng thái · quy tắc dùng.
- Bốn trạng thái runtime ghi cho mọi vùng dữ liệu.
- Nhãn thẻ KPI chép đúng tên KPI trong `specification.md`.
- Mục `## Giả định cần bạn xác nhận` của file này đã xong.

---

## Bước 7 — Rà chéo và báo cáo

**Mục tiêu:** tìm chỗ sai *giữa* bốn file, rồi giao lại toàn bộ giả định cho người dùng ở một chỗ.

**Đọc trước:** `rules-checklist.md`.

### 7.1 Chạy checklist

Rà từng dòng `rules-checklist.md`. Sai một dòng thì **sửa tài liệu ngay**, không viết một đoạn giải thích tại sao ngoại lệ này chấp nhận được, và không đẩy nó xuống mục giả định — giả định là chỗ cho quyết định chưa chắc, không phải chỗ cho lỗi đã biết.

### 7.2 Đọc lại cả bốn file

Mở lại **cả bốn file cùng lúc** và quét ba loại vấn đề. Đọc rời từng file thì không thấy được loại nặng nhất — mâu thuẫn giữa các file.

| Loại | Tìm gì | Xử lý |
|---|---|---|
| **Mâu thuẫn giữa file** | Cùng một thứ, hai file nói khác nhau | **Sửa ngay.** Nguồn sự thật: `layout-contract.md` cho số đo, `design-system.md` cho token, `specification.md` cho tên và ngưỡng |
| **Mơ hồ** | Câu không kiểm tra được bằng máy — "hiển thị top các chiến dịch" (top mấy? xếp theo gì?) | **Sửa ngay** bằng cách chốt một con số, rồi ghi thành giả định mức **Vừa** |
| **Tự suy diễn chưa ghi ra** | Chỗ lấp chỗ trống bằng suy luận hợp lý mà quên đưa vào mục giả định | **Bổ sung vào mục giả định** của đúng file đó |

Chỗ hay mâu thuẫn nhất, kiểm riêng:

- Tên KPI trong `specification.md` §5 ↔ nhãn thẻ KPI trong `components.md` §2.
- Chart nào có legend: `specification.md` ↔ `layout.md` §6 ↔ `components.md` §4. Ba file, một sự thật.
- Chiều cao vẽ trong `layout.md` §5 đã trừ legend chưa, và có khớp với loại chart mà `specification.md` chọn không.
- Bốn ngưỡng trong `specification.md` §9 ↔ KPI nào được tô màu trong `components.md` §2. KPI tô màu mà không có ngưỡng tương ứng là mâu thuẫn.
- Số lựa chọn chỉ số: phải đúng 4 ở cả `specification.md` §6 lẫn `components.md` §6.
- Thang `--series-*` trong `design.md` §3 ↔ màu chuỗi mô tả ở `components.md` §4.

### 7.3 Gom giả định

Đọc mục `## Giả định cần bạn xác nhận` của cả bốn file và kiểm ba điều:

1. **Đánh số liên tục** `G1 → Gn` xuyên bốn file, không trùng, không nhảy cóc.
2. **Đủ ba phần** ở mọi dòng: quyết định gì · vì sao · nếu sai thì sửa ở đâu. Thiếu dòng "nếu sai" là giả định chưa dùng được.
3. **Có mức rủi ro** ở mọi dòng, và mức gán đúng theo bảng ở đầu tài liệu này. Kiểm ngược một lượt: mọi giả định về PRIMARY_DIM, METRIC/ATTRIBUTE, bốn ngưỡng và domain **phải** ở mức Cao. Nhóm này mà lọt xuống Vừa thì người dùng sẽ lướt qua đúng chỗ cần đọc kỹ nhất.

Rồi xếp lại theo mức: **Cao → Vừa → Thấp**. Trong cùng một mức thì giữ thứ tự số.

### 7.4 Báo cáo cuối

In đúng định dạng ở `../SKILL.md` mục Output Contract:

```
✓ docs/1-spec/specification.md      (N dòng)
✓ docs/2-design/design.md           (N dòng)
✓ docs/2-design/layout.md           (N dòng)
✓ docs/2-design/components.md       (N dòng)

Đã đọc: <nguồn dữ liệu>, <số cột> cột, <số dòng> dòng sample

Giả định cần bạn xác nhận — <số lượng>, gom theo mức rủi ro:
  Cao   G1 …   (sai là phải dựng lại spec)
  Vừa   G4 …   (sai là sửa một mục)
  Thấp  G9 …   (sai cũng không ảnh hưởng bố cục)
```

Ba dòng nhóm chỉ liệt kê số hiệu và một mẩu nội dung đủ nhận ra — chi tiết đầy đủ đã nằm trong file, chép lại vào chat là làm báo cáo dài hơn cả tài liệu.

Sau báo cáo, **dừng**. Không tự sửa theo suy đoán thêm, không tự chuyển sang `dashboard-build`. Đợi người dùng review.

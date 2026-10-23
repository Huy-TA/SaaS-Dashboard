# Đọc dataset

Bước 1 của workflow. Cần **header row + ít nhất 5 dòng sample** trước khi quyết bất cứ điều gì.

Lý do phải có dòng sample, không chỉ tên cột: `budget` là METRIC hay ATTRIBUTE thì tên cột không nói được — phải nhìn giá trị có lặp lại trên mọi dòng của cùng một chiến dịch hay không. Đoán sai chỗ này là cả dashboard sai.

---

## Google Sheets

### Biến môi trường

Nằm ở `.env.local` trong **gốc Next.js** (`Dashboard/app/.env.local`), không phải gốc project:

```
GOOGLE_SHEETS_SPREADSHEET_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=sheets-reader@....iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Tên tab do người dùng nêu trong prompt (ví dụ `Dashboard_Data`). Không đoán tên tab.

### Đoạn đọc

Chạy bằng `node` ngay trong `Dashboard/app/`, nơi `googleapis` đã được cài:

```js
// scripts/peek.mjs — chỉ để xem schema, không phải code của app
import 'dotenv/config';
import { google } from 'googleapis';

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  range: 'Dashboard_Data!A1:Z6',        // header + 5 dòng
});

console.log(JSON.stringify(res.data.values, null, 2));
```

Xoá file này sau khi đọc xong. Nó không thuộc danh sách file của `dashboard-build`.

### `\n` trong private key — chỗ hỏng nhiều nhất

File `.env.local` lưu private key thành **chuỗi một dòng** với `\n` là hai ký tự `\` và `n`, không phải ký tự xuống dòng. Thư viện cần xuống dòng thật:

```js
key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
```

Quên dòng `.replace()` là lỗi `error:1E08010C:DECODER routines::unsupported` — thông báo không hề nhắc gì tới xuống dòng.

### Bốn lỗi thường gặp

| Thông báo | Nguyên nhân |
|---|---|
| `The caller does not have permission` | Chưa share Sheet cho `client_email` của service account |
| `Unable to parse range` | Sai tên tab, hoặc tên tab có dấu cách mà không bọc nháy đơn: `'Dashboard Data'!A1:Z6` |
| `DECODER routines::unsupported` | Thiếu `.replace(/\\n/g, '\n')` |
| Trả về mảng rỗng | Đúng tab nhưng sai vùng, hoặc sheet trống |

Lỗi thứ nhất là lỗi hay gặp nhất, và nó **không phải lỗi code** — service account là một tài khoản riêng, phải được share như share cho người thật.

---

## CSV

```bash
head -6 duong/dan/file.csv
```

Đủ cho bước 1. Nếu file dùng `;` thay `,` (Excel bản tiếng Việt hay xuất kiểu này) thì ghi vào giả định — nó ảnh hưởng tới code đọc file ở `dashboard-build`.

---

## Chỉ có danh sách cột

Vẫn chạy được, nhưng **ghi rõ vào mục giả định** rằng chưa thấy giá trị thật, và nêu đúng những gì bị ảnh hưởng:

- Phân biệt METRIC / ATTRIBUTE (đoán theo tên cột)
- Số giá trị riêng biệt của mỗi dimension → chọn PRIMARY_DIM
- Độ lớn của các chỉ số → bốn ngưỡng nghiệp vụ

Ba thứ này đều thuộc mức rủi ro **Cao**: sai là phải dựng lại spec.

---

## Đọc xong thì ghi lại gì

Trước khi sang bước 2, ghi vào `specification.md` mục "Nguồn dữ liệu":

| Mục | Ví dụ |
|---|---|
| Nguồn | Google Sheets, tab `Dashboard_Data` |
| Số cột | 9 |
| Số dòng đã xem | 5 (header + 5) |
| Tổng số dòng | 340 — nếu đọc được; nếu không thì ghi "chưa biết" |
| Khoảng thời gian | 2026-06-01 → 2026-08-31 |
| Cột thiếu giá trị | `campaign_budget` trống ở 2/5 dòng sample |

Mục cuối quan trọng hơn vẻ ngoài của nó: cột hay trống thì không làm KPI được, và đó là thứ chỉ thấy khi nhìn dữ liệu thật.

---

## Không làm

- **Không ghi credential vào bất cứ tài liệu nào.** `specification.md` chỉ nêu *tên biến*, không nêu giá trị.
- **Không đọc quá 20 dòng.** Đây là bước xem schema, không phải bước phân tích.
- **Không sửa Sheet.** Quyền là `spreadsheets.readonly`, và skill này chỉ thiết kế.

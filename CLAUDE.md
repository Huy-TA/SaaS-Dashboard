# CLAUDE.md — Dashboard

> Kế thừa `../CLAUDE.md`. File này chỉ chứa luật riêng của Project Dashboard.

## Mục đích

Dashboard theo dõi **churn** và **MRR** của một sản phẩm SaaS bán gói thuê bao hằng tháng.

- **Người xem:** CEO, các cấp quản lý liên quan, đội Growth/Finance.
- **Cần trả lời được:**
  - Tổng MRR và churn rate hiện tại; khách hàng và doanh thu phân bổ theo gói ra sao.
  - Gói / khu vực nào churn cao nhất; tenure ảnh hưởng đến churn thế nào.
- **Vì sao quan trọng:** giữ một khách cũ rẻ hơn nhiều so với có thêm một khách mới, nên cần thấy sớm rủi ro để chăm sóc kịp thời.
- **Ngoài phạm vi:** dự đoán khách sắp churn và revenue at risk (bài predictive/classification).

## Cấu trúc

```text
Dashboard/
├── CLAUDE.md              luật riêng của Project (file này)
├── MEMORY.md              kiến thức riêng của Project/dataset
├── .claude/skills/
│   ├── dashboard-design/  skill viết 4 tài liệu thiết kế trong docs/
│   └── dashboard-build/   skill dựng app trong app/ từ 4 tài liệu đó
├── docs/                  tài liệu — nguồn sự thật, nằm NGOÀI app
│   ├── 1-spec/            specification.md: xây cái gì, cho ai, đo bằng gì
│   └── 2-design/          design.md · layout.md · components.md
└── app/                   gốc Next.js (package.json, .env.local, ...)
    └── app/               App Router — hai chữ `app` lồng nhau là đúng
```

## Quy tắc làm việc

- **Thứ tự cố định:** `dashboard-design` → người dùng review, chốt `docs/` → `dashboard-build`. Không tự chuyển bước khi chưa được chốt.
- **Tài liệu trước, code sau.** Muốn đổi thiết kế hay chức năng thì sửa `docs/` trước, rồi mới sửa code.
- **Không bịa nội dung sản phẩm.** Mục đích, KPI, chức năng lấy từ dataset thật và từ người dùng; chỗ nào phải tự suy ra thì ghi vào mục giả định của tài liệu.
- **Môi trường đã dựng sẵn.** Không chạy lại `create-next-app`, không `npm install` thêm khi chưa được đồng ý.
- **Credential chỉ nằm ở `app/.env.local`.** Không ghi giá trị credential vào `docs/`, `MEMORY.md` hay chat; không commit file `.env*`.
- **Lệnh npm chạy trong `app/`,** không chạy ở `Dashboard/`.

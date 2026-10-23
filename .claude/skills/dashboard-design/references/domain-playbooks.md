# Domain Playbooks

Chọn **một** domain. Mỗi playbook cho sẵn: dimension, chỉ số phái sinh, 5 KPI, ngưỡng.

Nếu dataset không khớp playbook nào, dùng **Marketing** làm khuôn rồi thay chỉ số — cấu trúc 4 trang / 5 KPI / 4 chart giữ nguyên.

---

## Marketing — playbook chuẩn của bộ dạy

Dataset trên lớp: `marketpulse_campaign_daily.csv`. Từ điển cột, bẫy và số liệu tham chiếu nằm ở `dataset/schema.md` (tính từ thư mục gốc dự án).

**Nhận diện:** có `spend` + ít nhất một trong `impressions` / `clicks` / `leads` / `conversions`, kèm cột kênh hoặc chiến dịch.

| Vai trò | Cột |
|---|---|
| DATE | `date` |
| PRIMARY_DIM | `channel` (5 giá trị) |
| SECONDARY_DIM | `campaign` (12) · `objective` (4) |
| METRIC | `spend` `impressions` `clicks` `leads` `qualified_leads` `conversions` `revenue` |
| ATTRIBUTE | `campaign_budget` — **MAX, không SUM** |

### Chỉ số phái sinh

```
ROAS  = SUM(revenue) / SUM(spend)
CPL   = SUM(spend)   / SUM(leads)
CPA   = SUM(spend)   / SUM(conversions)
CTR   = SUM(clicks)  / SUM(impressions)
CPC   = SUM(spend)   / SUM(clicks)
CPM   = SUM(spend)   / SUM(impressions) × 1000
% ngân sách = SUM(spend) toàn kỳ / MAX(campaign_budget)
```

### 4 lựa chọn chỉ số
`Chi phí` · `Doanh thu` · `Conversion` · `ROAS`

### 5 KPI

| KPI | Chiều tốt | Đường chuẩn |
|---|---|---|
| Chi phí | thấp hơn tốt hơn | trung bình kỳ |
| Doanh thu | cao hơn tốt hơn | trung bình kỳ |
| Conversion | cao hơn tốt hơn | trung bình kỳ |
| CPL | thấp hơn tốt hơn | **ngưỡng 250.000** → xanh/đỏ |
| ROAS | cao hơn tốt hơn | **mục tiêu 4,0x** → xanh/đỏ |

### Ngưỡng cảnh báo
```
CPL   > 250.000 VND
ROAS  < 1,00x            → lỗ
ROAS  ≥ 4,00x            → mục tiêu
Ngân sách đã dùng > 80%
```

### Bẫy riêng của domain này
Chiến dịch `Awareness` **luôn** có ROAS thấp vì mục tiêu là hiển thị, không phải bán. Không được xếp chung một rổ với chiến dịch `Conversion`. Dashboard phải cho lọc theo `objective`, và spec phải ghi rõ điều này ở mục Ghi chú.

---

## Sales / Bán hàng

**Nhận diện:** có `revenue` hoặc `order_value`, kèm sản phẩm / cửa hàng / nhân viên bán.

| Vai trò | Cột điển hình |
|---|---|
| PRIMARY_DIM | `region` hoặc `store` |
| SECONDARY_DIM | `product_category` · `sales_rep` |
| METRIC | `orders` `units` `revenue` `cost` `discount` |
| ATTRIBUTE | `target_quota` — MAX |

```
AOV          = SUM(revenue) / SUM(orders)
Biên lợi nhuận = (SUM(revenue) − SUM(cost)) / SUM(revenue)
% chiết khấu  = SUM(discount) / SUM(revenue)
% đạt chỉ tiêu = SUM(revenue) / MAX(target_quota)
```

**Chỉ số:** `Doanh thu` · `Số đơn` · `AOV` · `Biên lợi nhuận`
**KPI:** Doanh thu · Số đơn · AOV · Biên lợi nhuận (ngưỡng) · % đạt chỉ tiêu (ngưỡng)

---

## Logistics / Vận hành

**Nhận diện:** có thời gian giao, tuyến, kho, trạng thái đơn.

| Vai trò | Cột điển hình |
|---|---|
| PRIMARY_DIM | `warehouse` hoặc `route` |
| SECONDARY_DIM | `carrier` · `service_level` |
| METRIC | `shipments` `delivered` `late` `returned` `cost` `distance_km` |
| ATTRIBUTE | `warehouse_capacity` — MAX |

```
Tỷ lệ đúng hẹn = SUM(delivered − late) / SUM(delivered)
Tỷ lệ hoàn     = SUM(returned) / SUM(shipments)
Chi phí / đơn  = SUM(cost) / SUM(shipments)
Thời gian giao TB = SUM(giờ giao) / SUM(delivered)     ← không phải AVG cột giờ
```

**Chỉ số:** `Số đơn` · `Tỷ lệ đúng hẹn` · `Chi phí/đơn` · `Tỷ lệ hoàn`
**Ngưỡng:** đúng hẹn ≥ 95% · hoàn < 3% · dùng > 85% công suất kho

---

## HR / Nhân sự

**Nhận diện:** có headcount, phòng ban, tuyển dụng, nghỉ việc.

| Vai trò | Cột điển hình |
|---|---|
| PRIMARY_DIM | `department` |
| SECONDARY_DIM | `level` · `location` |
| METRIC | `headcount` `hires` `leavers` `payroll_cost` `open_roles` |
| ATTRIBUTE | `headcount_budget` — MAX |

```
Tỷ lệ nghỉ việc = SUM(leavers) / AVG(headcount)
Chi phí/người   = SUM(payroll_cost) / AVG(headcount)
Tăng trưởng ròng = SUM(hires) − SUM(leavers)
% lấp đầy       = AVG(headcount) / MAX(headcount_budget)
```

⚠ Ở HR, `headcount` là **ảnh chụp tại một thời điểm**, không cộng dồn qua ngày. Cộng headcount của 30 ngày cho ra số vô nghĩa. Dùng giá trị của **ngày cuối kỳ** hoặc trung bình, và ghi rõ trong spec.

**Chỉ số:** `Headcount` · `Tuyển mới` · `Nghỉ việc` · `Chi phí/người`
**Ngưỡng:** nghỉ việc < 12%/năm · lấp đầy ≥ 90%

---

## Finance / Tài chính

**Nhận diện:** có doanh thu, chi phí, dòng tiền theo khoản mục.

| Vai trò | Cột điển hình |
|---|---|
| PRIMARY_DIM | `cost_center` hoặc `business_unit` |
| SECONDARY_DIM | `account` · `category` |
| METRIC | `revenue` `cogs` `opex` `cash_in` `cash_out` |
| ATTRIBUTE | `annual_budget` — MAX |

```
Biên gộp    = (revenue − cogs) / revenue
Biên hoạt động = (revenue − cogs − opex) / revenue
Dòng tiền ròng = cash_in − cash_out
% ngân sách  = SUM(opex) / MAX(annual_budget)
```

**Chỉ số:** `Doanh thu` · `Chi phí` · `Biên gộp` · `Dòng tiền ròng`

⚠ Ở tài chính, số âm là bình thường. Thang chart phải chứa được giá trị âm, và có đường zero rõ ràng. Đừng dùng `Math.max(0, v)` để "làm sạch" — sẽ giấu mất khoản lỗ.

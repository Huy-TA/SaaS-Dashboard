'use client';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { CV } from '@/lib/tokens';

/* #viewport (mặt bàn --page, lề bằng `scale: .94` trong CSS) bọc #stage (tấm 1600×900).
   #stage là nơi DUY NHẤT có transform — hàm fit gán inline.
   `stageClass` mang các trạng thái mà globals.css bám vào: rail · drawer · modal.

   G23 (design.md §4): --ink3 chỉ đạt 2,5:1 nên không được dùng cho chữ. globals.css
   (chép nguyên văn) vẫn tô một số chữ bằng --ink3, nên trong #stage ta trỏ --ink3
   về --ink2 — không sửa token gốc, không thêm hex. */
const INK3_AS_INK2 = { '--ink3': 'var(--ink2)' } as CSSProperties;

/* Vị trí cho tooltip .tip (globals.css: position:fixed). #stage có transform nên nó là khối
   chứa của .tip ⇒ toạ độ tính theo hệ 1600×900 của stage, chia cho hệ số scale. */
export function tipPosition(el: Element, width: number, place: 'below' | 'right' = 'below'): { left: number; top: number } | null {
  const stage = document.getElementById('stage');
  if (!stage) return null;
  const r = el.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  const k = s.width / CV.w || 1;
  if (place === 'right') return { left: (r.right - s.left) / k + 8, top: (r.top - s.top) / k };
  return { left: Math.min((r.left - s.left) / k, CV.w - width - 16), top: (r.bottom - s.top) / k + 4 };
}

export function Shell({ children, stageClass = '' }: { children: ReactNode; stageClass?: string }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(Math.min(innerWidth / CV.w, innerHeight / CV.h));
    fit();
    addEventListener('resize', fit);
    return () => removeEventListener('resize', fit);
  }, []);

  return (
    <div id="viewport">
      <div id="stage" className={stageClass} style={{ ...INK3_AS_INK2, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

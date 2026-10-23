import 'server-only';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/* Đăng nhập Google, chỉ email trong ALLOWED_EMAILS (app/.env.local).
   ALLOWED_EMAILS: phân tách bằng dấu phẩy. Mục bắt đầu bằng "@" cho cả tên miền,
   ví dụ "ceo@congty.vn, @congty.vn". Danh sách rỗng ⇒ không ai vào được (đóng mặc định). */
export function isAllowed(email?: string | null): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  const list = (process.env.ALLOWED_EMAILS ?? '')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.some((rule) => (rule.startsWith('@') ? e.endsWith(rule) : e === rule));
}

export const authSecret = process.env.AUTH_SECRET;

/* Tên biến cần có — trang Nguồn dữ liệu hiện trạng thái có/không, không bao giờ hiện giá trị. */
export const AUTH_ENV = ['AUTH_SECRET', 'AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET', 'ALLOWED_EMAILS'] as const;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
  ],
  secret: authSecret,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },   // một ngày làm việc
  pages: { signIn: '/', error: '/' },
  callbacks: {
    /* Email ngoài danh sách: Google đăng nhập thành công nhưng bị từ chối,
       quay về màn đăng nhập kèm email bị từ chối để người dùng biết đổi tài khoản. */
    signIn({ user }) {
      if (isAllowed(user.email)) return true;
      return `/?error=AccessDenied&email=${encodeURIComponent(user.email ?? '')}`;
    },
  },
};

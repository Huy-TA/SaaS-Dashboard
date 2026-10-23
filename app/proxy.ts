import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authSecret, isAllowed } from '@/lib/auth';

/* Lớp chặn thứ nhất: chưa đăng nhập (hoặc email đã bị gỡ khỏi ALLOWED_EMAILS) thì
   trang → về màn đăng nhập "/", API → 401. Lớp thứ hai nằm ngay trong /api/data. */
export async function proxy(req: NextRequest) {
  const token = authSecret ? await getToken({ req, secret: authSecret }) : null;   // thiếu secret ⇒ đóng mặc định
  if (token && isAllowed(token.email)) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Chưa đăng nhập hoặc không có quyền.' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/', req.url));
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/data'],
};

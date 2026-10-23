import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/* Endpoint của NextAuth: /api/auth/signin, /callback/google, /session, /signout… */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

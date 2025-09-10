import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl.clone();

  // ถ้าไม่มี token และพยายามเข้า protected path
  if (!token && (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/departments'))) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/departments/:path*'],
};
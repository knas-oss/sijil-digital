import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('esijil-session')?.value;
  if (token) {
    destroySession(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('esijil-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}

import { NextResponse } from 'next/server';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'theobroma-digital',
  });
}

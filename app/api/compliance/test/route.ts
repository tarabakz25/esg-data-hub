import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'コンプライアンスAPI テスト成功',
    timestamp: new Date().toISOString(),
    status: 'working'
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'コンプライアンスAPI POST テスト成功',
    timestamp: new Date().toISOString(),
    status: 'working'
  });
} 
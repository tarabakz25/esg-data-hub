import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// グローバル型の定義
declare global {
  var prismaCtx: {
    userId: string;
    ip: string;
    timestamp: Date;
  };
}

export function middleware(req: NextRequest) {
  try {
    // ユーザーIDの取得（デフォルト値の改善）
    const user = req.headers.get("x-user-id") || "anonymous";
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "0.0.0.0";
    
    // リクエストヘッダーの設定
    req.headers.set("x-internal-user", user);
    req.headers.set("x-request-timestamp", new Date().toISOString());
    
    // グローバルコンテキストの設定
    (global as any).prismaCtx = { 
      userId: user, 
      ip: ip,
      timestamp: new Date()
    };

    // 開発環境でのログ出力
    if (process.env.NODE_ENV === "development") {
      console.log(`[Middleware] User: ${user}, IP: ${ip}, Path: ${req.nextUrl.pathname}`);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware Error]:", error);
    // エラーが発生してもリクエストを通す
    return NextResponse.next();
  }
}

// ミドルウェアの適用パスを設定
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
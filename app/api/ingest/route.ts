import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { auth } from '@/lib/auth';

// セキュリティ設定
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (本番用に増加)
const ALLOWED_FILE_TYPES = ['.csv', '.xlsx', '.xls', '.json'];
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分
const RATE_LIMIT_REQUESTS = 10; // 1分間に10回まで

// レート制限用のメモリキャッシュ（本番では Redis推奨）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// セキュリティ：ファイル名のサニタイズ
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.\-_]/g, '_') // 許可文字以外を_に変換
    .replace(/\.{2,}/g, '.') // 連続ドットを単一ドットに
    .replace(/^\.+|\.+$/g, '') // 先頭・末尾のドットを削除
    .substring(0, 255); // ファイル名長制限
};

// レート制限チェック
const checkRateLimit = (clientId: string): boolean => {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    // 新しいウィンドウを開始
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  clientData.count++;
  return true;
};

// ログ記録関数
const logActivity = (level: 'info' | 'warn' | 'error', message: string, metadata?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    service: 'data-ingest',
    message,
    ...metadata
  };

  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  try {
    // レート制限チェック
    if (!checkRateLimit(clientIp)) {
      logActivity('warn', 'Rate limit exceeded', { clientIp });
      return NextResponse.json(
        { error: 'アップロード頻度が高すぎます。しばらく待ってから再試行してください。' },
        { status: 429 }
      );
    }

    // 認証チェック（本番環境では必須）
    let userId = 1; // デフォルトユーザー
    try {
      const session = await auth();
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        });
        if (user) {
          userId = user.id;
        }
      }
    } catch (authError) {
      logActivity('warn', 'Authentication check failed', { error: authError });
    }

    // フォームデータの解析
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // 基本バリデーション
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが指定されていません' },
        { status: 400 }
      );
    }

    // ファイル形式の厳密な検証
    const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      logActivity('warn', 'Invalid file type uploaded', { 
        fileName: file.name, 
        fileType: fileExtension,
        clientIp 
      });
      return NextResponse.json(
        { error: `サポートされていないファイル形式です。許可されている形式: ${ALLOWED_FILE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // ファイルサイズの検証
    if (file.size > MAX_FILE_SIZE) {
      logActivity('warn', 'File size exceeded', { 
        fileName: file.name, 
        fileSize: file.size,
        maxSize: MAX_FILE_SIZE,
        clientIp 
      });
      return NextResponse.json(
        { error: `ファイルサイズは${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB以下である必要があります` },
        { status: 400 }
      );
    }

    // 空ファイルチェック
    if (file.size === 0) {
      return NextResponse.json(
        { error: '空のファイルはアップロードできません' },
        { status: 400 }
      );
    }

    // アップロード用ディレクトリの確保
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true, mode: 0o755 });
    }

    // セキュアなファイル名の生成
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFileName = sanitizeFileName(file.name);
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${uniqueId}_${sanitizedFileName}`;
    const filePath = join(uploadsDir, fileName);

    // ファイルの保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer, { mode: 0o644 });

    // CSVファイルの基本検証（ヘッダー存在チェック）
    if (fileExtension === '.csv') {
      const fileContent = buffer.toString('utf8', 0, Math.min(1024, buffer.length));
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        logActivity('warn', 'Invalid CSV structure', { fileName: file.name, clientIp });
        return NextResponse.json(
          { error: 'CSVファイルにはヘッダーとデータ行が必要です' },
          { status: 400 }
        );
      }
    }

    const s3Key = `uploads/${fileName}`;

    // デフォルトユーザーの確認・作成
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser && userId === 1) {
      await prisma.user.create({
        data: {
          id: userId,
          email: 'system@esg-data-hub.com',
          name: 'System User',
          password: null,
        }
      });
    }

    // データベースにアップロード記録を作成
    const upload = await prisma.upload.create({
      data: {
        filename: file.name,
        s3Key: s3Key,
        userId: userId,
        status: 'parsed',
        createdAt: new Date(),
      },
    });

    const processingTime = Date.now() - startTime;

    logActivity('info', 'File upload successful', {
      uploadId: upload.id,
      fileName: file.name,
      fileSize: file.size,
      processingTimeMs: processingTime,
      clientIp,
      userId
    });

    return NextResponse.json(
      { 
        uploadId: upload.id.toString(),
        filename: file.name,
        fileSize: file.size,
        processingTimeMs: processingTime,
        message: 'ファイルのアップロードが完了しました'
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logActivity('error', 'File upload failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTimeMs: processingTime,
      clientIp
    });
    
    // 本番環境では詳細なエラー情報を隠す
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json(
      { 
        error: 'ファイルのアップロードに失敗しました',
        ...(isDevelopment && { 
          details: error instanceof Error ? error.message : 'Unknown error' 
        })
      },
      { status: 500 }
    );
  }
} 
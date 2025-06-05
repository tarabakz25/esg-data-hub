import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが指定されていません' },
        { status: 400 }
      );
    }

    // ファイル形式の検証
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'CSVファイルのみサポートされています' },
        { status: 400 }
      );
    }

    // ファイルサイズの検証 (10MB制限)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下である必要があります' },
        { status: 400 }
      );
    }

    // アップロード用ディレクトリの確保
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // ファイル名の生成（重複を避けるためタイムスタンプを追加）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-_]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = join(uploadsDir, fileName);

    // ファイルの保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // s3Key: ファイルパスをS3のキー風に変換（今回はローカルなのでファイル名をユニークキーとして使用）
    const s3Key = `uploads/${fileName}`;

    // userId: とりあえずデフォルトユーザーIDを使用（認証システムが実装されるまでの暫定措置）
    // 実際のアプリでは、認証システムから現在のユーザーIDを取得する必要があります
    let defaultUserId = 1;
    
    // デフォルトユーザーが存在しない場合は作成
    const existingUser = await prisma.user.findUnique({
      where: { id: defaultUserId }
    });

    if (!existingUser) {
      const defaultUser = await prisma.user.create({
        data: {
          id: defaultUserId,
          email: 'system@esg-data-hub.com',
          name: 'System User',
          password: null, // パスワードフィールドを明示的にnullに設定
        }
      });
      defaultUserId = defaultUser.id;
    }

    // データベースにアップロード記録を作成
    const upload = await prisma.upload.create({
      data: {
        filename: file.name,
        s3Key: s3Key,
        userId: defaultUserId,
        status: 'parsed', // デフォルトステータス
        createdAt: new Date(),
      },
    });

    console.log(`ファイルアップロード完了: ${file.name} -> Upload ID: ${upload.id}`);

    return NextResponse.json(
      { 
        uploadId: upload.id.toString(),
        filename: file.name,
        fileSize: file.size,
        message: 'ファイルのアップロードが完了しました'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    
    return NextResponse.json(
      { 
        error: 'ファイルのアップロードに失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/utils/db'
import { UserRole, UserRoleSchema } from '@/types/auth'
import { z } from 'zod'

const RegisterSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  name: z.string().min(1, '名前は必須です'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
  role: UserRoleSchema.optional().default('viewer'),
  department: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password, role, department } = RegisterSchema.parse(body)

    // 既存ユーザーの確認
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

    // ユーザーを作成
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'viewer',
        department: department || '',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: 'ユーザーの登録が完了しました',
      user
    })

  } catch (error) {
    console.error('ユーザー登録エラー:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力データが無効です', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'ユーザー登録に失敗しました' },
      { status: 500 }
    )
  }
} 
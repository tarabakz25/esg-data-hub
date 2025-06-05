#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

function askPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin
    const stdout = process.stdout

    stdout.write(question)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    let password = ''
    stdin.on('data', (char) => {
      char = char.toString()
      
      if (char === '\n' || char === '\r' || char === '\u0004') {
        stdin.setRawMode(false)
        stdin.pause()
        stdout.write('\n')
        resolve(password)
      } else if (char === '\u0003') {
        // Ctrl+C
        process.exit()
      } else if (char === '\u007f') {
        // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1)
          stdout.write('\b \b')
        }
      } else {
        password += char
        stdout.write('*')
      }
    })
  })
}

async function createAdmin() {
  try {
    console.log('🔧 ESGデータハブ 初期管理者ユーザー作成')
    console.log('========================================\n')

    // 既存の管理者ユーザーをチェック
    const existingAdmins = await prisma.user.findMany({
      where: { role: 'admin' }
    })

    if (existingAdmins.length > 0) {
      console.log('⚠️  管理者ユーザーが既に存在します:')
      existingAdmins.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.email})`)
      })
      
      const proceed = await askQuestion('\n新しい管理者を追加しますか？ (y/N): ')
      if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
        console.log('管理者作成をキャンセルしました。')
        return
      }
    }

    // ユーザー情報の入力
    const email = await askQuestion('管理者のメールアドレス: ')
    const name = await askQuestion('管理者の名前: ')
    const department = await askQuestion('部署名 (オプション): ')
    const password = await askPassword('パスワード (8文字以上): ')

    // バリデーション
    if (!email || !email.includes('@')) {
      throw new Error('有効なメールアドレスを入力してください')
    }
    if (!name.trim()) {
      throw new Error('名前は必須です')
    }
    if (password.length < 8) {
      throw new Error('パスワードは8文字以上である必要があります')
    }

    // 既存ユーザーの確認
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('このメールアドレスは既に使用されています')
    }

    // パスワードをハッシュ化
    console.log('\n🔄 ユーザーを作成中...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // ユーザーを作成
    const admin = await prisma.user.create({
      data: {
        email,
        name: name.trim(),
        password: hashedPassword,
        role: 'admin',
        department: department.trim() || null,
      }
    })

    console.log('\n✅ 管理者ユーザーが正常に作成されました!')
    console.log(`   名前: ${admin.name}`)
    console.log(`   メール: ${admin.email}`)
    console.log(`   役割: 管理者`)
    if (admin.department) {
      console.log(`   部署: ${admin.department}`)
    }
    console.log(`\n🚀 これでアプリケーションにログインできます。`)

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

createAdmin() 
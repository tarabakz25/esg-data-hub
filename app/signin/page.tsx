"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("認証に失敗しました")
      } else {
        const session = await getSession()
        if (session) {
          router.push("/dashboard")
        }
      }
    } catch (error) {
      setError("エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ESG Data Hub ログイン</CardTitle>
          <CardDescription>
            認証情報を入力してログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            <p>テストアカウント:</p>
            <ul className="list-disc list-inside">
              <li>admin@example.com (管理者)</li>
              <li>ir@example.com (IR担当者)</li>
              <li>auditor@example.com (監査担当者)</li>
            </ul>
            <p>パスワード: password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
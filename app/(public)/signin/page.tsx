"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Lock, Mail, Eye, EyeOff, User } from "lucide-react"
import { ESGIcon } from "@/components/ui/esg-theme"

export default function SignInPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (mode === "signin") {
        // ログイン処理
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError("認証に失敗しました。メールアドレスとパスワードを確認してください。")
        } else {
          const session = await getSession()
          if (session) {
            router.push("/")
          }
        }
      } else {
        // 新規登録処理
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            name,
            role: "viewer", // デフォルトは閲覧者権限
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "登録に失敗しました")
        } else {
          setSuccess("アカウントの作成が完了しました。ログインしてください。")
          setMode("signin")
          setPassword("")
          setName("")
        }
      }
    } catch (error) {
      setError("エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <ESGIcon category="environment" size="lg" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ESG Data Hub</h1>
            <p className="text-muted-foreground">
              ESGデータ管理プラットフォーム
            </p>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-background/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            {/* タブ切り替え */}
            <div className="flex bg-muted rounded-lg p-1 mb-4">
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                  mode === "signin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  setMode("signin")
                  setError("")
                  setSuccess("")
                }}
              >
                ログイン
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                  mode === "register"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  setMode("register")
                  setError("")
                  setSuccess("")
                }}
              >
                新規登録
              </button>
            </div>

            <CardTitle className="text-xl text-center">
              {mode === "signin" ? "ログイン" : "新規登録"}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === "signin" 
                ? "メールアドレスとパスワードでログインしてください"
                : "新しいアカウントを作成してください"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Credentials Form */}
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {/* 名前フィールド - 新規登録モードのみ表示 */}
              {mode === "register" && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    お名前
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full h-12 pl-10 pr-4 text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="田中太郎"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 pl-10 pr-4 text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  パスワード
                  {mode === "register" && (
                    <span className="text-xs text-muted-foreground ml-1">（8文字以上）</span>
                  )}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={mode === "register" ? 8 : undefined}
                    className="w-full h-12 pl-10 pr-12 text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    placeholder={mode === "register" ? "8文字以上のパスワード" : "パスワードを入力"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-700 font-medium">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                    <span>{mode === "signin" ? "ログイン中..." : "登録中..."}</span>
                  </div>
                ) : (
                  mode === "signin" ? "ログイン" : "アカウントを作成"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Information */}
        <div className="text-center text-sm text-muted-foreground">
          {mode === "register" && (
            <p>
              作成されるアカウントは閲覧者権限となります。管理者権限が必要な場合は管理者にお問い合わせください。
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 
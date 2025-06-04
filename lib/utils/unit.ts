// 単位ごとの変換係数を定義（基準単位：kg, m3）
const factor: Record<string, number> = {
  kg: 1,      // キログラム
  t: 1000,    // トン（1t = 1000kg）
  g: 0.001,   // グラム（1g = 0.001kg）
  m3: 1,      // 立方メートル
  l: 0.001,   // リットル（1l = 0.001m3）
}

// 単位変換関数
// value: 変換したい値
// from: 変換元の単位
// to: 変換先の単位
export function convertUnit(value: number, from: string, to: string) {
  // サポートされていない単位の場合はエラーを投げる
  if (!factor[from] || !factor[to]) {
    throw new Error(`Unsupported unit: ${from} or ${to}`)
  }
  // 基準単位に換算してから目的の単位に変換
  return value * factor[from] / factor[to]
}

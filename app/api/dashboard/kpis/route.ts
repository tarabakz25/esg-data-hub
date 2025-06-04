import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // サンプルKPIデータ（実際の実装では DB から取得）
    const kpis = [
      {
        id: "co2_emissions",
        title: "CO₂排出量",
        value: 442,
        unit: "t-CO₂",
        trend: "down",
        trendValue: "-3.2%",
        status: "good",
        description: "前月比",
      },
      {
        id: "energy_consumption", 
        title: "エネルギー消費量",
        value: 1180,
        unit: "MWh",
        trend: "up",
        trendValue: "+2.1%", 
        status: "warning",
        description: "前月比",
      },
      {
        id: "waste_recycling",
        title: "リサイクル率",
        value: 82,
        unit: "%",
        trend: "up",
        trendValue: "+1.5%",
        status: "good",
        description: "前月比",
      },
      {
        id: "data_completeness",
        title: "データ完全性",
        value: 94,
        unit: "%",
        trend: "neutral",
        trendValue: "0%",
        status: "good",
        description: "必須項目入力率",
      },
      {
        id: "audit_issues",
        title: "監査指摘事項",
        value: 3,
        unit: "件",
        trend: "down",
        trendValue: "-60%",
        status: "good",
        description: "前回比",
      },
      {
        id: "compliance_score",
        title: "コンプライアンススコア",
        value: 78,
        unit: "%",
        trend: "up",
        trendValue: "+5%",
        status: "warning",
        description: "ISSB基準",
      },
    ]

    return NextResponse.json({ kpis })
  } catch (error) {
    console.error("Error fetching KPIs:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 
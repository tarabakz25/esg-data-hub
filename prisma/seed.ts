import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 標準KPI定義
const standardKpiDefinitions = [
  // Environment (環境) - Scope1・Scope2排出量
  {
    id: 'CO2_SCOPE1',
    name: 'Scope1排出量',
    category: 'Environment',
    description: '直接排出量（燃料燃焼等による温室効果ガス排出）',
    preferredUnit: 't-CO2',
    aliases: ['GHG_EMISSIONS', 'SCOPE1_EMISSIONS', 'DIRECT_EMISSIONS', 'CO2_DIRECT'],
    isActive: true
  },
  {
    id: 'CO2_SCOPE2',
    name: 'Scope2排出量',
    category: 'Environment',
    description: '間接排出量（購入電力等による温室効果ガス排出）',
    preferredUnit: 't-CO2',
    aliases: ['SCOPE2_EMISSIONS', 'INDIRECT_EMISSIONS', 'ELECTRICITY_EMISSIONS'],
    isActive: true
  },
  {
    id: 'ENERGY_USAGE',
    name: 'エネルギー使用量',
    category: 'Environment',
    description: '総エネルギー消費量',
    preferredUnit: 'MWh',
    aliases: ['ENERGY_CONSUMPTION', 'TOTAL_ENERGY', 'POWER_USAGE'],
    isActive: true
  },
  {
    id: 'WATER_USAGE',
    name: '水使用量',
    category: 'Environment',
    description: '総水消費量',
    preferredUnit: 'm³',
    aliases: ['WATER_CONSUMPTION', 'WATER_INTAKE', 'TOTAL_WATER'],
    isActive: true
  },
  {
    id: 'WASTE_AMOUNT',
    name: '廃棄物総量',
    category: 'Environment',
    description: '総廃棄物発生量',
    preferredUnit: 't',
    aliases: ['TOTAL_WASTE', 'WASTE_GENERATION', 'WASTE_OUTPUT'],
    isActive: true
  },
  {
    id: 'RENEWABLE_ENERGY_RATIO',
    name: '再生可能エネルギー比率',
    category: 'Environment',
    description: '総エネルギー使用量に占める再生可能エネルギーの割合',
    preferredUnit: '%',
    aliases: ['RENEWABLE_RATIO', 'GREEN_ENERGY_RATIO', 'CLEAN_ENERGY_PERCENT'],
    isActive: true
  },
  // Social (社会) - 雇用・ダイバーシティ
  {
    id: 'EMPLOYEE_COUNT',
    name: '従業員数',
    category: 'Social',
    description: '総従業員数',
    preferredUnit: '人',
    aliases: ['TOTAL_EMPLOYEES', 'STAFF_COUNT', 'WORKFORCE_SIZE'],
    isActive: true
  },
  {
    id: 'FEMALE_EMPLOYEE_RATIO',
    name: '女性従業員比率',
    category: 'Social',
    description: '総従業員数に占める女性の割合',
    preferredUnit: '%',
    aliases: ['FEMALE_RATIO', 'WOMEN_PERCENTAGE', 'GENDER_DIVERSITY_FEMALE'],
    isActive: true
  },
  {
    id: 'FEMALE_MANAGEMENT_RATIO',
    name: '女性管理職比率',
    category: 'Social',
    description: '管理職に占める女性の割合',
    preferredUnit: '%',
    aliases: ['FEMALE_MANAGER_RATIO', 'WOMEN_LEADERSHIP_RATIO', 'FEMALE_EXEC_RATIO'],
    isActive: true
  },
  {
    id: 'WORKPLACE_ACCIDENT_RATE',
    name: '労働災害発生率',
    category: 'Social',
    description: '労働災害の発生頻度',
    preferredUnit: '件/100万時間',
    aliases: ['ACCIDENT_RATE', 'INJURY_RATE', 'SAFETY_INCIDENT_RATE'],
    isActive: true
  },
  // Governance (ガバナンス) - 取締役・コンプライアンス
  {
    id: 'INDEPENDENT_DIRECTOR_RATIO',
    name: '独立取締役比率',
    category: 'Governance',
    description: '取締役会における独立取締役の割合',
    preferredUnit: '%',
    aliases: ['INDEPENDENT_BOARD_RATIO', 'EXTERNAL_DIRECTOR_RATIO', 'NON_EXEC_RATIO'],
    isActive: true
  },
  {
    id: 'FEMALE_DIRECTOR_RATIO',
    name: '女性取締役比率',
    category: 'Governance',
    description: '取締役会における女性の割合',
    preferredUnit: '%',
    aliases: ['FEMALE_BOARD_RATIO', 'WOMEN_DIRECTOR_RATIO', 'BOARD_GENDER_DIVERSITY'],
    isActive: true
  },
  {
    id: 'COMPLIANCE_TRAINING_RATE',
    name: 'コンプライアンス研修受講率',
    category: 'Governance',
    description: '従業員のコンプライアンス研修受講割合',
    preferredUnit: '%',
    aliases: ['ETHICS_TRAINING_RATE', 'COMPLIANCE_COMPLETION_RATE'],
    isActive: true
  },
  // Financial - ESG関連財務指標
  {
    id: 'ESG_INVESTMENT_AMOUNT',
    name: 'ESG投資額',
    category: 'Financial',
    description: 'ESG関連への投資金額',
    preferredUnit: '億円',
    aliases: ['SUSTAINABILITY_INVESTMENT', 'GREEN_INVESTMENT', 'ESG_CAPEX'],
    isActive: true
  },
  {
    id: 'CARBON_CREDIT_COST',
    name: 'カーボンクレジット費用',
    category: 'Financial',
    description: 'カーボンオフセットのための費用',
    preferredUnit: '万円',
    aliases: ['OFFSET_COST', 'CARBON_OFFSET_EXPENSE', 'CO2_CREDIT_COST'],
    isActive: true
  },
  {
    id: 'ENVIRONMENTAL_FINE_AMOUNT',
    name: '環境関連罰金額',
    category: 'Financial',
    description: '環境法規制違反による罰金・制裁金',
    preferredUnit: '万円',
    aliases: ['ENV_PENALTY', 'ENVIRONMENTAL_PENALTY', 'ECO_VIOLATION_FINE'],
    isActive: true
  }
]

async function main() {
  console.log('ESGデータハブの初期データを設定中...')

  // 標準KPI定義をデータベースに挿入
  console.log('標準KPI定義を挿入中...')
  
  for (const kpiDef of standardKpiDefinitions) {
    await prisma.standard_kpi_definitions.upsert({
      where: { id: kpiDef.id },
      update: {
        name: kpiDef.name,
        category: kpiDef.category,
        description: kpiDef.description,
        preferredUnit: kpiDef.preferredUnit,
        aliases: kpiDef.aliases,
        isActive: kpiDef.isActive
      },
      create: kpiDef
    })
  }

  console.log(`✅ ${standardKpiDefinitions.length}件の標準KPI定義を挿入しました`)
  console.log('🎉 初期設定が完了しました。アプリケーションの使用準備ができています。')
}

main()
  .catch((e) => {
    console.error('❌ シードデータの挿入中にエラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
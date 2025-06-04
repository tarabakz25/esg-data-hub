import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // テストユーザーを作成
  const testUser = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User'
    }
  })

  console.log('Created test user:', testUser)

  // ESG KPIレコードを作成
  const kpis = [
    { id: 'GHG_EMISSIONS', name: '温室効果ガス排出量', unit: 'tCO2' },
    { id: 'ENERGY_USAGE', name: 'エネルギー使用量', unit: 'MWh' },
    { id: 'WATER_USAGE', name: '水使用量', unit: 'm3' },
    { id: 'WASTE_AMOUNT', name: '廃棄物量', unit: 'kg' },
    { id: 'EMPLOYEE_COUNT', name: '従業員数', unit: 'persons' },
    { id: 'FEMALE_MGMT_RATIO', name: '女性管理職比率', unit: '%' },
    { id: 'SAFETY_INCIDENTS', name: '労働災害件数', unit: 'count' },
    { id: 'TRAINING_HOURS', name: '研修時間', unit: 'hours' },
    { id: 'BOARD_MEETINGS', name: '取締役会開催回数', unit: 'count' },
    { id: 'COMPLIANCE_RATE', name: 'コンプライアンス研修受講率', unit: '%' }
  ]

  for (const kpi of kpis) {
    await prisma.kpi.upsert({
      where: { id: kpi.id },
      update: {},
      create: kpi
    })
  }

  console.log('Created KPI records:', kpis.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
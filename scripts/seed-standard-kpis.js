const { PrismaClient } = require('@prisma/client');

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
  }
];

async function seedStandardKpis() {
  const prisma = new PrismaClient();
  
  try {
    console.log('標準KPI定義のシードデータを挿入中...');

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
      });
    }

    console.log(`✅ ${standardKpiDefinitions.length}件の標準KPI定義を挿入しました`);
  } catch (error) {
    console.error('シードデータ挿入エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedStandardKpis()
  .then(() => {
    console.log('シードデータの挿入が完了しました');
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  }); 
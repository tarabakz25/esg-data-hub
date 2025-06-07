import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 標準KPI定義のシードデータ
 */
const standardKpiDefinitions = [
  // Environment (環境) - Scope1・Scope2排出量
  {
    id: 'CO2_SCOPE1',
    name: 'Scope1排出量',
    category: 'Environment',
    description: '直接排出量（燃料燃焼等による温室効果ガス排出）',
    preferredUnit: 't-CO2',
    aliases: ['GHG_EMISSIONS', 'SCOPE1_EMISSIONS', 'DIRECT_EMISSIONS', 'CO2_DIRECT', 'SCOPE1', 'CO2', 'CARBON_EMISSIONS', '二酸化炭素排出量', 'CO2排出量'],
    isActive: true
  },
  {
    id: 'CO2_SCOPE2',
    name: 'Scope2排出量',
    category: 'Environment',
    description: '間接排出量（購入電力等による温室効果ガス排出）',
    preferredUnit: 't-CO2',
    aliases: ['SCOPE2_EMISSIONS', 'INDIRECT_EMISSIONS', 'ELECTRICITY_EMISSIONS', 'SCOPE2', '電力由来CO2', '間接排出'],
    isActive: true
  },

  // Environment - エネルギー・水・廃棄物
  {
    id: 'ENERGY_USAGE',
    name: 'エネルギー使用量',
    category: 'Environment',
    description: '総エネルギー消費量',
    preferredUnit: 'MWh',
    aliases: ['ENERGY_CONSUMPTION', 'TOTAL_ENERGY', 'POWER_USAGE', 'ENERGY', 'エネルギー', '電力使用量', '電力消費量', 'ELECTRICITY', 'POWER'],
    isActive: true
  },
  {
    id: 'WATER_USAGE',
    name: '水使用量',
    category: 'Environment',
    description: '総水消費量',
    preferredUnit: 'm³',
    aliases: ['WATER_CONSUMPTION', 'WATER_INTAKE', 'TOTAL_WATER', 'WATER', '水', '水消費量', '上水使用量'],
    isActive: true
  },
  {
    id: 'WASTE_AMOUNT',
    name: '廃棄物総量',
    category: 'Environment',
    description: '総廃棄物発生量',
    preferredUnit: 't',
    aliases: ['TOTAL_WASTE', 'WASTE_GENERATION', 'WASTE_OUTPUT', 'WASTE', '廃棄物', '廃棄物量', 'ゴミ', '産業廃棄物'],
    isActive: true
  },
  {
    id: 'RENEWABLE_ENERGY_RATIO',
    name: '再生可能エネルギー比率',
    category: 'Environment',
    description: '総エネルギー使用量に占める再生可能エネルギーの割合',
    preferredUnit: '%',
    aliases: ['RENEWABLE_RATIO', 'GREEN_ENERGY_RATIO', 'CLEAN_ENERGY_PERCENT', '再エネ比率', '再生可能エネルギー', 'RENEWABLE'],
    isActive: true
  },

  // Social (社会) - 雇用・ダイバーシティ
  {
    id: 'EMPLOYEE_COUNT',
    name: '従業員数',
    category: 'Social',
    description: '総従業員数',
    preferredUnit: '人',
    aliases: ['TOTAL_EMPLOYEES', 'STAFF_COUNT', 'WORKFORCE_SIZE', 'EMPLOYEES', '従業員', '社員数', '人数', 'HEADCOUNT'],
    isActive: true
  },
  {
    id: 'FEMALE_EMPLOYEE_RATIO',
    name: '女性従業員比率',
    category: 'Social',
    description: '総従業員数に占める女性の割合',
    preferredUnit: '%',
    aliases: ['FEMALE_RATIO', 'WOMEN_PERCENTAGE', 'GENDER_DIVERSITY_FEMALE', '女性比率', '女性従業員', 'FEMALE', 'WOMEN'],
    isActive: true
  },
  {
    id: 'FEMALE_MANAGEMENT_RATIO',
    name: '女性管理職比率',
    category: 'Social',
    description: '管理職に占める女性の割合',
    preferredUnit: '%',
    aliases: ['FEMALE_MANAGER_RATIO', 'WOMEN_LEADERSHIP_RATIO', 'FEMALE_EXEC_RATIO', '女性管理職', '女性リーダー', 'FEMALE_MANAGEMENT'],
    isActive: true
  },
  {
    id: 'WORKPLACE_ACCIDENT_RATE',
    name: '労働災害発生率',
    category: 'Social',
    description: '労働災害の発生頻度',
    preferredUnit: '件/100万時間',
    aliases: ['ACCIDENT_RATE', 'INJURY_RATE', 'SAFETY_INCIDENT_RATE', '労働災害', '事故率', 'ACCIDENTS', 'SAFETY'],
    isActive: true
  },

  // Governance (ガバナンス) - 取締役・コンプライアンス
  {
    id: 'INDEPENDENT_DIRECTOR_RATIO',
    name: '独立取締役比率',
    category: 'Governance',
    description: '取締役会における独立取締役の割合',
    preferredUnit: '%',
    aliases: ['INDEPENDENT_BOARD_RATIO', 'EXTERNAL_DIRECTOR_RATIO', 'NON_EXEC_RATIO', '独立取締役', '社外取締役', 'INDEPENDENT'],
    isActive: true
  },
  {
    id: 'FEMALE_DIRECTOR_RATIO',
    name: '女性取締役比率',
    category: 'Governance',
    description: '取締役会における女性の割合',
    preferredUnit: '%',
    aliases: ['FEMALE_BOARD_RATIO', 'WOMEN_DIRECTOR_RATIO', 'BOARD_GENDER_DIVERSITY', '女性取締役', '女性役員', 'FEMALE_DIRECTORS'],
    isActive: true
  },
  {
    id: 'COMPLIANCE_TRAINING_RATE',
    name: 'コンプライアンス研修受講率',
    category: 'Governance',
    description: '従業員のコンプライアンス研修受講割合',
    preferredUnit: '%',
    aliases: ['ETHICS_TRAINING_RATE', 'COMPLIANCE_COMPLETION_RATE', 'コンプライアンス', '研修受講率', 'COMPLIANCE', 'TRAINING'],
    isActive: true
  },

  // Financial - ESG関連財務指標
  {
    id: 'ESG_INVESTMENT_AMOUNT',
    name: 'ESG投資額',
    category: 'Financial',
    description: 'ESG関連への投資金額',
    preferredUnit: '億円',
    aliases: ['SUSTAINABILITY_INVESTMENT', 'GREEN_INVESTMENT', 'ESG_CAPEX', 'ESG投資', '持続可能投資', 'ESG'],
    isActive: true
  },
  {
    id: 'CARBON_CREDIT_COST',
    name: 'カーボンクレジット費用',
    category: 'Financial',
    description: 'カーボンオフセットのための費用',
    preferredUnit: '万円',
    aliases: ['OFFSET_COST', 'CARBON_OFFSET_EXPENSE', 'CO2_CREDIT_COST', 'カーボンクレジット', 'オフセット費用', 'CARBON_CREDIT'],
    isActive: true
  },
  {
    id: 'ENVIRONMENTAL_FINE_AMOUNT',
    name: '環境関連罰金額',
    category: 'Financial',
    description: '環境法規制違反による罰金・制裁金',
    preferredUnit: '万円',
    aliases: ['ENV_PENALTY', 'ENVIRONMENTAL_PENALTY', 'ECO_VIOLATION_FINE', '環境罰金', '制裁金', 'PENALTY'],
    isActive: true
  }
];

async function main() {
  console.log('標準KPI定義のシードデータを挿入中...');

  try {
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

    // 挿入されたデータを確認
    const count = await prisma.standard_kpi_definitions.count();
    console.log(`📊 データベース内の標準KPI定義総数: ${count}件`);

  } catch (error) {
    console.error('❌ シードデータ挿入エラー:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
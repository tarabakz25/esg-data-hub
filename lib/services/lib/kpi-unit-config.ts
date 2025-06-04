import { KpiUnitConfig } from '../types/kpi';
import { UNIT_CATEGORIES } from '../types/unit';

/**
 * KPIごとの標準単位設定
 * ESGレポートでよく使用されるKPIの標準単位を定義
 */
export const KPI_UNIT_CONFIGS: KpiUnitConfig[] = [
  // 財務関連KPI
  {
    kpiId: 'revenue',
    kpiName: '売上高',
    standardUnit: 'M_JPY', // 百万円（仮想単位として定義）
    category: UNIT_CATEGORIES.MASS, // 一時的に質量カテゴリを使用
    description: '売上高は百万円単位で統一',
    isActive: true,
  },
  
  // 環境関連KPI
  {
    kpiId: 'co2_emissions',
    kpiName: 'CO2排出量',
    standardUnit: 't', // トン
    category: UNIT_CATEGORIES.MASS,
    description: 'CO2排出量はトン単位で統一',
    isActive: true,
  },
  {
    kpiId: 'energy_consumption',
    kpiName: 'エネルギー消費量',
    standardUnit: 'MJ', // メガジュール
    category: UNIT_CATEGORIES.ENERGY,
    description: 'エネルギー消費量はメガジュール単位で統一',
    isActive: true,
  },
  {
    kpiId: 'water_usage',
    kpiName: '水使用量',
    standardUnit: 'm3', // 立方メートル
    category: UNIT_CATEGORIES.VOLUME,
    description: '水使用量は立方メートル単位で統一',
    isActive: true,
  },
  {
    kpiId: 'waste_generation',
    kpiName: '廃棄物発生量',
    standardUnit: 't', // トン
    category: UNIT_CATEGORIES.MASS,
    description: '廃棄物発生量はトン単位で統一',
    isActive: true,
  },
  
  // 社会関連KPI
  {
    kpiId: 'employee_training_hours',
    kpiName: '従業員研修時間',
    standardUnit: 'h', // 時間
    category: UNIT_CATEGORIES.TIME,
    description: '従業員研修時間は時間単位で統一',
    isActive: true,
  },
  {
    kpiId: 'facility_area',
    kpiName: '施設面積',
    standardUnit: 'm2', // 平方メートル（仮想単位として定義）
    category: UNIT_CATEGORIES.LENGTH, // 一時的に長さカテゴリを使用
    description: '施設面積は平方メートル単位で統一',
    isActive: true,
  },
];

/**
 * KPI IDから標準単位設定を取得
 */
export function getKpiUnitConfig(kpiId: string): KpiUnitConfig | undefined {
  return KPI_UNIT_CONFIGS.find(config => config.kpiId === kpiId);
}

/**
 * カテゴリ別のKPI設定を取得
 */
export function getKpiConfigsByCategory(category: string): KpiUnitConfig[] {
  return KPI_UNIT_CONFIGS.filter(config => config.category === category && config.isActive);
}

/**
 * 全てのアクティブなKPI設定を取得
 */
export function getActiveKpiConfigs(): KpiUnitConfig[] {
  return KPI_UNIT_CONFIGS.filter(config => config.isActive);
} 
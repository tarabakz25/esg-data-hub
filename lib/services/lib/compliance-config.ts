import { ComplianceStandard, ComplianceSeverity, MandatoryKpiConfig } from '../../../types/services/compliance';

/**
 * ISSB必須KPI設定
 * ISSB（International Sustainability Standards Board）の必須開示項目
 */
const ISSB_MANDATORY_KPIS: Record<ComplianceSeverity, string[]> = {
  critical: [
    'CO2_SCOPE1',        // Scope1排出量（必須）
    'CO2_SCOPE2',        // Scope2排出量（必須）
    'ENERGY_USE',        // エネルギー使用量
    'EMPLOYEE_COUNT',    // 従業員数
    'REVENUE',           // 売上高
    'BOARD_INDEPENDENCE' // 独立取締役比率
  ],
  warning: [
    'RENEWABLE_ENERGY',  // 再生可能エネルギー使用率
    'WATER_USE',         // 水使用量
    'WASTE_TOTAL',       // 廃棄物総量
    'FEMALE_RATIO',      // 女性比率
    'TRAINING_HOURS'     // 研修時間
  ]
};

/**
 * CSRD必須KPI設定
 * CSRD（Corporate Sustainability Reporting Directive）の必須開示項目
 */
const CSRD_MANDATORY_KPIS: Record<ComplianceSeverity, string[]> = {
  critical: [
    'CO2_SCOPE1',         // Scope1排出量（必須）
    'CO2_SCOPE2',         // Scope2排出量（必須）
    'ENERGY_USE',         // エネルギー使用量
    'FEMALE_RATIO',       // 女性比率（重要視）
    'BOARD_FEMALE_RATIO', // 取締役会女性比率
    'COMPLIANCE_TRAINING' // コンプライアンス研修受講率
  ],
  warning: [
    'RENEWABLE_ENERGY',   // 再生可能エネルギー使用率
    'WASTE_RECYCLED',     // リサイクル率
    'EMPLOYEE_TURNOVER',  // 従業員離職率
    'SAFETY_INCIDENTS',   // 労働災害件数
    'ROE'                 // 自己資本利益率
  ]
};

/**
 * カスタム（社内基準）必須KPI設定
 */
const CUSTOM_MANDATORY_KPIS: Record<ComplianceSeverity, string[]> = {
  critical: [
    'REVENUE',           // 売上高
    'OPERATING_PROFIT',  // 営業利益
    'EMPLOYEE_COUNT'     // 従業員数
  ],
  warning: [
    'RISK_INCIDENTS'     // リスク事案件数
  ]
};

/**
 * 全ての必須KPI設定をまとめたマップ
 */
export const MANDATORY_KPI_CONFIGS: Map<ComplianceStandard, Record<ComplianceSeverity, string[]>> = new Map([
  ['issb', ISSB_MANDATORY_KPIS],
  ['csrd', CSRD_MANDATORY_KPIS],
  ['custom', CUSTOM_MANDATORY_KPIS]
]);

/**
 * 指定された基準の必須KPIリストを取得
 */
export function getMandatoryKpis(
  standard: ComplianceStandard,
  severity?: ComplianceSeverity
): string[] {
  const config = MANDATORY_KPI_CONFIGS.get(standard);
  if (!config) {
    throw new Error(`Unknown compliance standard: ${standard}`);
  }

  if (severity) {
    return config[severity] || [];
  }

  // severity指定なしの場合は全レベルを返す
  return [...config.critical, ...config.warning];
}

/**
 * 指定されたKPIが必須かどうかを判定
 */
export function isMandatoryKpi(
  kpiId: string,
  standard: ComplianceStandard,
  severity?: ComplianceSeverity
): boolean {
  const mandatoryKpis = getMandatoryKpis(standard, severity);
  return mandatoryKpis.includes(kpiId);
}

/**
 * 指定されたKPIの重要度レベルを取得
 */
export function getKpiSeverity(
  kpiId: string,
  standard: ComplianceStandard
): ComplianceSeverity | null {
  const config = MANDATORY_KPI_CONFIGS.get(standard);
  if (!config) return null;

  if (config.critical.includes(kpiId)) return 'critical';
  if (config.warning.includes(kpiId)) return 'warning';
  
  return null;
}

/**
 * 全ての基準で必須とされているKPIを取得
 */
export function getUniversalMandatoryKpis(): string[] {
  const allStandards = Array.from(MANDATORY_KPI_CONFIGS.keys());
  const allKpis = allStandards.flatMap(standard => getMandatoryKpis(standard));
  
  // 全ての基準に共通するKPIのみを抽出
  return allKpis.filter(kpiId => 
    allStandards.every(standard => isMandatoryKpi(kpiId, standard))
  );
}

/**
 * コンプライアンス設定のサマリーを取得
 */
export function getComplianceConfigSummary() {
  const summary: Record<string, any> = {};
  
  for (const [standard, config] of MANDATORY_KPI_CONFIGS.entries()) {
    summary[standard] = {
      critical: config.critical.length,
      warning: config.warning.length,
      total: config.critical.length + config.warning.length
    };
  }
  
  return summary;
} 
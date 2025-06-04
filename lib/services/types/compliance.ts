/**
 * コンプライアンス基準の種類
 */
export type ComplianceStandard = 'issb' | 'csrd' | 'custom';

/**
 * 必須KPIの重要度レベル
 */
export type ComplianceSeverity = 'critical' | 'warning';

/**
 * 必須KPI設定
 */
export interface MandatoryKpiConfig {
  standard: ComplianceStandard;
  severity: ComplianceSeverity;
  kpiIds: string[];
}

/**
 * KPI欠損検出結果
 */
export interface MissingKpi {
  kpiId: string;
  kpiName: string;
  category: string;
  severity: ComplianceSeverity;
  standard: ComplianceStandard;
  expectedUnit: string;
  lastUpdated?: Date;
}

/**
 * 期間ごとのコンプライアンスチェック結果
 */
export interface ComplianceCheckResult {
  id: string;
  period: string; // e.g., '2024Q3', '2024-12'
  standard: ComplianceStandard;
  checkedAt: Date;
  totalKpis: number;
  missingKpis: MissingKpi[];
  criticalMissing: number;
  warningMissing: number;
  complianceRate: number; // 0-100 percentage
  status: 'compliant' | 'warning' | 'critical';
}

/**
 * コンプライアンスチェック実行オプション
 */
export interface ComplianceCheckOptions {
  period: string;
  standards?: ComplianceStandard[];
  department?: string;
  includeWarnings?: boolean;
}

/**
 * コンプライアンスチェックサマリー
 */
export interface ComplianceSummary {
  totalPeriods: number;
  compliantPeriods: number;
  warningPeriods: number;
  criticalPeriods: number;
  overallStatus: 'compliant' | 'warning' | 'critical';
  lastChecked: Date;
} 
import { UnitRegistry } from './unit-registry';
import { STANDARD_UNITS, STANDARD_CATEGORIES, STANDARD_CONVERSION_RULES } from './unit-data';
import { getKpiUnitConfig } from './kpi-unit-config';
import { AutoConversionRequest, AutoConversionResult, ConversionLog } from '../../../types/services/kpi';

export class AutoConverter {
  private unitRegistry: UnitRegistry;
  private conversionLogs: ConversionLog[] = [];

  constructor() {
    this.unitRegistry = new UnitRegistry();
    this.initializeRegistry();
  }

  /**
   * UnitRegistryを初期化
   */
  private initializeRegistry(): void {
    this.unitRegistry.registerBatch(
      STANDARD_UNITS,
      STANDARD_CATEGORIES,
      STANDARD_CONVERSION_RULES
    );
  }

  /**
   * 自動変換を実行
   */
  async convertToStandard(request: AutoConversionRequest): Promise<AutoConversionResult> {
    const { kpiId, value, sourceUnit, metadata } = request;
    const timestamp = new Date().toISOString();

    // KPI設定を取得
    const kpiConfig = getKpiUnitConfig(kpiId);
    if (!kpiConfig) {
      return {
        kpiId,
        originalValue: value,
        originalUnit: sourceUnit,
        convertedValue: value,
        standardUnit: sourceUnit,
        conversionFactor: 1,
        isConverted: false,
        reason: `KPI "${kpiId}" の設定が見つかりません`,
        timestamp,
        metadata,
      };
    }

    const standardUnit = kpiConfig.standardUnit;

    // 既に標準単位の場合
    if (sourceUnit === standardUnit) {
      return {
        kpiId,
        originalValue: value,
        originalUnit: sourceUnit,
        convertedValue: value,
        standardUnit,
        conversionFactor: 1,
        isConverted: false,
        reason: '既に標準単位です',
        timestamp,
        metadata,
      };
    }

    // 単位互換性をチェック
    const compatibility = this.unitRegistry.checkCompatibility(sourceUnit, standardUnit);
    if (!compatibility.isCompatible) {
      return {
        kpiId,
        originalValue: value,
        originalUnit: sourceUnit,
        convertedValue: value,
        standardUnit,
        conversionFactor: 1,
        isConverted: false,
        reason: `単位変換不可: ${compatibility.reason}`,
        timestamp,
        metadata,
      };
    }

    // 変換を実行
    const conversionResult = this.unitRegistry.convert(value, sourceUnit, standardUnit);
    if (!conversionResult.isValid) {
      return {
        kpiId,
        originalValue: value,
        originalUnit: sourceUnit,
        convertedValue: value,
        standardUnit,
        conversionFactor: 1,
        isConverted: false,
        reason: `変換エラー: ${conversionResult.error || '不明なエラー'}`,
        timestamp,
        metadata,
      };
    }

    // 変換ログを記録
    const log: ConversionLog = {
      id: this.generateLogId(),
      kpiId,
      originalValue: value,
      originalUnit: sourceUnit,
      convertedValue: conversionResult.value,
      standardUnit,
      conversionFactor: conversionResult.factor,
      timestamp,
      metadata,
    };
    this.conversionLogs.push(log);

    return {
      kpiId,
      originalValue: value,
      originalUnit: sourceUnit,
      convertedValue: conversionResult.value,
      standardUnit,
      conversionFactor: conversionResult.factor,
      isConverted: true,
      reason: `${sourceUnit}から${standardUnit}に変換しました（係数: ${conversionResult.factor}）`,
      timestamp,
      metadata,
    };
  }

  /**
   * 複数データの一括変換
   */
  async convertBatch(requests: AutoConversionRequest[]): Promise<AutoConversionResult[]> {
    const results: AutoConversionResult[] = [];
    
    for (const request of requests) {
      const result = await this.convertToStandard(request);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 変換ログを取得
   */
  getConversionLogs(kpiId?: string): ConversionLog[] {
    if (kpiId) {
      return this.conversionLogs.filter(log => log.kpiId === kpiId);
    }
    return [...this.conversionLogs];
  }

  /**
   * 変換統計を取得
   */
  getConversionStats(): {
    totalConversions: number;
    successfulConversions: number;
    failedConversions: number;
    conversionsByKpi: Record<string, number>;
  } {
    const total = this.conversionLogs.length;
    const byKpi: Record<string, number> = {};
    
    this.conversionLogs.forEach(log => {
      byKpi[log.kpiId] = (byKpi[log.kpiId] || 0) + 1;
    });

    return {
      totalConversions: total,
      successfulConversions: total, // ログに記録されるのは成功したもののみ
      failedConversions: 0, // 失敗したものは別途カウントが必要
      conversionsByKpi: byKpi,
    };
  }

  /**
   * KPIの標準単位を取得
   */
  getStandardUnit(kpiId: string): string | null {
    const config = getKpiUnitConfig(kpiId);
    return config ? config.standardUnit : null;
  }

  /**
   * 変換可能性をチェック
   */
  canConvert(kpiId: string, sourceUnit: string): boolean {
    const config = getKpiUnitConfig(kpiId);
    if (!config) return false;
    
    const compatibility = this.unitRegistry.checkCompatibility(sourceUnit, config.standardUnit);
    return compatibility.isCompatible;
  }

  /**
   * ログIDを生成
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * UnitRegistryインスタンスを取得（テスト用）
   */
  getUnitRegistry(): UnitRegistry {
    return this.unitRegistry;
  }
} 
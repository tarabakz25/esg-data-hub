export interface KPIGroupData {
  kpiIdentifier: string;
  records: Array<{
    dataRowId: number;
    period: string;
    value: number;
    unit: string;
  }>;
  aggregatedValue: number;
  commonUnit: string;
  recordCount: number;
  valueRange: { min: number; max: number; avg: number };
  unitConsistency: boolean;
}

export interface DataQualityReport {
  missingValues: number;
  unitInconsistencies: string[];
  outliers: Array<{ kpiId: string; value: number; reason: string }>;
  duplicates: Array<{ kpiId: string; count: number }>;
  invalidValues: Array<{ kpiId: string; value: string; issue: string }>;
}

export interface CSVAnalysisResult {
  groupedKPIs: KPIGroupData[];
  totalRecords: number;
  uniqueKPIs: number;
  dataQuality: DataQualityReport;
  processingTimeMs: number;
}

export class CSVAnalyzer {
  /**
   * CSVデータをkpiId列でグループ化して分析
   */
  static groupByKPIId(
    csvData: any[],
    options: {
      kpiColumn?: string;
      valueColumn?: string;
      unitColumn?: string;
      periodColumn?: string;
      dataRowIdColumn?: string;
    } = {}
  ): KPIGroupData[] {
    const {
      kpiColumn = 'kpiId',
      valueColumn = 'value',
      unitColumn = 'unit',
      periodColumn = 'period',
      dataRowIdColumn = 'dataRowId'
    } = options;

    if (!csvData || csvData.length === 0) {
      return [];
    }

    // 必須列の存在チェック
    if (csvData.length > 0) {
      const firstRow = csvData[0];
      const requiredColumns = [kpiColumn, valueColumn, unitColumn];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        throw new Error(`必須列が見つかりません: ${missingColumns.join(', ')}`);
      }
    }

    // kpiIdでグループ化
    const groups = new Map<string, any[]>();
    
    csvData.forEach((row, index) => {
      const kpiId = row[kpiColumn];
      if (!kpiId || kpiId.toString().trim() === '') {
        return; // 空のkpiIdはスキップ
      }

      const kpiKey = kpiId.toString().trim();
      if (!groups.has(kpiKey)) {
        groups.set(kpiKey, []);
      }
      groups.get(kpiKey)!.push({ ...row, rowIndex: index });
    });

    // 各グループを処理
    const result: KPIGroupData[] = [];
    
    groups.forEach((records, kpiIdentifier) => {
      const groupData = this.processKPIGroup(
        kpiIdentifier,
        records,
        { valueColumn, unitColumn, periodColumn, dataRowIdColumn }
      );
      if (groupData) {
        result.push(groupData);
      }
    });

    return result.sort((a, b) => a.kpiIdentifier.localeCompare(b.kpiIdentifier));
  }

  /**
   * 個別のKPIグループを処理
   */
  private static processKPIGroup(
    kpiIdentifier: string,
    records: any[],
    columns: {
      valueColumn: string;
      unitColumn: string;
      periodColumn: string;
      dataRowIdColumn: string;
    }
  ): KPIGroupData | null {
    const { valueColumn, unitColumn, periodColumn, dataRowIdColumn } = columns;

    // レコードを処理
    const processedRecords: KPIGroupData['records'] = [];
    const values: number[] = [];
    const units: string[] = [];

    records.forEach(record => {
      const rawValue = record[valueColumn];
      const unit = record[unitColumn]?.toString().trim() || '';
      const period = record[periodColumn]?.toString().trim() || '';
      const dataRowId = this.parseDataRowId(record[dataRowIdColumn]);

      // 値の解析と正規化
      const parsedValue = this.parseNumericValue(rawValue);
      
      if (parsedValue !== null && !isNaN(parsedValue)) {
        processedRecords.push({
          dataRowId,
          period,
          value: parsedValue,
          unit
        });
        values.push(parsedValue);
        if (unit) units.push(unit);
      }
    });

    if (processedRecords.length === 0) {
      return null; // 有効なレコードがない場合
    }

    // 統計計算
    const aggregatedValue = values.reduce((sum, val) => sum + val, 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const avgValue = aggregatedValue / values.length;

    // 単位の一貫性チェック
    const uniqueUnits = [...new Set(units.filter(u => u !== ''))];
    const unitConsistency = uniqueUnits.length <= 1;
    const commonUnit = this.determineCommonUnit(uniqueUnits);

    return {
      kpiIdentifier,
      records: processedRecords,
      aggregatedValue,
      commonUnit,
      recordCount: processedRecords.length,
      valueRange: {
        min: minValue,
        max: maxValue,
        avg: avgValue
      },
      unitConsistency
    };
  }

  /**
   * 数値の解析と正規化
   */
  private static parseNumericValue(rawValue: any): number | null {
    if (rawValue == null) return null;
    
    const stringValue = rawValue.toString().trim();
    if (stringValue === '') return null;

    // カンマ、パーセント、通貨記号を除去
    const cleaned = stringValue
      .replace(/[,\s%$€¥£]/g, '')
      .replace(/[（）()]/g, ''); // 括弧も除去

    const parsed = parseFloat(cleaned);
    
    if (isNaN(parsed) || !isFinite(parsed)) {
      return null;
    }

    // パーセンテージの場合は0.01倍
    if (stringValue.includes('%')) {
      return parsed / 100;
    }

    return parsed;
  }

  /**
   * データ行IDの解析
   */
  private static parseDataRowId(rawValue: any): number {
    if (rawValue == null) return 0;
    const parsed = parseInt(rawValue.toString());
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * 共通単位の決定
   */
  private static determineCommonUnit(units: string[]): string {
    if (units.length === 0) return '';
    if (units.length === 1) return units[0];
    
    // 最も頻繁に使用される単位を選択
    const unitCounts = new Map<string, number>();
    units.forEach(unit => {
      unitCounts.set(unit, (unitCounts.get(unit) || 0) + 1);
    });

    let maxCount = 0;
    let commonUnit = '';
    unitCounts.forEach((count, unit) => {
      if (count > maxCount) {
        maxCount = count;
        commonUnit = unit;
      }
    });

    return commonUnit;
  }

  /**
   * データ品質チェック
   */
  static validateDataQuality(groupedData: KPIGroupData[], originalData: any[]): DataQualityReport {
    const missingValues = this.countMissingValues(originalData);
    const unitInconsistencies = this.findUnitInconsistencies(groupedData);
    const outliers = this.detectOutliers(groupedData);
    const duplicates = this.findDuplicates(groupedData);
    const invalidValues = this.findInvalidValues(originalData);

    return {
      missingValues,
      unitInconsistencies,
      outliers,
      duplicates,
      invalidValues
    };
  }

  /**
   * 欠損値のカウント
   */
  private static countMissingValues(originalData: any[]): number {
    let missingCount = 0;
    originalData.forEach(row => {
      ['kpiId', 'value', 'unit'].forEach(column => {
        const value = row[column];
        if (value == null || value.toString().trim() === '') {
          missingCount++;
        }
      });
    });
    return missingCount;
  }

  /**
   * 単位の不整合を検出
   */
  private static findUnitInconsistencies(groupedData: KPIGroupData[]): string[] {
    return groupedData
      .filter(group => !group.unitConsistency)
      .map(group => `${group.kpiIdentifier}: 複数の単位が混在`);
  }

  /**
   * 外れ値の検出
   */
  private static detectOutliers(groupedData: KPIGroupData[]): Array<{ kpiId: string; value: number; reason: string }> {
    const outliers: Array<{ kpiId: string; value: number; reason: string }> = [];

    groupedData.forEach(group => {
      if (group.records.length < 3) return; // 3レコード未満では外れ値検出しない

      const values = group.records.map(r => r.value);
      const mean = group.valueRange.avg;
      const std = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      );

      // 3σルールで外れ値を検出
      const threshold = 3 * std;
      
      group.records.forEach(record => {
        if (Math.abs(record.value - mean) > threshold) {
          outliers.push({
            kpiId: group.kpiIdentifier,
            value: record.value,
            reason: `平均から${threshold.toFixed(2)}以上離れている`
          });
        }
      });
    });

    return outliers;
  }

  /**
   * 重複の検出
   */
  private static findDuplicates(groupedData: KPIGroupData[]): Array<{ kpiId: string; count: number }> {
    return groupedData
      .filter(group => group.recordCount > 1)
      .map(group => ({
        kpiId: group.kpiIdentifier,
        count: group.recordCount
      }));
  }

  /**
   * 無効な値の検出
   */
  private static findInvalidValues(originalData: any[]): Array<{ kpiId: string; value: string; issue: string }> {
    const invalid: Array<{ kpiId: string; value: string; issue: string }> = [];

    originalData.forEach(row => {
      const kpiId = row.kpiId?.toString() || 'unknown';
      const value = row.value;

      if (value != null) {
        const stringValue = value.toString().trim();
        
        // 負の値のチェック（通常ESGデータでは負の値は異常）
        const numericValue = parseFloat(stringValue.replace(/[,\s%$€¥£]/g, ''));
        if (!isNaN(numericValue) && numericValue < 0) {
          invalid.push({
            kpiId,
            value: stringValue,
            issue: '負の値が含まれています'
          });
        }

        // 非数値データのチェック
        if (isNaN(numericValue) && stringValue !== '') {
          invalid.push({
            kpiId,
            value: stringValue,
            issue: '数値ではない値が含まれています'
          });
        }
      }
    });

    return invalid;
  }

  /**
   * 完全なCSV分析を実行
   */
  static analyzeCSV(
    csvData: any[],
    options: {
      kpiColumn?: string;
      valueColumn?: string;
      unitColumn?: string;
      periodColumn?: string;
      dataRowIdColumn?: string;
    } = {}
  ): CSVAnalysisResult {
    const startTime = Date.now();

    const groupedKPIs = this.groupByKPIId(csvData, options);
    const dataQuality = this.validateDataQuality(groupedKPIs, csvData);

    const processingTime = Date.now() - startTime;

    return {
      groupedKPIs,
      totalRecords: csvData.length,
      uniqueKPIs: groupedKPIs.length,
      dataQuality,
      processingTimeMs: processingTime
    };
  }

  /**
   * KPIグループのテキスト埋め込み用サマリーを生成
   */
  static createKPIEmbeddingText(group: KPIGroupData): string {
    const unitText = group.commonUnit ? ` in ${group.commonUnit}` : '';
    const consistencyText = group.unitConsistency ? 'consistent' : 'inconsistent';
    
    return `KPI identifier: ${group.kpiIdentifier}. ` +
           `Total value: ${group.aggregatedValue}${unitText}. ` +
           `Records count: ${group.recordCount}. ` +
           `Value range: ${group.valueRange.min.toFixed(2)}-${group.valueRange.max.toFixed(2)} ` +
           `(average: ${group.valueRange.avg.toFixed(2)}). ` +
           `Unit consistency: ${consistencyText}. ` +
           `Data quality: ${group.recordCount >= 3 ? 'sufficient' : 'limited'} sample size.`;
  }
} 
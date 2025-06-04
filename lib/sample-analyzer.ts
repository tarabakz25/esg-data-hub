export interface SampleAnalysis {
  dataType: 'number' | 'date' | 'text' | 'percentage' | 'currency' | 'boolean';
  unit?: string;
  pattern?: string;
  confidence: number;
  samples: string[];
  summary: string;
  statistics?: {
    count: number;
    numericCount: number;
    uniqueValues: number;
    avgLength: number;
  };
}

export interface KPIGroupAnalysis {
  kpiIdentifier: string;
  dataTypeAnalysis: SampleAnalysis;
  qualityScore: number;
  recommendations: string[];
}

export class SampleValueAnalyzer {
  /**
   * サンプル値を分析してデータ型と特徴を判別
   */
  static analyzeSamples(samples: string[]): SampleAnalysis {
    const cleanSamples = samples
      .filter(s => s != null && s.toString().trim() !== '')
      .map(s => s.toString().trim())
      .slice(0, 10); // 最大10サンプルで分析

    if (cleanSamples.length === 0) {
      return {
        dataType: 'text',
        confidence: 0,
        samples: [],
        summary: 'No valid samples found',
        statistics: {
          count: 0,
          numericCount: 0,
          uniqueValues: 0,
          avgLength: 0
        }
      };
    }

    // 統計情報の計算
    const statistics = this.calculateStatistics(cleanSamples);

    // ブール値の判別（数値より先に判定）
    const boolResult = this.analyzeBooleans(cleanSamples);
    if (boolResult.confidence > 0.8) {
      return { ...boolResult, statistics };
    }

    // 日付パターンの判別（数値より先に判定）
    const dateResult = this.analyzeDates(cleanSamples);
    if (dateResult.confidence > 0.7) {
      return { ...dateResult, statistics };
    }

    // 数値パターンの判別
    const numberResult = this.analyzeNumbers(cleanSamples);
    if (numberResult.confidence > 0.7) {
      return { ...numberResult, statistics };
    }

    // デフォルトはテキスト
    return {
      dataType: 'text',
      confidence: 0.6,
      samples: cleanSamples,
      summary: `Text data with ${cleanSamples.length} samples`,
      pattern: 'free_text',
      statistics
    };
  }

  /**
   * 統計情報の計算
   */
  private static calculateStatistics(samples: string[]): SampleAnalysis['statistics'] {
    const uniqueValues = new Set(samples).size;
    const numericCount = samples.filter(s => {
      const cleaned = s.replace(/[,\s%$€¥]/g, '');
      return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
    }).length;
    
    const avgLength = samples.reduce((sum, s) => sum + s.length, 0) / samples.length;

    return {
      count: samples.length,
      numericCount,
      uniqueValues,
      avgLength: Math.round(avgLength * 100) / 100
    };
  }

  /**
   * 数値データの分析
   */
  private static analyzeNumbers(samples: string[]): SampleAnalysis {
    const numberSamples = samples.filter(s => {
      const cleaned = s.replace(/[,\s%$€¥]/g, '');
      return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
    });

    const confidence = numberSamples.length / samples.length;
    
    if (confidence < 0.5) {
      return { dataType: 'text', confidence: 0, samples, summary: 'Not numeric' };
    }

    // パーセンテージの判別
    const percentageCount = samples.filter(s => s.includes('%')).length;
    if (percentageCount / samples.length > 0.5) {
      return {
        dataType: 'percentage',
        unit: '%',
        confidence,
        samples: numberSamples,
        summary: `Percentage values (${numberSamples.length}/${samples.length})`,
        pattern: 'percentage'
      };
    }

    // 通貨の判別
    const currencyCount = samples.filter(s => /[$€¥£]/.test(s)).length;
    if (currencyCount / samples.length > 0.3) {
      const currency = samples.find(s => /[$€¥£]/.test(s))?.match(/[$€¥£]/)?.[0];
      return {
        dataType: 'currency',
        unit: currency,
        confidence,
        samples: numberSamples,
        summary: `Currency values in ${currency} (${numberSamples.length}/${samples.length})`,
        pattern: 'currency'
      };
    }

    // 一般的な数値
    return {
      dataType: 'number',
      confidence,
      samples: numberSamples,
      summary: `Numeric values (${numberSamples.length}/${samples.length})`,
      pattern: 'decimal'
    };
  }

  /**
   * 日付データの分析
   */
  private static analyzeDates(samples: string[]): SampleAnalysis {
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,           // 2024-01-01
      /^\d{2}\/\d{2}\/\d{4}$/,         // 01/01/2024
      /^\d{4}\/\d{2}\/\d{2}$/,         // 2024/01/01
      /^\d{2}-\d{2}-\d{4}$/,           // 01-01-2024
      /^\d{4}年\d{1,2}月\d{1,2}日$/    // 2024年1月1日
    ];

    const dateSamples = samples.filter(s => {
      // 数値形式（1234）を除外
      if (/^\d+$/.test(s)) return false;
      
      return datePatterns.some(pattern => pattern.test(s)) || 
             (!isNaN(Date.parse(s)) && isNaN(parseFloat(s)));
    });

    const confidence = dateSamples.length / samples.length;

    if (confidence < 0.5) {
      return { dataType: 'text', confidence: 0, samples, summary: 'Not date format' };
    }

    // パターン判別
    let detectedPattern = 'iso_date';
    if (samples.some(s => /^\d{2}\/\d{2}\/\d{4}$/.test(s))) {
      detectedPattern = 'mm_dd_yyyy';
    } else if (samples.some(s => /^\d{4}年/.test(s))) {
      detectedPattern = 'japanese_date';
    }

    return {
      dataType: 'date',
      confidence,
      samples: dateSamples,
      summary: `Date values with ${detectedPattern} pattern (${dateSamples.length}/${samples.length})`,
      pattern: detectedPattern
    };
  }

  /**
   * ブール値の分析
   */
  private static analyzeBooleans(samples: string[]): SampleAnalysis {
    const booleanValues = ['true', 'false', 'yes', 'no', '1', '0', 'はい', 'いいえ', 'on', 'off'];
    
    const boolSamples = samples.filter(s => 
      booleanValues.includes(s.toLowerCase())
    );

    const confidence = boolSamples.length / samples.length;

    if (confidence < 0.7) {
      return { dataType: 'text', confidence: 0, samples, summary: 'Not boolean' };
    }

    return {
      dataType: 'boolean',
      confidence,
      samples: boolSamples,
      summary: `Boolean values (${boolSamples.length}/${samples.length})`,
      pattern: 'true_false'
    };
  }

  /**
   * 分析結果をテキスト形式で要約（埋め込み生成用）
   */
  static createEmbeddingSummary(analysis: SampleAnalysis, columnName: string): string {
    const { dataType, unit, pattern, samples, summary, statistics } = analysis;
    
    let description = `Column "${columnName}" contains ${dataType} data. `;
    
    if (unit) {
      description += `Unit: ${unit}. `;
    }
    
    if (pattern) {
      description += `Pattern: ${pattern}. `;
    }
    
    description += `Summary: ${summary}. `;

    // 統計情報を追加
    if (statistics) {
      description += `Statistics: ${statistics.count} total samples, `;
      description += `${statistics.uniqueValues} unique values, `;
      description += `${statistics.numericCount} numeric values. `;
    }
    
    if (samples.length > 0) {
      const sampleStr = samples.slice(0, 3).join(', ');
      description += `Examples: ${sampleStr}`;
    }

    return description;
  }

  /**
   * KPIグループデータ用の拡張分析
   */
  static analyzeKPIGroup(
    kpiIdentifier: string,
    values: string[],
    units: string[],
    periods: string[]
  ): KPIGroupAnalysis {
    // 値の分析
    const valueAnalysis = this.analyzeSamples(values);
    
    // 単位の分析
    const unitAnalysis = this.analyzeSamples(units);
    
    // 期間の分析
    const periodAnalysis = this.analyzeSamples(periods);
    
    // 品質スコアの計算
    const qualityScore = this.calculateQualityScore(valueAnalysis, unitAnalysis, periodAnalysis);
    
    // 推奨事項の生成
    const recommendations = this.generateRecommendations(
      kpiIdentifier,
      valueAnalysis,
      unitAnalysis,
      periodAnalysis
    );

    return {
      kpiIdentifier,
      dataTypeAnalysis: valueAnalysis,
      qualityScore,
      recommendations
    };
  }

  /**
   * データ品質スコアの計算
   */
  private static calculateQualityScore(
    valueAnalysis: SampleAnalysis,
    unitAnalysis: SampleAnalysis,
    periodAnalysis: SampleAnalysis
  ): number {
    let score = 0;
    
    // 値の品質（50%の重み）
    score += valueAnalysis.confidence * 0.5;
    
    // 単位の一貫性（30%の重み）
    if (unitAnalysis.statistics && unitAnalysis.statistics.uniqueValues <= 2) {
      score += 0.3;
    } else {
      score += unitAnalysis.confidence * 0.3;
    }
    
    // 期間データの品質（20%の重み）
    score += periodAnalysis.confidence * 0.2;
    
    return Math.round(score * 100) / 100;
  }

  /**
   * 推奨事項の生成
   */
  private static generateRecommendations(
    kpiIdentifier: string,
    valueAnalysis: SampleAnalysis,
    unitAnalysis: SampleAnalysis,
    periodAnalysis: SampleAnalysis
  ): string[] {
    const recommendations: string[] = [];
    
    // 値の品質に関する推奨
    if (valueAnalysis.confidence < 0.8) {
      recommendations.push(`${kpiIdentifier}: 値の形式を統一してください`);
    }
    
    // 単位の統一性に関する推奨
    if (unitAnalysis.statistics && unitAnalysis.statistics.uniqueValues > 2) {
      recommendations.push(`${kpiIdentifier}: 単位を統一してください`);
    }
    
    // 期間データに関する推奨
    if (periodAnalysis.confidence < 0.7) {
      recommendations.push(`${kpiIdentifier}: 期間の形式を統一してください`);
    }
    
    // データ量に関する推奨
    if (valueAnalysis.statistics && valueAnalysis.statistics.count < 3) {
      recommendations.push(`${kpiIdentifier}: より多くのデータポイントが推奨されます`);
    }
    
    return recommendations;
  }

  /**
   * KPIの種類を推定
   */
  static estimateKPIType(kpiIdentifier: string, values: number[], unit: string): string {
    const identifier = kpiIdentifier.toLowerCase();
    
    // 環境指標の推定
    if (identifier.includes('ghg') || identifier.includes('co2') || identifier.includes('emission')) {
      return 'Environment - GHG Emissions';
    }
    
    if (identifier.includes('energy') || identifier.includes('kwh') || identifier.includes('mwh')) {
      return 'Environment - Energy Usage';
    }
    
    if (identifier.includes('water') || identifier.includes('h2o')) {
      return 'Environment - Water Usage';
    }
    
    if (identifier.includes('waste') || identifier.includes('recycle')) {
      return 'Environment - Waste Management';
    }
    
    // 社会指標の推定
    if (identifier.includes('employee') || identifier.includes('staff') || identifier.includes('worker')) {
      return 'Social - Employee Metrics';
    }
    
    if (identifier.includes('female') || identifier.includes('gender') || identifier.includes('diversity')) {
      return 'Social - Diversity';
    }
    
    if (identifier.includes('safety') || identifier.includes('accident') || identifier.includes('incident')) {
      return 'Social - Safety';
    }
    
    // ガバナンス指標の推定
    if (identifier.includes('board') || identifier.includes('governance') || identifier.includes('compliance')) {
      return 'Governance - Corporate Governance';
    }
    
    // 財務指標の推定
    if (identifier.includes('revenue') || identifier.includes('profit') || identifier.includes('cost')) {
      return 'Financial - Financial Performance';
    }
    
    // 単位からの推定
    if (unit) {
      const unitLower = unit.toLowerCase();
      if (unitLower.includes('t-co2') || unitLower.includes('kg-co2')) {
        return 'Environment - GHG Emissions';
      }
      if (unitLower.includes('kwh') || unitLower.includes('mwh') || unitLower.includes('gj')) {
        return 'Environment - Energy Usage';
      }
      if (unitLower.includes('m3') || unitLower.includes('l') || unitLower.includes('liter')) {
        return 'Environment - Water Usage';
      }
    }
    
    return 'Unknown - Requires Manual Classification';
  }
} 
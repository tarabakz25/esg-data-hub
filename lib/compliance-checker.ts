
export interface ComplianceCheckResult {
  overallScore: number; // 0-100%
  categoryScores: {
    Environment: number;
    Social: number;
    Governance: number;
    Financial?: number;
  };
  missingKPIs: Array<{
    category: string;
    requiredKPI: string;
    importance: 'critical' | 'important' | 'optional';
    suggestion: string;
  }>;
  dataQualityIssues: Array<{
    kpiIdentifier: string;
    issue: string;
    severity: 'error' | 'warning' | 'info';
    recommendation: string;
  }>;
  mappingQuality: {
    totalMapped: number;
    highConfidence: number; // >80%
    mediumConfidence: number; // 60-80%
    lowConfidence: number; // <60%
    unmapped: number;
  };
  processingTimeMs: number;
  checkedAt: Date;
}

export interface MappingResult {
  kpiIdentifier: string;
  aggregatedValue: number;
  unit: string;
  recordCount: number;
  suggestedKPI: {
    id: string;
    name: string;
    category: string;
    unit: string;
  } | null;
  confidence: number;
  alternativeSuggestions: Array<{
    kpi: any;
    confidence: number;
  }>;
  originalConfidence?: number;
  confidenceBoosts?: {
    unitMatch: number;
    dataQuality: number;
    sampleSize: number;
    valueRange: number;
  };
}

export interface ComplianceCheckRequest {
  mappingResults: MappingResult[];
  requiredCategories: string[];
  minConfidenceThreshold: number; // default: 0.6
  includeDataQuality?: boolean;
}

export interface ComplianceCheckResponse {
  success: boolean;
  complianceResult?: ComplianceCheckResult;
  detailedReport?: {
    summary: string;
    recommendations: string[];
    nextSteps: string[];
  };
  processingTimeMs?: number;
  error?: string;
  details?: string;
}

export class ComplianceChecker {
  /**
   * KPIマッピング結果のコンプライアンスチェックを実行
   */
  static checkKPICompliance(
    mappingResults: MappingResult[],
    options: {
      requiredCategories?: string[];
      minConfidenceThreshold?: number;
      includeDataQuality?: boolean;
    } = {}
  ): ComplianceCheckResult {
    const startTime = Date.now();
    
    const {
      requiredCategories = ['Environment', 'Social', 'Governance'],
      minConfidenceThreshold = 0.6,
      includeDataQuality = true
    } = options;

    // 1. 必須KPIの網羅性チェック
    const requiredKPIs = this.getRequiredKPIsByCategory();
    const missingKPIs = this.identifyMissingKPIs(mappingResults, requiredKPIs, requiredCategories);

    // 2. カテゴリ別充足率計算
    const categoryScores = this.calculateCategoryScores(mappingResults, requiredKPIs, minConfidenceThreshold);

    // 3. データ品質評価
    const dataQualityIssues = includeDataQuality ? 
      this.evaluateDataQuality(mappingResults) : [];

    // 4. マッピング品質評価
    const mappingQuality = this.evaluateMappingQuality(mappingResults, minConfidenceThreshold);

    // 5. 総合スコア計算
    const overallScore = this.calculateOverallScore(categoryScores, mappingQuality, dataQualityIssues);

    const processingTime = Date.now() - startTime;

    return {
      overallScore,
      categoryScores,
      missingKPIs,
      dataQualityIssues,
      mappingQuality,
      processingTimeMs: processingTime,
      checkedAt: new Date()
    };
  }

  /**
   * カテゴリ別必須KPIの定義
   * KPI辞書の実際のIDに合わせて修正
   */
  static getRequiredKPIsByCategory(): Record<string, Array<{id: string, name: string, importance: 'critical' | 'important' | 'optional'}>> {
    return {
      Environment: [
        { id: 'CO2_SCOPE1', name: 'Scope1排出量', importance: 'critical' },
        { id: 'CO2_SCOPE2', name: 'Scope2排出量', importance: 'critical' },
        { id: 'ENERGY_USE', name: 'エネルギー使用量', importance: 'critical' },
        { id: 'WATER_USE', name: '水使用量', importance: 'important' },
        { id: 'WASTE_TOTAL', name: '廃棄物総量', importance: 'important' },
        { id: 'RENEWABLE_ENERGY', name: '再生可能エネルギー使用率', importance: 'optional' },
        { id: 'WASTE_RECYCLED', name: 'リサイクル率', importance: 'optional' }
      ],
      Social: [
        { id: 'EMPLOYEE_COUNT', name: '従業員数', importance: 'critical' },
        { id: 'FEMALE_RATIO', name: '女性比率', importance: 'important' },
        { id: 'SAFETY_INCIDENTS', name: '労働災害件数', importance: 'critical' },
        { id: 'TRAINING_HOURS', name: '研修時間', importance: 'important' },
        { id: 'EMPLOYEE_TURNOVER', name: '従業員離職率', importance: 'optional' }
      ],
      Governance: [
        { id: 'BOARD_INDEPENDENCE', name: '独立取締役比率', importance: 'critical' },
        { id: 'BOARD_FEMALE_RATIO', name: '取締役会女性比率', importance: 'important' },
        { id: 'COMPLIANCE_TRAINING', name: 'コンプライアンス研修受講率', importance: 'critical' },
        { id: 'RISK_INCIDENTS', name: 'リスク事案件数', importance: 'important' }
      ],
      Financial: [
        { id: 'REVENUE', name: '売上高', importance: 'critical' },
        { id: 'OPERATING_PROFIT', name: '営業利益', importance: 'critical' },
        { id: 'ROE', name: '自己資本利益率', importance: 'important' }
      ]
    };
  }

  /**
   * 欠損KPIの特定
   */
  private static identifyMissingKPIs(
    mappingResults: MappingResult[],
    requiredKPIs: Record<string, Array<{id: string, name: string, importance: 'critical' | 'important' | 'optional'}>>,
    requiredCategories: string[]
  ): ComplianceCheckResult['missingKPIs'] {
    const missingKPIs: ComplianceCheckResult['missingKPIs'] = [];
    
    // マッピングされたKPIのIDセットを作成
    const mappedKPIIds = new Set(
      mappingResults
        .filter(result => result.suggestedKPI && result.confidence >= 0.6)
        .map(result => result.suggestedKPI!.id)
    );

    // 各カテゴリの必須KPIをチェック
    for (const category of requiredCategories) {
      const categoryKPIs = requiredKPIs[category] || [];
      
      for (const requiredKPI of categoryKPIs) {
        if (!mappedKPIIds.has(requiredKPI.id)) {
          missingKPIs.push({
            category,
            requiredKPI: requiredKPI.name,
            importance: requiredKPI.importance,
            suggestion: this.generateKPISuggestion(requiredKPI, category)
          });
        }
      }
    }

    return missingKPIs;
  }

  /**
   * カテゴリ別充足率の計算
   */
  private static calculateCategoryScores(
    mappingResults: MappingResult[],
    requiredKPIs: Record<string, Array<{id: string, name: string, importance: 'critical' | 'important' | 'optional'}>>,
    minConfidenceThreshold: number
  ): ComplianceCheckResult['categoryScores'] {
    const categoryScores = {
      Environment: 0,
      Social: 0,
      Governance: 0,
      Financial: 0
    };

    // 高信頼度でマッピングされたKPIのセット
    const highConfidenceMappedKPIs = new Set(
      mappingResults
        .filter(result => result.suggestedKPI && result.confidence >= minConfidenceThreshold)
        .map(result => result.suggestedKPI!.id)
    );

    // 各カテゴリのスコア計算
    for (const [category, kpis] of Object.entries(requiredKPIs)) {
      const totalWeight = kpis.reduce((sum, kpi) => {
        return sum + this.getKPIWeight(kpi.importance);
      }, 0);

      const achievedWeight = kpis.reduce((sum, kpi) => {
        if (highConfidenceMappedKPIs.has(kpi.id)) {
          return sum + this.getKPIWeight(kpi.importance);
        }
        return sum;
      }, 0);

      const score = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;
      
      if (category in categoryScores) {
        (categoryScores as any)[category] = Math.round(score * 100) / 100;
      }
    }

    return categoryScores;
  }

  /**
   * KPIの重要度に基づく重み計算
   */
  private static getKPIWeight(importance: 'critical' | 'important' | 'optional'): number {
    switch (importance) {
      case 'critical': return 3;
      case 'important': return 2;
      case 'optional': return 1;
      default: return 1;
    }
  }

  /**
   * データ品質の評価
   */
  private static evaluateDataQuality(mappingResults: MappingResult[]): ComplianceCheckResult['dataQualityIssues'] {
    const issues: ComplianceCheckResult['dataQualityIssues'] = [];

    mappingResults.forEach(result => {
      // 低信頼度マッピングの検出
      if (result.confidence < 0.6) {
        issues.push({
          kpiIdentifier: result.kpiIdentifier,
          issue: `マッピング信頼度が低い (${Math.round(result.confidence * 100)}%)`,
          severity: 'warning',
          recommendation: '手動でのKPIマッピング確認を推奨します'
        });
      }

      // 極端に低い信頼度
      if (result.confidence < 0.3) {
        issues.push({
          kpiIdentifier: result.kpiIdentifier,
          issue: `マッピング信頼度が極端に低い (${Math.round(result.confidence * 100)}%)`,
          severity: 'error',
          recommendation: 'KPI識別子の見直しまたは手動マッピングが必要です'
        });
      }

      // データ量不足
      if (result.recordCount < 3) {
        issues.push({
          kpiIdentifier: result.kpiIdentifier,
          issue: `データポイント数が不足 (${result.recordCount}レコード)`,
          severity: 'warning',
          recommendation: '3レコード以上のデータ提供を推奨します'
        });
      }

      // 単位の不一致
      if (result.suggestedKPI && result.unit !== result.suggestedKPI.unit && result.unit && result.suggestedKPI.unit) {
        issues.push({
          kpiIdentifier: result.kpiIdentifier,
          issue: `単位の不一致 (データ: ${result.unit}, 期待: ${result.suggestedKPI.unit})`,
          severity: 'warning',
          recommendation: '単位の確認と統一を推奨します'
        });
      }
    });

    return issues;
  }

  /**
   * マッピング品質の評価
   */
  private static evaluateMappingQuality(
    mappingResults: MappingResult[],
    minConfidenceThreshold: number
  ): ComplianceCheckResult['mappingQuality'] {
    const totalMapped = mappingResults.length;
    const highConfidence = mappingResults.filter(r => r.confidence >= 0.8).length;
    const mediumConfidence = mappingResults.filter(r => r.confidence >= 0.6 && r.confidence < 0.8).length;
    const lowConfidence = mappingResults.filter(r => r.confidence > 0 && r.confidence < 0.6).length;
    const unmapped = mappingResults.filter(r => !r.suggestedKPI || r.confidence === 0).length;

    return {
      totalMapped,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      unmapped
    };
  }

  /**
   * 総合スコアの計算
   */
  private static calculateOverallScore(
    categoryScores: ComplianceCheckResult['categoryScores'],
    mappingQuality: ComplianceCheckResult['mappingQuality'],
    dataQualityIssues: ComplianceCheckResult['dataQualityIssues']
  ): number {
    // カテゴリスコアの加重平均（環境40%, 社会30%, ガバナンス30%）
    const categoryScore = (
      categoryScores.Environment * 0.4 +
      categoryScores.Social * 0.3 +
      categoryScores.Governance * 0.3
    );

    // マッピング品質スコア（高信頼度の割合）
    const mappingScore = mappingQuality.totalMapped > 0 ? 
      (mappingQuality.highConfidence / mappingQuality.totalMapped) * 100 : 0;

    // データ品質ペナルティ
    const criticalIssues = dataQualityIssues.filter(issue => issue.severity === 'error').length;
    const warningIssues = dataQualityIssues.filter(issue => issue.severity === 'warning').length;
    const qualityPenalty = (criticalIssues * 10) + (warningIssues * 5);

    // 総合スコア計算
    const baseScore = (categoryScore * 0.7) + (mappingScore * 0.3);
    const finalScore = Math.max(0, baseScore - qualityPenalty);

    return Math.round(finalScore * 100) / 100;
  }

  /**
   * KPI欠損に対する提案生成
   */
  private static generateKPISuggestion(
    requiredKPI: {id: string, name: string, importance: 'critical' | 'important' | 'optional'},
    category: string
  ): string {
    const suggestions: Record<string, string> = {
      'CO2_SCOPE1': 'スコープ1の排出量データを収集し、CO2_SCOPE1として報告してください',
      'CO2_SCOPE2': 'スコープ2の排出量データを収集し、CO2_SCOPE2として報告してください',
      'ENERGY_USE': '電力・ガス・燃料の使用量を統合し、ENERGY_USEとして集計してください',
      'WATER_USE': '上水・工業用水の使用量をWATER_USEとして測定してください',
      'WASTE_TOTAL': '廃棄物の総量をWASTE_TOTALとして報告してください',
      'RENEWABLE_ENERGY': '再生可能エネルギーの使用率をRENEWABLE_ENERGYとして測定してください',
      'WASTE_RECYCLED': 'リサイクル率をWASTE_RECYCLEDとして測定してください',
      'EMPLOYEE_COUNT': '正社員・契約社員・派遣社員の総数をEMPLOYEE_COUNTとして報告してください',
      'FEMALE_RATIO': '管理職における女性の比率をFEMALE_RATIOとして算出してください',
      'SAFETY_INCIDENTS': '労働災害・事故件数をSAFETY_INCIDENTSとして記録してください',
      'COMPLIANCE_TRAINING': 'コンプライアンス研修受講率をCOMPLIANCE_TRAININGとして測定してください'
    };

    return suggestions[requiredKPI.id] || 
      `${requiredKPI.name}のデータ収集と${category}カテゴリでの報告が必要です`;
  }

  /**
   * 詳細レポートの生成
   */
  static generateDetailedReport(complianceResult: ComplianceCheckResult): {
    summary: string;
    recommendations: string[];
    nextSteps: string[];
  } {
    const { overallScore, categoryScores, missingKPIs, dataQualityIssues, mappingQuality } = complianceResult;

    // サマリー生成
    const summary = this.generateSummary(overallScore, categoryScores, missingKPIs.length);

    // 推奨事項生成
    const recommendations = this.generateRecommendations(categoryScores, missingKPIs, dataQualityIssues);

    // 次のステップ生成
    const nextSteps = this.generateNextSteps(overallScore, missingKPIs, mappingQuality);

    return { summary, recommendations, nextSteps };
  }

  /**
   * サマリー生成
   */
  private static generateSummary(
    overallScore: number,
    categoryScores: ComplianceCheckResult['categoryScores'],
    missingKPICount: number
  ): string {
    let summary = `総合コンプライアンススコア: ${overallScore}%\n`;
    
    if (overallScore >= 80) {
      summary += '優秀なコンプライアンス状況です。';
    } else if (overallScore >= 60) {
      summary += '良好なコンプライアンス状況ですが、改善の余地があります。';
    } else {
      summary += '重要な改善が必要なコンプライアンス状況です。';
    }

    summary += `\n\nカテゴリ別スコア:`;
    summary += `\n• 環境: ${categoryScores.Environment}%`;
    summary += `\n• 社会: ${categoryScores.Social}%`;
    summary += `\n• ガバナンス: ${categoryScores.Governance}%`;

    if (missingKPICount > 0) {
      summary += `\n\n${missingKPICount}個のKPIが不足しています。`;
    }

    return summary;
  }

  /**
   * 推奨事項生成
   */
  private static generateRecommendations(
    categoryScores: ComplianceCheckResult['categoryScores'],
    missingKPIs: ComplianceCheckResult['missingKPIs'],
    dataQualityIssues: ComplianceCheckResult['dataQualityIssues']
  ): string[] {
    const recommendations: string[] = [];

    // カテゴリ別推奨
    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score < 60) {
        recommendations.push(`${category}カテゴリのKPI充足率向上（現在${score}%）`);
      }
    });

    // 重要な欠損KPI
    const criticalMissing = missingKPIs.filter(kpi => kpi.importance === 'critical');
    if (criticalMissing.length > 0) {
      recommendations.push(`クリティカルなKPI（${criticalMissing.map(k => k.requiredKPI).join(', ')}）の優先的な対応`);
    }

    // データ品質改善
    const criticalIssues = dataQualityIssues.filter(issue => issue.severity === 'error');
    if (criticalIssues.length > 0) {
      recommendations.push('データ品質の改善（エラーレベル問題の解決）');
    }

    return recommendations;
  }

  /**
   * 次のステップ生成
   */
  private static generateNextSteps(
    overallScore: number,
    missingKPIs: ComplianceCheckResult['missingKPIs'],
    mappingQuality: ComplianceCheckResult['mappingQuality']
  ): string[] {
    const nextSteps: string[] = [];

    if (overallScore < 60) {
      nextSteps.push('コンプライアンス改善計画の策定');
      nextSteps.push('重要度の高いKPIから順次データ収集開始');
    }

    if (missingKPIs.length > 0) {
      nextSteps.push('欠損KPIの収集体制構築');
      nextSteps.push('データ収集スケジュールの作成');
    }

    if (mappingQuality.lowConfidence > 0 || mappingQuality.unmapped > 0) {
      nextSteps.push('低信頼度マッピングの手動確認');
      nextSteps.push('KPI識別子の標準化検討');
    }

    nextSteps.push('次回チェック日程の設定');

    return nextSteps;
  }
} 
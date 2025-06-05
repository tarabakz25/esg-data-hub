import { OpenAIEmbeddingClient } from './openai-client';
import { VectorUtils } from './prisma';
import { KPIDictionary, KPIDictionaryManager, ESG_KPI_DICTIONARY } from './kpi-dictionary';
import { type KPIGroupData } from './csv-analyzer';

export interface KPIEmbedding {
  kpiId: string;
  kpi: KPIDictionary;
  embedding: number[];
  embeddingText: string;
}

export interface SimilarityResult {
  kpi: KPIDictionary;
  similarity: number;
  distance: number;
  embeddingText: string;
}

export interface ColumnMapping {
  columnName: string;
  sampleValues?: string[];
  topMatches: SimilarityResult[];
  bestMatch?: SimilarityResult;
  confidence: number;
}

export interface KPIGroupMapping {
  kpiIdentifier: string;
  groupData: KPIGroupData;
  topMatches: SimilarityResult[];
  bestMatch?: SimilarityResult;
  adjustedConfidence: number;
  originalConfidence: number;
  confidenceBoosts: {
    unitMatch: number;
    dataQuality: number;
    sampleSize: number;
    valueRange: number;
  };
}

/**
 * KPI埋め込み管理とセマンティック検索を提供するクラス
 */
export class KPIEmbeddingManager {
  private dictionaryManager: KPIDictionaryManager;
  private openaiClient: OpenAIEmbeddingClient;
  private kpiEmbeddings: Map<string, KPIEmbedding>;

  constructor(embeddingClient?: any) {
    this.dictionaryManager = new KPIDictionaryManager();
    this.openaiClient = embeddingClient || new OpenAIEmbeddingClient();
    this.kpiEmbeddings = new Map();
  }

  /**
   * すべてのKPIの埋め込みを生成
   */
  async generateAllKPIEmbeddings(): Promise<KPIEmbedding[]> {
    const kpis = this.dictionaryManager.getAll();
    const embeddingTexts = kpis.map(kpi => 
      this.dictionaryManager.createEmbeddingText(kpi)
    );

    try {
      const embeddings = await this.openaiClient.generateBatchEmbeddings(embeddingTexts);
      
      const kpiEmbeddings: KPIEmbedding[] = [];
      for (let i = 0; i < kpis.length; i++) {
        const kpiEmbedding: KPIEmbedding = {
          kpiId: kpis[i].id,
          kpi: kpis[i],
          embedding: embeddings[i],
          embeddingText: embeddingTexts[i],
        };
        
        this.kpiEmbeddings.set(kpis[i].id, kpiEmbedding);
        kpiEmbeddings.push(kpiEmbedding);
      }

      return kpiEmbeddings;
    } catch (error) {
      console.error('Failed to generate KPI embeddings:', error);
      throw error;
    }
  }

  /**
   * 列名の埋め込みとKPI辞書の類似度検索
   */
  async findSimilarKPIs(
    columnEmbedding: number[],
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<SimilarityResult[]> {
    if (this.kpiEmbeddings.size === 0) {
      await this.generateAllKPIEmbeddings();
    }

    const similarities: SimilarityResult[] = [];

    const kpiEmbeddingArray = Array.from(this.kpiEmbeddings.values());
    
    for (const kpiEmbedding of kpiEmbeddingArray) {
      const similarity = this.calculateCosineSimilarity(columnEmbedding, kpiEmbedding.embedding);
      const distance = this.calculateL2Distance(columnEmbedding, kpiEmbedding.embedding);

      if (similarity >= threshold) {
        similarities.push({
          kpi: kpiEmbedding.kpi,
          similarity,
          distance,
          embeddingText: kpiEmbedding.embeddingText,
        });
      }
    }

    // 類似度の高い順にソート
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * 新規追加: KPIグループデータから最適なKPIマッピングを提案
   */
  async suggestKPIGroupMapping(
    groupData: KPIGroupData,
    limit: number = 3,
    threshold: number = 0.5
  ): Promise<KPIGroupMapping> {
    console.log(`🤖 KPI Group mapping for identifier: "${groupData.kpiIdentifier}"`);
    
    try {
      // 1. GPT-4o-miniを使用したインテリジェント分析
      const availableKPIs = this.dictionaryManager.getAll().map(kpi => kpi.name);
      const embeddingText = this.createKPIGroupEmbeddingText(groupData);
      
      console.log(`🧠 Analyzing with GPT-4o-mini: "${embeddingText}"`);
      
      const gptAnalysis = await this.openaiClient.analyzeKPIMapping(embeddingText, availableKPIs);
      console.log(`💡 GPT-4o-mini suggestion: ${gptAnalysis.suggestedKPI} (confidence: ${Math.round(gptAnalysis.confidence * 100)}%)`);
      console.log(`📝 Reasoning: ${gptAnalysis.reasoning}`);

      // 2. 従来の埋め込みベース検索
      const groupEmbedding = await this.openaiClient.generateEmbedding(embeddingText);
      const similarKPIs = await this.findSimilarKPIs(groupEmbedding, limit, threshold);

      // 3. GPT-4o-miniの提案を考慮した結果の調整
      let adjustedResults = similarKPIs.map(result => {
        const adjustedSimilarity = this.calculateAdjustedConfidence(
          result.similarity, 
          groupData, 
          result.kpi
        );
        
        // GPT-4o-miniの提案が一致する場合はボーナス
        if (gptAnalysis.suggestedKPI === result.kpi.name && gptAnalysis.confidence > 0.5) {
          const gptBonus = gptAnalysis.confidence * 0.2; // 最大20%のボーナス
          console.log(`🚀 GPT-4o-mini match bonus: +${Math.round(gptBonus * 100)}% for ${result.kpi.name}`);
          return {
            ...result,
            similarity: Math.min(adjustedSimilarity + gptBonus, 1.0)
          };
        }
        
        return {
          ...result,
          similarity: adjustedSimilarity
        };
      });

      // 4. GPT-4o-miniが新しい提案をした場合の処理
      if (gptAnalysis.suggestedKPI && gptAnalysis.confidence > 0.7) {
        const suggestedKPI = this.dictionaryManager.getAll().find(kpi => kpi.name === gptAnalysis.suggestedKPI);
        if (suggestedKPI && !adjustedResults.find(r => r.kpi.name === gptAnalysis.suggestedKPI)) {
          console.log(`🌟 Adding GPT-4o-mini high-confidence suggestion: ${gptAnalysis.suggestedKPI}`);
          adjustedResults.unshift({
            kpi: suggestedKPI,
            similarity: gptAnalysis.confidence,
            distance: 1 - gptAnalysis.confidence,
            embeddingText: `GPT-4o-mini suggestion: ${gptAnalysis.reasoning}`
          });
        }
      }

             // 5. 再ソート（調整後の信頼度で）
       const sortedResults = adjustedResults.sort((a, b) => b.similarity - a.similarity);

          const bestMatch = sortedResults.length > 0 ? sortedResults[0] : undefined;
      const originalConfidence = similarKPIs.length > 0 ? similarKPIs[0].similarity : 0;
      const adjustedConfidence = bestMatch?.similarity || 0;

      // 6. 信頼度ボーストの詳細計算
      const confidenceBoosts = this.calculateConfidenceBoosts(groupData, bestMatch?.kpi);

      console.log(`✅ Best hybrid match: ${bestMatch?.kpi.name || 'None'} (original: ${Math.round(originalConfidence * 100)}%, adjusted: ${Math.round(adjustedConfidence * 100)}%)`);

      return {
        kpiIdentifier: groupData.kpiIdentifier,
        groupData,
        topMatches: sortedResults,
        bestMatch,
        adjustedConfidence,
        originalConfidence,
        confidenceBoosts
      };
    } catch (error) {
      console.error(`❌ Error in KPI group mapping for ${groupData.kpiIdentifier}:`, error);
      
      // フォールバック: 従来の埋め込みベース検索のみ
      console.log(`🔄 Falling back to embedding-only search for ${groupData.kpiIdentifier}`);
      
      try {
        const embeddingText = this.createKPIGroupEmbeddingText(groupData);
        const groupEmbedding = await this.openaiClient.generateEmbedding(embeddingText);
        const similarKPIs = await this.findSimilarKPIs(groupEmbedding, limit, threshold);
        
        const adjustedResults = similarKPIs.map(result => ({
          ...result,
          similarity: this.calculateAdjustedConfidence(result.similarity, groupData, result.kpi)
        }));
        
        const sortedResults = adjustedResults.sort((a, b) => b.similarity - a.similarity);
        const bestMatch = sortedResults.length > 0 ? sortedResults[0] : undefined;
        const confidenceBoosts = this.calculateConfidenceBoosts(groupData, bestMatch?.kpi);
        
        console.log(`✅ Fallback match: ${bestMatch?.kpi.name || 'None'} (${Math.round((bestMatch?.similarity || 0) * 100)}%)`);
        
        return {
          kpiIdentifier: groupData.kpiIdentifier,
          groupData,
          topMatches: sortedResults,
          bestMatch,
          adjustedConfidence: bestMatch?.similarity || 0,
          originalConfidence: similarKPIs.length > 0 ? similarKPIs[0].similarity : 0,
          confidenceBoosts
        };
      } catch (fallbackError) {
        console.error(`❌ Fallback also failed for ${groupData.kpiIdentifier}:`, fallbackError);
        
        // 最後のフォールバック: 空の結果を返す
        return {
          kpiIdentifier: groupData.kpiIdentifier,
          groupData,
          topMatches: [],
          bestMatch: undefined,
          adjustedConfidence: 0,
          originalConfidence: 0,
          confidenceBoosts: { unitMatch: 0, dataQuality: 0, sampleSize: 0, valueRange: 0 }
        };
      }
    }
  }

  /**
   * 新規追加: KPIグループ用の拡張埋め込みテキスト生成
   */
  private createKPIGroupEmbeddingText(group: KPIGroupData): string {
    const unitText = group.commonUnit ? ` in ${group.commonUnit}` : '';
    const consistencyText = group.unitConsistency ? 'consistent' : 'inconsistent';
    
    // 基本情報
    let text = `KPI identifier: ${group.kpiIdentifier}. `;
    text += `Total aggregated value: ${group.aggregatedValue}${unitText}. `;
    text += `Number of records: ${group.recordCount}. `;
    
    // 統計情報
    text += `Value statistics: minimum ${group.valueRange.min.toFixed(2)}, `;
    text += `maximum ${group.valueRange.max.toFixed(2)}, `;
    text += `average ${group.valueRange.avg.toFixed(2)}${unitText}. `;
    
    // データ品質情報
    text += `Unit consistency: ${consistencyText}. `;
    text += `Data quality assessment: ${group.recordCount >= 5 ? 'high' : group.recordCount >= 3 ? 'medium' : 'low'} sample size. `;
    
    // KPIタイプの推定を追加
    const estimatedType = this.estimateKPICategory(group);
    if (estimatedType !== 'Unknown') {
      text += `Estimated category: ${estimatedType}. `;
    }
    
    // サンプルデータ
    if (group.records.length > 0) {
      const sampleValues = group.records.slice(0, 3).map(r => 
        `${r.value}${r.unit ? ' ' + r.unit : ''}`
      ).join(', ');
      text += `Sample values: ${sampleValues}.`;
    }

    return text;
  }

  /**
   * 新規追加: 調整された信頼度計算
   */
  private calculateAdjustedConfidence(
    baseSimilarity: number, 
    group: KPIGroupData, 
    kpi: KPIDictionary
  ): number {
    let adjustedScore = baseSimilarity;
    
    // 単位の一致度ボーナス（最大+0.15）
    if (group.commonUnit && kpi.unit) {
      const unitSimilarity = this.calculateUnitSimilarity(group.commonUnit, kpi.unit);
      adjustedScore += unitSimilarity * 0.15;
    }
    
    // データ品質ボーナス（最大+0.10）
    if (group.unitConsistency && group.recordCount >= 3) {
      const qualityBonus = Math.min(0.10, 0.02 * group.recordCount);
      adjustedScore += qualityBonus;
    }
    
    // サンプルサイズボーナス（最大+0.08）
    if (group.recordCount >= 5) {
      const sizeBonus = Math.min(0.08, 0.01 * (group.recordCount - 4));
      adjustedScore += sizeBonus;
    }
    
    // 値の妥当性ボーナス（最大+0.07）
    if (this.isValueRangeReasonable(group, kpi)) {
      adjustedScore += 0.07;
    }
    
    // カテゴリ一致ボーナス（最大+0.10）
    const estimatedCategory = this.estimateKPICategory(group);
    if (estimatedCategory !== 'Unknown' && kpi.category.includes(estimatedCategory)) {
      adjustedScore += 0.10;
    }
    
    return Math.min(adjustedScore, 1.0);
  }

  /**
   * 新規追加: 単位の類似度計算
   */
  private calculateUnitSimilarity(unit1: string, unit2: string): number {
    if (unit1 === unit2) return 1.0;
    
    // 単位の正規化マッピング
    const unitNormalization: Record<string, string> = {
      // CO2系
      't-co2': 'co2', 'kg-co2': 'co2', 'ton-co2': 'co2',
      // エネルギー系
      'kwh': 'energy', 'mwh': 'energy', 'gwh': 'energy', 'gj': 'energy',
      // 水系
      'm3': 'volume', 'l': 'volume', 'liter': 'volume', 'litre': 'volume',
      // 重量系
      'kg': 'weight', 't': 'weight', 'ton': 'weight', 'g': 'weight',
      // 人数系
      '人': 'people', 'person': 'people', 'people': 'people',
      // パーセント系
      '%': 'percentage', 'percent': 'percentage'
    };
    
    const norm1 = unitNormalization[unit1.toLowerCase()] || unit1.toLowerCase();
    const norm2 = unitNormalization[unit2.toLowerCase()] || unit2.toLowerCase();
    
    return norm1 === norm2 ? 0.8 : 0.0;
  }

  /**
   * 新規追加: 値の範囲妥当性チェック
   */
  private isValueRangeReasonable(group: KPIGroupData, kpi: KPIDictionary): boolean {
    const { min, max, avg } = group.valueRange;
    
    // 基本的な妥当性チェック
    if (min < 0) return false; // ESGデータで負の値は通常異常
    
    // 極端な外れ値チェック（最大値が平均の1000倍以上）
    if (max > avg * 1000 && avg > 0) return false;
    
    // ゼロ除算チェック
    if (avg === 0) return min === 0 && max === 0;
    
    // KPIカテゴリ別の妥当性チェック
    const category = kpi.category.toLowerCase();
    
    if (category.includes('percentage') || category.includes('ratio')) {
      // パーセンテージ系は0-1の範囲が妥当
      return max <= 1.0 && min >= 0;
    }
    
    if (category.includes('emissions') || category.includes('energy')) {
      // 排出量やエネルギーは正の値で、現実的な範囲
      return min >= 0 && max < 1e9; // 10億未満
    }
    
    return true;
  }

  /**
   * 新規追加: KPIカテゴリの推定
   */
  private estimateKPICategory(group: KPIGroupData): string {
    const identifier = group.kpiIdentifier.toLowerCase();
    const unit = group.commonUnit.toLowerCase();
    
    // 環境指標
    if (identifier.includes('ghg') || identifier.includes('co2') || identifier.includes('emission') ||
        unit.includes('co2') || unit.includes('carbon')) {
      return 'Environment';
    }
    
    if (identifier.includes('energy') || identifier.includes('power') || identifier.includes('fuel') ||
        unit.includes('kwh') || unit.includes('mwh') || unit.includes('gj')) {
      return 'Environment';
    }
    
    if (identifier.includes('water') || identifier.includes('h2o') ||
        unit.includes('m3') || unit.includes('liter') || unit.includes('litre')) {
      return 'Environment';
    }
    
    if (identifier.includes('waste') || identifier.includes('recycle') || identifier.includes('disposal')) {
      return 'Environment';
    }
    
    // 社会指標
    if (identifier.includes('employee') || identifier.includes('staff') || identifier.includes('worker') ||
        identifier.includes('human') || identifier.includes('people')) {
      return 'Social';
    }
    
    if (identifier.includes('safety') || identifier.includes('accident') || identifier.includes('incident')) {
      return 'Social';
    }
    
    if (identifier.includes('diversity') || identifier.includes('gender') || identifier.includes('female')) {
      return 'Social';
    }
    
    // ガバナンス指標
    if (identifier.includes('governance') || identifier.includes('board') || identifier.includes('compliance')) {
      return 'Governance';
    }
    
    return 'Unknown';
  }

  /**
   * 新規追加: 信頼度ボーストの詳細計算
   */
  private calculateConfidenceBoosts(
    group: KPIGroupData, 
    kpi?: KPIDictionary
  ): KPIGroupMapping['confidenceBoosts'] {
    if (!kpi) {
      return { unitMatch: 0, dataQuality: 0, sampleSize: 0, valueRange: 0 };
    }
    
    const unitMatch = group.commonUnit && kpi.unit ? 
      this.calculateUnitSimilarity(group.commonUnit, kpi.unit) * 0.15 : 0;
    
    const dataQuality = group.unitConsistency && group.recordCount >= 3 ? 
      Math.min(0.10, 0.02 * group.recordCount) : 0;
    
    const sampleSize = group.recordCount >= 5 ? 
      Math.min(0.08, 0.01 * (group.recordCount - 4)) : 0;
    
    const valueRange = this.isValueRangeReasonable(group, kpi) ? 0.07 : 0;
    
    return { unitMatch, dataQuality, sampleSize, valueRange };
  }

  /**
   * 列名とサンプル値から最適なKPIマッピングを提案（従来の列ベース）
   */
  async suggestKPIMapping(
    columnName: string,
    sampleValues?: string[],
    limit: number = 3
  ): Promise<ColumnMapping> {
    console.log(`🤖 Column-based mapping for column: "${columnName}"`);
    
    // 1. 列名の埋め込み生成
    let searchText = `Column name: ${columnName}`;
    
    // 2. サンプル値があれば追加（簡易分析）
    if (sampleValues && sampleValues.length > 0) {
      const sampleStr = sampleValues.slice(0, 3).join(', ');
      searchText += `. Sample values: ${sampleStr}`;
    }

    console.log(`🔍 Search text: "${searchText}"`);

    const columnEmbedding = await this.openaiClient.generateEmbedding(searchText);

    // 3. 類似度検索
    const similarKPIs = await this.findSimilarKPIs(columnEmbedding, limit, 0.5);

    // 4. 信頼度計算
    const confidence = similarKPIs.length > 0 ? similarKPIs[0].similarity : 0;
    const bestMatch = similarKPIs.length > 0 ? similarKPIs[0] : undefined;

    console.log(`✅ Best column match: ${bestMatch?.kpi.name || 'None'} (confidence: ${Math.round(confidence * 100)}%)`);

    return {
      columnName,
      sampleValues,
      topMatches: similarKPIs,
      bestMatch,
      confidence,
    };
  }

  /**
   * テキスト検索とベクトル検索のハイブリッド検索
   */
  async hybridKPISearch(
    query: string,
    vectorWeight: number = 0.7,
    textWeight: number = 0.3
  ): Promise<SimilarityResult[]> {
    // 1. テキスト検索
    const textResults = this.dictionaryManager.searchByText(query);
    
    // 2. ベクトル検索
    const queryEmbedding = await this.openaiClient.generateEmbedding(query);
    const vectorResults = await this.findSimilarKPIs(queryEmbedding, 10, 0.3);

    // 3. スコア統合
    const hybridResults = new Map<string, SimilarityResult>();

    // テキスト検索結果にスコア付与
    textResults.forEach((kpi, index) => {
      const textScore = 1.0 - (index / textResults.length); // 順位ベーススコア
      const existingVector = vectorResults.find(r => r.kpi.id === kpi.id);
      
      hybridResults.set(kpi.id, {
        kpi,
        similarity: textScore * textWeight + (existingVector?.similarity || 0) * vectorWeight,
        distance: existingVector?.distance || 1.0,
        embeddingText: this.dictionaryManager.createEmbeddingText(kpi),
      });
    });

    // ベクトル検索結果を追加・更新
    vectorResults.forEach(result => {
      const existing = hybridResults.get(result.kpi.id);
      if (existing) {
        // 既に存在する場合はベクトルスコアを更新
        existing.similarity = existing.similarity * textWeight + result.similarity * vectorWeight;
        existing.distance = result.distance;
      } else {
        // 新規追加（ベクトルスコアのみ）
        hybridResults.set(result.kpi.id, {
          ...result,
          similarity: result.similarity * vectorWeight,
        });
      }
    });

    return Array.from(hybridResults.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  /**
   * KPI辞書の統計情報
   */
  getDictionaryStats() {
    return {
      ...this.dictionaryManager.getStatistics(),
      embeddingsGenerated: this.kpiEmbeddings.size,
    };
  }

  /**
   * コサイン類似度計算
   */
  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * L2距離計算
   */
  private calculateL2Distance(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions must match');
    }

    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
      const diff = vecA[i] - vecB[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  }

  /**
   * 特定のKPIの埋め込みを取得
   */
  getKPIEmbedding(kpiId: string): KPIEmbedding | undefined {
    return this.kpiEmbeddings.get(kpiId);
  }

  /**
   * カテゴリ別のKPI分布を取得
   */
  getCategoryDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const kpi of this.dictionaryManager.getAll()) {
      distribution[kpi.category] = (distribution[kpi.category] || 0) + 1;
    }
    return distribution;
  }
} 
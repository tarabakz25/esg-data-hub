import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiEmbeddingClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // text-embedding-004は最新のembeddingモデル（768次元）
    this.model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.model.embedContent(text);
      const embedding = result.embedding;
      
      if (!embedding || !embedding.values) {
        throw new Error('Invalid embedding response from Gemini');
      }
      
      return embedding.values;
    } catch (error) {
      console.error('Gemini embedding generation failed:', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    // Gemini APIはバッチ処理をサポートしていないため、順次処理
    // レート制限を考慮してリトライ機能付きで実装
    const promises = texts.map(text => 
      this.retryWithBackoff(() => this.generateEmbedding(text))
    );
    return Promise.all(promises);
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // レート制限エラーの場合はより長く待機
        const isRateLimit = error instanceof Error && 
          (error.message.includes('quota') || error.message.includes('rate'));
        const delay = isRateLimit ? baseDelay * Math.pow(3, i) : baseDelay * Math.pow(2, i);
        
        console.warn(`Gemini API retry ${i + 1}/${maxRetries} after ${delay}ms. Error:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  // 類似度計算用のヘルパー関数
  static cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

/**
 * テスト用のモックEmbeddingClient
 * Gemini APIの代わりに文字列マッチングベースの類似度を計算
 */
export class MockEmbeddingClient {
  private readonly EMBEDDING_SIZE = 768; // Geminiと同じ768次元

  /**
   * KPIキーワードマッピング
   */
  private readonly KPI_KEYWORDS = {
    'GHG_EMISSIONS': ['温室効果ガス', 'ghg', 'emission', 'co2', 'carbon', '排出', 'カーボン'],
    'ENERGY_USAGE': ['エネルギー', 'energy', '電力', '使用量', 'consumption', 'kwh', 'mwh'],
    'WATER_USAGE': ['水', 'water', '水使用', '用水', 'm3', 'リットル', 'liter'],
    'WASTE_AMOUNT': ['廃棄物', 'waste', 'ゴミ', 'garbage', 'disposal', '処分'],
    'EMPLOYEE_COUNT': ['従業員', 'employee', '社員', '人数', 'count', 'staff', 'worker'],
    'FEMALE_MGMT_RATIO': ['女性', 'female', '管理職', 'management', '比率', 'ratio', 'mgmt'],
    'SAFETY_INCIDENTS': ['安全', 'safety', '事故', 'incident', '災害', 'accident'],
    'TRAINING_HOURS': ['研修', 'training', '教育', 'education', '時間', 'hours', '学習'],
    'BOARD_MEETINGS': ['取締役', 'board', '会議', 'meeting', '役員', 'director'],
    'COMPLIANCE_RATE': ['コンプライアンス', 'compliance', '法令', '遵守', '率', 'rate']
  };

  async generateEmbedding(text: string): Promise<number[]> {
    // テキストを正規化
    const normalizedText = text.toLowerCase();
    
    // 各KPIとの類似度を計算
    const kpiScores = Object.entries(this.KPI_KEYWORDS).map(([kpiId, keywords]) => {
      let score = 0;
      
      // キーワードマッチング
      keywords.forEach(keyword => {
        if (normalizedText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
      
      // 部分マッチングにもスコアを与える
      keywords.forEach(keyword => {
        const similarity = this.calculateStringSimilarity(normalizedText, keyword.toLowerCase());
        if (similarity > 0.7) {
          score += similarity * 0.5;
        }
      });
      
      return { kpiId, score };
    });

    // 最高スコアのKPIを特定
    const maxScore = Math.max(...kpiScores.map(s => s.score));
    const bestMatch = kpiScores.find(s => s.score === maxScore);

    // エンベディングベクトルを生成（768次元）
    const embedding = new Array(this.EMBEDDING_SIZE).fill(0);
    
    if (bestMatch && bestMatch.score > 0) {
      // 最適マッチのKPIに基づいてベクトルを生成
      const kpiIndex = Object.keys(this.KPI_KEYWORDS).indexOf(bestMatch.kpiId);
      const baseValue = 0.8 + (bestMatch.score * 0.2); // 0.8-1.0の範囲
      
      // 特定の次元に高い値を設定（768次元に対応）
      for (let i = 0; i < 50; i++) {
        embedding[kpiIndex * 50 + i] = baseValue + (Math.random() * 0.1 - 0.05);
      }
      
      // その他の次元にノイズを追加
      for (let i = 0; i < this.EMBEDDING_SIZE; i++) {
        if (embedding[i] === 0) {
          embedding[i] = Math.random() * 0.3;
        }
      }
    } else {
      // マッチしない場合はランダムな低い値
      for (let i = 0; i < this.EMBEDDING_SIZE; i++) {
        embedding[i] = Math.random() * 0.4;
      }
    }

    return embedding;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const promises = texts.map(text => this.generateEmbedding(text));
    return Promise.all(promises);
  }

  /**
   * 文字列類似度計算（簡易版）
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * レーベンシュタイン距離計算
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // 類似度計算用のヘルパー関数
  static cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
} 
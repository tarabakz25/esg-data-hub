import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Vector utilities for embedding operations
export class VectorUtils {
  /**
   * ベクトル配列を PostgreSQL vector型の文字列に変換
   */
  static vectorToString(vector: number[]): string {
    return `[${vector.join(',')}]`;
  }

  /**
   * PostgreSQL vector型の文字列をベクトル配列に変換
   */
  static stringToVector(vectorString: string): number[] {
    // "[1.0,2.0,3.0]" -> [1.0, 2.0, 3.0]
    const cleanString = vectorString.replace(/[\[\]]/g, '');
    return cleanString.split(',').map(num => parseFloat(num.trim()));
  }

  /**
   * 類似ベクトル検索（コサイン類似度）
   */
  static async findSimilarEmbeddings(queryVector: number[], limit: number = 5, threshold: number = 0.7) {
    const vectorString = this.vectorToString(queryVector);
    return await prisma.$queryRaw`
      SELECT id, raw, 1 - (embedding <=> ${vectorString}::vector) as similarity 
      FROM "DataRow" 
      WHERE embedding IS NOT NULL 
      AND 1 - (embedding <=> ${vectorString}::vector) > ${threshold}
      ORDER BY embedding <=> ${vectorString}::vector 
      LIMIT ${limit}
    `;
  }

  /**
   * 最近傍検索（L2距離）
   */
  static async findNearestEmbeddings(queryVector: number[], limit: number = 5) {
    const vectorString = this.vectorToString(queryVector);
    return await prisma.$queryRaw`
      SELECT id, raw, embedding <-> ${vectorString}::vector as distance
      FROM "DataRow" 
      WHERE embedding IS NOT NULL 
      ORDER BY embedding <-> ${vectorString}::vector 
      LIMIT ${limit}
    `;
  }

  /**
   * 内積検索
   */
  static async findByInnerProduct(queryVector: number[], limit: number = 5) {
    const vectorString = this.vectorToString(queryVector);
    return await prisma.$queryRaw`
      SELECT id, raw, (embedding <#> ${vectorString}::vector) * -1 as inner_product
      FROM "DataRow" 
      WHERE embedding IS NOT NULL 
      ORDER BY embedding <#> ${vectorString}::vector
      LIMIT ${limit}
    `;
  }

  /**
   * 既存の類似検索メソッド（後方互換性のため）
   */
  static async findSimilar(embedding: number[], limit: number = 5) {
    return this.findSimilarEmbeddings(embedding, limit, 0.5);
  }

  /**
   * ベクトル正規化
   */
  static normalizeEmbedding(embedding: number[]): number[] {
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }
} 
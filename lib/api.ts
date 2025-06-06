import prisma from '@/lib/utils/db';

// Supabase風のAPI インターフェース
interface ApiTable {
  from(table: string): QueryBuilder;
}

interface QueryBuilder {
  select(columns: string): QueryBuilder;
  eq(column: string, value: any): QueryBuilder;
  order(column: string, options?: { ascending?: boolean }): Promise<{ data: any[], error?: any }>;
}

class PrismaApiWrapper implements ApiTable {
  from(table: string): QueryBuilder {
    return new PrismaQueryBuilder(table);
  }
}

class PrismaQueryBuilder implements QueryBuilder {
  private table: string;
  private selectColumns: string = '*';
  private whereConditions: { [key: string]: any } = {};
  private orderBy: { column: string; direction: 'asc' | 'desc' } | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string): QueryBuilder {
    this.selectColumns = columns;
    return this;
  }

  eq(column: string, value: any): QueryBuilder {
    this.whereConditions[column] = value;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): Promise<{ data: any[], error?: any }> {
    this.orderBy = {
      column,
      direction: options?.ascending === false ? 'desc' : 'asc'
    };
    return this.execute();
  }

  private async execute(): Promise<{ data: any[], error?: any }> {
    try {
      if (this.table === 'auditTrail') {
        // auditTrail テーブルの場合
        const where: any = {};
        Object.keys(this.whereConditions).forEach(key => {
          where[key] = this.whereConditions[key];
        });

        const orderBy: any = {};
        if (this.orderBy) {
          orderBy[this.orderBy.column] = this.orderBy.direction;
        }

        const data = await prisma.auditTrail.findMany({
          where,
          orderBy
        });

        return { data, error: null };
      }

      // 他のテーブルの場合、ここに追加する
      throw new Error(`Unsupported table: ${this.table}`);
    } catch (error) {
      console.error('API Error:', error);
      return { data: [], error };
    }
  }
}

export const api = new PrismaApiWrapper(); 
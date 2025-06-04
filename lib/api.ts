import { PrismaClient } from "@prisma/client"

// 簡単なAPIクライアントの実装
export const api = {
  from: (table: string) => ({
    select: (fields: string) => ({
      eq: (field: string, value: any) => ({
        order: (orderField: string, options: { ascending: boolean }) => ({
          then: async () => {
            // 実際のPrismaクエリの実装は後で追加
            return { data: [] };
          }
        })
      })
    })
  })
}; 
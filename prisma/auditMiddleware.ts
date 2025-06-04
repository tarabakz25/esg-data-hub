import { Prisma } from "@prisma/client";
import { hashPayload } from "@/lib/utils/audit";
import prisma from "@/lib/utils/db";

export const auditMiddleware: Prisma.Middleware = async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
  const result = await next(params)

  const actionMap: Record<string, "CREATE" | "UPDATE" | "DELETE"> = {
    create: "CREATE",
    update: "UPDATE",
    delete: "DELETE",
  }

  const action = actionMap[params.action]
  if (!action) return result;

  const payloadHash = hashPayload(result)
  const prevHash = await prisma.auditTrail.findFirst({
    where: { tableName: params.model, recordId: params.args.id },
    orderBy: { id: "desc" },
  })

  // 監査証跡の作成
  await prisma.auditTrail.create({
    data: {
      tableName: params.model || "unknown",
      recordId: BigInt(params.args.id || 0),
      action,
      payloadHash,
      prevHash: prevHash?.payloadHash || null,
      userId: "system", // TODO: 実際のユーザーIDを取得
      ipAddress: "127.0.0.1", // TODO: 実際のIPアドレスを取得
    }
  });

  return result;
}
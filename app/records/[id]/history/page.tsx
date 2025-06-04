import { api } from "@/app/lib/api";
import { TimeLine } from "@/app/components/ui/timeline";

export default async function HistoryPage({ params }: { params: { id: string } }) {
  const history = await api
    .from("auditTrail")
    .select("*")
    .eq("recordId", params.id)
    .order("createdAt", { ascending: false });

  return (
    <TimeLine items={history.data.map(h => ({
      title: h.action,
      content: <code>{h.payloadHash.slice(0, 10)}...</code>,
      timestamp: new Date(h.createdAt),
      by: h.userId,
    }))}></TimeLine>
  )
}
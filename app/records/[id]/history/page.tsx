import { api } from "@/lib/api";
import { Timeline } from "@/components/ui/timeline";

export default async function HistoryPage({ params }: { params: { id: string } }) {
  const history = await api
    .from("auditTrail")
    .select("*")
    .eq("recordId", params.id)
    .order("createdAt", { ascending: false });

  return (
    <Timeline items={history.data.map(h => ({
      title: h.action,
      content: <code>{h.payloadHash.slice(0, 10)}...</code>,
      timestamp: new Date(h.createdAt),
      by: h.userId,
    }))}></Timeline>
  )
}
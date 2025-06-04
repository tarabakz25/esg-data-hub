"use client";
import { useKpis } from "@/app/hooks/useKpis";

export default function KpiTable() {
    const { data, isLoading, error } = useKpis();
    
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading KPIs: {String(error)}</div>;
    
    // データ形式を正規化（配列でない場合の対応）
    const kpiData = Array.isArray(data) ? data : data?.data || data?.kpis || data?.items || [];
    
    return (
        <table className="min-w-full border">
            <thead className="bg-gray-100">
                <tr>
                    <th className="p-2">KPI</th>
                    <th>Value</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                {kpiData.length > 0 ? (
                    kpiData.map((row: any) => (
                        <tr key={row.id || Math.random()} className="border-t">
                            <td className="p-2">{row.kpiName || row.name || 'N/A'}</td>
                            <td>{row.value || 'N/A'}</td>
                            <td>{row.period ? new Date(row.period).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={3} className="p-4 text-center text-gray-500">
                            データがありません
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
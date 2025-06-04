"use client";
import { useQuery } from "@tanstack/react-query";

export function useKpis(params?: {
    kpiId?: string;
    page?: number;
    limit?: number;
}) {
    const qs = params ? new URLSearchParams(params as any).toString() : '';
    const url = qs ? `/api/kpi?${qs}` : '/api/kpi';
    
    return useQuery({
        queryKey: ['kpis', params],
        queryFn: () => fetch(url).then(r => r.json())
    });
}
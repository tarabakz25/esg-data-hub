"use client";

import { Button } from "@/components/ui/button";
import { useUploadKpi } from "@/hooks/useUploadKpi";
import { useState } from "react";
import KPIMappingResults from "../mapping/KPIMappingResults";
import { type MappingResult } from "@/lib/compliance-checker";

export default function UploadForm() {
    const [file, setFile] = useState<File | null>(null);
    const [mappingResults, setMappingResults] = useState<MappingResult[]>([]);
    const [showMappingResults, setShowMappingResults] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { mutate, progress, isPending, isSuccess, error } = useUploadKpi();

    // エラーメッセージを詳細に表示する関数
    const getErrorMessage = (error: any) => {
        if (!error) return '';
        
        // エラーオブジェクトの種類に応じて適切にメッセージを抽出
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        if (error.error) return error.error;
        if (error.statusText) return error.statusText;
        
        // 最後の手段としてJSON文字列化
        try {
            return JSON.stringify(error, null, 2);
        } catch {
            return 'Unknown error occurred';
        }
    };

    // KPIマッピング分析の実行
    const handleAnalyzeKPI = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        try {
            // CSVファイルを読み込んでパース
            const text = await file.text();
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            const csvData = lines.slice(1)
                .filter(line => line.trim())
                .map(line => {
                    const values = line.split(',').map(v => v.trim());
                    const row: any = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    return row;
                });

            if (csvData.length === 0) {
                throw new Error('CSVファイルにデータが含まれていません');
            }

            // KPIマッピング分析APIを呼び出し
            const response = await fetch('/api/mapping/csv-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    csvData,
                    kpiColumn: 'kpiId',
                    valueColumn: 'value',
                    unitColumn: 'unit',
                    periodColumn: 'period',
                    dataRowIdColumn: 'dataRowId'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'マッピング分析に失敗しました');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'マッピング分析に失敗しました');
            }

            setMappingResults(result.groupedMappings || []);
            setShowMappingResults(true);

        } catch (error) {
            console.error('KPIマッピング分析エラー:', error);
            // エラーハンドリングは既存のerror状態を使用
        } finally {
            setIsAnalyzing(false);
        }
    };

    // マッピング承認処理
    const handleApprove = (kpiId: string, mappedKPI: any) => {
        console.log(`承認: ${kpiId} → ${mappedKPI.name}`);
        // TODO: 承認後の処理を実装
    };

    // マッピング拒否処理  
    const handleReject = (kpiId: string) => {
        console.log(`拒否/修正: ${kpiId}`);
        // TODO: 拒否/修正後の処理を実装
    };

    // 一括承認処理
    const handleBulkApprove = () => {
        const highConfidenceResults = mappingResults.filter(r => r.confidence >= 0.8);
        console.log(`一括承認: ${highConfidenceResults.length}件`);
        // TODO: 一括承認後の処理を実装
    };

    return (
        <div className="space-y-6">
            {/* ファイルアップロードセクション */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">CSVファイルアップロード</h2>
                
                <input
                    type="file"
                    accept=".csv"
                    onChange={e => {
                        setFile(e.target.files?.[0] ?? null);
                        setShowMappingResults(false); // 新しいファイルが選択されたら結果をリセット
                        setMappingResults([]);
                    }}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />

                <div className="flex space-x-3">
                    <Button
                        disabled={!file || isPending}
                        onClick={() => file && mutate(file)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isPending ? "アップロード中…" : "従来のアップロード"}
                    </Button>

                    <Button
                        disabled={!file || isAnalyzing}
                        onClick={handleAnalyzeKPI}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isAnalyzing ? "分析中…" : "KPIマッピング分析"}
                    </Button>
                </div>

                {isPending && (
                    <div className="space-y-2">
                        <div className="text-sm text-gray-600">アップロード進行状況:</div>
                        <progress value={progress} max={100} className="w-full" />
                        <div className="text-xs text-gray-500">{progress}%</div>
                    </div>
                )}

                {isAnalyzing && (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            <div className="text-sm text-gray-600">KPIマッピング分析を実行中...</div>
                        </div>
                    </div>
                )}

                {isSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-green-700 font-medium">✅ アップロード完了!</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="font-semibold text-red-700">❌ エラーが発生しました:</p>
                        <pre className="text-sm mt-1 p-2 bg-red-50 rounded overflow-auto text-red-600">
                            {getErrorMessage(error)}
                        </pre>
                    </div>
                )}
            </div>

            {/* KPIマッピング結果表示 */}
            {showMappingResults && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">KPIマッピング結果</h2>
                    <KPIMappingResults
                        mappingResults={mappingResults}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onBulkApprove={handleBulkApprove}
                        isLoading={isAnalyzing}
                    />
                </div>
            )}

            {/* ヘルプセクション */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 使用方法</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>従来のアップロード:</strong> 既存の列ベースマッピング処理</li>
                    <li>• <strong>KPIマッピング分析:</strong> 新しいKPIグループベースの高精度マッピング</li>
                    <li>• CSVファイルには kpiId, value, unit, period, dataRowId 列が必要です</li>
                    <li>• マッピング結果を確認して承認・修正を行ってください</li>
                </ul>
            </div>
        </div>
    );
}
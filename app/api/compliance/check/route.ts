import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simulate fetching compliance data
    // In a real implementation, this would query actual KPI and compliance data
    const mockComplianceData = [
      {
        id: '1',
        kpi: '炭素排出量削減',
        standard: 'ISSB',
        status: '適合',
        dueDate: '2024-12-31',
        assignedTo: '山田 花子',
        progress: 85,
        statusColor: 'green',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        kpi: '水使用効率',
        standard: 'CSRD',
        status: 'リスクあり',
        dueDate: '2024-09-15',
        assignedTo: '佐藤 健太',
        progress: 65,
        statusColor: 'yellow',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '3',
        kpi: 'ダイバーシティ&インクルージョン指標',
        standard: 'ISSB',
        status: '適合',
        dueDate: '2024-11-30',
        assignedTo: '田中 美咲',
        progress: 92,
        statusColor: 'green',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '4',
        kpi: 'サプライチェーン透明性',
        standard: 'CSRD',
        status: '非適合',
        dueDate: '2024-08-31',
        assignedTo: '鈴木 大介',
        progress: 35,
        statusColor: 'red',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '5',
        kpi: 'エネルギー効率',
        standard: 'ISSB',
        status: '適合',
        dueDate: '2024-10-15',
        assignedTo: '高橋 雅子',
        progress: 78,
        statusColor: 'green',
        lastUpdated: new Date().toISOString()
      }
    ];

    // Calculate statistics
    const totalKpis = mockComplianceData.length;
    const compliant = mockComplianceData.filter(item => item.status === '適合').length;
    const atRisk = mockComplianceData.filter(item => item.status === 'リスクあり').length;
    const nonCompliant = mockComplianceData.filter(item => item.status === '非適合').length;
    const overallProgress = Math.round(
      mockComplianceData.reduce((sum, item) => sum + item.progress, 0) / totalKpis
    );
    const complianceRate = Math.round((compliant / totalKpis) * 100);

    const stats = {
      totalKpis,
      compliant,
      atRisk,
      nonCompliant,
      overallProgress,
      complianceRate
    };

    return NextResponse.json({
      items: mockComplianceData,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Compliance check error:', error);
    return NextResponse.json(
      { error: 'コンプライアンスデータの取得に失敗しました' },
      { status: 500 }
    );
  }
} 
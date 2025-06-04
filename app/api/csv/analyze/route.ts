import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

export interface CSVColumnInfo {
  columnName: string;
  sampleValues: string[];
  totalRows: number;
  nonEmptyRows: number;
  dataType?: string;
}

export interface CSVAnalysisResult {
  filename: string;
  totalRows: number;
  totalColumns: number;
  columns: CSVColumnInfo[];
  preview: Record<string, any>[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('CSV analyze API called');

    // FormDataを使用してファイルを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);

    // ファイル内容を読み取り
    const fileContent = await file.text();
    
    if (!fileContent || fileContent.trim().length === 0) {
      console.error('File is empty');
      return NextResponse.json(
        { error: 'File is empty' }, 
        { status: 400 }
      );
    }

    console.log(`File content length: ${fileContent.length} characters`);

    try {
      // CSVを同期的に解析（最大100行まで）
      const rows = parse(fileContent, { 
        columns: true, 
        trim: true,
        skip_empty_lines: true,
        to_line: 100
      });

      if (!rows || rows.length === 0) {
        console.error('No data rows found in CSV');
        return NextResponse.json(
          { error: 'No data rows found in CSV file' }, 
          { status: 400 }
        );
      }

      console.log(`Parsed ${rows.length} rows from CSV`);

      const columnNames = Object.keys(rows[0]);
      if (columnNames.length === 0) {
        console.error('No columns found in CSV');
        return NextResponse.json(
          { error: 'No columns found in CSV file' }, 
          { status: 400 }
        );
      }

      console.log(`Found columns: ${columnNames.join(', ')}`);

      const columns: CSVColumnInfo[] = [];

      // 各列の分析
      for (const columnName of columnNames) {
        const allValues = rows.map((row: any) => row[columnName]);
        const nonEmptyValues = allValues.filter((val: any) => 
          val != null && val.toString().trim() !== ''
        );
        
        // サンプル値を最大5個取得
        const sampleValues = nonEmptyValues
          .slice(0, 5)
          .map((val: any) => val.toString());

        columns.push({
          columnName,
          sampleValues,
          totalRows: allValues.length,
          nonEmptyRows: nonEmptyValues.length,
        });
      }

      const analysisResult: CSVAnalysisResult = {
        filename: file.name,
        totalRows: rows.length,
        totalColumns: columnNames.length,
        columns,
        preview: rows.slice(0, 5), // プレビュー用に最初の5行
      };

      console.log('Analysis completed successfully');

      return NextResponse.json({
        success: true,
        analysis: analysisResult,
      });

    } catch (parseError: any) {
      console.error('CSV parsing error:', parseError);
      
      // CSVパースエラーの詳細情報
      let errorDetails = 'Unknown parsing error';
      if (parseError?.message) {
        errorDetails = parseError.message;
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to parse CSV file', 
          details: errorDetails,
          suggestion: 'Please check if the file is a valid CSV with proper headers'
        }, 
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('CSV analyze API error:', error);
    
    // 詳細なエラー情報をログに出力
    console.error('Error stack:', error?.stack);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 
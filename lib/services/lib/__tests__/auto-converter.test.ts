import { describe, it, expect, beforeEach } from 'vitest';
import { AutoConverter } from '../auto-converter';
import { AutoConversionRequest } from '../../../../types/services/kpi';

describe('AutoConverter', () => {
  let autoConverter: AutoConverter;

  beforeEach(() => {
    autoConverter = new AutoConverter();
  });

  describe('基本的な自動変換', () => {
    it('CO2排出量: kg → t (標準単位) への変換', async () => {
      const request: AutoConversionRequest = {
        kpiId: 'co2_emissions',
        value: 1500,
        sourceUnit: 'kg',
      };

      const result = await autoConverter.convertToStandard(request);

      expect(result.isConverted).toBe(true);
      expect(result.originalValue).toBe(1500);
      expect(result.originalUnit).toBe('kg');
      expect(result.convertedValue).toBe(1.5);
      expect(result.standardUnit).toBe('t');
      expect(result.conversionFactor).toBe(0.001);
    });

    it('エネルギー消費量: kJ → MJ (標準単位) への変換', async () => {
      const request: AutoConversionRequest = {
        kpiId: 'energy_consumption',
        value: 5000,
        sourceUnit: 'kJ',
      };

      const result = await autoConverter.convertToStandard(request);

      expect(result.isConverted).toBe(true);
      expect(result.originalValue).toBe(5000);
      expect(result.originalUnit).toBe('kJ');
      expect(result.convertedValue).toBe(5);
      expect(result.standardUnit).toBe('MJ');
      expect(result.conversionFactor).toBe(0.001);
    });

    it('水使用量: L → m3 (標準単位) への変換', async () => {
      const request: AutoConversionRequest = {
        kpiId: 'water_usage',
        value: 2000,
        sourceUnit: 'L',
      };

      const result = await autoConverter.convertToStandard(request);

      expect(result.isConverted).toBe(true);
      expect(result.originalValue).toBe(2000);
      expect(result.originalUnit).toBe('L');
      expect(result.convertedValue).toBe(2);
      expect(result.standardUnit).toBe('m3');
      expect(result.conversionFactor).toBe(0.001);
    });

    it('従業員研修時間: min → h (標準単位) への変換', async () => {
      const request: AutoConversionRequest = {
        kpiId: 'employee_training_hours',
        value: 180,
        sourceUnit: 'min',
      };

      const result = await autoConverter.convertToStandard(request);

      expect(result.isConverted).toBe(true);
      expect(result.originalValue).toBe(180);
      expect(result.originalUnit).toBe('min');
      expect(result.convertedValue).toBe(3);
      expect(result.standardUnit).toBe('h');
      expect(result.conversionFactor).toBe(1/60);
    });
  });

  describe('既に標準単位の場合', () => {
    it('CO2排出量が既にt単位の場合は変換しない', async () => {
      const request: AutoConversionRequest = {
        kpiId: 'co2_emissions',
        value: 2.5,
        sourceUnit: 't',
      };

      const result = await autoConverter.convertToStandard(request);

      expect(result.isConverted).toBe(false);
      expect(result.originalValue).toBe(2.5);
      expect(result.convertedValue).toBe(2.5);
      expect(result.reason).toBe('既に標準単位です');
    });
  });

  describe('エラーハンドリング', () => {
    it('存在しないKPIの場合はエラーを返す', async () => {
      const request: AutoConversionRequest = {
        kpiId: 'unknown_kpi',
        value: 100,
        sourceUnit: 'kg',
      };

      const result = await autoConverter.convertToStandard(request);

      expect(result.isConverted).toBe(false);
      expect(result.reason).toContain('KPI "unknown_kpi" の設定が見つかりません');
    });

    it('互換性のない単位の場合はエラーを返す', async () => {
      const request: AutoConversionRequest = {
        kpiId: 'co2_emissions', // 質量単位を期待
        value: 100,
        sourceUnit: 'm', // 長さ単位
      };

      const result = await autoConverter.convertToStandard(request);

      expect(result.isConverted).toBe(false);
      expect(result.reason).toContain('単位変換不可');
    });
  });

  describe('一括変換', () => {
    it('複数のKPIデータを一括変換', async () => {
      const requests: AutoConversionRequest[] = [
        {
          kpiId: 'co2_emissions',
          value: 1000,
          sourceUnit: 'kg',
        },
        {
          kpiId: 'water_usage',
          value: 500,
          sourceUnit: 'L',
        },
        {
          kpiId: 'energy_consumption',
          value: 2000,
          sourceUnit: 'kJ',
        },
      ];

      const results = await autoConverter.convertBatch(requests);

      expect(results).toHaveLength(3);
      
      // CO2排出量の変換確認
      expect(results[0].isConverted).toBe(true);
      expect(results[0].convertedValue).toBe(1);
      expect(results[0].standardUnit).toBe('t');
      
      // 水使用量の変換確認
      expect(results[1].isConverted).toBe(true);
      expect(results[1].convertedValue).toBe(0.5);
      expect(results[1].standardUnit).toBe('m3');
      
      // エネルギー消費量の変換確認
      expect(results[2].isConverted).toBe(true);
      expect(results[2].convertedValue).toBe(2);
      expect(results[2].standardUnit).toBe('MJ');
    });
  });

  describe('ユーティリティ機能', () => {
    it('KPIの標準単位を取得', () => {
      const standardUnit = autoConverter.getStandardUnit('co2_emissions');
      expect(standardUnit).toBe('t');
    });

    it('存在しないKPIの標準単位はnullを返す', () => {
      const standardUnit = autoConverter.getStandardUnit('unknown_kpi');
      expect(standardUnit).toBeNull();
    });

    it('変換可能性をチェック', () => {
      const canConvert = autoConverter.canConvert('co2_emissions', 'kg');
      expect(canConvert).toBe(true);
    });

    it('変換不可能な場合はfalseを返す', () => {
      const canConvert = autoConverter.canConvert('co2_emissions', 'm');
      expect(canConvert).toBe(false);
    });
  });

  describe('変換ログと統計', () => {
    it('変換ログが正しく記録される', async () => {
      const request: AutoConversionRequest = {
        kpiId: 'co2_emissions',
        value: 1000,
        sourceUnit: 'kg',
      };

      await autoConverter.convertToStandard(request);
      
      const logs = autoConverter.getConversionLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].kpiId).toBe('co2_emissions');
      expect(logs[0].originalValue).toBe(1000);
      expect(logs[0].convertedValue).toBe(1);
    });

    it('変換統計が正しく計算される', async () => {
      // 複数の変換を実行
      await autoConverter.convertToStandard({
        kpiId: 'co2_emissions',
        value: 1000,
        sourceUnit: 'kg',
      });
      
      await autoConverter.convertToStandard({
        kpiId: 'water_usage',
        value: 500,
        sourceUnit: 'L',
      });

      const stats = autoConverter.getConversionStats();
      expect(stats.totalConversions).toBe(2);
      expect(stats.conversionsByKpi['co2_emissions']).toBe(1);
      expect(stats.conversionsByKpi['water_usage']).toBe(1);
    });
  });
}); 
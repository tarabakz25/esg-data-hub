import { UnitCategoryType } from './unit';

export interface KpiUnitConfig {
  kpiId: string;
  kpiName: string;
  standardUnit: string;
  category: UnitCategoryType;
  description: string;
  isActive: boolean;
}

export interface AutoConversionRequest {
  kpiId: string;
  value: number;
  sourceUnit: string;
  metadata?: Record<string, any>;
}

export interface AutoConversionResult {
  kpiId: string;
  originalValue: number;
  originalUnit: string;
  convertedValue: number;
  standardUnit: string;
  conversionFactor: number;
  isConverted: boolean;
  reason: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ConversionLog {
  id: string;
  kpiId: string;
  originalValue: number;
  originalUnit: string;
  convertedValue: number;
  standardUnit: string;
  conversionFactor: number;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
} 
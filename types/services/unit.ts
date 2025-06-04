// 単位定義の型システム
export interface Unit {
  id: string;
  name: string;
  symbol: string;
  category: UnitCategory;
  isBaseUnit: boolean;
  conversionToBase?: number; // 基準単位への変換係数
  description?: string;
}

export interface ConversionRule {
  fromUnit: string;
  toUnit: string;
  factor: number;
  offset?: number; // 温度変換等で使用
  formula?: string; // 変換式の説明
}

export interface UnitCategory {
  id: string;
  name: string;
  baseUnit: string; // この分類の基準単位
  description?: string;
}

export interface ConversionResult {
  value: number;
  sourceUnit: string;
  targetUnit: string;
  factor: number;
  formula: string;
  isValid: boolean;
  error?: string;
}

export interface UnitCompatibilityCheck {
  fromUnit: string;
  toUnit: string;
  isCompatible: boolean;
  reason?: string;
  conversionPath?: string[];
}

export interface AutoConversionResult {
  originalValue: number;
  originalUnit: string;
  convertedValue: number;
  convertedUnit: string;
  reason: string;
  isConverted: boolean;
  conversionFactor: number;
}

export interface AutoConversionRule {
  categoryId: string;
  minThreshold: number;
  maxThreshold: number;
  targetUnit: string;
  priority: number;
}

// 標準的な単位分類
export const UNIT_CATEGORIES = {
  MASS: 'mass',
  LENGTH: 'length',
  TIME: 'time',
  TEMPERATURE: 'temperature',
  VOLUME: 'volume',
  AREA: 'area',
  ENERGY: 'energy',
  CURRENCY: 'currency',
} as const;

export type UnitCategoryType = typeof UNIT_CATEGORIES[keyof typeof UNIT_CATEGORIES]; 
import { Unit, UnitCategory, ConversionRule, UNIT_CATEGORIES, AutoConversionRule } from '../../../types/services/unit';

// 単位分類定義
export const STANDARD_CATEGORIES: UnitCategory[] = [
  {
    id: UNIT_CATEGORIES.MASS,
    name: '質量',
    baseUnit: 'kg',
    description: 'キログラムを基準とした質量単位',
  },
  {
    id: UNIT_CATEGORIES.LENGTH,
    name: '長さ',
    baseUnit: 'm',
    description: 'メートルを基準とした長さ単位',
  },
  {
    id: UNIT_CATEGORIES.TIME,
    name: '時間',
    baseUnit: 's',
    description: '秒を基準とした時間単位',
  },
  {
    id: UNIT_CATEGORIES.TEMPERATURE,
    name: '温度',
    baseUnit: 'K',
    description: 'ケルビンを基準とした温度単位',
  },
  {
    id: UNIT_CATEGORIES.VOLUME,
    name: '体積',
    baseUnit: 'm3',
    description: '立方メートルを基準とした体積単位',
  },
  {
    id: UNIT_CATEGORIES.ENERGY,
    name: 'エネルギー',
    baseUnit: 'J',
    description: 'ジュールを基準としたエネルギー単位',
  },
];

// 標準単位定義
export const STANDARD_UNITS: Unit[] = [
  // 質量
  {
    id: 'kg',
    name: 'キログラム',
    symbol: 'kg',
    category: STANDARD_CATEGORIES[0],
    isBaseUnit: true,
    description: 'SI基本単位（質量）',
  },
  {
    id: 'g',
    name: 'グラム',
    symbol: 'g',
    category: STANDARD_CATEGORIES[0],
    isBaseUnit: false,
    conversionToBase: 0.001,
    description: '1g = 0.001kg',
  },
  {
    id: 't',
    name: 'トン',
    symbol: 't',
    category: STANDARD_CATEGORIES[0],
    isBaseUnit: false,
    conversionToBase: 1000,
    description: '1t = 1000kg',
  },
  
  // 長さ
  {
    id: 'm',
    name: 'メートル',
    symbol: 'm',
    category: STANDARD_CATEGORIES[1],
    isBaseUnit: true,
    description: 'SI基本単位（長さ）',
  },
  {
    id: 'cm',
    name: 'センチメートル',
    symbol: 'cm',
    category: STANDARD_CATEGORIES[1],
    isBaseUnit: false,
    conversionToBase: 0.01,
    description: '1cm = 0.01m',
  },
  {
    id: 'mm',
    name: 'ミリメートル',
    symbol: 'mm',
    category: STANDARD_CATEGORIES[1],
    isBaseUnit: false,
    conversionToBase: 0.001,
    description: '1mm = 0.001m',
  },
  {
    id: 'km',
    name: 'キロメートル',
    symbol: 'km',
    category: STANDARD_CATEGORIES[1],
    isBaseUnit: false,
    conversionToBase: 1000,
    description: '1km = 1000m',
  },
  
  // 時間
  {
    id: 's',
    name: '秒',
    symbol: 's',
    category: STANDARD_CATEGORIES[2],
    isBaseUnit: true,
    description: 'SI基本単位（時間）',
  },
  {
    id: 'min',
    name: '分',
    symbol: 'min',
    category: STANDARD_CATEGORIES[2],
    isBaseUnit: false,
    conversionToBase: 60,
    description: '1min = 60s',
  },
  {
    id: 'h',
    name: '時間',
    symbol: 'h',
    category: STANDARD_CATEGORIES[2],
    isBaseUnit: false,
    conversionToBase: 3600,
    description: '1h = 3600s',
  },
  {
    id: 'day',
    name: '日',
    symbol: 'day',
    category: STANDARD_CATEGORIES[2],
    isBaseUnit: false,
    conversionToBase: 86400,
    description: '1day = 86400s',
  },
  
  // 温度
  {
    id: 'K',
    name: 'ケルビン',
    symbol: 'K',
    category: STANDARD_CATEGORIES[3],
    isBaseUnit: true,
    description: 'SI基本単位（温度）',
  },
  {
    id: 'C',
    name: '摂氏',
    symbol: '°C',
    category: STANDARD_CATEGORIES[3],
    isBaseUnit: false,
    description: '°C = K - 273.15',
  },
  
  // 体積
  {
    id: 'm3',
    name: '立方メートル',
    symbol: 'm³',
    category: STANDARD_CATEGORIES[4],
    isBaseUnit: true,
    description: 'SI基本単位（体積）',
  },
  {
    id: 'L',
    name: 'リットル',
    symbol: 'L',
    category: STANDARD_CATEGORIES[4],
    isBaseUnit: false,
    conversionToBase: 0.001,
    description: '1L = 0.001m³',
  },
  
  // エネルギー
  {
    id: 'J',
    name: 'ジュール',
    symbol: 'J',
    category: STANDARD_CATEGORIES[5],
    isBaseUnit: true,
    description: 'SI基本単位（エネルギー）',
  },
  {
    id: 'kJ',
    name: 'キロジュール',
    symbol: 'kJ',
    category: STANDARD_CATEGORIES[5],
    isBaseUnit: false,
    conversionToBase: 1000,
    description: '1kJ = 1000J',
  },
  {
    id: 'MJ',
    name: 'メガジュール',
    symbol: 'MJ',
    category: STANDARD_CATEGORIES[5],
    isBaseUnit: false,
    conversionToBase: 1000000,
    description: '1MJ = 1000000J',
  },
];

// 変換ルール定義
export const STANDARD_CONVERSION_RULES: ConversionRule[] = [
  // 質量変換
  { fromUnit: 'kg', toUnit: 'g', factor: 1000, formula: 'kg × 1000 = g' },
  { fromUnit: 'g', toUnit: 'kg', factor: 0.001, formula: 'g × 0.001 = kg' },
  { fromUnit: 'kg', toUnit: 't', factor: 0.001, formula: 'kg × 0.001 = t' },
  { fromUnit: 't', toUnit: 'kg', factor: 1000, formula: 't × 1000 = kg' },
  { fromUnit: 'g', toUnit: 't', factor: 0.000001, formula: 'g × 0.000001 = t' },
  { fromUnit: 't', toUnit: 'g', factor: 1000000, formula: 't × 1000000 = g' },
  
  // 長さ変換
  { fromUnit: 'm', toUnit: 'cm', factor: 100, formula: 'm × 100 = cm' },
  { fromUnit: 'cm', toUnit: 'm', factor: 0.01, formula: 'cm × 0.01 = m' },
  { fromUnit: 'm', toUnit: 'mm', factor: 1000, formula: 'm × 1000 = mm' },
  { fromUnit: 'mm', toUnit: 'm', factor: 0.001, formula: 'mm × 0.001 = m' },
  { fromUnit: 'm', toUnit: 'km', factor: 0.001, formula: 'm × 0.001 = km' },
  { fromUnit: 'km', toUnit: 'm', factor: 1000, formula: 'km × 1000 = m' },
  
  // 時間変換
  { fromUnit: 's', toUnit: 'min', factor: 1/60, formula: 's ÷ 60 = min' },
  { fromUnit: 'min', toUnit: 's', factor: 60, formula: 'min × 60 = s' },
  { fromUnit: 's', toUnit: 'h', factor: 1/3600, formula: 's ÷ 3600 = h' },
  { fromUnit: 'h', toUnit: 's', factor: 3600, formula: 'h × 3600 = s' },
  { fromUnit: 'min', toUnit: 'h', factor: 1/60, formula: 'min ÷ 60 = h' },
  { fromUnit: 'h', toUnit: 'min', factor: 60, formula: 'h × 60 = min' },
  
  // 温度変換（特殊処理）
  { fromUnit: 'K', toUnit: 'C', factor: 1, offset: -273.15, formula: 'K - 273.15 = °C' },
  { fromUnit: 'C', toUnit: 'K', factor: 1, offset: 273.15, formula: '°C + 273.15 = K' },
  
  // 体積変換
  { fromUnit: 'm3', toUnit: 'L', factor: 1000, formula: 'm³ × 1000 = L' },
  { fromUnit: 'L', toUnit: 'm3', factor: 0.001, formula: 'L × 0.001 = m³' },
  
  // エネルギー変換
  { fromUnit: 'J', toUnit: 'kJ', factor: 0.001, formula: 'J × 0.001 = kJ' },
  { fromUnit: 'kJ', toUnit: 'J', factor: 1000, formula: 'kJ × 1000 = J' },
  { fromUnit: 'J', toUnit: 'MJ', factor: 0.000001, formula: 'J × 0.000001 = MJ' },
  { fromUnit: 'MJ', toUnit: 'J', factor: 1000000, formula: 'MJ × 1000000 = J' },
  { fromUnit: 'kJ', toUnit: 'MJ', factor: 0.001, formula: 'kJ × 0.001 = MJ' },
  { fromUnit: 'MJ', toUnit: 'kJ', factor: 1000, formula: 'MJ × 1000 = kJ' },
];

// 自動変換ルール定義
export const AUTO_CONVERSION_RULES: AutoConversionRule[] = [
  // 質量の自動変換ルール
  { categoryId: 'mass', minThreshold: 0, maxThreshold: 0.1, targetUnit: 'g', priority: 1 },
  { categoryId: 'mass', minThreshold: 0.1, maxThreshold: 1000, targetUnit: 'kg', priority: 2 },
  { categoryId: 'mass', minThreshold: 1000, maxThreshold: Infinity, targetUnit: 't', priority: 3 },
  
  // 長さの自動変換ルール
  { categoryId: 'length', minThreshold: 0, maxThreshold: 0.01, targetUnit: 'mm', priority: 1 },
  { categoryId: 'length', minThreshold: 0.01, maxThreshold: 1, targetUnit: 'cm', priority: 2 },
  { categoryId: 'length', minThreshold: 1, maxThreshold: 1000, targetUnit: 'm', priority: 3 },
  { categoryId: 'length', minThreshold: 1000, maxThreshold: Infinity, targetUnit: 'km', priority: 4 },
  
  // 時間の自動変換ルール
  { categoryId: 'time', minThreshold: 0, maxThreshold: 60, targetUnit: 's', priority: 1 },
  { categoryId: 'time', minThreshold: 60, maxThreshold: 3600, targetUnit: 'min', priority: 2 },
  { categoryId: 'time', minThreshold: 3600, maxThreshold: 86400, targetUnit: 'h', priority: 3 },
  { categoryId: 'time', minThreshold: 86400, maxThreshold: Infinity, targetUnit: 'day', priority: 4 },
  
  // 体積の自動変換ルール
  { categoryId: 'volume', minThreshold: 0, maxThreshold: 1, targetUnit: 'L', priority: 1 },
  { categoryId: 'volume', minThreshold: 1, maxThreshold: Infinity, targetUnit: 'm3', priority: 2 },
  
  // エネルギーの自動変換ルール
  { categoryId: 'energy', minThreshold: 0, maxThreshold: 1000, targetUnit: 'J', priority: 1 },
  { categoryId: 'energy', minThreshold: 1000, maxThreshold: 1000000, targetUnit: 'kJ', priority: 2 },
  { categoryId: 'energy', minThreshold: 1000000, maxThreshold: Infinity, targetUnit: 'MJ', priority: 3 },
]; 
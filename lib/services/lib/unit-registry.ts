import { 
  Unit, 
  UnitCategory, 
  ConversionRule, 
  ConversionResult, 
  UnitCompatibilityCheck,
  UnitCategoryType 
} from '../types/unit';

export class UnitRegistry {
  private units: Map<string, Unit> = new Map();
  private categories: Map<string, UnitCategory> = new Map();
  private conversionRules: Map<string, ConversionRule> = new Map();

  constructor() {
    this.initialize();
  }

  /**
   * レジストリの初期化
   */
  private initialize(): void {
    // 初期化は外部データから行う
  }

  /**
   * 単位を登録
   */
  registerUnit(unit: Unit): void {
    this.units.set(unit.id, unit);
    
    // カテゴリも登録
    if (!this.categories.has(unit.category.id)) {
      this.categories.set(unit.category.id, unit.category);
    }
  }

  /**
   * 変換ルールを登録
   */
  registerConversionRule(rule: ConversionRule): void {
    const key = `${rule.fromUnit}->${rule.toUnit}`;
    this.conversionRules.set(key, rule);
  }

  /**
   * 複数の単位とルールを一括登録
   */
  registerBatch(units: Unit[], categories: UnitCategory[], rules: ConversionRule[]): void {
    // カテゴリを先に登録
    categories.forEach(category => {
      this.categories.set(category.id, category);
    });

    // 単位を登録
    units.forEach(unit => {
      this.registerUnit(unit);
    });

    // 変換ルールを登録
    rules.forEach(rule => {
      this.registerConversionRule(rule);
    });
  }

  /**
   * 単位変換を実行
   */
  convert(value: number, fromUnit: string, toUnit: string): ConversionResult {
    // 同じ単位の場合
    if (fromUnit === toUnit) {
      return {
        value,
        sourceUnit: fromUnit,
        targetUnit: toUnit,
        factor: 1,
        formula: `${fromUnit} = ${toUnit}`,
        isValid: true,
      };
    }

    // 直接変換ルールを検索
    const directRule = this.findConversionRule(fromUnit, toUnit);
    if (directRule) {
      return this.applyConversionRule(value, directRule);
    }

    // 基準単位経由の変換を試行
    const baseConversion = this.convertViaBaseUnit(value, fromUnit, toUnit);
    if (baseConversion.isValid) {
      return baseConversion;
    }

    // 変換不可能
    return {
      value: 0,
      sourceUnit: fromUnit,
      targetUnit: toUnit,
      factor: 0,
      formula: '',
      isValid: false,
      error: `${fromUnit}から${toUnit}への変換ルールが見つかりません`,
    };
  }

  /**
   * 単位互換性をチェック
   */
  checkCompatibility(fromUnit: string, toUnit: string): UnitCompatibilityCheck {
    const fromUnitObj = this.units.get(fromUnit);
    const toUnitObj = this.units.get(toUnit);

    if (!fromUnitObj || !toUnitObj) {
      return {
        fromUnit,
        toUnit,
        isCompatible: false,
        reason: '単位が見つかりません',
      };
    }

    // 同じカテゴリかチェック
    if (fromUnitObj.category.id !== toUnitObj.category.id) {
      return {
        fromUnit,
        toUnit,
        isCompatible: false,
        reason: `異なるカテゴリの単位です（${fromUnitObj.category.name} vs ${toUnitObj.category.name}）`,
      };
    }

    // 変換ルールの存在確認
    const hasDirectRule = this.findConversionRule(fromUnit, toUnit) !== null;
    const hasBaseConversion = this.canConvertViaBaseUnit(fromUnit, toUnit);

    if (hasDirectRule || hasBaseConversion) {
      return {
        fromUnit,
        toUnit,
        isCompatible: true,
        conversionPath: hasDirectRule ? [fromUnit, toUnit] : [fromUnit, fromUnitObj.category.baseUnit, toUnit],
      };
    }

    return {
      fromUnit,
      toUnit,
      isCompatible: false,
      reason: '変換ルールが見つかりません',
    };
  }

  /**
   * カテゴリ別の単位一覧を取得
   */
  getUnitsByCategory(categoryId: UnitCategoryType): Unit[] {
    return Array.from(this.units.values()).filter(
      unit => unit.category.id === categoryId
    );
  }

  /**
   * 全カテゴリを取得
   */
  getAllCategories(): UnitCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * 全単位を取得
   */
  getAllUnits(): Unit[] {
    return Array.from(this.units.values());
  }

  /**
   * 単位を検索
   */
  findUnit(unitId: string): Unit | undefined {
    return this.units.get(unitId);
  }

  /**
   * 変換ルールを検索
   */
  private findConversionRule(fromUnit: string, toUnit: string): ConversionRule | null {
    const key = `${fromUnit}->${toUnit}`;
    return this.conversionRules.get(key) || null;
  }

  /**
   * 変換ルールを適用
   */
  private applyConversionRule(value: number, rule: ConversionRule): ConversionResult {
    let convertedValue: number;

    if (rule.offset !== undefined) {
      // 温度変換等でオフセットがある場合
      convertedValue = (value * rule.factor) + rule.offset;
    } else {
      // 通常の係数変換
      convertedValue = value * rule.factor;
    }

    return {
      value: convertedValue,
      sourceUnit: rule.fromUnit,
      targetUnit: rule.toUnit,
      factor: rule.factor,
      formula: rule.formula || `${rule.fromUnit} × ${rule.factor} = ${rule.toUnit}`,
      isValid: true,
    };
  }

  /**
   * 基準単位経由での変換
   */
  private convertViaBaseUnit(value: number, fromUnit: string, toUnit: string): ConversionResult {
    const fromUnitObj = this.units.get(fromUnit);
    const toUnitObj = this.units.get(toUnit);

    if (!fromUnitObj || !toUnitObj || fromUnitObj.category.id !== toUnitObj.category.id) {
      return {
        value: 0,
        sourceUnit: fromUnit,
        targetUnit: toUnit,
        factor: 0,
        formula: '',
        isValid: false,
        error: '基準単位経由の変換ができません',
      };
    }

    const baseUnit = fromUnitObj.category.baseUnit;

    // fromUnit -> baseUnit
    let baseValue: number;
    if (fromUnitObj.isBaseUnit) {
      baseValue = value;
    } else if (fromUnitObj.conversionToBase) {
      baseValue = value * fromUnitObj.conversionToBase;
    } else {
      return {
        value: 0,
        sourceUnit: fromUnit,
        targetUnit: toUnit,
        factor: 0,
        formula: '',
        isValid: false,
        error: `${fromUnit}から基準単位への変換係数が未定義`,
      };
    }

    // baseUnit -> toUnit
    let finalValue: number;
    if (toUnitObj.isBaseUnit) {
      finalValue = baseValue;
    } else if (toUnitObj.conversionToBase) {
      finalValue = baseValue / toUnitObj.conversionToBase;
    } else {
      return {
        value: 0,
        sourceUnit: fromUnit,
        targetUnit: toUnit,
        factor: 0,
        formula: '',
        isValid: false,
        error: `基準単位から${toUnit}への変換係数が未定義`,
      };
    }

    const totalFactor = finalValue / value;

    return {
      value: finalValue,
      sourceUnit: fromUnit,
      targetUnit: toUnit,
      factor: totalFactor,
      formula: `${fromUnit} → ${baseUnit} → ${toUnit}`,
      isValid: true,
    };
  }

  /**
   * 基準単位経由での変換可能性をチェック
   */
  private canConvertViaBaseUnit(fromUnit: string, toUnit: string): boolean {
    const fromUnitObj = this.units.get(fromUnit);
    const toUnitObj = this.units.get(toUnit);

    if (!fromUnitObj || !toUnitObj) {
      return false;
    }

    // 同じカテゴリで、両方とも基準単位への変換係数が定義されている
    return (
      fromUnitObj.category.id === toUnitObj.category.id &&
      (fromUnitObj.isBaseUnit || fromUnitObj.conversionToBase !== undefined) &&
      (toUnitObj.isBaseUnit || toUnitObj.conversionToBase !== undefined)
    );
  }
} 
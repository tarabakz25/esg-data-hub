import { describe, it, expect, beforeEach } from 'vitest';
import { UnitRegistry } from '../unit-registry';
import { 
  STANDARD_UNITS, 
  STANDARD_CATEGORIES, 
  STANDARD_CONVERSION_RULES 
} from '../unit-data';

describe('UnitRegistry', () => {
  let registry: UnitRegistry;

  beforeEach(() => {
    registry = new UnitRegistry();
    registry.registerBatch(STANDARD_UNITS, STANDARD_CATEGORIES, STANDARD_CONVERSION_RULES);
  });

  describe('基本的な単位変換', () => {
    it('should convert kg to g correctly', () => {
      const result = registry.convert(1, 'kg', 'g');
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(1000);
      expect(result.sourceUnit).toBe('kg');
      expect(result.targetUnit).toBe('g');
      expect(result.factor).toBe(1000);
    });

    it('should convert g to kg correctly', () => {
      const result = registry.convert(1000, 'g', 'kg');
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(1);
      expect(result.sourceUnit).toBe('g');
      expect(result.targetUnit).toBe('kg');
      expect(result.factor).toBe(0.001);
    });

    it('should convert m to cm correctly', () => {
      const result = registry.convert(1, 'm', 'cm');
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(100);
      expect(result.sourceUnit).toBe('m');
      expect(result.targetUnit).toBe('cm');
    });

    it('should handle same unit conversion', () => {
      const result = registry.convert(5, 'kg', 'kg');
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(5);
      expect(result.factor).toBe(1);
    });
  });

  describe('基準単位経由の変換', () => {
    it('should convert g to t via kg', () => {
      const result = registry.convert(1000000, 'g', 't');
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(1);
      expect(result.formula).toContain('→');
    });

    it('should convert cm to km via m', () => {
      const result = registry.convert(100000, 'cm', 'km');
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(1);
    });
  });

  describe('温度変換（オフセット付き）', () => {
    it('should convert Kelvin to Celsius', () => {
      const result = registry.convert(273.15, 'K', 'C');
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0);
    });

    it('should convert Celsius to Kelvin', () => {
      const result = registry.convert(0, 'C', 'K');
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(273.15);
    });
  });

  describe('エラーハンドリング', () => {
    it('should fail for incompatible units', () => {
      const result = registry.convert(1, 'kg', 'm');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should fail for unknown units', () => {
      const result = registry.convert(1, 'unknown', 'kg');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('単位互換性チェック', () => {
    it('should confirm compatibility for same category units', () => {
      const compatibility = registry.checkCompatibility('kg', 'g');
      
      expect(compatibility.isCompatible).toBe(true);
      expect(compatibility.conversionPath).toBeDefined();
    });

    it('should reject incompatible units', () => {
      const compatibility = registry.checkCompatibility('kg', 'm');
      
      expect(compatibility.isCompatible).toBe(false);
      expect(compatibility.reason).toContain('異なるカテゴリ');
    });

    it('should handle unknown units', () => {
      const compatibility = registry.checkCompatibility('unknown', 'kg');
      
      expect(compatibility.isCompatible).toBe(false);
      expect(compatibility.reason).toContain('見つかりません');
    });
  });

  describe('レジストリ管理', () => {
    it('should return all categories', () => {
      const categories = registry.getAllCategories();
      
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.some(cat => cat.id === 'mass')).toBe(true);
      expect(categories.some(cat => cat.id === 'length')).toBe(true);
    });

    it('should return units by category', () => {
      const massUnits = registry.getUnitsByCategory('mass');
      
      expect(massUnits.length).toBeGreaterThan(0);
      expect(massUnits.every(unit => unit.category.id === 'mass')).toBe(true);
    });

    it('should find specific unit', () => {
      const unit = registry.findUnit('kg');
      
      expect(unit).toBeDefined();
      expect(unit?.id).toBe('kg');
      expect(unit?.isBaseUnit).toBe(true);
    });
  });

  describe('複雑な変換シナリオ', () => {
    it('should handle multiple conversions accurately', () => {
      // 1 ton = 1000 kg = 1000000 g
      const tonToKg = registry.convert(1, 't', 'kg');
      const kgToG = registry.convert(tonToKg.value, 'kg', 'g');
      
      expect(tonToKg.isValid).toBe(true);
      expect(tonToKg.value).toBe(1000);
      
      expect(kgToG.isValid).toBe(true);
      expect(kgToG.value).toBe(1000000);
    });

    it('should maintain precision in conversions', () => {
      const result = registry.convert(0.001, 'kg', 'g');
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(1);
    });
  });
}); 
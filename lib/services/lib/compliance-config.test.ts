import { 
  getMandatoryKpis, 
  isMandatoryKpi, 
  getKpiSeverity,
  getUniversalMandatoryKpis,
  getComplianceConfigSummary 
} from './compliance-config';

describe('Compliance Config', () => {
  describe('getMandatoryKpis', () => {
    it('ISSB基準のcritical KPIを取得できる', () => {
      const criticalKpis = getMandatoryKpis('issb', 'critical');
      
      expect(criticalKpis).toContain('CO2_SCOPE1');
      expect(criticalKpis).toContain('CO2_SCOPE2');
      expect(criticalKpis).toContain('ENERGY_USE');
      expect(criticalKpis.length).toBeGreaterThan(0);
    });

    it('ISSB基準のwarning KPIを取得できる', () => {
      const warningKpis = getMandatoryKpis('issb', 'warning');
      
      expect(warningKpis).toContain('RENEWABLE_ENERGY');
      expect(warningKpis).toContain('WATER_USE');
      expect(warningKpis.length).toBeGreaterThan(0);
    });

    it('全レベルのKPIを取得できる', () => {
      const allKpis = getMandatoryKpis('issb');
      const criticalKpis = getMandatoryKpis('issb', 'critical');
      const warningKpis = getMandatoryKpis('issb', 'warning');
      
      expect(allKpis.length).toBe(criticalKpis.length + warningKpis.length);
      expect(allKpis).toEqual(expect.arrayContaining(criticalKpis));
      expect(allKpis).toEqual(expect.arrayContaining(warningKpis));
    });

    it('存在しない基準でエラーを投げる', () => {
      expect(() => {
        getMandatoryKpis('invalid' as any);
      }).toThrow('Unknown compliance standard: invalid');
    });
  });

  describe('isMandatoryKpi', () => {
    it('必須KPIを正しく判定する', () => {
      expect(isMandatoryKpi('CO2_SCOPE1', 'issb')).toBe(true);
      expect(isMandatoryKpi('RENEWABLE_ENERGY', 'issb')).toBe(true);
      expect(isMandatoryKpi('NONEXISTENT_KPI', 'issb')).toBe(false);
    });

    it('severityレベル指定で判定する', () => {
      expect(isMandatoryKpi('CO2_SCOPE1', 'issb', 'critical')).toBe(true);
      expect(isMandatoryKpi('RENEWABLE_ENERGY', 'issb', 'critical')).toBe(false);
      expect(isMandatoryKpi('RENEWABLE_ENERGY', 'issb', 'warning')).toBe(true);
    });
  });

  describe('getKpiSeverity', () => {
    it('正しい重要度レベルを返す', () => {
      expect(getKpiSeverity('CO2_SCOPE1', 'issb')).toBe('critical');
      expect(getKpiSeverity('RENEWABLE_ENERGY', 'issb')).toBe('warning');
      expect(getKpiSeverity('NONEXISTENT_KPI', 'issb')).toBeNull();
    });

    it('基準間で重要度が異なる場合', () => {
      // FEMALE_RATIOはISSBではwarning、CSRDではcritical
      expect(getKpiSeverity('FEMALE_RATIO', 'issb')).toBe('warning');
      expect(getKpiSeverity('FEMALE_RATIO', 'csrd')).toBe('critical');
    });
  });

  describe('getUniversalMandatoryKpis', () => {
    it('全基準で共通の必須KPIを取得する', () => {
      const universalKpis = getUniversalMandatoryKpis();
      
      // 各基準の設定を確認
      const issbKpis = getMandatoryKpis('issb');
      const csrdKpis = getMandatoryKpis('csrd');
      const customKpis = getMandatoryKpis('custom');
      
      // 各KPIが実際に全基準に含まれているかチェック
      for (const kpiId of universalKpis) {
        expect(issbKpis).toContain(kpiId);
        expect(csrdKpis).toContain(kpiId);
        expect(customKpis).toContain(kpiId);
      }
      
      // 関数が正しく動作していることを確認（空配列でも可）
      expect(Array.isArray(universalKpis)).toBe(true);
    });
  });

  describe('getComplianceConfigSummary', () => {
    it('設定サマリーを正しく生成する', () => {
      const summary = getComplianceConfigSummary();
      
      expect(summary).toHaveProperty('issb');
      expect(summary).toHaveProperty('csrd');
      expect(summary).toHaveProperty('custom');
      
      expect(summary.issb.critical).toBeGreaterThan(0);
      expect(summary.issb.warning).toBeGreaterThan(0);
      expect(summary.issb.total).toBe(summary.issb.critical + summary.issb.warning);
    });
  });
}); 
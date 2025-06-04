export interface KPIDictionary {
  id: string;
  name: string;
  unit: string;
  category: string;
  description?: string;
  aliases?: string[];
  keywords?: string[];
}

/**
 * ESG関連の包括的なKPI辞書
 */
export const ESG_KPI_DICTIONARY: KPIDictionary[] = [
  // Environmental (環境)
  {
    id: 'CO2_SCOPE1',
    name: 'Scope1 排出量',
    unit: 't-CO2',
    category: 'Environment',
    description: '直接的な温室効果ガス排出量',
    aliases: ['直接排出', 'スコープ1', 'scope 1'],
    keywords: ['二酸化炭素', 'CO2', '温室効果ガス', 'GHG', '直接', '排出量']
  },
  {
    id: 'CO2_SCOPE2',
    name: 'Scope2 排出量',
    unit: 't-CO2',
    category: 'Environment',
    description: '電力等の間接的な温室効果ガス排出量',
    aliases: ['間接排出', 'スコープ2', 'scope 2'],
    keywords: ['電力', '間接', '排出量', 'CO2', '温室効果ガス']
  },
  {
    id: 'ENERGY_USE',
    name: 'エネルギー使用量',
    unit: 'MWh',
    category: 'Environment',
    description: '総エネルギー消費量',
    aliases: ['エネルギー消費', '電力使用量'],
    keywords: ['エネルギー', '電力', '消費', '使用量', 'kWh', 'MWh']
  },
  {
    id: 'RENEWABLE_ENERGY',
    name: '再生可能エネルギー使用率',
    unit: '%',
    category: 'Environment',
    description: '総エネルギーに占める再生可能エネルギーの割合',
    aliases: ['再エネ率', '再生エネルギー'],
    keywords: ['再生可能', '再エネ', 'renewable', '太陽光', '風力', '割合', '%', 'パーセント']
  },
  {
    id: 'WATER_USE',
    name: '水使用量',
    unit: 'm³',
    category: 'Environment',
    description: '総水消費量',
    aliases: ['水消費量', '取水量'],
    keywords: ['水', '使用', '消費', '取水', 'm³', 'リットル']
  },
  {
    id: 'WASTE_TOTAL',
    name: '廃棄物総量',
    unit: 't',
    category: 'Environment',
    description: '総廃棄物発生量',
    aliases: ['廃棄物量', 'ごみ'],
    keywords: ['廃棄物', 'ごみ', 'waste', '発生量', 'トン']
  },
  {
    id: 'WASTE_RECYCLED',
    name: 'リサイクル率',
    unit: '%',
    category: 'Environment',
    description: '廃棄物のリサイクル率',
    aliases: ['再利用率'],
    keywords: ['リサイクル', '再利用', 'recycle', '割合', 'パーセント', '%']
  },

  // Social (社会)
  {
    id: 'EMPLOYEE_COUNT',
    name: '従業員数',
    unit: '人',
    category: 'Social',
    description: '総従業員数',
    aliases: ['社員数', '人員数'],
    keywords: ['従業員', '社員', '人員', '人数', 'employee', 'staff']
  },
  {
    id: 'EMPLOYEE_TURNOVER',
    name: '従業員離職率',
    unit: '%',
    category: 'Social',
    description: '年間離職率',
    aliases: ['離職率', '退職率', 'turnover'],
    keywords: ['離職', '退職', 'turnover', '率', '割合', '%', 'パーセント']
  },
  {
    id: 'FEMALE_RATIO',
    name: '女性比率',
    unit: '%',
    category: 'Social',
    description: '従業員に占める女性の割合',
    aliases: ['女性割合'],
    keywords: ['女性', 'female', '比率', '割合', 'ダイバーシティ', '%', 'パーセント']
  },
  {
    id: 'TRAINING_HOURS',
    name: '研修時間',
    unit: '時間',
    category: 'Social',
    description: '従業員一人あたりの年間研修時間',
    aliases: ['教育時間', 'トレーニング'],
    keywords: ['研修', '教育', 'training', '時間', 'hour', '学習']
  },
  {
    id: 'SAFETY_INCIDENTS',
    name: '労働災害件数',
    unit: '件',
    category: 'Social',
    description: '労働災害・事故の発生件数',
    aliases: ['事故件数', '災害件数'],
    keywords: ['労働災害', '事故', '安全', 'safety', '件数', 'incident']
  },

  // Governance (ガバナンス)
  {
    id: 'BOARD_INDEPENDENCE',
    name: '独立取締役比率',
    unit: '%',
    category: 'Governance',
    description: '取締役会における独立取締役の比率',
    aliases: ['独立役員比率'],
    keywords: ['独立', '取締役', 'board', 'independence', '比率', 'ガバナンス', '%', 'パーセント']
  },
  {
    id: 'BOARD_FEMALE_RATIO',
    name: '取締役会女性比率',
    unit: '%',
    category: 'Governance',
    description: '取締役会における女性の比率',
    aliases: ['役員女性比率'],
    keywords: ['取締役', '女性', 'board', 'female', '比率', 'ダイバーシティ', '%', 'パーセント']
  },
  {
    id: 'COMPLIANCE_TRAINING',
    name: 'コンプライアンス研修受講率',
    unit: '%',
    category: 'Governance',
    description: 'コンプライアンス研修の受講率',
    aliases: ['法令遵守研修'],
    keywords: ['コンプライアンス', '法令遵守', 'compliance', '研修', '受講率', '%', 'パーセント']
  },
  {
    id: 'RISK_INCIDENTS',
    name: 'リスク事案件数',
    unit: '件',
    category: 'Governance',
    description: 'リスク管理上の重要事案件数',
    aliases: ['リスク事象'],
    keywords: ['リスク', 'risk', '事案', '事象', '件数', '管理']
  },

  // Financial Performance (財務)
  {
    id: 'REVENUE',
    name: '売上高',
    unit: '億円',
    category: 'Financial',
    description: '年間売上高',
    aliases: ['売上', '収益', 'revenue'],
    keywords: ['売上', '収益', 'revenue', '億円', '円', '売上高']
  },
  {
    id: 'OPERATING_PROFIT',
    name: '営業利益',
    unit: '億円',
    category: 'Financial',
    description: '営業利益',
    aliases: ['営業益'],
    keywords: ['営業利益', 'operating', 'profit', '利益', '億円']
  },
  {
    id: 'ROE',
    name: '自己資本利益率',
    unit: '%',
    category: 'Financial',
    description: 'ROE（自己資本利益率）',
    aliases: ['ROE', '株主資本利益率'],
    keywords: ['ROE', '自己資本', '利益率', 'return', 'equity', '収益性', '%', 'パーセント']
  }
];

export class KPIDictionaryManager {
  private dictionary: Map<string, KPIDictionary>;

  constructor(kpis: KPIDictionary[] = ESG_KPI_DICTIONARY) {
    this.dictionary = new Map(kpis.map(kpi => [kpi.id, kpi]));
  }

  /**
   * KPI IDで検索
   */
  getById(id: string): KPIDictionary | undefined {
    return this.dictionary.get(id);
  }

  /**
   * すべてのKPIを取得
   */
  getAll(): KPIDictionary[] {
    return Array.from(this.dictionary.values());
  }

  /**
   * カテゴリで絞り込み
   */
  getByCategory(category: string): KPIDictionary[] {
    return this.getAll().filter(kpi => kpi.category === category);
  }

  /**
   * テキスト検索（名前、エイリアス、キーワード）
   */
  searchByText(query: string): KPIDictionary[] {
    const lowerQuery = query.toLowerCase();
    
    return this.getAll().filter(kpi => {
      // 名前での検索
      if (kpi.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // エイリアスでの検索
      if (kpi.aliases?.some(alias => alias.toLowerCase().includes(lowerQuery))) {
        return true;
      }
      
      // キーワードでの検索
      if (kpi.keywords?.some(keyword => keyword.toLowerCase().includes(lowerQuery))) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * 埋め込み用のテキスト生成
   */
  createEmbeddingText(kpi: KPIDictionary): string {
    let text = `KPI: ${kpi.name} (${kpi.id}). `;
    text += `Category: ${kpi.category}. `;
    text += `Unit: ${kpi.unit}. `;
    
    if (kpi.description) {
      text += `Description: ${kpi.description}. `;
    }
    
    if (kpi.aliases && kpi.aliases.length > 0) {
      text += `Aliases: ${kpi.aliases.join(', ')}. `;
    }
    
    if (kpi.keywords && kpi.keywords.length > 0) {
      text += `Keywords: ${kpi.keywords.join(', ')}`;
    }
    
    return text;
  }

  /**
   * KPI辞書に新しいKPIを追加
   */
  addKPI(kpi: KPIDictionary): void {
    this.dictionary.set(kpi.id, kpi);
  }

  /**
   * 統計情報を取得
   */
  getStatistics() {
    const categories = new Set(this.getAll().map(kpi => kpi.category));
    const totalCount = this.dictionary.size;
    const categoryStats = Array.from(categories).map(category => ({
      category,
      count: this.getByCategory(category).length
    }));

    return {
      totalCount,
      categoryCount: categories.size,
      categoryStats
    };
  }
} 
import { 
  Home,
  Database, 
  Target,
  FileText, 
  Settings,
  BarChart3,
  Upload,
  Zap,
  CheckCircle,
  Search,
  Shield,
  Users
} from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  description: string;
  badge?: string;
  subItems?: {
    name: string;
    href: string;
    description: string;
  }[];
}

export const navigation: NavigationItem[] = [
  { 
    name: "ダッシュボード", 
    href: "/", 
    icon: Home,
    description: "KPI概要・進捗・アラート",
    subItems: [
      { name: "概要", href: "/", description: "全体の進捗状況" },
      { name: "KPI監視", href: "/dashboard/kpis", description: "リアルタイムKPI状況" },
      { name: "アクティビティ", href: "/dashboard/activity", description: "最近の活動履歴" }
    ]
  },
  { 
    name: "データ管理", 
    href: "/data", 
    icon: Database,
    description: "ソース登録・アップロード・履歴",
    subItems: [
      { name: "ソース管理", href: "/data/sources", description: "データソースの登録・管理" },
      { name: "アップロード", href: "/data/upload", description: "ファイルのアップロード・取込" },
      { name: "処理履歴", href: "/data/history", description: "データ処理の履歴確認" }
    ]
  },
  { 
    name: "KPI管理", 
    href: "/kpi", 
    icon: Target,
    description: "マッピング・チェック・要件",
    badge: "AI",
    subItems: [
      { name: "自動マッピング", href: "/kpi/mapping", description: "AIによる自動マッピング" },
      { name: "欠損チェック", href: "/kpi/check", description: "KPI欠損の検出・対応" },
      { name: "要件管理", href: "/kpi/requirements", description: "KPI要件の設定・管理" }
    ]
  },
  { 
    name: "データブラウザ", 
    href: "/records", 
    icon: Search,
    description: "データ閲覧・検索・エクスポート",
    subItems: [
      { name: "データ検索", href: "/records", description: "統合データの検索・閲覧" },
      { name: "カタログ", href: "/records/catalog", description: "KPI・データソースカタログ" },
      { name: "監査証跡", href: "/records/audit", description: "変更履歴・証跡確認" }
    ]
  },
  { 
    name: "レポート", 
    href: "/reports", 
    icon: FileText,
    description: "生成・履歴・エクスポート",
    subItems: [
      { name: "レポート生成", href: "/reports/generate", description: "各種レポートの生成" },
      { name: "生成履歴", href: "/reports/history", description: "過去のレポート履歴" },
      { name: "テンプレート", href: "/reports/templates", description: "レポートテンプレート管理" }
    ]
  }
]; 
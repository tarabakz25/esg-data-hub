import { 
  Home,
  Database, 
  ClipboardCheck, 
  FileText, 
  Activity,
  BarChart3
} from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  description: string;
}

export const navigation: NavigationItem[] = [
  { 
    name: "ダッシュボード", 
    href: "/dashboard", 
    icon: Home,
    description: "概要および分析ダッシュボード"
  },
  { 
    name: "データ管理", 
    href: "/data-management", 
    icon: Database,
    description: "ESGデータ収集とデータソースの管理"
  },
  { 
    name: "KPIコンプライアンス", 
    href: "/kpi-compliance", 
    icon: ClipboardCheck,
    description: "KPIコンプライアンス状況の監視"
  },
  { 
    name: "カタログ", 
    href: "/catalog", 
    icon: BarChart3,
    description: "データカタログとKPIの閲覧"
  },
  { 
    name: "レコード", 
    href: "/records", 
    icon: FileText,
    description: "データレコードの表示と管理"
  }
]; 
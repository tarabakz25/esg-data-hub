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
    name: "Dashboard", 
    href: "/dashboard", 
    icon: Home,
    description: "Overview and analytics dashboard"
  },
  { 
    name: "Data Management", 
    href: "/data-management", 
    icon: Database,
    description: "Manage ESG data collection and sources"
  },
  { 
    name: "KPI Compliance", 
    href: "/kpi-compliance", 
    icon: ClipboardCheck,
    description: "Monitor KPI compliance status"
  },
  { 
    name: "Catalog", 
    href: "/catalog", 
    icon: BarChart3,
    description: "Browse data catalog and KPIs"
  },
  { 
    name: "Records", 
    href: "/records", 
    icon: FileText,
    description: "View and manage data records"
  }
]; 
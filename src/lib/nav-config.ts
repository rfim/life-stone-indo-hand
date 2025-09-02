import { 
  Package, 
  Grid, 
  Layers, 
  Palette, 
  Boxes, 
  Ruler, 
  MapPin, 
  Coins, 
  Tag, 
  Users, 
  Warehouse, 
  Truck, 
  Ship, 
  Crown, 
  CreditCard, 
  UserCheck, 
  FileText, 
  FolderTree, 
  Building, 
  UserSquare, 
  FolderOpen, 
  ShoppingCart, 
  Receipt, 
  BarChart3, 
  ArrowRightLeft, 
  Settings, 
  ClipboardList, 
  Phone, 
  NotebookPen, 
  FileCheck, 
  ScrollText, 
  DollarSign, 
  HandCoins, 
  Calendar, 
  Palette as PaletteIcon, 
  Route, 
  Navigation, 
  RotateCcw, 
  Shield, 
  Banknote, 
  CheckSquare, 
  CreditCard as Payment, 
  Calculator, 
  TrendingUp, 
  PieChart, 
  ClipboardCheck, 
  MessageSquare, 
  BarChart, 
  Users2, 
  UserCog, 
  Cog, 
  Bell, 
  Percent, 
  ShieldCheck, 
  LogIn, 
  ArrowUp, 
  ArrowDown, 
  Car 
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<any>
}

export interface NavGroup {
  group: string
  children: NavItem[]
}

export const NAV_TREE: NavGroup[] = [
  {
    group: "Master Data",
    children: [
      { label: "Master Data", path: "/master-data", icon: Grid },
      { label: "Products", path: "/master-data/product", icon: Package },
      { label: "Categories", path: "/master-data/category", icon: Layers },
      { label: "Finishing Types", path: "/master-data/finishing", icon: Palette },
      { label: "Material Types", path: "/master-data/material-type", icon: Boxes },
      { label: "Sizes", path: "/master-data/size", icon: Ruler },
      { label: "Origins", path: "/master-data/origin", icon: MapPin },
      { label: "Currencies", path: "/master-data/currency", icon: Coins },
      { label: "Promotions", path: "/master-data/promotion", icon: Tag },
      { label: "Suppliers", path: "/master-data/supplier", icon: Users },
      { label: "Warehouses", path: "/master-data/warehouse", icon: Warehouse },
      { label: "Vehicles", path: "/master-data/vehicle", icon: Truck },
      { label: "Expeditions", path: "/master-data/expedition", icon: Ship },
      { label: "Armadas", path: "/master-data/armada", icon: Crown },
      { label: "Bank Accounts", path: "/master-data/bank-account", icon: CreditCard },
      { label: "Vendors", path: "/master-data/vendor", icon: UserCheck },
      { label: "Accounts", path: "/master-data/account", icon: FileText },
      { label: "Account Categories", path: "/master-data/account-category", icon: FolderTree },
      { label: "Account Sub Categories", path: "/master-data/account-subcategory", icon: FolderOpen },
      { label: "Departments", path: "/master-data/department", icon: Building },
      { label: "Customer Types", path: "/master-data/customer-type", icon: UserSquare },
      { label: "Projects", path: "/master-data/project", icon: FolderOpen },
      { label: "Customers", path: "/master-data/customer", icon: Users },
      { label: "Item Suppliers", path: "/master-data/item-supplier", icon: Users }
    ]
  },
  {
    group: "Purchasing",
    children: [
      { label: "Purchase Request", path: "/purchasing/purchase-requests", icon: ShoppingCart },
      { label: "Purchase Order Management", path: "/purchasing/purchase-orders", icon: ClipboardList },
      { label: "Purchase Invoice", path: "/purchasing/purchase-invoices", icon: Receipt },
      { label: "Purchasing Dashboard", path: "/purchasing/dashboard", icon: BarChart3 }
    ]
  },
  {
    group: "Warehouse",
    children: [
      { label: "Warehouse Dashboard", path: "/warehouse/dashboard", icon: BarChart3 },
      { label: "SKU Management", path: "/warehouse/sku-management", icon: BarChart3 },
      { label: "Receive Items", path: "/warehouse/receive-items", icon: ArrowDown },
      { label: "Complaint / Purchase Retur", path: "/warehouse/complaint-retur", icon: RotateCcw },
      { label: "Movement", path: "/warehouse/movement", icon: ArrowRightLeft },
      { label: "Adjustment", path: "/warehouse/adjustment", icon: Settings },
      { label: "Stock Overview", path: "/warehouse/stock-overview", icon: BarChart },
      { label: "Stock Card", path: "/warehouse/stock-card", icon: CreditCard },
      { label: "Surat Instruksi Kerja", path: "/warehouse/sik", icon: ClipboardList },
      { label: "Request Barang Masuk", path: "/warehouse/request-inbound", icon: ArrowUp }
    ]
  },
  {
    group: "Marketing",
    children: [
      { label: "Marketing Dashboard", path: "/marketing/dashboard", icon: BarChart3 },
      { label: "Cold Calls", path: "/marketing/cold-calls", icon: Phone },
      { label: "Meeting Minutes", path: "/marketing/notulen", icon: NotebookPen },
      { label: "Sales Orders", path: "/marketing/sales-orders", icon: ShoppingCart },
      { label: "Delivery Orders", path: "/marketing/delivery-orders", icon: Route },
      { label: "Contracts", path: "/marketing/contract", icon: ScrollText },
      { label: "Price Lists", path: "/marketing/price-lists", icon: DollarSign },
      { label: "Commissions", path: "/marketing/commissions", icon: HandCoins },
      { label: "Settings", path: "/marketing/settings", icon: Settings }
    ]
  },
  {
    group: "Social Media",
    children: [
      { label: "Content Planning", path: "/social-media/content-planning", icon: Calendar },
      { label: "Book Matching (Graphic Design)", path: "/social-media/book-matching", icon: PaletteIcon }
    ]
  },
  {
    group: "Logistics/Delivery",
    children: [
      { label: "Delivery Order", path: "/logistics/delivery-orders", icon: Route },
      { label: "Delivery Tracking", path: "/logistics/delivery-tracking", icon: Navigation },
      { label: "Return Management", path: "/logistics/return-management", icon: RotateCcw },
      { label: "Shipment Verification", path: "/logistics/shipment-verification", icon: Shield }
    ]
  },
  {
    group: "Finance",
    children: [
      { label: "Invoice Management", path: "/finance/invoice-management", icon: Receipt },
      { label: "Payment Approval", path: "/finance/payment-approval", icon: CheckSquare },
      { label: "Payment Management", path: "/finance/payment-management", icon: Payment },
      { label: "Reimbursment", path: "/finance/reimbursement", icon: Banknote },
      { label: "Accounting & Journal", path: "/finance/accounting-journal", icon: Calculator },
      { label: "Account Properties & Profit-Loss Management", path: "/finance/account-properties-pl", icon: TrendingUp }
    ]
  },
  {
    group: "Dashboards",
    children: [
      { label: "Dashboard Overview", path: "/dashboards/overview", icon: BarChart3 },
      { label: "Report Generation", path: "/dashboards/report-generation", icon: BarChart },
      { label: "Approval Management", path: "/dashboards/approval-management", icon: ClipboardCheck },
      { label: "Content Request Management", path: "/dashboards/content-requests", icon: MessageSquare },
      { label: "Financial Dashboard", path: "/dashboards/financial", icon: PieChart },
      { label: "Meeting Minutes Management", path: "/dashboards/meeting-minutes", icon: NotebookPen },
      { label: "Director/Supervisor Approvals", path: "/dashboards/director-approvals", icon: Users2 }
    ]
  },
  {
    group: "Settings & User Privilege",
    children: [
      { label: "User Management", path: "/settings/user-management", icon: Users },
      { label: "Role Assignment", path: "/settings/role-assignment", icon: UserCog },
      { label: "System Configuration", path: "/settings/system-configuration", icon: Cog },
      { label: "Notifications Management", path: "/settings/notifications", icon: Bell },
      { label: "VAT", path: "/settings/vat", icon: Percent }
    ]
  },
  {
    group: "Security",
    children: [
      { label: "Guest Log Management", path: "/security/guest-log", icon: LogIn },
      { label: "Incoming Items", path: "/security/incoming-items", icon: ArrowDown },
      { label: "Outgoing Items", path: "/security/outgoing-items", icon: ArrowUp }
    ]
  },
  {
    group: "Driver",
    children: [
      { label: "Delivery", path: "/driver/delivery", icon: Car }
    ]
  }
]

// Get all paths for route generation
export const getAllPaths = (): string[] => {
  return NAV_TREE.flatMap(group => group.children.map(item => item.path))
}

// Get navigation item by path
export const getNavItemByPath = (path: string): NavItem | undefined => {
  for (const group of NAV_TREE) {
    const item = group.children.find(child => child.path === path)
    if (item) return item
  }
  return undefined
}
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
    group: "Masters",
    children: [
      { label: "Items", path: "/masters/items", icon: Package },
      { label: "Products", path: "/masters/products", icon: Package },
      { label: "Categories", path: "/masters/categories", icon: Layers },
      { label: "Finishing types", path: "/masters/finishing-types", icon: Palette },
      { label: "Material types", path: "/masters/material-types", icon: Boxes },
      { label: "Sizes", path: "/masters/sizes", icon: Ruler },
      { label: "Origins", path: "/masters/origins", icon: MapPin },
      { label: "Currencies", path: "/masters/currencies", icon: Coins },
      { label: "Promotions", path: "/masters/promotions", icon: Tag },
      { label: "Suppliers", path: "/masters/suppliers", icon: Users },
      { label: "Warehouses", path: "/masters/warehouses", icon: Warehouse },
      { label: "Vehicles", path: "/masters/vehicles", icon: Truck },
      { label: "Expeditions", path: "/masters/expeditions", icon: Ship },
      { label: "Armadas", path: "/masters/armadas", icon: Crown },
      { label: "Bank accounts", path: "/masters/bank-accounts", icon: CreditCard },
      { label: "Vendors", path: "/masters/vendors", icon: UserCheck },
      { label: "Accounts", path: "/masters/accounts", icon: FileText },
      { label: "Account categories", path: "/masters/account-categories", icon: FolderTree },
      { label: "Sub account categories", path: "/masters/sub-account-categories", icon: FolderOpen },
      { label: "Departments", path: "/masters/departments", icon: Building },
      { label: "Customer types", path: "/masters/customer-types", icon: UserSquare },
      { label: "Projects", path: "/masters/projects", icon: FolderOpen },
      { label: "Customers", path: "/masters/customers", icon: Users }
    ]
  },
  {
    group: "Purchasing",
    children: [
      { label: "Purchase Request", path: "/purchasing/purchase-requests", icon: ShoppingCart },
      { label: "Purchase Order Management", path: "/purchasing/purchase-orders", icon: ClipboardList },
      { label: "Purchase Invoice", path: "/purchasing/purchase-invoices", icon: Receipt }
    ]
  },
  {
    group: "Warehouse",
    children: [
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
      { label: "Cold Calls", path: "/marketing/cold-calls", icon: Phone },
      { label: "Notulen", path: "/marketing/notulen", icon: NotebookPen },
      { label: "Offering", path: "/marketing/offering", icon: FileCheck },
      { label: "Contract", path: "/marketing/contract", icon: ScrollText },
      { label: "Price Lists", path: "/marketing/price-lists", icon: DollarSign },
      { label: "Sales Order Management", path: "/marketing/sales-orders", icon: ShoppingCart },
      { label: "Commissions", path: "/marketing/commissions", icon: HandCoins }
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
      { label: "Director Dashboard", path: "/dashboards/director", icon: Users2 },
      { label: "Supervisor Dashboard", path: "/dashboards/supervisor", icon: UserCog },
      { label: "Report Generation", path: "/dashboards/report-generation", icon: BarChart },
      { label: "Approval Management", path: "/dashboards/approval-management", icon: ClipboardCheck },
      { label: "Content Request Management", path: "/dashboards/content-requests", icon: MessageSquare },
      { label: "Financial Dashboard", path: "/dashboards/financial", icon: PieChart },
      { label: "Meeting Minutes Management", path: "/dashboards/meeting-minutes", icon: NotebookPen },
      { label: "Dashboard Overview", path: "/dashboards/overview", icon: BarChart3 },
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
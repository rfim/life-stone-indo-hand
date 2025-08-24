import { useState } from 'react'
import { ChevronLeft, ChevronRight, List, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSidebarContext } from '@/components/sidebar-provider'
import { useIsMobile } from '@/hooks/use-mobile'
import { useRouter } from '@/hooks/use-router'

interface NavigationItem {
  label: string
  href: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  {
    label: 'Masters',
    href: '/masters',
    children: [
      { label: 'Items', href: '/masters/items', icon: List },
      { label: 'Products', href: '/masters/products', icon: List },
      { label: 'Categories', href: '/masters/categories', icon: List },
      { label: 'Finishing types', href: '/masters/finishing-types', icon: List },
      { label: 'Material types', href: '/masters/material-types', icon: List },
      { label: 'Sizes', href: '/masters/sizes', icon: List },
      { label: 'Origins', href: '/masters/origins', icon: List },
      { label: 'Currencies', href: '/masters/currencies', icon: List },
      { label: 'Promotions', href: '/masters/promotions', icon: List },
      { label: 'Suppliers', href: '/masters/suppliers', icon: List },
      { label: 'Warehouses', href: '/masters/warehouses', icon: List },
      { label: 'Vehicles', href: '/masters/vehicles', icon: List },
      { label: 'Expeditions', href: '/masters/expeditions', icon: List },
      { label: 'Armadas', href: '/masters/armadas', icon: List },
      { label: 'Bank accounts', href: '/masters/bank-accounts', icon: List },
      { label: 'Vendors', href: '/masters/vendors', icon: List },
      { label: 'Accounts', href: '/masters/accounts', icon: List },
      { label: 'Account categories', href: '/masters/account-categories', icon: List },
      { label: 'Sub account categories', href: '/masters/sub-account-categories', icon: List },
      { label: 'Departments', href: '/masters/departments', icon: List },
      { label: 'Customer types', href: '/masters/customer-types', icon: List },
      { label: 'Projects', href: '/masters/projects', icon: List },
      { label: 'Customers', href: '/masters/customers', icon: List },
    ]
  },
  {
    label: 'Purchasing',
    href: '/purchasing',
    children: [
      { label: 'Purchase Request', href: '/purchasing/purchase-requests', icon: List },
      { label: 'Purchase Order Management', href: '/purchasing/purchase-orders', icon: List },
      { label: 'Purchase Invoice', href: '/purchasing/purchase-invoices', icon: List },
    ]
  },
  {
    label: 'Warehouse',
    href: '/warehouse',
    children: [
      { label: 'SKU Management', href: '/warehouse/sku-management', icon: List },
      { label: 'Receive Items', href: '/warehouse/receive-items', icon: List },
      { label: 'Complaint / Purchase Retur', href: '/warehouse/complaint-retur', icon: List },
      { label: 'Movement', href: '/warehouse/movement', icon: List },
      { label: 'Adjustment', href: '/warehouse/adjustment', icon: List },
      { label: 'Stock Overview', href: '/warehouse/stock-overview', icon: List },
      { label: 'Stock Card', href: '/warehouse/stock-card', icon: List },
      { label: 'Surat Instruksi Kerja', href: '/warehouse/sik', icon: List },
      { label: 'Request Barang Masuk', href: '/warehouse/request-inbound', icon: List },
    ]
  },
  {
    label: 'Marketing',
    href: '/marketing',
    children: [
      { label: 'Cold Calls', href: '/marketing/cold-calls', icon: List },
      { label: 'Notulen', href: '/marketing/notulen', icon: List },
      { label: 'Offering', href: '/marketing/offering', icon: List },
      { label: 'Contract', href: '/marketing/contract', icon: List },
      { label: 'Price Lists', href: '/marketing/price-lists', icon: List },
      { label: 'Sales Order Management', href: '/marketing/sales-orders', icon: List },
      { label: 'Commissions', href: '/marketing/commissions', icon: List },
    ]
  },
  {
    label: 'Social Media',
    href: '/social-media',
    children: [
      { label: 'Content Planning', href: '/social-media/content-planning', icon: List },
      { label: 'Book Matching (Graphic Design)', href: '/social-media/book-matching', icon: List },
    ]
  },
  {
    label: 'Logistics/Delivery',
    href: '/logistics',
    children: [
      { label: 'Delivery Order', href: '/logistics/delivery-orders', icon: List },
      { label: 'Delivery Tracking', href: '/logistics/delivery-tracking', icon: List },
      { label: 'Return Management', href: '/logistics/return-management', icon: List },
      { label: 'Shipment Verification', href: '/logistics/shipment-verification', icon: List },
    ]
  },
  {
    label: 'Finance',
    href: '/finance',
    children: [
      { label: 'Invoice Management', href: '/finance/invoice-management', icon: List },
      { label: 'Payment Approval', href: '/finance/payment-approval', icon: List },
      { label: 'Payment Management', href: '/finance/payment-management', icon: List },
      { label: 'Reimbursment', href: '/finance/reimbursement', icon: List },
      { label: 'Accounting & Journal', href: '/finance/accounting-journal', icon: List },
      { label: 'Account Properties & Profit-Loss Management', href: '/finance/account-properties-pl', icon: List },
    ]
  },
  {
    label: 'Dashboards',
    href: '/dashboards',
    children: [
      { label: 'Report Generation', href: '/dashboards/report-generation', icon: List },
      { label: 'Approval Management', href: '/dashboards/approval-management', icon: List },
      { label: 'Content Request Management', href: '/dashboards/content-requests', icon: List },
      { label: 'Financial Dashboard', href: '/dashboards/financial', icon: List },
      { label: 'Meeting Minutes Management', href: '/dashboards/meeting-minutes', icon: List },
      { label: 'Dashboard Overview', href: '/dashboards/overview', icon: List },
      { label: 'Director/Supervisor Approvals', href: '/dashboards/director-approvals', icon: List },
    ]
  },
  {
    label: 'Settings & User Privilege',
    href: '/settings',
    children: [
      { label: 'User Management', href: '/settings/user-management', icon: List },
      { label: 'Role Assignment', href: '/settings/role-assignment', icon: List },
      { label: 'System Configuration', href: '/settings/system-configuration', icon: List },
      { label: 'Notifications Management', href: '/settings/notifications', icon: List },
      { label: 'VAT', href: '/settings/vat', icon: List },
    ]
  },
  {
    label: 'Security',
    href: '/security',
    children: [
      { label: 'Guest Log Management', href: '/security/guest-log', icon: List },
      { label: 'Incoming Items', href: '/security/incoming-items', icon: List },
      { label: 'Outgoing Items', href: '/security/outgoing-items', icon: List },
    ]
  },
  {
    label: 'Driver',
    href: '/driver',
    children: [
      { label: 'Delivery', href: '/driver/delivery', icon: List },
    ]
  },
]

function NavigationSection({ 
  item, 
  isExpanded, 
  isCollapsed,
  currentPath
}: { 
  item: NavigationItem
  isExpanded: boolean
  isCollapsed: boolean
  currentPath: string
}) {
  const [isOpen, setIsOpen] = useState(item.label === 'Masters' || currentPath.startsWith(item.href))
  const { navigate } = useRouter()

  if (isCollapsed) {
    return (
      <div className="relative group">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-center px-3 py-2 h-10",
            currentPath.startsWith(item.href) && "bg-primary/10 text-primary"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <List size={20} />
        </Button>
        {/* Tooltip for collapsed state */}
        <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {item.label}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-between px-3 py-2 h-10 text-left font-medium",
          currentPath.startsWith(item.href) && "bg-primary/10 text-primary",
          isOpen && "text-primary"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <List size={20} />
          <span>{item.label}</span>
        </div>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </Button>
      {isOpen && item.children && (
        <div className="ml-6 space-y-0.5">
          {item.children.map((child) => (
            <Button
              key={child.href}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start px-3 py-2 h-9 text-sm font-normal",
                currentPath === child.href && "bg-primary text-primary-foreground"
              )}
              onClick={() => navigate(child.href)}
            >
              <div className="flex items-center gap-3">
                {child.icon && <child.icon size={16} />}
                <span>{child.label}</span>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

function ChevronDown({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}

export function Sidebar() {
  const { state, isExpanded, isCollapsed, isHidden, toggle, collapse } = useSidebarContext()
  const { currentPath } = useRouter()
  const isMobile = useIsMobile()

  if (isHidden && !isMobile) {
    return null
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={collapse}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-200",
          "flex flex-col",
          isExpanded && "w-[var(--sidebar-width)]",
          isCollapsed && "w-[72px]",
          isHidden && "w-0 -translate-x-full",
          isMobile && isExpanded && "w-[280px] shadow-lg"
        )}
        aria-label="Primary navigation"
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              LS
            </div>
            {(isExpanded || isMobile) && (
              <div>
                <div className="font-semibold text-sm">Life Stone</div>
                <div className="text-xs text-muted-foreground">Indonesia</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {navigation.map((item) => (
              <NavigationSection
                key={item.href}
                item={item}
                isExpanded={isExpanded || isMobile}
                isCollapsed={isCollapsed && !isMobile}
                currentPath={currentPath}
              />
            ))}
          </div>
        </nav>

        {/* Collapse/Expand Toggle - Desktop only */}
        {!isMobile && !isHidden && (
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={toggle}
            >
              {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
import { Routes, Route, Navigate } from 'react-router-dom'
import { getAllPaths } from '@/lib/nav-config'
import { ListPage } from '@/components/list-page'
import { GenericMasterPage } from '@/components/generic-master-page'
import { DashboardOverview } from '@/components/dashboard-overview'

// Import specific pages that exist
import { DashboardApp } from '@/components/purchasing/DashboardApp'
import { WarehouseDashboard } from '@/components/warehouse/WarehouseDashboard'
import { FinancialDashboard } from '@/components/finance/FinancialDashboard'
import { InvoiceManagement } from '@/components/finance/InvoiceManagement'
import { PaymentApproval } from '@/components/finance/PaymentApproval'
import { PaymentManagement } from '@/components/finance/PaymentManagement'
import { ReimbursementManagement } from '@/components/finance/ReimbursementManagement'
import { AccountingJournal } from '@/components/finance/AccountingJournal'
import { AccountPropertiesPL } from '@/components/finance/AccountPropertiesPL'

export function AppRouter() {
  const allPaths = getAllPaths()

  // Map specific paths to their components
  const getPageComponent = (path: string) => {
    switch (path) {
      case '/dashboards/overview':
        return <DashboardOverview />
      case '/purchasing/dashboard':
        return <DashboardApp />
      case '/warehouse/dashboard':
        return <WarehouseDashboard />
      case '/dashboards/financial':
        return <FinancialDashboard />
      case '/finance/invoice-management':
        return <InvoiceManagement />
      case '/finance/payment-approval':
        return <PaymentApproval />
      case '/finance/payment-management':
        return <PaymentManagement />
      case '/finance/reimbursement':
        return <ReimbursementManagement />
      case '/finance/accounting-journal':
        return <AccountingJournal />
      case '/finance/account-properties-pl':
        return <AccountPropertiesPL />
      default:
        // Use generic page for master data paths, list page for others
        if (path.startsWith('/masters/')) {
          return <GenericMasterPage path={path} />
        }
        return <ListPage path={path} />
    }
  }

  return (
    <Routes>
      {/* Redirect root to dashboard overview */}
      <Route path="/" element={<Navigate to="/dashboards/overview" replace />} />
      
      {/* Generate routes for all navigation paths */}
      {allPaths.map((path) => (
        <Route
          key={path}
          path={path}
          element={getPageComponent(path)}
        />
      ))}
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboards/overview" replace />} />
    </Routes>
  )
}
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

// Import Director Dashboard components
import { DirectorDashboard } from '@/components/director/DirectorDashboard'
import { ReportGeneration } from '@/components/director/ReportGeneration'
import { ApprovalManagement } from '@/components/director/ApprovalManagement'
import { ContentRequestManagement } from '@/components/director/ContentRequestManagement'

// Meeting Minutes components (from marketing)
import { MeetingMinutesPage } from '@/pages/marketing/meeting-minutes'
import { CreateMeetingMinutesPage } from '@/pages/marketing/meeting-minutes/create'
import { EditMeetingMinutesPage } from '@/pages/marketing/meeting-minutes/edit'
import { ViewMeetingMinutesPage } from '@/pages/marketing/meeting-minutes/view'

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
      // Director Dashboard routes
      case '/dashboards/report-generation':
        return <ReportGeneration />
      case '/dashboards/approval-management':
        return <ApprovalManagement />
      case '/dashboards/content-requests':
        return <ContentRequestManagement />
      case '/dashboards/director-approvals':
        return <DirectorDashboard userRole="Director" />
      case '/dashboards/meeting-minutes':
        return <MeetingMinutesPage />
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
      
      {/* Director Dashboard routes with dynamic user role */}
      <Route path="/dashboards/director" element={<DirectorDashboard userRole="Director" />} />
      <Route path="/dashboards/supervisor" element={<DirectorDashboard userRole="Supervisor" />} />
      
      {/* Meeting Minutes sub-routes */}
      <Route path="/dashboards/meeting-minutes" element={<MeetingMinutesPage />} />
      <Route path="/dashboards/meeting-minutes/create" element={<CreateMeetingMinutesPage />} />
      <Route path="/dashboards/meeting-minutes/:id/edit" element={<EditMeetingMinutesPage />} />
      <Route path="/dashboards/meeting-minutes/:id/view" element={<ViewMeetingMinutesPage />} />
      
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
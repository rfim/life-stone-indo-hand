import { Routes, Route, Navigate } from 'react-router-dom'
import { getAllPaths } from '@/lib/nav-config'
import { ListPage } from '@/components/list-page'
import { GenericMasterPage } from '@/components/generic-master-page'
import { DashboardOverview } from '@/components/dashboard-overview'

// Import new master data pages
import { MasterDataIndexPage } from '@/pages/master-data'
import { CategoryPage } from '@/pages/master-data/category'
import { SupplierPage } from '@/pages/master-data/supplier'
import { CurrencyPage } from '@/pages/master-data/currency'
import { VehiclePage } from '@/pages/master-data/vehicle'
import { CustomerPage } from '@/pages/master-data/customer'
import { MaterialTypePage } from '@/pages/master-data/material-type'
import { FinishingPage } from '@/pages/master-data/finishing'
import { DeliveryOrdersPage } from '@/pages/logistics/delivery-orders'

export function AppRouter() {
  const allPaths = getAllPaths()

  // Map specific paths to their components
  const getPageComponent = (path: string) => {
    switch (path) {
      case '/dashboards/overview':
        return <DashboardOverview />
      case '/master-data':
        return <MasterDataIndexPage />
      case '/master-data/category':
        return <CategoryPage />
      case '/master-data/supplier':
        return <SupplierPage />
      case '/master-data/currency':
        return <CurrencyPage />
      case '/master-data/vehicle':
        return <VehiclePage />
      case '/master-data/customer':
        return <CustomerPage />
      case '/master-data/material-type':
        return <MaterialTypePage />
      case '/master-data/finishing':
        return <FinishingPage />
      case '/logistics/delivery-orders':
        return <DeliveryOrdersPage />
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
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
import { ProductPage } from '@/pages/master-data/product'
import { WarehousePage } from '@/pages/master-data/warehouse'
import { DepartmentPage } from '@/pages/master-data/department'
import { CustomerTypePage } from '@/pages/master-data/customer-type'
import { AccountCategoryPage } from '@/pages/master-data/account-category'
import { OriginPage } from '@/pages/master-data/origin'
import { VendorPage } from '@/pages/master-data/vendor'
import { DeliveryOrdersPage } from '@/pages/logistics/delivery-orders'

// Import purchasing pages
import { PurchaseRequestsPage } from '@/pages/purchasing/purchase-requests'

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
      case '/master-data/product':
        return <ProductPage />
      case '/master-data/warehouse':
        return <WarehousePage />
      case '/master-data/department':
        return <DepartmentPage />
      case '/master-data/customer-type':
        return <CustomerTypePage />
      case '/master-data/account-category':
        return <AccountCategoryPage />
      case '/master-data/origin':
        return <OriginPage />
      case '/master-data/vendor':
        return <VendorPage />
      case '/logistics/delivery-orders':
        return <DeliveryOrdersPage />
      case '/purchasing/purchase-requests':
        return <PurchaseRequestsPage />
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
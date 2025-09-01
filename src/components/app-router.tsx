import { Routes, Route, Navigate } from 'react-router-dom'
import { getAllPaths } from '@/lib/nav-config'
import { ListPage } from '@/components/list-page'
import { GenericMasterPage } from '@/components/generic-master-page'
import { DashboardOverview } from '@/components/dashboard-overview'

// Import specific page components
import { CategoriesPage } from '@/pages/masters/categories'
import { SuppliersPage } from '@/pages/masters/suppliers'
import { ProductsPage } from '@/pages/masters/products'
import { DeliveryOrdersPage } from '@/pages/logistics/delivery-orders'

export function AppRouter() {
  const allPaths = getAllPaths()

  // Map specific paths to their components
  const getPageComponent = (path: string) => {
    switch (path) {
      case '/dashboards/overview':
        return <DashboardOverview />
      case '/masters/categories':
        return <CategoriesPage />
      case '/masters/suppliers':
        return <SuppliersPage />
      case '/masters/products':
        return <ProductsPage />
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
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
import { CreatePurchaseRequestPage } from '@/pages/purchasing/purchase-requests/create'
import { ViewPurchaseRequestPage } from '@/pages/purchasing/purchase-requests/view'
import { EditPurchaseRequestPage } from '@/pages/purchasing/purchase-requests/edit'
import { PurchaseOrdersPage } from '@/pages/purchasing/purchase-orders'
import { CreatePurchaseOrderPage } from '@/pages/purchasing/purchase-orders/create'
import { ViewPurchaseOrderPage } from '@/pages/purchasing/purchase-orders/view'
import { EditPurchaseOrderPage } from '@/pages/purchasing/purchase-orders/edit'
import { PurchaseInvoicesPage } from '@/pages/purchasing/purchase-invoices'
import { CreatePurchaseInvoicePage } from '@/pages/purchasing/purchase-invoices/create'
import { ViewPurchaseInvoicePage } from '@/pages/purchasing/purchase-invoices/view'
import { EditPurchaseInvoicePage } from '@/pages/purchasing/purchase-invoices/edit'

// Import warehouse pages
import { SKUManagementPage } from '@/pages/warehouse/sku-management'
import { CreateSKUPage } from '@/pages/warehouse/sku-management/create'
import { ViewSKUPage } from '@/pages/warehouse/sku-management/view'
import { EditSKUPage } from '@/pages/warehouse/sku-management/edit'
import { ReceiveItemsPage } from '@/pages/warehouse/receive-items'
import { CreateReceiveItemsPage } from '@/pages/warehouse/receive-items/create'
import { ViewReceiveItemsPage } from '@/pages/warehouse/receive-items/view'
import { EditReceiveItemsPage } from '@/pages/warehouse/receive-items/edit'
import { ComplaintReturPage } from '@/pages/warehouse/complaint-retur'
import { CreateComplaintReturPage } from '@/pages/warehouse/complaint-retur/create'
import { ViewComplaintReturPage } from '@/pages/warehouse/complaint-retur/view'
import { EditComplaintReturPage } from '@/pages/warehouse/complaint-retur/edit'

// Import purchasing dashboard
import { DashboardApp } from '@/components/purchasing/DashboardApp'

// Import warehouse dashboard
import { WarehouseDashboard } from '@/components/warehouse/WarehouseDashboard'
import { StockCard } from '@/components/warehouse/StockCard'

// Import marketing pages
import { MarketingDashboard } from '@/pages/marketing/dashboard'
import { ColdCallsPage } from '@/pages/marketing/cold-calls'
import { CreateColdCallPage } from '@/pages/marketing/cold-calls/create'
import { ViewColdCallPage } from '@/pages/marketing/cold-calls/view'
import { EditColdCallPage } from '@/pages/marketing/cold-calls/edit'
import { SalesOrdersPage } from '@/pages/marketing/sales-orders'
import { CreateSalesOrderPage } from '@/pages/marketing/sales-orders/create'
import { ViewSalesOrderPage } from '@/pages/marketing/sales-orders/view'
import { MeetingMinutesPage } from '@/pages/marketing/meeting-minutes'
import { CreateMeetingMinutesPage } from '@/pages/marketing/meeting-minutes/create'
import { ViewMeetingMinutesPage } from '@/pages/marketing/meeting-minutes/view'
import { EditMeetingMinutesPage } from '@/pages/marketing/meeting-minutes/edit'
import { CloneMeetingMinutesPage } from '@/pages/marketing/meeting-minutes/clone'
import { ContractsPage } from '@/pages/marketing/contracts'
import { CreateContractPage } from '@/pages/marketing/contracts/create'
import { ViewContractPage } from '@/pages/marketing/contracts/view'

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
      case '/marketing/dashboard':
        return <MarketingDashboard />
      case '/marketing/cold-calls':
        return <ColdCallsPage />
      case '/marketing/sales-orders':
        return <SalesOrdersPage />
      case '/marketing/meeting-minutes':
        return <MeetingMinutesPage />
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
      
      {/* Marketing Dashboard */}
      <Route path="/marketing/dashboard" element={<MarketingDashboard />} />
      
      {/* Marketing Pages */}
      <Route path="/marketing/cold-calls" element={<ColdCallsPage />} />
      <Route path="/marketing/cold-calls/create" element={<CreateColdCallPage />} />
      <Route path="/marketing/cold-calls/:id/view" element={<ViewColdCallPage />} />
      <Route path="/marketing/cold-calls/:id/edit" element={<EditColdCallPage />} />
      
      {/* Meeting Minutes */}
      <Route path="/marketing/meeting-minutes" element={<MeetingMinutesPage />} />
      <Route path="/marketing/meeting-minutes/create" element={<CreateMeetingMinutesPage />} />
      <Route path="/marketing/meeting-minutes/:id/view" element={<ViewMeetingMinutesPage />} />
      <Route path="/marketing/meeting-minutes/:id/edit" element={<EditMeetingMinutesPage />} />
      <Route path="/marketing/meeting-minutes/:id/clone" element={<CloneMeetingMinutesPage />} />
      
      <Route path="/marketing/sales-orders" element={<SalesOrdersPage />} />
      <Route path="/marketing/sales-orders/create" element={<CreateSalesOrderPage />} />
      <Route path="/marketing/sales-orders/:id/view" element={<ViewSalesOrderPage />} />
      
      {/* Contracts */}
      <Route path="/marketing/contracts" element={<ContractsPage />} />
      <Route path="/marketing/contracts/create" element={<CreateContractPage />} />
      <Route path="/marketing/contracts/:id/view" element={<ViewContractPage />} />
      
      {/* Purchasing Dashboard */}
      <Route path="/purchasing/dashboard" element={<DashboardApp />} />
      
      {/* Warehouse Dashboard */}
      <Route path="/warehouse/dashboard" element={<WarehouseDashboard />} />
      <Route path="/warehouse/stock-card/:skuId" element={<StockCard />} />
      
      {/* Purchase Orders - dedicated pages */}
      <Route path="/purchasing/purchase-orders" element={<PurchaseOrdersPage />} />
      <Route path="/purchasing/purchase-orders/create" element={<CreatePurchaseOrderPage />} />
      <Route path="/purchasing/purchase-orders/:id/view" element={<ViewPurchaseOrderPage />} />
      <Route path="/purchasing/purchase-orders/:id/edit" element={<EditPurchaseOrderPage />} />
      
      {/* Purchase Requests - dedicated pages */}
      <Route path="/purchasing/purchase-requests" element={<PurchaseRequestsPage />} />
      <Route path="/purchasing/purchase-requests/create" element={<CreatePurchaseRequestPage />} />
      <Route path="/purchasing/purchase-requests/:id/view" element={<ViewPurchaseRequestPage />} />
      <Route path="/purchasing/purchase-requests/:id/edit" element={<EditPurchaseRequestPage />} />
      
      {/* Purchase Invoices - dedicated pages */}
      <Route path="/purchasing/purchase-invoices" element={<PurchaseInvoicesPage />} />
      <Route path="/purchasing/purchase-invoices/create" element={<CreatePurchaseInvoicePage />} />
      <Route path="/purchasing/purchase-invoices/:id/view" element={<ViewPurchaseInvoicePage />} />
      <Route path="/purchasing/purchase-invoices/:id/edit" element={<EditPurchaseInvoicePage />} />
      
      {/* SKU Management - dedicated pages */}
      <Route path="/warehouse/sku-management" element={<SKUManagementPage />} />
      <Route path="/warehouse/sku-management/create" element={<CreateSKUPage />} />
      <Route path="/warehouse/sku-management/:id/view" element={<ViewSKUPage />} />
      <Route path="/warehouse/sku-management/:id/edit" element={<EditSKUPage />} />
      
      {/* Receive Items - dedicated pages */}
      <Route path="/warehouse/receive-items" element={<ReceiveItemsPage />} />
      <Route path="/warehouse/receive-items/create" element={<CreateReceiveItemsPage />} />
      <Route path="/warehouse/receive-items/:id/view" element={<ViewReceiveItemsPage />} />
      <Route path="/warehouse/receive-items/:id/edit" element={<EditReceiveItemsPage />} />
      
      {/* Complaint Retur - dedicated pages */}
      <Route path="/warehouse/complaint-retur" element={<ComplaintReturPage />} />
      <Route path="/warehouse/complaint-retur/create" element={<CreateComplaintReturPage />} />
      <Route path="/warehouse/complaint-retur/:id/view" element={<ViewComplaintReturPage />} />
      <Route path="/warehouse/complaint-retur/:id/edit" element={<EditComplaintReturPage />} />
      
      {/* Generate routes for all other navigation paths */}
      {allPaths.filter(path => 
        !path.startsWith('/purchasing/purchase-orders') &&
        !path.startsWith('/purchasing/purchase-requests') &&
        !path.startsWith('/purchasing/purchase-invoices') &&
        !path.startsWith('/warehouse/sku-management') &&
        !path.startsWith('/warehouse/receive-items') &&
        !path.startsWith('/warehouse/complaint-retur')
      ).map((path) => (
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
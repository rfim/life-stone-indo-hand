import { useRouter } from '@/hooks/use-router'
import { CustomersPage } from '@/components/customers-page'
import { DataTable } from '@/components/data-table'

function DashboardPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Life Stone Indonesia ERP</h1>
        <p className="text-muted-foreground mb-8">
          Comprehensive business management system for stone and construction materials
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Masters</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage items, products, customers, and other master data
            </p>
            <div className="text-2xl font-bold text-primary">23</div>
            <div className="text-xs text-muted-foreground">Total modules</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Active Orders</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Purchase and sales orders in progress
            </p>
            <div className="text-2xl font-bold text-primary">156</div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Inventory</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stock levels and warehouse management
            </p>
            <div className="text-2xl font-bold text-primary">89%</div>
            <div className="text-xs text-muted-foreground">Capacity utilized</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <DataTable
        title={title}
        subtitle={`Manage your ${title.toLowerCase()}`}
        data={[]}
        columns={[
          { key: 'name', label: 'Name', sortable: true },
          { key: 'status', label: 'Status', sortable: true },
          { key: 'createdAt', label: 'Created', sortable: true }
        ]}
        onCreateClick={() => console.log(`Create ${title}`)}
        createButtonText={`Create ${title.slice(0, -1)}`}
      />
    </div>
  )
}

export function AppRouter() {
  const { currentPath } = useRouter()

  if (currentPath === '/' || currentPath === '/dashboard') {
    return <DashboardPage />
  }

  if (currentPath === '/masters/customers') {
    return <CustomersPage />
  }

  // Handle all other master routes
  if (currentPath.startsWith('/masters/')) {
    const entity = currentPath.split('/')[2]
    const entityMap: Record<string, string> = {
      'items': 'Items',
      'products': 'Products',
      'categories': 'Categories',
      'finishing-types': 'Finishing Types',
      'material-types': 'Material Types',
      'sizes': 'Sizes',
      'origins': 'Origins',
      'currencies': 'Currencies',
      'promotions': 'Promotions',
      'suppliers': 'Suppliers',
      'warehouses': 'Warehouses',
      'vehicles': 'Vehicles',
      'expeditions': 'Expeditions',
      'armadas': 'Armadas',
      'bank-accounts': 'Bank Accounts',
      'vendors': 'Vendors',
      'accounts': 'Accounts',
      'account-categories': 'Account Categories',
      'sub-account-categories': 'Sub Account Categories',
      'departments': 'Departments',
      'customer-types': 'Customer Types',
      'projects': 'Projects'
    }
    
    const title = entityMap[entity] || 'Unknown'
    return <PlaceholderPage title={title} />
  }

  // Handle other module routes
  const moduleMap: Record<string, string> = {
    '/purchasing': 'Purchasing',
    '/warehouse': 'Warehouse',
    '/marketing': 'Marketing',
    '/social-media': 'Social Media',
    '/logistics': 'Logistics',
    '/finance': 'Finance',
    '/dashboards': 'Dashboards',
    '/settings': 'Settings',
    '/security': 'Security',
    '/driver': 'Driver'
  }

  for (const [path, title] of Object.entries(moduleMap)) {
    if (currentPath.startsWith(path)) {
      return <PlaceholderPage title={title} />
    }
  }

  // 404 fallback
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The page you're looking for doesn't exist.
        </p>
        <button 
          onClick={() => window.history.pushState({}, '', '/')}
          className="text-primary hover:underline"
        >
          Go back to dashboard
        </button>
      </div>
    </div>
  )
}
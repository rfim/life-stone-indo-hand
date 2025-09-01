import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Refine } from '@refinedev/core'
import { AppLayout } from '@/components/layout/app-layout'
import { Sidebar } from '@/components/sidebar/sidebar'
import { Header } from '@/components/layout/header'
import { AppRouter } from '@/components/app-router'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useIsMobile } from '@/hooks/use-mobile'
import { Toaster } from '@/components/ui/sonner'

// Import seeding function - temporarily disabled
// import '@/lib/seed-data'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 401/403
        if (error instanceof Error) {
          const status = (error as any).status
          if (status >= 400 && status < 500 && ![401, 403].includes(status)) {
            return false
          }
        }
        return failureCount < 3
      },
    },
    mutations: {
      retry: 1,
    },
  },
})

function AppContent() {
  const isMobile = useIsMobile()
  useKeyboardShortcuts()

  useEffect(() => {
    // Set initial CSS variable for sidebar width
    const savedState = localStorage.getItem('ls.sidebar.state')
    const savedWidth = localStorage.getItem('ls.sidebar.width') || '264'
    
    const root = document.documentElement
    
    // Mobile devices use drawer instead of persistent sidebar
    if (isMobile) {
      root.style.setProperty('--sidebar-width', '0px')
    } else {
      if (savedState === 'hidden') {
        root.style.setProperty('--sidebar-width', '0px')
      } else if (savedState === 'collapsed') {
        root.style.setProperty('--sidebar-width', '72px')
      } else {
        root.style.setProperty('--sidebar-width', `${savedWidth}px`)
      }
    }
  }, [isMobile])

  return (
    <AppLayout>
      {/* Sidebar is hidden on mobile, shown via drawer instead */}
      {!isMobile && <Sidebar />}
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1">
          <AppRouter />
        </div>
      </div>
    </AppLayout>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Refine
          dataProvider={{
            getList: async () => {
              // Simple data provider that returns sample data
              return {
                data: [
                  {
                    id: 'DO-001',
                    deliveryOrderNumber: 'DO/2024/01/0001',
                    deliveryDate: new Date(),
                    customerName: 'PT. Sample Customer',
                    status: 'draft',
                    totalQuantity: 5,
                    totalAmount: 500000,
                    notes: 'Sample delivery order',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  },
                  {
                    id: 'DO-002',
                    deliveryOrderNumber: 'DO/2024/01/0002',
                    deliveryDate: new Date(),
                    customerName: 'PT. Another Customer',
                    status: 'released',
                    totalQuantity: 10,
                    totalAmount: 1000000,
                    notes: 'Another sample delivery order',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                ],
                total: 2
              }
            },
            getOne: async () => ({ data: {} }),
            create: async () => ({ data: {} }),
            update: async () => ({ data: {} }),
            deleteOne: async () => ({ data: {} }),
            getApiUrl: () => '',
          }}
          resources={[
            {
              name: "delivery-orders",
              list: "/logistics/delivery-orders",
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <AppContent />
        </Refine>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

import { Routes, Route, Navigate } from 'react-router-dom'
import { getAllPaths } from '@/lib/nav-config'
import { ListPage } from '@/components/list-page'
import { DashboardOverview } from '@/components/dashboard-overview'

export function AppRouter() {
  const allPaths = getAllPaths()

  return (
    <Routes>
      {/* Redirect root to dashboard overview */}
      <Route path="/" element={<Navigate to="/dashboards/overview" replace />} />
      
      {/* Special dashboard overview page */}
      <Route path="/dashboards/overview" element={<DashboardOverview />} />
      
      {/* Generate routes for all other navigation paths */}
      {allPaths
        .filter(path => path !== '/dashboards/overview') // Exclude the special overview page
        .map((path) => (
          <Route
            key={path}
            path={path}
            element={<ListPage path={path} />}
          />
        ))
      }
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboards/overview" replace />} />
    </Routes>
  )
}
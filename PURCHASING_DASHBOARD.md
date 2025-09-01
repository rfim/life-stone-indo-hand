# Purchasing Dashboard

A comprehensive purchasing dashboard system that provides real-time monitoring and analytics for procurement operations.

## Overview

The Purchasing Dashboard is a read-only monitoring system that provides insights into:
- Purchase Requests (PR)
- Purchase Orders (PO) 
- Invoices
- Goods Received Notes (GRN)
- SKU Management
- Complaints/Returns

## Features

### 🎯 Role-Based Views
- **Executive**: High-level KPIs, spend overview, top suppliers, currency exposure
- **Procurement**: PR queue, PO pipeline, shipments, supplier performance
- **Finance**: Unpaid POs, invoice due dates, currency exposure, payment trends
- **Warehouse**: Incoming shipments, GRN processing, SKU gaps, receiving trends
- **Quality**: Complaint management, defect rates, supplier quality metrics

### 📊 Key Performance Indicators (KPIs)
- PR awaiting approval (count & value)
- PO status breakdown (Draft/Sent/Confirmed/In Transit/Delivered/Closed)
- Unpaid POs tracking
- Invoices due within 7 days
- Shipments arriving in next 3 days (H-3)
- Open complaints/returns
- Items without SKU
- Average lead time and on-time delivery percentage
- Defect rate percentage

### 📈 Interactive Charts
- Spend over time (area chart)
- Top suppliers by spend (bar chart)
- Currency exposure (donut chart)
- Lead time distribution (histogram)
- Deductions/defects by supplier (stacked bar)
- On-time vs late deliveries (gauge)
- Items without SKU trend (line chart)

### 📋 Data Tables
All tables include:
- Sorting and filtering capabilities
- Pagination
- Column visibility controls
- Export to CSV/PDF
- Quick action links (view-only, no mutations)

### 🔍 Global Filters
- **Date Range**: Today, 7d, 30d, Quarter, Custom
- **Supplier Multi-select**: Filter by specific suppliers
- **Currency Filter**: IDR, USD, EUR
- **Search**: Global text search across entities
- **Active Filter Pills**: Visual indicators of applied filters

## Getting Started

### Installation
```bash
npm install
npm run dev
```

### Navigation
Access the dashboard at: `/dashboards/purchasing`

The dashboard is also available from the main navigation menu under "Dashboards" > "Purchasing Dashboard".

### Switching Between Views
Use the tab navigation to switch between different role views:
- Executive
- Procurement  
- Finance
- Warehouse
- Quality

## Data Layer

### Mock Data Provider
The system currently uses a mock data provider (`src/data/mockProvider.ts`) that:
- Loads seed data from `src/data/seeds.json`
- Provides deterministic filtering and calculations
- Supports all query operations
- Excludes "free slab" complaints from metrics

### Data Types
Core data types defined in `src/data/purchasing-types.ts`:
- `PRSummary`: Purchase Request data
- `POSummary`: Purchase Order data  
- `InvoiceSummary`: Invoice data
- `GRNSummary`: Goods Received Note data
- `SKUGap`: Items missing SKU data
- `ComplaintSummary`: Complaint/return data
- `KpiBundle`: Aggregated KPI metrics

### Switching to Live API
To connect to a live API:

1. **Replace the mock provider** in the query hooks (`src/hooks/purchasing/usePurchasingQueries.ts`)
2. **Implement API service functions** that return the same data structures
3. **Update import statements** to use your API service instead of `mockDataProvider`

Example:
```typescript
// Instead of:
queryFn: () => mockDataProvider.getKpis(params)

// Use:
queryFn: () => apiService.getKpis(params)
```

## Component Architecture

### Reusable Components
- `KpiTile`: Displays KPI values with delta indicators
- `ChartArea`, `ChartBar`, `ChartDonut`: Interactive chart components  
- `DataTable`: Full-featured data table with sorting/filtering/export
- `DashboardApp`: Main dashboard layout with filters and tabs

### Dashboard Pages
Each role has its own dashboard component:
- `ExecutiveDashboard`: High-level metrics and overview
- `ProcurementDashboard`: Operational procurement metrics
- `FinanceDashboard`: Financial and payment tracking
- `WarehouseDashboard`: Receiving and inventory metrics
- `QualityDashboard`: Quality assurance and complaints

## URL Integration

### Query Parameters
The dashboard preserves filter state in URL query parameters:
- `tab`: Current active tab (executive/procurement/finance/warehouse/quality)
- Date range, suppliers, currency, and search filters are maintained in component state

### Navigation Links
All tables include drill-down links to detail pages:
- `/pr/:id` - Purchase Request details
- `/po/:id` - Purchase Order details  
- `/invoice/:id` - Invoice details
- `/grn/:id` - GRN details
- `/sku/new?from=:id` - Create SKU from item
- `/complaint/:id` - Complaint details

*Note: These are placeholder routes for demo purposes*

## Export Functionality

### CSV Export
- Exports current filtered dataset
- Includes all visible columns
- Automatically downloads file

### PDF Export  
- Placeholder implementation included
- Can be enhanced with libraries like jsPDF
- Maintains current filter context

## Responsive Design

### Mobile Support
- KPI tiles: 2-per-row on mobile
- Charts: Stacked vertically
- Tables: Horizontal scroll
- Responsive navigation tabs

### Accessibility
- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support
- High contrast color schemes
- Screen reader compatible

## Key Calculations

### Lead Time
Average days between PR creation and PO ETA (simplified calculation linking PR to PO by supplier match)

### On-Time Delivery
Percentage of delivered POs where actual delivery date <= ETA date

### Defect Rate
Weighted average of GRN defect percentages by item count

### Previous Period Delta
Calculated using same time period length immediately before current range

### Shipments H-3
POs with ETA within next 3 days from current date

### Invoices Due ≤7
Invoices with due date within next 7 days and not in Paid/Archived status

## Business Rules

### Free Slab Exclusion
Complaints marked with `isFreeSlab: true` are automatically excluded from:
- Complaint count KPIs
- Quality metrics calculations  
- Defect rate calculations
- Deduction amount totals

### Currency Handling
- IDR: Indonesian Rupiah (no decimal places)
- USD/EUR: Standard currency formatting
- Multi-currency totals aggregated by currency type

## Development

### Adding New KPIs
1. Add calculation logic to `mockProvider.getKpis()`
2. Update `KpiBundle` type definition
3. Add KpiTile to relevant dashboard component

### Adding New Charts
1. Create chart data transformation in dashboard component
2. Use existing chart components or create new ones
3. Add drill-down navigation handlers

### Adding New Tables
1. Define column configuration using TanStack Table
2. Add to DataTable component with export handlers
3. Include action buttons for navigation

## Testing

### Mock Data
The system includes comprehensive seed data representing various scenarios:
- Different suppliers and currencies
- Various PO statuses and timelines
- Mix of complaint types and statuses
- Sample GRN data with defects
- Items missing SKU assignments

### Validation
- All KPI calculations are deterministic
- Filter combinations work correctly
- Export functions operate on filtered data
- Navigation links include proper parameters

## Performance

### Optimization
- TanStack Query caching (5-minute stale time)
- Memoized calculations using React.useMemo
- Lazy loading for chart components
- Efficient filtering and sorting

### Bundle Size
Current build size: ~1.5MB (gzipped: ~394KB)
Consider code splitting for production deployment.

## Support

For questions or issues with the Purchasing Dashboard:
1. Check the mock data in `src/data/seeds.json`
2. Review component logic in dashboard files
3. Verify filter parameters and data transformations
4. Test with different date ranges and filter combinations

The dashboard is designed to be fully functional with mock data and easily adaptable to real API endpoints.
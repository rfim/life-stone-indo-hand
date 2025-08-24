# Pages Directory Structure

This directory contains all the page components for different modules of the ERP system.

## Structure

- `masters/` - Master data management pages
  - `categories.tsx` - Product categories management
  - `suppliers.tsx` - Supplier management  
  - `products.tsx` - Product catalog management
  - More to be added...

- `purchasing/` - Purchasing module pages
- `warehouse/` - Warehouse management pages
- `marketing/` - Marketing and sales pages
- `finance/` - Financial management pages
- `dashboards/` - Dashboard and reporting pages
- `settings/` - System configuration pages

## Implementation Status

✅ Categories - Complete with CRUD operations
✅ Suppliers - Complete with CRUD operations  
✅ Products - Complete with complex pricing and product details
🚧 Other masters - Using generic placeholder pages
🚧 Other modules - Using generic placeholder pages

## Usage

Each page component should:
1. Import the appropriate API hooks
2. Define table columns
3. Create form validation schema
4. Implement the form component
5. Use CrudModal for create/edit/view operations
6. Use DataTable for listing
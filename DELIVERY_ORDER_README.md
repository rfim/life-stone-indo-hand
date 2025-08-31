# Delivery Order Module

This module provides comprehensive delivery order management functionality for Life Stone Indonesia ERP system.

## Features

### 1. Header Fields
- **Delivery Order Number**: Auto-generated format DO/YYYY/MM/#### (can be manually set during creation)
- **Delivery Date**: Default to today, editable
- **Expedition**: Dropdown selection from master expedition table
- **Sales Order**: Dropdown showing only active/approved sales orders with remaining deliverable quantities
- **Customer**: Auto-populated from selected sales order
- **Notes**: Optional text area for additional delivery instructions

### 2. Line Items Management
- **Product Information**: Auto-loaded from sales order lines
- **Ordered Quantity**: Shows original quantity from sales order
- **Already Delivered**: Shows cumulative delivered quantity from previous delivery orders
- **Quantity to Deliver**: Editable field with validation
- **Unit of Measure**: From product master data
- **Warehouse**: Dropdown selection with stock availability check
- **Stock Validation**: Real-time stock checking to prevent over-delivery
- **Progress Tracking**: Visual progress bars showing delivery completion percentage

### 3. Business Logic & Validation
- **Stock Validation**: Prevents delivery quantities exceeding available stock
- **Remaining Balance Check**: Ensures delivery doesn't exceed remaining sales order balance
- **Sales Order Status Updates**: Automatically updates SO status based on delivery completion
- **Stock Movements**: Creates inventory transactions (outbound) when delivery order is finished
- **Atomic Transactions**: All stock movements and status updates are transaction-safe

### 4. Status Management
- **Draft**: Initial state, allows full editing
- **Released**: Ready for delivery, limited editing
- **Invoiced**: Linked to invoice, no longer voidable
- **Closed**: Completed delivery
- **Cancelled**: Voided delivery order with reason tracking

### 5. Void Functionality
- Available for draft and released status
- Requires void reason entry
- Reverses all stock movements
- Updates sales order delivery quantities
- Creates audit trail with void timestamp and user

## API Endpoints

The module uses REST API pattern with the following endpoints:

```
GET    /api/delivery-orders?page=&pageSize=&q=&sortBy=&sortDir=&filters={}
GET    /api/delivery-orders/:id
POST   /api/delivery-orders                 → Creates DO + stock mutations
PATCH  /api/delivery-orders/:id             → Updates DO details
DELETE /api/delivery-orders/:id             → Soft delete (void)
GET    /api/delivery-orders/export.xlsx     → Export filtered data
GET    /api/delivery-orders/template.xlsx   → Download import template
POST   /api/delivery-orders/import.xlsx     → Bulk import with validation
```

## Data Models

### DeliveryOrder
```typescript
interface DeliveryOrder extends BaseEntity {
  deliveryOrderNumber: string
  deliveryDate: Date
  expeditionId: string
  salesOrderId: string
  customerId: string
  customerName: string
  notes?: string
  status: 'draft' | 'released' | 'invoiced' | 'closed' | 'cancelled'
  lines: DeliveryOrderLine[]
  totalQuantity: number
  totalAmount: number
  isVoidable: boolean
  voidReason?: string
  voidedAt?: Date
  voidedBy?: string
}
```

### DeliveryOrderLine
```typescript
interface DeliveryOrderLine {
  id: string
  productId: string
  productCode: string
  productName: string
  orderedQuantity: number
  alreadyDeliveredQuantity: number
  quantityToDeliver: number
  unitOfMeasure: string
  warehouseId: string
  stockAvailable: number
  pricePerUnit: number
  totalAmount: number
}
```

## Components

### Pages
- **DeliveryOrdersPage**: Main list view with search, filters, and actions
- **DeliveryOrderForm**: Create/edit form with line item management
- **DeliveryOrderView**: Read-only detail view with void capability

### Features
- **Responsive Design**: Mobile-friendly with drawer navigation
- **Real-time Validation**: Stock and balance checking
- **Progress Visualization**: Delivery completion tracking
- **Print/Export**: PDF generation and Excel export
- **Audit Trail**: Complete change tracking

## Usage

### Creating a Delivery Order
1. Navigate to Logistics → Delivery Orders
2. Click "Create Delivery Order"
3. Select expedition and sales order
4. Review auto-loaded line items
5. Adjust quantities and warehouses as needed
6. Add notes if required
7. Click "Save" or "Save & Close"

### Managing Stock
- Stock availability is checked in real-time
- Delivery quantities cannot exceed available stock
- Stock movements are automatically created on save
- Voided orders reverse all stock movements

### Voiding a Delivery Order
1. Open delivery order in view mode
2. Click "Void" button (if voidable)
3. Enter void reason
4. Confirm void action
5. System reverses stock movements and updates sales order

## Integration Points

### Related Modules
- **Sales Orders**: Source for delivery orders
- **Inventory Management**: Stock tracking and movements
- **Expeditions**: Delivery service providers
- **Warehouses**: Stock locations
- **Products**: Item master data
- **Customers**: Delivery recipients

### Seed Data
The module includes comprehensive seed data:
- Sample expeditions (JNE, TIKI, SiCepat)
- Sample products (marble, granite, ceramic)
- Sample customers (contractors, distributors)
- Sample sales orders with deliverable items
- Initial stock levels for all products

## Technical Implementation

### State Management
- React Query for server state
- React Hook Form for form state
- GitHub Spark KV store for persistence

### Validation
- Zod schemas for type-safe validation
- Real-time stock availability checking
- Business rule enforcement

### Performance
- Optimistic updates for better UX
- Lazy loading for large datasets
- Efficient stock calculation algorithms

## Future Enhancements

1. **Barcode Integration**: QR/barcode scanning for products
2. **Mobile App**: Dedicated delivery driver app
3. **GPS Tracking**: Real-time delivery tracking
4. **Photo Capture**: Delivery proof of delivery photos
5. **Electronic Signatures**: Digital delivery confirmations
6. **Route Optimization**: Delivery route planning
7. **Push Notifications**: Status update notifications

## Troubleshooting

### Common Issues
1. **Stock Validation Errors**: Check warehouse stock levels
2. **Sales Order Not Available**: Verify SO status is active/approved
3. **Void Not Allowed**: Check if DO is already invoiced
4. **Form Validation**: Ensure all required fields are filled

### Debug Mode
Set `NEXT_PUBLIC_DEBUG=true` to enable detailed logging for stock calculations and business rule validation.
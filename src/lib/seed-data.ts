import { 
  categoriesService,
  currenciesService,
  materialTypesService,
  finishingTypesService,
  sizesService,
  originsService,
  customerTypesService,
  suppliersService,
  warehousesService
} from '@/lib/api/masters'
import { itemsService } from '@/lib/api/items'
import { deliveryOrderService } from '@/lib/api/delivery-orders'

// Import spark for KV operations
declare global {
  interface Window {
    spark: any
  }
}

const spark = (typeof window !== 'undefined' && window.spark) || {
  kv: {
    get: async (key: string) => {
      try {
        const data = localStorage.getItem(`spark:${key}`)
        return data ? JSON.parse(data) : null
      } catch {
        return null
      }
    },
    set: async (key: string, value: any) => {
      try {
        localStorage.setItem(`spark:${key}`, JSON.stringify(value))
        return true
      } catch {
        return false
      }
    }
  }
}

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Check if already seeded
    const existingCategories = await categoriesService.list({ pageSize: 1 })
    if (existingCategories.total > 0) {
      console.log('✅ Database already seeded, skipping...')
      return
    }

    // Seed Categories
    const categories = [
      { name: 'Natural Stone', code: 'NS', description: 'Natural stone products including granite, marble, etc.' },
      { name: 'Ceramic Tiles', code: 'CT', description: 'Ceramic and porcelain tiles' },
      { name: 'Engineered Stone', code: 'ES', description: 'Quartz and engineered stone products' },
      { name: 'Accessories', code: 'ACC', description: 'Installation accessories and tools' }
    ]
    
    console.log('📦 Seeding categories...')
    for (const category of categories) {
      await categoriesService.create({ ...category, isActive: true })
    }

    // Seed Currencies
    const currencies = [
      { name: 'Indonesian Rupiah', code: 'IDR', symbol: 'Rp', isBase: true, exchangeRate: 1 },
      { name: 'US Dollar', code: 'USD', symbol: '$', isBase: false, exchangeRate: 15800 },
      { name: 'Euro', code: 'EUR', symbol: '€', isBase: false, exchangeRate: 17200 },
      { name: 'Chinese Yuan', code: 'CNY', symbol: '¥', isBase: false, exchangeRate: 2200 }
    ]
    
    console.log('💰 Seeding currencies...')
    for (const currency of currencies) {
      await currenciesService.create({ ...currency, isActive: true })
    }

    // Seed Material Types
    const materialTypes = [
      { name: 'Granite', code: 'GRN', description: 'Natural granite stone' },
      { name: 'Marble', code: 'MRB', description: 'Natural marble stone' },
      { name: 'Quartz', code: 'QTZ', description: 'Engineered quartz stone' },
      { name: 'Porcelain', code: 'PRC', description: 'Porcelain ceramic tiles' },
      { name: 'Ceramic', code: 'CER', description: 'Standard ceramic tiles' },
      { name: 'Travertine', code: 'TRV', description: 'Natural travertine stone' }
    ]
    
    console.log('🪨 Seeding material types...')
    for (const materialType of materialTypes) {
      await materialTypesService.create({ ...materialType, isActive: true })
    }

    // Seed Finishing Types
    const finishingTypes = [
      { name: 'Polished', code: 'POL', description: 'High gloss polished finish' },
      { name: 'Honed', code: 'HON', description: 'Matte honed finish' },
      { name: 'Brushed', code: 'BRU', description: 'Brushed textured finish' },
      { name: 'Flamed', code: 'FLA', description: 'Flame textured finish' },
      { name: 'Sandblasted', code: 'SBL', description: 'Sandblasted rough finish' }
    ]
    
    console.log('✨ Seeding finishing types...')
    for (const finishingType of finishingTypes) {
      await finishingTypesService.create({ ...finishingType, isActive: true })
    }

    // Seed Sizes
    const sizes = [
      { 
        name: 'Slab 320x160', 
        code: 'SL32016', 
        dimensions: { length: 3200, width: 1600, height: 20, unit: 'mm' } 
      },
      { 
        name: 'Tile 60x60', 
        code: 'TL6060', 
        dimensions: { length: 600, width: 600, height: 10, unit: 'mm' } 
      },
      { 
        name: 'Tile 80x80', 
        code: 'TL8080', 
        dimensions: { length: 800, width: 800, height: 10, unit: 'mm' } 
      },
      { 
        name: 'Tile 30x60', 
        code: 'TL3060', 
        dimensions: { length: 600, width: 300, height: 8, unit: 'mm' } 
      }
    ]
    
    console.log('📏 Seeding sizes...')
    for (const size of sizes) {
      await sizesService.create({ ...size, isActive: true })
    }

    // Seed Origins
    const origins = [
      { name: 'Italy', code: 'IT', country: 'Italy', region: 'Carrara' },
      { name: 'Brazil', code: 'BR', country: 'Brazil', region: 'Espirito Santo' },
      { name: 'India', code: 'IN', country: 'India', region: 'Rajasthan' },
      { name: 'China', code: 'CN', country: 'China', region: 'Fujian' },
      { name: 'Turkey', code: 'TR', country: 'Turkey', region: 'Afyon' },
      { name: 'Spain', code: 'ES', country: 'Spain', region: 'Valencia' }
    ]
    
    console.log('🌍 Seeding origins...')
    for (const origin of origins) {
      await originsService.create({ ...origin, isActive: true })
    }

    // Seed Customer Types
    const customerTypes = [
      { 
        name: 'Retail Customer', 
        code: 'RET', 
        description: 'Individual retail customers',
        discountRate: 0,
        creditLimit: 50000000,
        paymentTerms: 'COD'
      },
      { 
        name: 'Contractor', 
        code: 'CON', 
        description: 'Construction contractors',
        discountRate: 5,
        creditLimit: 200000000,
        paymentTerms: 'Net 30'
      },
      { 
        name: 'Distributor', 
        code: 'DIS', 
        description: 'Product distributors',
        discountRate: 15,
        creditLimit: 500000000,
        paymentTerms: 'Net 45'
      },
      { 
        name: 'Project Developer', 
        code: 'DEV', 
        description: 'Property developers',
        discountRate: 10,
        creditLimit: 1000000000,
        paymentTerms: 'Net 60'
      }
    ]
    
    console.log('👥 Seeding customer types...')
    for (const customerType of customerTypes) {
      await customerTypesService.create({ ...customerType, isActive: true })
    }

    // Seed Suppliers
    const suppliers = [
      {
        name: 'Marble Italia SRL',
        code: 'MIT001',
        contactPerson: 'Giuseppe Rossi',
        email: 'giuseppe@marbleitalia.it',
        phone: '+39 0585 123456',
        address: 'Via Carrara 123, 54033 Carrara MS, Italy',
        paymentTerms: 'T/T 30% advance, 70% against B/L',
        rating: 4.5
      },
      {
        name: 'Brazil Stone Export',
        code: 'BSE002',
        contactPerson: 'Carlos Silva',
        email: 'carlos@brazilstone.com.br',
        phone: '+55 27 3333-4444',
        address: 'Rua das Pedras 456, Vila Velha, ES, Brazil',
        paymentTerms: 'L/C at sight',
        rating: 4.0
      },
      {
        name: 'Rajasthan Granite Ltd',
        code: 'RGL003',
        contactPerson: 'Raj Kumar',
        email: 'raj@rajasthangranite.co.in',
        phone: '+91 141 234-5678',
        address: 'Jaipur Industrial Area, Rajasthan 302013, India',
        paymentTerms: 'T/T 50% advance, 50% against shipping docs',
        rating: 3.8
      }
    ]
    
    console.log('🏢 Seeding suppliers...')
    for (const supplier of suppliers) {
      await suppliersService.create({ ...supplier, isActive: true })
    }

    // Seed Warehouses
    const warehouses = [
      {
        name: 'Main Warehouse Jakarta',
        code: 'WH-JKT-01',
        address: 'Jl. Industri Raya No. 123, Bekasi, West Java',
        bins: []
      },
      {
        name: 'Surabaya Distribution Center',
        code: 'WH-SBY-01',
        address: 'Jl. Margomulyo Indah No. 45, Surabaya, East Java',
        bins: []
      }
    ]
    
    console.log('🏭 Seeding warehouses...')
    for (const warehouse of warehouses) {
      await warehousesService.create({ ...warehouse, isActive: true })
    }

    // Get seeded data for items
    const categoryResult = await categoriesService.list({ pageSize: 100 })
    const materialResult = await materialTypesService.list({ pageSize: 100 })
    const finishingResult = await finishingTypesService.list({ pageSize: 100 })
    const originResult = await originsService.list({ pageSize: 100 })

    const naturalStoneCategory = categoryResult.data.find(c => c.code === 'NS')
    const graniteType = materialResult.data.find(m => m.code === 'GRN')
    const polishedFinish = finishingResult.data.find(f => f.code === 'POL')
    const italyOrigin = originResult.data.find(o => o.code === 'IT')

    // Seed Sample Items
    if (naturalStoneCategory && graniteType && polishedFinish && italyOrigin) {
      const items = [
        {
          name: 'Carrara White Marble',
          code: 'CWM-001',
          description: 'Premium white marble from Carrara, Italy',
          categoryId: naturalStoneCategory.id,
          materialTypeId: graniteType.id,
          finishingTypeId: polishedFinish.id,
          originId: italyOrigin.id,
          specifications: {
            density: '2.7 g/cm³',
            absorption: '< 0.2%',
            compressiveStrength: '120 MPa'
          }
        }
      ]
      
      console.log('📦 Seeding items...')
      for (const item of items) {
        await itemsService.create({ ...item, isActive: true })
      }
    }

    // Seed Expeditions (for delivery orders)
    const expeditions = [
      {
        name: 'JNE Express',
        code: 'JNE001',
        contactPerson: 'Budi Santoso',
        phone: '+62 21 1500-888',
        email: 'cs@jne.co.id',
        address: 'Jl. Tomang Raya No. 11, Jakarta Barat',
        status: 'active'
      },
      {
        name: 'TIKI Logistics',
        code: 'TIKI002',
        contactPerson: 'Siti Rahayu',
        phone: '+62 21 1500-125',
        email: 'cs@tiki.id',
        address: 'Jl. Daan Mogot Km. 11, Jakarta Barat',
        status: 'active'
      },
      {
        name: 'SiCepat Express',
        code: 'SICEPAT003',
        contactPerson: 'Ahmad Yani',
        phone: '+62 21 500-900',
        email: 'cs@sicepat.com',
        address: 'Jl. Raya Serpong, Tangerang Selatan',
        status: 'active'
      }
    ]

    console.log('🚚 Seeding expeditions...')
    for (const expedition of expeditions) {
      await spark.kv.set('erp.expeditions', [...(await spark.kv.get('erp.expeditions') || []), {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...expedition,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      }])
    }

    // Seed Products (for sales orders and delivery orders)
    const products = [
      {
        code: 'MAR-CWM-001',
        name: 'Carrara White Marble Slab',
        description: 'Premium Carrara white marble slab 2cm thickness',
        unitOfMeasure: 'sqm',
        category: 'Natural Stone',
        status: 'active'
      },
      {
        code: 'GRN-ABS-002',
        name: 'Absolute Black Granite',
        description: 'Pure black granite from India, premium quality',
        unitOfMeasure: 'sqm',
        category: 'Natural Stone',
        status: 'active'
      },
      {
        code: 'CER-WOD-003',
        name: 'Wood Look Ceramic Tile',
        description: '60x120cm wood look ceramic tile',
        unitOfMeasure: 'sqm',
        category: 'Ceramic',
        status: 'active'
      }
    ]

    console.log('🪨 Seeding products...')
    for (const product of products) {
      await spark.kv.set('erp.products', [...(await spark.kv.get('erp.products') || []), {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      }])
    }

    // Seed Customers (for sales orders)
    const customers = [
      {
        name: 'PT. Konstruksi Utama',
        code: 'CUS001',
        type: 'Contractor',
        contactPerson: 'Ir. Bambang Sutrisno',
        phone: '+62 21 5555-1234',
        email: 'bambang@konstruksiutama.co.id',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        status: 'active'
      },
      {
        name: 'CV. Interior Design Plus',
        code: 'CUS002',
        type: 'Retail Customer',
        contactPerson: 'Maya Sari',
        phone: '+62 21 8888-5678',
        email: 'maya@interiorplus.com',
        address: 'Jl. Kemang Raya No. 45, Jakarta Selatan',
        status: 'active'
      },
      {
        name: 'Toko Bangunan Sentosa',
        code: 'CUS003',
        type: 'Distributor',
        contactPerson: 'Hendra Wijaya',
        phone: '+62 21 7777-9876',
        email: 'hendra@sentosabangunan.com',
        address: 'Jl. Raya Bekasi No. 789, Bekasi',
        status: 'active'
      }
    ]

    console.log('👥 Seeding customers...')
    for (const customer of customers) {
      await spark.kv.set('erp.customers', [...(await spark.kv.get('erp.customers') || []), {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...customer,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      }])
    }

    // Get seeded data for sales orders
    const productsList = await spark.kv.get('erp.products') || []
    const customersList = await spark.kv.get('erp.customers') || []

    if (productsList.length > 0 && customersList.length > 0) {
      // Seed Sales Orders (for delivery orders to reference)
      const salesOrders = [
        {
          salesOrderNumber: 'SO/2024/01/001',
          customerId: customersList[0].id,
          customerName: customersList[0].name,
          status: 'approved',
          orderDate: new Date('2024-01-15'),
          deliveryDate: new Date('2024-02-15'),
          lines: [
            {
              id: `line-${Date.now()}-1`,
              productId: productsList[0].id,
              productCode: productsList[0].code,
              productName: productsList[0].name,
              quantity: 100,
              deliveredQuantity: 0,
              remainingQuantity: 100,
              unitOfMeasure: productsList[0].unitOfMeasure,
              pricePerUnit: 850000,
              totalAmount: 85000000
            },
            {
              id: `line-${Date.now()}-2`,
              productId: productsList[1].id,
              productCode: productsList[1].code,
              productName: productsList[1].name,
              quantity: 50,
              deliveredQuantity: 0,
              remainingQuantity: 50,
              unitOfMeasure: productsList[1].unitOfMeasure,
              pricePerUnit: 1200000,
              totalAmount: 60000000
            }
          ],
          totalAmount: 145000000
        },
        {
          salesOrderNumber: 'SO/2024/01/002',
          customerId: customersList[1].id,
          customerName: customersList[1].name,
          status: 'active',
          orderDate: new Date('2024-01-20'),
          deliveryDate: new Date('2024-02-20'),
          lines: [
            {
              id: `line-${Date.now()}-3`,
              productId: productsList[2].id,
              productCode: productsList[2].code,
              productName: productsList[2].name,
              quantity: 200,
              deliveredQuantity: 50,
              remainingQuantity: 150,
              unitOfMeasure: productsList[2].unitOfMeasure,
              pricePerUnit: 450000,
              totalAmount: 90000000
            }
          ],
          totalAmount: 90000000
        }
      ]

      console.log('📋 Seeding sales orders...')
      for (const salesOrder of salesOrders) {
        await spark.kv.set('erp.sales-orders', [...(await spark.kv.get('erp.sales-orders') || []), {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...salesOrder,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false
        }])
      }

      // Seed Stock Cards (initial inventory)
      const stockCards = []
      const warehousesList = await warehousesService.list({ pageSize: 100 })
      const defaultWarehouse = warehousesList.data[0]

      if (defaultWarehouse) {
        for (const product of productsList) {
          stockCards.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productId: product.id,
            warehouseId: defaultWarehouse.id,
            transactionType: 'in',
            transactionDate: new Date('2024-01-01'),
            referenceType: 'adjustment',
            referenceId: 'initial-stock',
            quantity: 500, // Initial stock
            balance: 500,
            notes: 'Initial stock setup',
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false
          })
        }

        console.log('📊 Seeding stock cards...')
        await spark.kv.set('erp.stock-cards', stockCards)
      }
    }

    console.log('✅ Database seeding completed successfully!')
    
    // Seed Director Dashboard data
    await seedDirectorDashboardData()
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

async function seedDirectorDashboardData() {
  try {
    console.log('📊 Seeding Director Dashboard data...')
    
    // Seed sample approvals
    const approvals = [
      {
        id: `approval-${Date.now()}-1`,
        entityType: 'PurchaseRequest',
        entityId: 'PR-2024-001',
        requestedBy: 'John Doe',
        requestedAt: new Date().toISOString(),
        requiredApprovers: ['director', 'finance_manager'],
        status: 'Pending',
        priority: 'Urgent',
        metadata: {
          amount: 15000000,
          supplier: 'PT. Supplier ABC',
          description: 'Raw materials for Q1 production'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      },
      {
        id: `approval-${Date.now()}-2`,
        entityType: 'ClientDiscount',
        entityId: 'SO-2024-002',
        requestedBy: 'Jane Smith',
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        requiredApprovers: ['director'],
        status: 'Pending',
        priority: 'High',
        metadata: {
          originalAmount: 50000000,
          discountPercent: 15,
          customerName: 'PT. Major Client'
        },
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        isDeleted: false
      },
      {
        id: `approval-${Date.now()}-3`,
        entityType: 'HRGAPayment',
        entityId: 'HR-PAY-001',
        requestedBy: 'HRGA Team',
        requestedAt: new Date(Date.now() - 172800000).toISOString(),
        requiredApprovers: ['director'],
        status: 'Approved',
        priority: 'Medium',
        approvedBy: 'director',
        approvedAt: new Date(Date.now() - 86400000).toISOString(),
        notes: 'Approved for Q1 training budget',
        metadata: {
          amount: 25000000,
          description: 'Employee training and development'
        },
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 86400000),
        isDeleted: false
      }
    ]

    await spark.kv.set('erp.approvals', approvals)

    // Seed sample content requests
    const contentRequests = [
      {
        id: `content-${Date.now()}-1`,
        title: 'Granite Product Showcase Video',
        description: 'Create a professional video showcasing our premium granite collection for social media marketing',
        productDetails: {
          productId: 'GRN-001',
          productName: 'Premium Granite Collection',
          category: 'Natural Stone',
          specifications: 'Various colors and finishes available',
          targetAudience: 'Architects and interior designers',
          brandingGuidelines: 'Use company logo and brand colors'
        },
        requestedBy: 'Marketing Team',
        department: 'Marketing',
        priority: 'High',
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days from now
        status: 'InProgress',
        assignedTo: 'Creative Team',
        deliverables: [
          {
            type: 'ProductVideo',
            platform: 'Instagram, YouTube',
            dimensions: '1080x1920, 1920x1080',
            format: 'MP4'
          },
          {
            type: 'SocialMediaPost',
            platform: 'Instagram',
            dimensions: '1080x1080',
            format: 'JPG'
          }
        ],
        approvals: [],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
        isDeleted: false
      },
      {
        id: `content-${Date.now()}-2`,
        title: 'New Product Brochure Design',
        description: 'Design professional brochure for new marble collection launch',
        productDetails: {
          productId: 'MAR-002',
          productName: 'Luxury Marble Collection',
          category: 'Natural Stone',
          specifications: 'Premium Italian marble with unique veining patterns',
          targetAudience: 'High-end residential and commercial projects',
          brandingGuidelines: 'Elegant design following brand guidelines'
        },
        requestedBy: 'Sales Team',
        department: 'Sales',
        priority: 'Medium',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(), // 14 days from now
        status: 'Submitted',
        deliverables: [
          {
            type: 'Brochure',
            platform: 'Print and Digital',
            dimensions: 'A4, 8 pages',
            format: 'PDF for print, JPG for digital'
          }
        ],
        approvals: [],
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
        isDeleted: false
      }
    ]

    await spark.kv.set('erp.contentRequests', contentRequests)

    // Seed meeting minute notifications
    const meetingMinuteNotifications = [
      {
        id: `notification-${Date.now()}-1`,
        meetingMinuteId: 'meeting-001',
        daysOverdue: 8,
        lastNotificationSent: new Date(Date.now() - 2 * 86400000).toISOString(),
        remindersSent: 2,
        assignedTo: ['sales_manager', 'project_lead'],
        status: 'Active',
        createdAt: new Date(Date.now() - 8 * 86400000),
        updatedAt: new Date(Date.now() - 2 * 86400000),
        isDeleted: false
      }
    ]

    await spark.kv.set('erp.meetingMinuteNotifications', meetingMinuteNotifications)

    console.log('✅ Director Dashboard data seeding completed!')
    
  } catch (error) {
    console.error('❌ Error seeding Director Dashboard data:', error)
    throw error
  }
}

// Auto-seed on app start in development - DISABLED for debugging
// if (typeof window !== 'undefined' && import.meta.env.DEV) {
//   // Run seed after a longer delay to ensure app is fully initialized
//   setTimeout(() => {
//     // Only seed if we're in a proper React context
//     try {
//       seedDatabase().catch(console.error)
//     } catch (error) {
//       console.error('Error during seeding:', error)
//     }
//   }, 5000) // Increased delay
// }
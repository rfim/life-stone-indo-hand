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

    console.log('✅ Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Auto-seed on app start in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Run seed after a short delay to ensure app is initialized
  setTimeout(() => {
    seedDatabase().catch(console.error)
  }, 2000)
}
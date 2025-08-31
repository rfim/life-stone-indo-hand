import { useState, useEffect } from 'react'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Trash2 } from '@phosphor-icons/react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  city: string
  province: string
  status: 'active' | 'inactive'
  type: string
  createdAt: string
}

const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'PT Bangunan Jaya',
    email: 'contact@bangunanjaya.com',
    phone: '+62 21 1234567',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    status: 'active',
    type: 'Corporate',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'CV Mandiri Stone',
    email: 'info@mandiristone.com',
    phone: '+62 22 2345678',
    city: 'Bandung',
    province: 'Jawa Barat',
    status: 'active',
    type: 'SME',
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'Toko Bangunan Sejahtera',
    email: 'sejahtera@email.com',
    phone: '+62 24 3456789',
    city: 'Banyuwangi',
    province: 'Jawa Timur',
    status: 'inactive',
    type: 'Retail',
    createdAt: '2024-02-01'
  }
]

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  // Save to localStorage when customers change
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers))
  }, [customers])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('customers')
    if (stored) {
      try {
        setCustomers(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading customers:', error)
      }
    }
  }, [])

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    {
      key: 'name' as keyof Customer,
      label: 'Customer Name',
      sortable: true,
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'email' as keyof Customer,
      label: 'Email',
      sortable: true
    },
    {
      key: 'phone' as keyof Customer,
      label: 'Phone',
      sortable: false
    },
    {
      key: 'city' as keyof Customer,
      label: 'City',
      sortable: true
    },
    {
      key: 'province' as keyof Customer,
      label: 'Province',
      sortable: true
    },
    {
      key: 'type' as keyof Customer,
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <Badge variant="secondary">{value}</Badge>
      )
    },
    {
      key: 'status' as keyof Customer,
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'id' as keyof Customer,
      label: 'Actions',
      sortable: false,
      width: '120px',
      render: (value: string, record: Customer) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Eye size={14} />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Pencil size={14} />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleSort = (column: keyof Customer, direction: 'asc' | 'desc') => {
    const sortedCustomers = [...customers].sort((a, b) => {
      const aValue = a[column]
      const bValue = b[column]
      
      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    setCustomers(sortedCustomers)
  }

  const pageSize = 10
  const startIndex = (currentPage - 1) * pageSize
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize)

  return (
    <div className="p-6">
      <DataTable
        title="Customers"
        subtitle="Manage your customer database"
        data={paginatedCustomers}
        columns={columns}
        loading={loading}
        totalCount={filteredCustomers.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onSearch={handleSearch}
        onSort={handleSort}
        onCreateClick={() => console.log('Create customer')}
        onExportClick={() => console.log('Export customers')}
        onImportClick={() => console.log('Import customers')}
        onTemplateClick={() => console.log('Download template')}
        createButtonText="Create Customer"
        searchPlaceholder="Search customers..."
      />
    </div>
  )
}
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  DollarSign, 
  Truck, 
  Package, 
  FileText, 
  Database,
  Tag,
  Layers,
  Building2,
  UserCircle,
  Calendar
} from 'lucide-react';

interface MasterInfo {
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  implemented: boolean;
}

const masters: MasterInfo[] = [
  {
    name: 'Categories',
    description: 'Product categories and classifications',
    icon: Layers,
    path: '/master-data/category',
    implemented: true
  },
  {
    name: 'Suppliers',
    description: 'Supplier information and contacts',
    icon: Users,
    path: '/master-data/supplier',
    implemented: true
  },
  {
    name: 'Currencies',
    description: 'Currency codes and exchange rates',
    icon: DollarSign,
    path: '/master-data/currency',
    implemented: true
  },
  {
    name: 'Vehicles',
    description: 'Company vehicles and fleet management',
    icon: Truck,
    path: '/master-data/vehicle',
    implemented: true
  },
  {
    name: 'Customers',
    description: 'Customer information and types',
    icon: UserCircle,
    path: '/master-data/customer',
    implemented: true
  },
  {
    name: 'Material Types',
    description: 'Raw material classifications',
    icon: Package,
    path: '/master-data/material-type',
    implemented: true
  },
  {
    name: 'Finishing Types',
    description: 'Product finishing options',
    icon: Tag,
    path: '/master-data/finishing',
    implemented: true
  },
  // Additional masters to be implemented
  {
    name: 'Products',
    description: 'Product catalog and specifications',
    icon: Package,
    path: '/master-data/product',
    implemented: false
  },
  {
    name: 'Warehouses',
    description: 'Storage locations and facilities',
    icon: Building2,
    path: '/master-data/warehouse',
    implemented: false
  },
  {
    name: 'Departments',
    description: 'Organizational departments',
    icon: Building,
    path: '/master-data/department',
    implemented: false
  },
  {
    name: 'Expeditions',
    description: 'Shipping and delivery services',
    icon: Truck,
    path: '/master-data/expedition',
    implemented: false
  },
  {
    name: 'Customer Types',
    description: 'Customer type classifications',
    icon: FileText,
    path: '/master-data/customer-type',
    implemented: false
  }
];

export function MasterDataIndexPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master Data Management</h1>
        <p className="text-muted-foreground">
          Manage all master data entities with consistent CRUD operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {masters.map((master) => (
          <Card key={master.path} className={`transition-all ${master.implemented ? 'hover:shadow-md' : 'opacity-60'}`}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <master.icon className="h-5 w-5" />
                <CardTitle className="text-lg">{master.name}</CardTitle>
              </div>
              {master.implemented && (
                <div className="ml-auto">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {master.description}
              </CardDescription>
              {master.implemented ? (
                <Link to={master.path}>
                  <Button variant="outline" size="sm" className="w-full">
                    Manage {master.name}
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Coming Soon
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Implemented</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• LocalStorage-based data persistence</li>
                <li>• Consistent CRUD operations (Create, Read, Update)</li>
                <li>• Search and pagination functionality</li>
                <li>• Sheet/drawer forms with validation</li>
                <li>• URL-based modal state management</li>
                <li>• TypeScript type safety</li>
                <li>• Toast notifications for user feedback</li>
                <li>• Responsive design with shadcn/ui</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">🚀 Key Benefits</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Pluggable adapter pattern for easy API integration</li>
                <li>• Consistent UX patterns across all masters</li>
                <li>• Auto-seeding with demo data</li>
                <li>• ISO date handling for proper timestamps</li>
                <li>• Generic components for rapid development</li>
                <li>• Mobile-friendly responsive interface</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
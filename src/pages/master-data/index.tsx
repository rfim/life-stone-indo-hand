import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
    implemented: true
  },
  {
    name: 'Warehouses',
    description: 'Storage locations and facilities',
    icon: Building2,
    path: '/master-data/warehouse',
    implemented: true
  },
  {
    name: 'Departments',
    description: 'Organizational departments',
    icon: Building,
    path: '/master-data/department',
    implemented: true
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
    implemented: true
  },
  {
    name: 'Account Categories',
    description: 'Account category classifications',
    icon: FileText,
    path: '/master-data/account-category',
    implemented: true
  },
  {
    name: 'Origins',
    description: 'Product origin locations',
    icon: Building,
    path: '/master-data/origin',
    implemented: true
  },
  {
    name: 'Vendors',
    description: 'Vendor information and contacts',
    icon: Users,
    path: '/master-data/vendor',
    implemented: true
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Master Data Entities
          </CardTitle>
          <CardDescription>
            Complete list of master data entities in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {masters.map((master) => (
                  <TableRow key={master.path}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <master.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{master.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{master.description}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={master.implemented ? 'default' : 'secondary'}>
                        {master.implemented ? 'Active' : 'Coming Soon'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {master.implemented ? (
                        <Link to={master.path}>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          Coming Soon
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
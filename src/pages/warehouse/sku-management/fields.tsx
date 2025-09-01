import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calculator, QrCode, Barcode, Upload, X } from 'lucide-react'
import { SKUFormData } from './schema'

interface SKUFieldsProps {
  form: UseFormReturn<SKUFormData>
  isEdit?: boolean
}

export function SKUFields({ form, isEdit = false }: SKUFieldsProps) {
  const [images, setImages] = React.useState<string[]>(form.watch('images') || [])

  // Initialize images from form when component mounts
  React.useEffect(() => {
    const currentImages = form.watch('images') || []
    setImages(currentImages)
  }, [])

  const calculateSellingPrice = () => {
    const costPrice = form.watch('costPrice') || 0
    const artisticValue = form.watch('artisticValue') || 0
    const profitMargin = form.watch('profitMargin') || 0
    
    const totalCost = costPrice + artisticValue
    const sellingPrice = totalCost + (totalCost * profitMargin / 100)
    
    form.setValue('sellingPrice', Number(sellingPrice.toFixed(2)))
  }

  const calculateAvailableStock = () => {
    const currentStock = form.watch('currentStock') || 0
    const reservedStock = form.watch('reservedStock') || 0
    const availableStock = Math.max(0, currentStock - reservedStock)
    
    form.setValue('availableStock', availableStock)
  }

  const generateSKUCode = () => {
    const category = form.watch('category')
    const productName = form.watch('name')
    
    if (category && productName) {
      const categoryCode = category.substring(0, 3).toUpperCase()
      const productCode = productName.substring(0, 3).toUpperCase()
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const skuCode = `${categoryCode}-${productCode}-${random}`
      
      form.setValue('skuCode', skuCode)
    }
  }

  const generateQRCode = () => {
    // In real app, this would generate actual QR code
    const skuCode = form.watch('skuCode')
    if (skuCode) {
      form.setValue('qrCode', `QR-${skuCode}`)
    }
  }

  const generateBarcode = () => {
    // In real app, this would generate actual barcode
    const skuCode = form.watch('skuCode')
    if (skuCode) {
      const timestamp = Date.now().toString().slice(-8)
      form.setValue('barcode', `${timestamp}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`)
    }
  }

  const addImage = (imageUrl: string) => {
    const updatedImages = [...images, imageUrl]
    setImages(updatedImages)
    form.setValue('images', updatedImages)
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    form.setValue('images', updatedImages)
  }

  const getStockLevelColor = (currentStock: number, reorderLevel: number) => {
    if (currentStock <= 0) return 'destructive'
    if (currentStock <= reorderLevel) return 'secondary'
    return 'default'
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="skuCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU Code</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input placeholder="Enter SKU code" {...field} />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={generateSKUCode}
                    >
                      Generate
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="prod-001">Marble Slab - Carrara White</SelectItem>
                      <SelectItem value="prod-002">Granite Tile - Black Galaxy</SelectItem>
                      <SelectItem value="prod-003">Travertine - Beige Classic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SKU name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="marble">Marble</SelectItem>
                      <SelectItem value="granite">Granite</SelectItem>
                      <SelectItem value="travertine">Travertine</SelectItem>
                      <SelectItem value="ceramic">Ceramic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter detailed description"
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sup-001">PT. Stone Indonesia</SelectItem>
                    <SelectItem value="sup-002">CV. Marble Jaya</SelectItem>
                    <SelectItem value="sup-003">UD. Granite Sejahtera</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pricing Information</CardTitle>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={calculateSellingPrice}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price (IDR)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter cost price" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="artisticValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artistic Value (IDR)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter artistic value" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="profitMargin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profit Margin (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter profit margin" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price (IDR)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Calculated selling price" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stock Information</CardTitle>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={calculateAvailableStock}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Available
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="currentStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Stock</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter current stock" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reservedStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reserved Stock</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter reserved stock" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Stock</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Available stock" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        readOnly
                      />
                    </FormControl>
                    <Badge variant={getStockLevelColor(field.value || 0, form.watch('reorderLevel') || 0)}>
                      {field.value <= 0 ? 'Out of Stock' : 
                       field.value <= (form.watch('reorderLevel') || 0) ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="reorderLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Level</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter reorder level" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxStockLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Stock Level</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter max stock level" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dimensions and Weight */}
      <Card>
        <CardHeader>
          <CardTitle>Dimensions and Weight</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="dimensions.length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Length" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dimensions.width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Width" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dimensions.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Height" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dimensions.unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mm">mm</SelectItem>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter weight in kg" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* QR Code and Barcode */}
      <Card>
        <CardHeader>
          <CardTitle>Identification Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="qrCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>QR Code</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input placeholder="QR code will be generated" {...field} readOnly />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={generateQRCode}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input placeholder="Barcode will be generated" {...field} readOnly />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={generateBarcode}
                    >
                      <Barcode className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image} 
                  alt={`Product ${index + 1}`}
                  className="w-24 h-24 object-cover rounded border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                // In real app, upload files and get URLs
                const files = Array.from(e.target.files || [])
                files.forEach((file, index) => {
                  addImage(`https://via.placeholder.com/200x200?text=Image+${images.length + index + 1}`)
                })
                e.target.value = '' // Reset input
              }}
            />
            <Button type="button" variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
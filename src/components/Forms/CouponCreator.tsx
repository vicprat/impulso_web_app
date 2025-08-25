'use client'

import { Calendar, CalendarDays, DollarSign, Package, Percent, Tag, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type CreateDiscountInput } from '@/services/product/types'

interface CouponCreatorProps {
  selectedProducts: { id: string; title: string }[]
  onCouponCreated: (coupon: CreateDiscountInput) => void
  onClose: () => void
}

export function CouponCreator({
  onClose,
  onCouponCreated,
  selectedProducts,
}: CouponCreatorProps) {
  const [ couponCode, setCouponCode ] = useState('')
  const [ couponTitle, setCouponTitle ] = useState('')
  const [ discountType, setDiscountType ] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE')
  const [ discountValue, setDiscountValue ] = useState('')
  const [ startsAt, setStartsAt ] = useState('')
  const [ endsAt, setEndsAt ] = useState('')
  const [ appliesTo, setAppliesTo ] = useState<'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS'>('SPECIFIC_PRODUCTS')

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCouponCode(result)
  }

  const handleCreateCoupon = () => {
    if (!couponCode || !couponTitle || !discountValue || !startsAt) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    const value = parseFloat(discountValue)
    if (isNaN(value) || value <= 0) {
      toast.error('El valor del descuento debe ser mayor a 0')
      return
    }

    if (discountType === 'PERCENTAGE' && value > 100) {
      toast.error('El porcentaje de descuento no puede ser mayor al 100%')
      return
    }

    if (appliesTo === 'SPECIFIC_PRODUCTS' && selectedProducts.length === 0) {
      toast.error('Debes seleccionar al menos un producto para aplicar el cupón')
      return
    }

    const coupon: CreateDiscountInput = {
      appliesTo,
      code: couponCode.toUpperCase(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      productIds: appliesTo === 'SPECIFIC_PRODUCTS' ? selectedProducts.map(p => p.id) : undefined,
      startsAt: new Date(startsAt).toISOString(),
      type: discountType,
      value,
    }

    onCouponCreated(coupon)
    toast.success('Cupón creado exitosamente')
    onClose()
  }

  const calculateDiscountPreview = () => {
    if (!discountValue) return null

    const value = parseFloat(discountValue)
    if (discountType === 'PERCENTAGE') {
      return `${value}% OFF`
    } else {
      return `$${value.toFixed(2)} OFF`
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="size-5 text-blue-500" />
          Crear Cupón de Descuento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información básica del cupón */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Código del Cupón *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: SUMMER25"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateCouponCode}
                className="px-3"
              >
                Generar
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Título del Cupón *</Label>
            <Input
              placeholder="Ej: Descuento de Verano"
              value={couponTitle}
              onChange={(e) => setCouponTitle(e.target.value)}
            />
          </div>
        </div>

        {/* Tipo y valor del descuento */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Tipo de Descuento</Label>
            <Select value={discountType} onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT') => setDiscountType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">
                  <div className="flex items-center gap-2">
                    <Percent className="size-4" />
                    Porcentaje
                  </div>
                </SelectItem>
                <SelectItem value="FIXED_AMOUNT">
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-4" />
                    Monto Fijo
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Valor del Descuento *
              {discountType === 'PERCENTAGE' ? ' (%)' : ' ($)'}
            </Label>
            <Input
              type="number"
              placeholder={discountType === 'PERCENTAGE' ? '25' : '50.00'}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              min="0"
              max={discountType === 'PERCENTAGE' ? '100' : undefined}
              step={discountType === 'PERCENTAGE' ? '1' : '0.01'}
            />
          </div>
        </div>

        {/* Fechas de validez */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Fecha de Inicio *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Fecha de Fin (Opcional)</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="pl-10"
                min={startsAt}
              />
            </div>
          </div>
        </div>

        {/* Alcance del cupón */}
        <div>
          <Label className="text-sm font-medium">Aplicar a:</Label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-products"
                checked={appliesTo === 'ALL_PRODUCTS'}
                onCheckedChange={() => setAppliesTo('ALL_PRODUCTS')}
              />
              <Label htmlFor="all-products" className="flex items-center gap-2">
                <Package className="size-4" />
                Todos los productos
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="specific-products"
                checked={appliesTo === 'SPECIFIC_PRODUCTS'}
                onCheckedChange={() => setAppliesTo('SPECIFIC_PRODUCTS')}
              />
              <Label htmlFor="specific-products" className="flex items-center gap-2">
                <Users className="size-4" />
                Productos específicos ({selectedProducts.length} seleccionados)
              </Label>
            </div>
          </div>
        </div>

        {/* Productos seleccionados */}
        {appliesTo === 'SPECIFIC_PRODUCTS' && selectedProducts.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="mb-2 text-sm font-medium">Productos Aplicables:</h4>
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {selectedProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{product.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {product.id.split('/').pop()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vista previa del cupón */}
        {couponCode && discountValue && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
            <h4 className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-200">
              Vista Previa del Cupón
            </h4>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex justify-between">
                <span>Código:</span>
                <Badge variant="default" className="text-xs">
                  {couponCode}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Descuento:</span>
                <Badge variant="destructive" className="text-xs">
                  {calculateDiscountPreview()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Productos:</span>
                <span>
                  {appliesTo === 'ALL_PRODUCTS' ? 'Todos' : `${selectedProducts.length} específicos`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button onClick={handleCreateCoupon} className="flex-1">
            Crear Cupón
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

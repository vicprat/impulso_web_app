'use client'

import { Calendar, CalendarDays, DollarSign, Percent, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type CreateProductDiscountInput, type ProductDiscount } from '@/services/product/types'

interface ProductDiscountProps {
  productId: string
  productTitle: string
  currentPrice: string
  onDiscountChange: (discount: CreateProductDiscountInput | null) => void
  existingDiscount?: ProductDiscount | null
}

export function ProductDiscount({
  productId,
  productTitle,
  currentPrice,
  onDiscountChange,
  existingDiscount,
}: ProductDiscountProps) {
  const [ discountType, setDiscountType ] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>(
    existingDiscount?.type || 'PERCENTAGE'
  )
  const [ discountValue, setDiscountValue ] = useState<string>(
    existingDiscount?.value?.toString() || ''
  )
  const [ startsAt, setStartsAt ] = useState<string>(
    existingDiscount?.startsAt ? new Date(existingDiscount.startsAt).toISOString().split('T')[ 0 ] : ''
  )
  const [ endsAt, setEndsAt ] = useState<string>(
    existingDiscount?.endsAt ? new Date(existingDiscount.endsAt).toISOString().split('T')[ 0 ] : ''
  )
  const [ isActive, setIsActive ] = useState<boolean>(existingDiscount?.isActive ?? true)

  const handleSaveDiscount = () => {
    if (!discountValue || !startsAt) {
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

    const discount: CreateProductDiscountInput = {
      productId,
      type: discountType,
      value,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
    }

    onDiscountChange(discount)
    toast.success('Descuento guardado exitosamente')
  }

  const handleRemoveDiscount = () => {
    onDiscountChange(null)
    setDiscountValue('')
    setStartsAt('')
    setEndsAt('')
    toast.success('Descuento removido')
  }

  const calculateDiscountedPrice = () => {
    if (!discountValue || !isActive) return currentPrice

    const currentPriceNum = parseFloat(currentPrice)
    const discountNum = parseFloat(discountValue)

    if (discountType === 'PERCENTAGE') {
      const discountAmount = (currentPriceNum * discountNum) / 100
      return (currentPriceNum - discountAmount).toFixed(2)
    } else {
      return Math.max(0, currentPriceNum - discountNum).toFixed(2)
    }
  }

  const getDiscountLabel = () => {
    if (discountType === 'PERCENTAGE') {
      return `${discountValue}% OFF`
    } else {
      return `$${discountValue} OFF`
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Percent className="h-5 w-5 text-orange-500" />
          Descuento del Producto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado del descuento */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Estado del Descuento</Label>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Activo' : 'Inactivo'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsActive(!isActive)}
              className="h-6 px-2 text-xs"
            >
              {isActive ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </div>

        {/* Tipo de descuento */}
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
                    <Percent className="h-4 w-4" />
                    Porcentaje
                  </div>
                </SelectItem>
                <SelectItem value="FIXED_AMOUNT">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Monto Fijo
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Valor del Descuento
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

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Fecha de Inicio</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
              <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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

        {/* Vista previa del descuento */}
        {discountValue && (
          <div className="rounded-lg bg-muted/50 p-4">
            <h4 className="mb-2 text-sm font-medium">Vista Previa del Descuento</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Precio Original:</span>
                <span className="font-medium">${currentPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Descuento:</span>
                <Badge variant="destructive" className="text-xs">
                  {getDiscountLabel()}
                </Badge>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Precio con Descuento:</span>
                <span className="font-bold text-green-600">
                  ${calculateDiscountedPrice()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button onClick={handleSaveDiscount} className="flex-1">
            {existingDiscount ? 'Actualizar Descuento' : 'Guardar Descuento'}
          </Button>
          {existingDiscount && (
            <Button
              variant="destructive"
              onClick={handleRemoveDiscount}
              className="px-4"
            >
              <X className="mr-2 h-4 w-4" />
              Remover
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

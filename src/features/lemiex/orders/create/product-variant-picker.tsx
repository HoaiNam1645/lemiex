'use client'

import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import {
  fetchProductColors,
  fetchProducts,
  fetchProductSizes,
  fetchProductVariant,
  type ProductOption,
  type ProductVariantDetail,
  type SelectOption,
} from '@/services/orders/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/context/i18n-provider'

type ProductVariantPickerProps = {
  value?: string
  onVariantResolved: (variant: ProductVariantDetail) => void
}

export function ProductVariantPicker({
  value,
  onVariantResolved,
}: ProductVariantPickerProps) {
  const { messages } = useI18n()
  const pickerMessages = messages.orders.createForm.productPicker
  const [products, setProducts] = useState<ProductOption[]>([])
  const [colors, setColors] = useState<SelectOption[]>([])
  const [sizes, setSizes] = useState<SelectOption[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [loading, setLoading] = useState({
    products: false,
    colors: false,
    sizes: false,
    variant: false,
  })

  useEffect(() => {
    let active = true

    const run = async () => {
      setLoading((prev) => ({ ...prev, products: true }))
      try {
        const response = await fetchProducts()
        if (active) setProducts(response)
      } catch {
        if (active) setProducts([])
      } finally {
        if (active) setLoading((prev) => ({ ...prev, products: false }))
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const run = async () => {
      if (!selectedProductId) {
        setColors([])
        setSizes([])
        setSelectedColor('')
        setSelectedSize('')
        return
      }

      setLoading((prev) => ({ ...prev, colors: true }))
      try {
        const response = await fetchProductColors(selectedProductId)
        if (!active) return
        setColors(response)
        setSizes([])
        setSelectedColor('')
        setSelectedSize('')
      } catch {
        if (!active) return
        setColors([])
        setSizes([])
      } finally {
        if (active) setLoading((prev) => ({ ...prev, colors: false }))
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [selectedProductId])

  useEffect(() => {
    let active = true

    const run = async () => {
      if (!selectedProductId || !selectedColor) {
        setSizes([])
        setSelectedSize('')
        return
      }

      setLoading((prev) => ({ ...prev, sizes: true }))
      try {
        const response = await fetchProductSizes(selectedProductId, selectedColor)
        if (!active) return
        setSizes(response)
        setSelectedSize('')
      } catch {
        if (!active) return
        setSizes([])
      } finally {
        if (active) setLoading((prev) => ({ ...prev, sizes: false }))
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [selectedProductId, selectedColor])

  useEffect(() => {
    let active = true

    const run = async () => {
      if (!selectedProductId || !selectedColor || !selectedSize) return

      setLoading((prev) => ({ ...prev, variant: true }))
      try {
        const variant = await fetchProductVariant(
          selectedProductId,
          selectedColor,
          selectedSize
        )
        if (active && variant) onVariantResolved(variant)
      } finally {
        if (active) setLoading((prev) => ({ ...prev, variant: false }))
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [onVariantResolved, selectedColor, selectedProductId, selectedSize])

  return (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      <div className='space-y-1.5'>
        <label className='text-[12px] font-medium text-foreground'>
          {pickerMessages.product}
        </label>
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger className='w-full rounded-[6px] text-[13px]'>
            <SelectValue
              placeholder={
                loading.products
                  ? pickerMessages.loadingProducts
                  : pickerMessages.selectProduct
              }
            />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={String(product.id)}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-1.5'>
        <label className='text-[12px] font-medium text-foreground'>
          {pickerMessages.color}
        </label>
        <Select
          value={selectedColor}
          onValueChange={setSelectedColor}
          disabled={!selectedProductId || loading.colors}
        >
          <SelectTrigger className='w-full rounded-[6px] text-[13px]'>
            <SelectValue
              placeholder={
                loading.colors
                  ? pickerMessages.loadingColors
                  : pickerMessages.selectColor
              }
            />
          </SelectTrigger>
          <SelectContent>
            {colors.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-1.5'>
        <label className='text-[12px] font-medium text-foreground'>
          {pickerMessages.size}
        </label>
        <Select
          value={selectedSize}
          onValueChange={setSelectedSize}
          disabled={!selectedColor || loading.sizes}
        >
          <SelectTrigger className='w-full rounded-[6px] text-[13px]'>
            <SelectValue
              placeholder={
                loading.sizes
                  ? pickerMessages.loadingSizes
                  : pickerMessages.selectSize
              }
            />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='sm:col-span-2 lg:col-span-3'>
        <div className='flex min-h-9 items-center rounded-[6px] border border-dashed border-border bg-muted/20 px-3 text-[12px] text-muted-foreground'>
          {loading.variant ? (
            <span className='inline-flex items-center gap-2'>
              <LoaderCircle className='h-3.5 w-3.5 animate-spin' />
              {pickerMessages.resolvingVariant}
            </span>
          ) : value ? (
            <span>
              {pickerMessages.variantId}:{' '}
              <span className='font-medium text-foreground'>{value}</span>
            </span>
          ) : (
            pickerMessages.chooseAll
          )}
        </div>
      </div>
    </div>
  )
}

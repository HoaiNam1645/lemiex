'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitch } from '@/components/language-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/context/i18n-provider'
import {
  createProduct,
  fetchProductFilterOptions,
  fetchProductMetadata,
  type CreateProductPayload,
  type CreateProductVariantPayload,
  type ProductFilterOptions,
  type ProductMetadata,
  type ProductPricePayload,
} from '@/services/products/api'

type LocalPrice = Omit<ProductPricePayload, 'id'> & { id: number }
type LocalVariant = Omit<CreateProductVariantPayload, 'prices'> & {
  id: number
  prices: LocalPrice[]
}

function cardClassName() {
  return 'rounded-[6px] border-border/80 shadow-none'
}

function fieldClassName() {
  return 'h-11 w-full rounded-[6px] px-4 text-[14px]'
}

function subsectionClassName() {
  return 'rounded-[6px] border border-border/70 bg-background p-4 sm:p-5'
}

function sectionLabelClassName() {
  return 'text-sm font-medium text-foreground'
}

function sectionGridClassName() {
  return 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12'
}

function fieldWrapClassName(span = 'xl:col-span-3') {
  return `space-y-2 ${span}`
}

function nextId() {
  return Date.now() + Math.floor(Math.random() * 1000)
}

function defaultPrice(): LocalPrice {
  return {
    id: nextId(),
    tier_id: 0,
    type: 'base_cost',
    price: 0,
  }
}

function defaultVariant(style?: string): LocalVariant {
  return {
    id: nextId(),
    variant_id: '',
    sku: '',
    style: style || '',
    color: '',
    size: '',
    stock: 0,
    active: true,
    weight: null,
    length: null,
    width: null,
    height: null,
    supplier_price: null,
    prices: [],
  }
}

export function LemiexCreateProduct() {
  const router = useRouter()
  const { messages } = useI18n()
  const productMessages = messages.productVariants
  const formMessages = productMessages.createForm

  const [loading, setLoading] = useState(false)
  const [booting, setBooting] = useState(true)
  const [metadata, setMetadata] = useState<ProductMetadata>({
    tiers: [],
    price_types: [],
  })
  const [filterOptions, setFilterOptions] = useState<ProductFilterOptions>({
    brands: [],
    styles: [],
    colors: [],
    sizes: [],
  })
  const [productData, setProductData] = useState<CreateProductPayload>({
    name: '',
    style: '',
    status: true,
    category_type: 'embroidery',
    mockup: '',
    brand: '',
    warehouse_name: '',
    variants: [],
  })
  const [variants, setVariants] = useState<LocalVariant[]>([])

  useEffect(() => {
    let active = true

    async function bootstrap() {
      setBooting(true)
      try {
        const [nextMetadata, nextFilterOptions] = await Promise.all([
          fetchProductMetadata(),
          fetchProductFilterOptions(),
        ])

        if (!active) return
        setMetadata(nextMetadata)
        setFilterOptions(nextFilterOptions)
      } catch (error) {
        if (!active) return
        toast.error(error instanceof Error ? error.message : formMessages.createFailed)
      } finally {
        if (active) setBooting(false)
      }
    }

    void bootstrap()
    return () => {
      active = false
    }
  }, [formMessages.createFailed])

  const hasVariants = variants.length > 0

  const firstTierId = useMemo(
    () => metadata.tiers[0]?.id || 0,
    [metadata.tiers]
  )
  const firstPriceType = useMemo(
    () => metadata.price_types[0] || 'base_cost',
    [metadata.price_types]
  )

  function updateProductField<K extends keyof Omit<CreateProductPayload, 'variants'>>(
    field: K,
    value: CreateProductPayload[K]
  ) {
    setProductData((prev) => ({ ...prev, [field]: value }))
    if (field === 'style') {
      setVariants((prev) =>
        prev.map((variant) => ({
          ...variant,
          style: String(value || ''),
        }))
      )
    }
  }

  function addVariant() {
    setVariants((prev) => [...prev, defaultVariant(productData.style)])
  }

  function removeVariant(id: number) {
    setVariants((prev) => prev.filter((variant) => variant.id !== id))
  }

  function updateVariant<K extends keyof LocalVariant>(
    id: number,
    field: K,
    value: LocalVariant[K]
  ) {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    )
  }

  function addPrice(variantId: number) {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              prices: [
                ...variant.prices,
                {
                  ...defaultPrice(),
                  tier_id: firstTierId,
                  type: firstPriceType,
                },
              ],
            }
          : variant
      )
    )
  }

  function removePrice(variantId: number, priceId: number) {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              prices: variant.prices.filter((price) => price.id !== priceId),
            }
          : variant
      )
    )
  }

  function updatePrice<K extends keyof LocalPrice>(
    variantId: number,
    priceId: number,
    field: K,
    value: LocalPrice[K]
  ) {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              prices: variant.prices.map((price) =>
                price.id === priceId ? { ...price, [field]: value } : price
              ),
            }
          : variant
      )
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!productData.name.trim()) {
      toast.error(formMessages.productNameRequired)
      return
    }

    if (variants.some((variant) => !variant.variant_id.trim())) {
      toast.error(formMessages.variantIdRequired)
      return
    }

    const submitData: CreateProductPayload = {
      ...productData,
      variants: variants.map(({ id, prices, ...variant }) => ({
        ...variant,
        prices: prices.map(({ id: priceId, ...price }) => price),
      })),
    }

    setLoading(true)
    try {
      await createProduct(submitData)
      toast.success(formMessages.createSuccess)
      router.push('/lemiex/product-variants')
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'errors' in error &&
        error.errors &&
        typeof error.errors === 'object'
      ) {
        const entries = Object.values(error.errors as Record<string, string[]>)
        const first = entries[0]
        if (Array.isArray(first) && first[0]) {
          toast.error(first[0])
          setLoading(false)
          return
        }
      }

      toast.error(error instanceof Error ? error.message : formMessages.createFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid className='min-h-screen px-4 py-6 pb-12 sm:px-5 lg:px-6 xl:px-7'>
        <form className='mx-auto w-full max-w-[1640px] space-y-6' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between'>
            <div className='space-y-2'>
              <Button
                type='button'
                variant='ghost'
                className='h-8 rounded-[6px] px-2 text-muted-foreground'
                onClick={() => router.push('/lemiex/product-variants')}
              >
                <ArrowLeft className='size-4' />
                {formMessages.cancel}
              </Button>
              <div className='space-y-1'>
                <h1 className='text-3xl font-semibold tracking-tight'>
                  {formMessages.title}
                </h1>
                <p className='text-sm text-muted-foreground'>
                  {formMessages.description}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                className='rounded-[6px]'
                onClick={() => router.push('/lemiex/product-variants')}
              >
                {formMessages.cancel}
              </Button>
              <Button type='submit' className='rounded-[6px]' disabled={loading || booting}>
                {loading ? (
                  <>
                    <Loader2 className='size-4 animate-spin' />
                    {formMessages.creating}
                  </>
                ) : (
                  formMessages.create
                )}
              </Button>
            </div>
          </div>

          <Card className={cardClassName()}>
            <CardHeader>
              <CardTitle>{formMessages.productInfo}</CardTitle>
            </CardHeader>
            <CardContent className={sectionGridClassName()}>
              <div className={fieldWrapClassName('xl:col-span-8')}>
                <label className={sectionLabelClassName()}>{formMessages.productName}</label>
                <Input
                  className={fieldClassName()}
                  value={productData.name}
                  onChange={(event) => updateProductField('name', event.target.value)}
                  placeholder={formMessages.productNamePlaceholder}
                />
              </div>

              <div className={fieldWrapClassName('xl:col-span-4')}>
                <label className={sectionLabelClassName()}>{formMessages.style}</label>
                <Input
                  className={fieldClassName()}
                  list='product-style-options'
                  value={productData.style || ''}
                  onChange={(event) => updateProductField('style', event.target.value)}
                  placeholder={formMessages.stylePlaceholder}
                />
              </div>

              <div className={fieldWrapClassName('xl:col-span-4')}>
                <label className={sectionLabelClassName()}>{formMessages.brand}</label>
                <Input
                  className={fieldClassName()}
                  list='product-brand-options'
                  value={productData.brand || ''}
                  onChange={(event) => updateProductField('brand', event.target.value)}
                  placeholder={formMessages.brandPlaceholder}
                />
              </div>

              <div className={fieldWrapClassName('xl:col-span-2')}>
                <label className={sectionLabelClassName()}>
                  {productMessages.columns.status}
                </label>
                <Select
                  value={productData.status ? 'true' : 'false'}
                  onValueChange={(value) => updateProductField('status', value === 'true')}
                >
                  <SelectTrigger className={fieldClassName()}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='true'>{formMessages.active}</SelectItem>
                    <SelectItem value='false'>{formMessages.inactive}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={fieldWrapClassName('xl:col-span-2')}>
                <label className={sectionLabelClassName()}>{formMessages.category}</label>
                <Select
                  value={productData.category_type}
                  onValueChange={(value) =>
                    updateProductField(
                      'category_type',
                      value as CreateProductPayload['category_type']
                    )
                  }
                >
                  <SelectTrigger className={fieldClassName()}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='embroidery'>
                      {productMessages.tabs.embroidery}
                    </SelectItem>
                    <SelectItem value='print'>{productMessages.tabs.print}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={fieldWrapClassName('xl:col-span-4')}>
                <label className={sectionLabelClassName()}>{formMessages.warehouse}</label>
                <Input
                  className={fieldClassName()}
                  value={productData.warehouse_name || ''}
                  onChange={(event) =>
                    updateProductField('warehouse_name', event.target.value)
                  }
                  placeholder={formMessages.warehousePlaceholder}
                />
              </div>

              <div className={fieldWrapClassName('xl:col-span-12')}>
                <label className={sectionLabelClassName()}>{formMessages.mockupUrl}</label>
                <Input
                  className={fieldClassName()}
                  value={productData.mockup || ''}
                  onChange={(event) => updateProductField('mockup', event.target.value)}
                  placeholder='https://example.com/mockup.jpg'
                />
              </div>

              <datalist id='product-style-options'>
                {filterOptions.styles.map((style) => (
                  <option key={style} value={style} />
                ))}
              </datalist>
              <datalist id='product-brand-options'>
                {filterOptions.brands.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
            </CardContent>
          </Card>

          <Card className={cardClassName()}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0'>
              <CardTitle>{formMessages.variants}</CardTitle>
              <Button
                type='button'
                variant='outline'
                className='rounded-[6px]'
                onClick={addVariant}
              >
                <Plus className='size-4' />
                {formMessages.addVariant}
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              {!hasVariants ? (
                <div className='rounded-[6px] border border-dashed p-6 text-sm text-muted-foreground'>
                  {formMessages.noVariantsYet}
                </div>
              ) : null}

              {variants.map((variant, index) => (
                <Card key={variant.id} className={cardClassName()}>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0'>
                    <CardTitle className='text-lg'>
                      {formMessages.variant} #{index + 1}
                    </CardTitle>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='size-9 rounded-[6px]'
                      onClick={() => removeVariant(variant.id)}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className={subsectionClassName()}>
                      <div className={sectionGridClassName()}>
                        <div className={fieldWrapClassName()}>
                          <label className={sectionLabelClassName()}>
                            {formMessages.variantId}
                          </label>
                          <Input
                            className={fieldClassName()}
                            value={variant.variant_id}
                            onChange={(event) =>
                              updateVariant(variant.id, 'variant_id', event.target.value)
                            }
                            placeholder={formMessages.variantIdPlaceholder}
                          />
                        </div>

                        <div className={fieldWrapClassName()}>
                          <label className={sectionLabelClassName()}>{formMessages.sku}</label>
                          <Input
                            className={fieldClassName()}
                            value={variant.sku || ''}
                            onChange={(event) =>
                              updateVariant(variant.id, 'sku', event.target.value)
                            }
                            placeholder={formMessages.skuPlaceholder}
                          />
                        </div>

                        <div className={fieldWrapClassName()}>
                          <label className={sectionLabelClassName()}>{formMessages.color}</label>
                          <Input
                            className={fieldClassName()}
                            list={`variant-colors-${variant.id}`}
                            value={variant.color || ''}
                            onChange={(event) =>
                              updateVariant(variant.id, 'color', event.target.value)
                            }
                            placeholder={formMessages.colorPlaceholder}
                          />
                          <datalist id={`variant-colors-${variant.id}`}>
                            {filterOptions.colors.map((color) => (
                              <option key={color} value={color} />
                            ))}
                          </datalist>
                        </div>

                        <div className={fieldWrapClassName()}>
                          <label className={sectionLabelClassName()}>{formMessages.size}</label>
                          <Input
                            className={fieldClassName()}
                            list={`variant-sizes-${variant.id}`}
                            value={variant.size || ''}
                            onChange={(event) =>
                              updateVariant(variant.id, 'size', event.target.value)
                            }
                            placeholder={formMessages.sizePlaceholder}
                          />
                          <datalist id={`variant-sizes-${variant.id}`}>
                            {filterOptions.sizes.map((size) => (
                              <option key={size} value={size} />
                            ))}
                          </datalist>
                        </div>

                        <div className={fieldWrapClassName()}>
                          <label className={sectionLabelClassName()}>{formMessages.stock}</label>
                          <Input
                            className={fieldClassName()}
                            type='number'
                            min={0}
                            value={variant.stock ?? 0}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                'stock',
                                Number(event.target.value || 0)
                              )
                            }
                          />
                        </div>

                        <div className={fieldWrapClassName()}>
                          <label className={sectionLabelClassName()}>
                            {formMessages.supplierPrice}
                          </label>
                          <Input
                            className={fieldClassName()}
                            type='number'
                            min={0}
                            step='0.01'
                            value={variant.supplier_price ?? ''}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                'supplier_price',
                                event.target.value === ''
                                  ? null
                                  : Number(event.target.value || 0)
                              )
                            }
                          />
                        </div>

                        <div className={fieldWrapClassName()}>
                          <label className={sectionLabelClassName()}>{formMessages.weight}</label>
                          <Input
                            className={fieldClassName()}
                            type='number'
                            min={0}
                            value={variant.weight ?? ''}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                'weight',
                                event.target.value === ''
                                  ? null
                                  : Number(event.target.value || 0)
                              )
                            }
                          />
                        </div>

                        <div className={fieldWrapClassName()}>
                          <label className={sectionLabelClassName()}>{formMessages.status}</label>
                          <Select
                            value={variant.active ? 'true' : 'false'}
                            onValueChange={(value) =>
                              updateVariant(variant.id, 'active', value === 'true')
                            }
                          >
                            <SelectTrigger className={fieldClassName()}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='true'>{formMessages.active}</SelectItem>
                              <SelectItem value='false'>{formMessages.inactive}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                          <label className={sectionLabelClassName()}>Length</label>
                          <Input
                            className={fieldClassName()}
                            type='number'
                            min={0}
                            placeholder='Length'
                            value={variant.length ?? ''}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                'length',
                                event.target.value === ''
                                  ? null
                                  : Number(event.target.value || 0)
                              )
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <label className={sectionLabelClassName()}>Width</label>
                          <Input
                            className={fieldClassName()}
                            type='number'
                            min={0}
                            placeholder='Width'
                            value={variant.width ?? ''}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                'width',
                                event.target.value === ''
                                  ? null
                                  : Number(event.target.value || 0)
                              )
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <label className={sectionLabelClassName()}>Height</label>
                          <Input
                            className={fieldClassName()}
                            type='number'
                            min={0}
                            placeholder='Height'
                            value={variant.height ?? ''}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                'height',
                                event.target.value === ''
                                  ? null
                                  : Number(event.target.value || 0)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Card className={cardClassName()}>
                      <CardHeader className='flex flex-row items-center justify-between space-y-0'>
                        <CardTitle className='text-base'>{formMessages.pricing}</CardTitle>
                        <Button
                          type='button'
                          variant='outline'
                          className='rounded-[6px]'
                          onClick={() => addPrice(variant.id)}
                        >
                          <Plus className='size-4' />
                          {formMessages.addPrice}
                        </Button>
                      </CardHeader>
                      <CardContent className='space-y-3'>
                        {variant.prices.length === 0 ? (
                          <div className='rounded-[6px] border border-dashed p-4 text-sm text-muted-foreground'>
                            {formMessages.noPricesAdded}
                          </div>
                        ) : null}

                        {variant.prices.map((price) => (
                          <div
                            key={price.id}
                            className='grid gap-3 rounded-[6px] border p-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(180px,220px)_44px]'
                          >
                            <Select
                              value={String(price.tier_id)}
                              onValueChange={(value) =>
                                updatePrice(variant.id, price.id, 'tier_id', Number(value))
                              }
                            >
                              <SelectTrigger className={fieldClassName()}>
                                <SelectValue placeholder={formMessages.tier} />
                              </SelectTrigger>
                              <SelectContent>
                                {metadata.tiers.map((tier) => (
                                  <SelectItem key={tier.id} value={String(tier.id)}>
                                    {tier.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select
                              value={price.type}
                              onValueChange={(value) =>
                                updatePrice(variant.id, price.id, 'type', value)
                              }
                            >
                              <SelectTrigger className={fieldClassName()}>
                                <SelectValue placeholder={formMessages.priceType} />
                              </SelectTrigger>
                              <SelectContent>
                                {metadata.price_types.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.replaceAll('_', ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Input
                              className={fieldClassName()}
                              type='number'
                              min={0}
                              step='0.01'
                              value={price.price}
                              onChange={(event) =>
                                updatePrice(
                                  variant.id,
                                  price.id,
                                  'price',
                                  Number(event.target.value || 0)
                                )
                              }
                              placeholder='0.00'
                            />

                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='size-10 rounded-[6px]'
                              onClick={() => removePrice(variant.id, price.id)}
                            >
                              <Trash2 className='size-4' />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <div className='flex justify-end border-t bg-background pt-4'>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                className='rounded-[6px]'
                onClick={() => router.push('/lemiex/product-variants')}
              >
                {formMessages.cancel}
              </Button>
              <Button
                type='submit'
                className='rounded-[6px]'
                disabled={loading || booting}
              >
                {loading ? (
                  <>
                    <Loader2 className='size-4 animate-spin' />
                    {formMessages.creating}
                  </>
                ) : (
                  formMessages.create
                )}
              </Button>
            </div>
          </div>
        </form>
      </Main>
    </>
  )
}

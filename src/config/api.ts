const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

export const API_BASE_URL =
  typeof window !== 'undefined' && /^https?:\/\//.test(configuredApiBaseUrl)
    ? '/api'
    : configuredApiBaseUrl

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  ORDERS: '/orders',
  ORDER_TIMELINE: '/orders',
  ORDER_IDS: '/orders/ids',
  ORDER_FULFILL_STATUSES: '/orders/fulfill-statuses',
  ORDER_EMBROIDERY_TYPES: '/orders/embroidery-types',
  ORDER_CREATE: '/orders/create',
  ORDER_UPLOAD_FILE: '/orders/upload/file',
  BUY_LABEL_SINGLE: '/buy-label/single',
  BUY_LABEL_BATCH: '/buy-label/batch',
  USERS: '/users',
  STORES: '/stores',
  FULFILLMENT_PRIORITIES: '/fulfillment-priorities',
  EMBROIDERY_TYPES: '/embroidery-types',
  METADATA_SHIPPING_METHODS: '/metadata/shipping-methods',
  PRODUCTS: '/products',
  PRODUCTS_WITH_VARIANTS: '/products/with-variants',
  PRODUCTS_PRINT: '/products/print',
  PRODUCT_FILTER_OPTIONS: '/products/filter-options',
  PRODUCT_METADATA: '/products/metadata',
  PRODUCT_UPDATE_STOCK: '/products/updatestock',
  PRODUCT_VARIANTS: '/products/variants',
  STYLES: '/styles',
  COLORS: '/colors',
  SIZES: '/sizes',
  PRINT_STYLES: '/print/styles',
  PRINT_COLORS: '/print/colors',
  PRINT_SIZES: '/print/sizes',
  PRINT_ALL_VARIANTS: '/print/all-variants',
} as const

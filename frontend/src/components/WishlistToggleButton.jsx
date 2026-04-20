import React, { useMemo, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { isInWishlist, toggleWishlist } from '../utils/wishlist'
import useStorageSync from '../hooks/useStorageSync'
import { STORAGE_EVENTS } from '../constants/storageEvents'

export default function WishlistToggleButton({ product, className = '', showLabel = false }) {
  const { t } = useLang()

  const normalizedProduct = useMemo(() => {
    if (!product) return null
    return {
      ...product,
      price_usd: product.price_usd ?? product.usd_price ?? product.priceUsd,
      price_rub: product.price_rub ?? product.rub_price ?? product.priceRub
    }
  }, [product])

  const productId = normalizedProduct?.id
  const [inWishlist, setInWishlist] = useState(() => (productId !== undefined && productId !== null ? isInWishlist(productId) : false))

  useStorageSync(
    () => {
      if (productId === undefined || productId === null) {
        setInWishlist(false)
        return
      }
      setInWishlist(isInWishlist(productId))
    },
    {
      eventNames: [STORAGE_EVENTS.WISHLIST_UPDATED],
      deps: [productId]
    }
  )

  const label = inWishlist ? t('wishlist.remove') : t('wishlist.add')

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`${inWishlist ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border transition-colors ${className}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!normalizedProduct || productId === undefined || productId === null) return
        toggleWishlist(normalizedProduct)
        setInWishlist((prev) => !prev)
      }}
    >
      <span aria-hidden="true">{inWishlist ? '♥' : '♡'}</span>
      {showLabel && <span className="ml-2">{label}</span>}
    </button>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { addToCart } from '../utils/cart'
import { useLang } from '../i18n.jsx'
import { formatLocalizedPrice } from '../utils/currency'
import WishlistToggleButton from './WishlistToggleButton'
import { useCurrency } from '../context/CurrencyContext'

export default function ProductCard({ product, variant = 'catalog' }) {
  const { t, lang } = useLang()
  const { currency, exchangeRate } = useCurrency()
  const [added, setAdded] = useState(false)
  const addedTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) {
        clearTimeout(addedTimerRef.current)
      }
    }
  }, [])

  const isSearchVariant = variant === 'search'
  const isHomeVariant = variant === 'home'
  const cardHeight = isHomeVariant ? 'h-[340px]' : (isSearchVariant ? 'h-[380px]' : 'h-[400px]')
  const imageHeight = isHomeVariant ? 'h-36' : (isSearchVariant ? 'h-44' : 'h-40')

  const getPriceDisplay = () => formatLocalizedPrice(product, lang, currency, exchangeRate)

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden w-full flex flex-col ${cardHeight} border border-gray-100 group`}>
      <Link to={`/product/${product.id}`} className="flex-1 flex flex-col no-underline text-current">
        <div className={`relative w-full ${imageHeight} bg-gray-50 overflow-hidden`}>
          <img
            src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Photo'}
            alt={product.name}
            className={`w-full h-full object-cover ${isSearchVariant ? 'group-hover:scale-105 transition-transform duration-300' : ''}`}
          />
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-sm text-gray-800 mb-1 line-clamp-2 h-10">{product.name}</h3>
          <p className="text-gray-500 text-xs mb-2 line-clamp-2 h-8">{product.description}</p>
          <div className="mt-auto">
            <p className="text-indigo-600 font-bold text-lg">
              {getPriceDisplay()}
            </p>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-0 flex items-center gap-2">
        <button
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            added ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          onClick={() => {
            addToCart({
              id: product.id,
              name: product.name,
              image_url: product.image_url,
              price: product.price,
              price_usd: product.price_usd ?? product.usd_price ?? product.priceUsd,
              price_rub: product.price_rub ?? product.rub_price ?? product.priceRub
            }, 1)
            setAdded(true)
            if (addedTimerRef.current) {
              clearTimeout(addedTimerRef.current)
            }
            addedTimerRef.current = setTimeout(() => setAdded(false), 1200)
          }}
        >
          {added ? `✓ ${t('added')}` : t('add_to_cart')}
        </button>

        <WishlistToggleButton product={product} className="px-3 py-2.5 rounded-lg" />
      </div>
    </div>
  )
}

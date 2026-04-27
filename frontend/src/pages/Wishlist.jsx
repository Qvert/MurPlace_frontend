import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { addToCart } from '../utils/cart'
import { getWishlist, removeFromWishlist, clearWishlist } from '../utils/wishlist'
import { useLang } from '../i18n.jsx'
import { formatLocalizedPrice } from '../utils/currency'
import EmptyStateCard from '../components/EmptyStateCard'
import useStorageSync from '../hooks/useStorageSync'
import { STORAGE_EVENTS } from '../constants/storageEvents'
import { useCurrency } from '../context/CurrencyContext'

export default function Wishlist() {
  const [items, setItems] = useState([])
  const { t, lang } = useLang()
  const { currency, exchangeRate } = useCurrency()

  useStorageSync(() => setItems(getWishlist()), {
    eventNames: [STORAGE_EVENTS.WISHLIST_UPDATED],
    deps: []
  })

  const handleRemove = (id) => {
    const next = removeFromWishlist(id)
    setItems(next)
  }

  const handleClear = () => {
    const next = clearWishlist()
    setItems(next)
  }

  if (!items.length) {
    return (
      <EmptyStateCard
        title={t('wishlist.empty_title')}
        description={t('wishlist.empty_desc')}
        actionLabel={t('wishlist.browse')}
        actionTo="/"
      />
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('wishlist.title')}</h1>
          <p className="text-gray-600">{t('wishlist.subtitle')}</p>
        </div>
        <button onClick={handleClear} className="text-sm text-gray-500 hover:text-gray-700">{t('wishlist.clear')}</button>
      </div>

      <ul className="divide-y">
        {items.map(item => (
          <li key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:space-x-6">
            <Link to={`/product/${item.id}`}>
              <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded" />
            </Link>
            <div className="flex-1 mt-4 sm:mt-0">
              <Link to={`/product/${item.id}`} className="font-semibold hover:text-indigo-600">{item.name}</Link>
              <p className="text-indigo-600 font-bold mt-1">{formatLocalizedPrice(item, lang, currency, exchangeRate)}</p>
              {item.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>}
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                onClick={() => addToCart(item, 1)}
              >
                {t('add_to_cart')}
              </button>
              <button
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                onClick={() => handleRemove(item.id)}
              >
                {t('wishlist.remove')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

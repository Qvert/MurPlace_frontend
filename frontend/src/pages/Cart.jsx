import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearCart, getCart, removeFromCart, updateCartItemQuantity } from '../utils/cart'
import { useLang } from '../i18n.jsx'
import { formatPrice, getConvertedPriceNumber } from '../utils/currency'
import EmptyStateCard from '../components/EmptyStateCard'
import useStorageSync from '../hooks/useStorageSync'
import { STORAGE_EVENTS } from '../constants/storageEvents'
import { useCurrency } from '../context/CurrencyContext'

export default function Cart() {
  const [items, setItems] = useState([])
  const { t, lang } = useLang()
  const { currency, exchangeRate } = useCurrency()

  useStorageSync(() => setItems(getCart()), {
    eventNames: [STORAGE_EVENTS.CART_UPDATED],
    deps: []
  })

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = getConvertedPriceNumber(item, currency, exchangeRate, 0)
      return sum + itemPrice * (Number(item.quantity) || 0)
    }, 0)
    const shipping = items.length ? 9.99 : 0
    return { subtotal, shipping, total: subtotal + shipping }
  }, [items, lang, currency, exchangeRate])

  const handleQuantityChange = (id, quantity) => {
    const next = updateCartItemQuantity(id, quantity)
    setItems(next)
  }

  const handleRemove = (id) => {
    const next = removeFromCart(id)
    setItems(next)
  }

  const handleClear = () => {
    const next = clearCart()
    setItems(next)
  }

  const getItemPriceDisplay = (item) => {
    const itemPrice = getConvertedPriceNumber(item, currency, exchangeRate, 0)
    return formatPrice(itemPrice, lang, currency)
  }

  if (!items.length) {
    return (
      <EmptyStateCard
        title={t('cart.empty_title')}
        description={t('cart.empty_desc')}
        actionLabel={t('cart.continue')}
        actionTo="/"
      />
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold">{t('cart.title')}</h1>
          <p className="text-gray-600">{t('cart.review')}</p>
        </div>

        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:space-x-6">
              <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded" />
              <div className="flex-1 mt-4 sm:mt-0">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-indigo-600 font-bold">{getItemPriceDisplay(item)}</p>
                <div className="mt-3 flex items-center space-x-2">
                  <label className="text-sm text-gray-600" htmlFor={`qty-${item.id}`}>{t('cart.qty')}</label>
                  <input
                    id={`qty-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(item.id, Number(e.target.value))}
                    className="w-20 border rounded px-3 py-2"
                  />
                  <button onClick={() => handleRemove(item.id)} className="text-sm text-red-600 hover:text-red-700">{t('cart.remove')}</button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="p-6 flex justify-between items-center border-t">
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">{t('cart.continue')}</Link>
          <button onClick={handleClear} className="text-sm text-gray-500 hover:text-gray-700">{t('cart.clear')}</button>
        </div>
      </div>

      <aside className="bg-white rounded-lg shadow p-6 h-fit">
        <h2 className="text-xl font-semibold mb-4">{t('cart.order_summary')}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t('cart.subtotal')}</span>
            <span>{formatPrice(totals.subtotal, lang, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('cart.shipping')}</span>
            <span>{totals.shipping ? formatPrice(totals.shipping, lang, currency) : t('cart.free')}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-3 mt-3">
            <span>{t('cart.total')}</span>
            <span>{formatPrice(totals.total, lang, currency)}</span>
          </div>
        </div>

        <button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold">{t('cart.proceed')}</button>
        <p className="text-xs text-gray-500 mt-3">{t('cart.checkout_placeholder')}</p>
      </aside>
    </div>
  )
}

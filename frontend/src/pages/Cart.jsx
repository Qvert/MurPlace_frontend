import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearCart, getCart, removeFromCart, updateCartItemQuantity } from '../utils/cart'

export default function Cart() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const sync = () => setItems(getCart())
    sync()
    window.addEventListener('cart-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('cart-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
    const shipping = items.length ? 9.99 : 0
    const total = subtotal + shipping
    return { subtotal, shipping, total }
  }, [items])

  const handleQuantityChange = (id, quantity) => {
    const next = updateCartItemQuantity(id, quantity)
    setItems(next)
  }

  const handleRemove = id => {
    const next = removeFromCart(id)
    setItems(next)
  }

  const handleClear = () => {
    const next = clearCart()
    setItems(next)
  }

  if (!items.length) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add some goodies for your pet to get started.</p>
        <Link to="/" className="inline-block px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Continue shopping</Link>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-gray-600">Review your picks before checkout.</p>
        </div>

        <ul className="divide-y">
          {items.map(item => (
            <li key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:space-x-6">
              <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded" />
              <div className="flex-1 mt-4 sm:mt-0">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-indigo-600 font-bold">${Number(item.price || 0).toFixed(2)}</p>
                <div className="mt-3 flex items-center space-x-2">
                  <label className="text-sm text-gray-600" htmlFor={`qty-${item.id}`}>Qty</label>
                  <input
                    id={`qty-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(item.id, Number(e.target.value))}
                    className="w-20 border rounded px-3 py-2"
                  />
                  <button onClick={() => handleRemove(item.id)} className="text-sm text-red-600 hover:text-red-700">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="p-6 flex justify-between items-center border-t">
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">Continue shopping</Link>
          <button onClick={handleClear} className="text-sm text-gray-500 hover:text-gray-700">Clear cart</button>
        </div>
      </div>

      <aside className="bg-white rounded-lg shadow p-6 h-fit">
        <h2 className="text-xl font-semibold mb-4">Order summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{totals.shipping ? `$${totals.shipping.toFixed(2)}` : 'Free'}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-3 mt-3">
            <span>Total</span>
            <span>${totals.total.toFixed(2)}</span>
          </div>
        </div>

        <button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold">Proceed to checkout</button>
        <p className="text-xs text-gray-500 mt-3">Checkout is a placeholder for now.</p>
      </aside>
    </div>
  )
}

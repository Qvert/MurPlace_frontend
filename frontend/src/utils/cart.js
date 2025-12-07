const CART_KEY = 'cartItems'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readCart() {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(item => ({ ...item, quantity: Math.max(1, Number(item.quantity) || 1) }))
  } catch (e) {
    return []
  }
}

function writeCart(items) {
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items))
      window.dispatchEvent(new Event('cart-updated'))
    } catch (e) {
      // ignore storage errors
    }
  }
  return items
}

export function getCart() {
  return readCart()
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
}

export function addToCart(product, quantity = 1) {
  if (!product || product.id === undefined || product.id === null) return readCart()
  const cart = readCart()
  const existingIdx = cart.findIndex(i => String(i.id) === String(product.id))
  if (existingIdx >= 0) {
    cart[existingIdx].quantity = (Number(cart[existingIdx].quantity) || 0) + quantity
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: quantity || 1
    })
  }
  return writeCart(cart)
}

export function updateCartItemQuantity(id, quantity) {
  const cart = readCart()
  const idx = cart.findIndex(i => String(i.id) === String(id))
  if (idx === -1) return cart
  const qty = Number(quantity)
  if (Number.isNaN(qty) || qty <= 0) {
    cart.splice(idx, 1)
  } else {
    cart[idx].quantity = qty
  }
  return writeCart(cart)
}

export function removeFromCart(id) {
  const cart = readCart().filter(i => String(i.id) !== String(id))
  return writeCart(cart)
}

export function clearCart() {
  return writeCart([])
}

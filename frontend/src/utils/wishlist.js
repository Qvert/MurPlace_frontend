const WISHLIST_KEY = 'wishlistItems'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readWishlist() {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

function writeWishlist(items) {
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items))
      window.dispatchEvent(new Event('wishlist-updated'))
    } catch (e) {
      // ignore storage errors
    }
  }
  return items
}

export function getWishlist() {
  return readWishlist()
}

export function getWishlistCount() {
  return readWishlist().length
}

export function isInWishlist(id) {
  return readWishlist().some(item => String(item.id) === String(id))
}

export function addToWishlist(product) {
  if (!product || product.id === undefined || product.id === null) return readWishlist()
  const wishlist = readWishlist()
  const exists = wishlist.some(item => String(item.id) === String(product.id))
  if (exists) return wishlist

  wishlist.push({
    id: product.id,
    name: product.name,
    image_url: product.image_url,
    description: product.description,
    price: product.price,
    price_usd: product.price_usd ?? product.usd_price ?? product.priceUsd,
    price_rub: product.price_rub ?? product.rub_price ?? product.priceRub,
    createdAt: Date.now()
  })

  return writeWishlist(wishlist)
}

export function removeFromWishlist(id) {
  const wishlist = readWishlist().filter(item => String(item.id) !== String(id))
  return writeWishlist(wishlist)
}

export function toggleWishlist(product) {
  if (!product || product.id === undefined || product.id === null) return readWishlist()
  if (isInWishlist(product.id)) {
    return removeFromWishlist(product.id)
  }
  return addToWishlist(product)
}

export function clearWishlist() {
  return writeWishlist([])
}

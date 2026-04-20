const REVIEWS_KEY = 'productReviews'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStore() {
  if (!canUseStorage()) return {}
  try {
    const raw = window.localStorage.getItem(REVIEWS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (e) {
    return {}
  }
}

function writeStore(store) {
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(store))
      window.dispatchEvent(new Event('reviews-updated'))
    } catch (e) {
      // ignore storage errors
    }
  }
  return store
}

function toSafeRating(value) {
  const rating = Math.round(Number(value))
  if (!Number.isFinite(rating)) return 5
  return Math.max(1, Math.min(5, rating))
}

export function getReviewsByProduct(productId) {
  const store = readStore()
  const list = store[String(productId)]
  if (!Array.isArray(list)) return []
  return list.slice().sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
}

export function addReview(productId, review) {
  if (!productId) return []

  const store = readStore()
  const key = String(productId)
  const list = Array.isArray(store[key]) ? store[key].slice() : []

  const nextReview = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author: String(review?.author || '').trim() || 'Anonymous',
    rating: toSafeRating(review?.rating),
    comment: String(review?.comment || '').trim(),
    createdAt: Date.now()
  }

  if (!nextReview.comment) return getReviewsByProduct(productId)

  list.unshift(nextReview)
  store[key] = list
  writeStore(store)
  return getReviewsByProduct(productId)
}

export function getAverageRating(productId) {
  const reviews = getReviewsByProduct(productId)
  if (!reviews.length) return 0
  const total = reviews.reduce((sum, review) => sum + toSafeRating(review.rating), 0)
  return total / reviews.length
}

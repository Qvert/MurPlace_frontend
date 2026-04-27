import { STORAGE_EVENTS } from '../constants/storageEvents'
import api from '../services/api'

const REVIEWS_KEY = 'productReviews'
const REVIEWS_GET_ENDPOINTS = [
  (productId) => `/api/products/${encodeURIComponent(productId)}/reviews/`,
  (productId) => `/api/reviews/?product=${encodeURIComponent(productId)}`
]
const REVIEWS_POST_ENDPOINTS = [
  {
    buildUrl: (productId) => `/api/products/${encodeURIComponent(productId)}/reviews/`,
    buildPayload: (productId, review) => ({
      author: review.author,
      rating: review.rating,
      comment: review.comment
    })
  },
  {
    buildUrl: () => '/api/reviews/',
    buildPayload: (productId, review) => ({
      product: productId,
      author: review.author,
      rating: review.rating,
      comment: review.comment
    })
  }
]

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
      window.dispatchEvent(new Event(STORAGE_EVENTS.REVIEWS_UPDATED))
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

function toTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Date.parse(String(value || ''))
  return Number.isFinite(parsed) ? parsed : Date.now()
}

function normalizeReview(item, index = 0) {
  const createdAt = toTimestamp(item?.createdAt ?? item?.created_at ?? item?.created)
  const comment = String(item?.comment ?? item?.text ?? '').trim()

  return {
    id: String(item?.id ?? `${createdAt}-${index}`),
    author: String(item?.author ?? item?.name ?? item?.user_name ?? '').trim() || 'Anonymous',
    rating: toSafeRating(item?.rating ?? item?.stars),
    comment,
    createdAt
  }
}

function normalizeReviewList(payload) {
  const maybeList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.reviews)
        ? payload.reviews
        : []

  return maybeList
    .map((item, index) => normalizeReview(item, index))
    .filter(review => Boolean(review.comment))
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
}

function getCachedReviews(productId) {
  const store = readStore()
  const list = store[String(productId)]
  if (!Array.isArray(list)) return []
  return list.slice().sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
}

function saveCachedReviews(productId, reviews) {
  const store = readStore()
  store[String(productId)] = Array.isArray(reviews) ? reviews.slice() : []
  writeStore(store)
}

async function loadReviewsFromBackend(productId) {
  for (const endpointBuilder of REVIEWS_GET_ENDPOINTS) {
    try {
      const response = await api.get(endpointBuilder(productId))
      return normalizeReviewList(response?.data)
    } catch (error) {
      const status = error?.response?.status
      if (status !== 404 && status !== 405) {
        // keep trying fallback endpoints and fallback cache
      }
    }
  }

  return null
}

async function postReviewToBackend(productId, review) {
  for (const endpoint of REVIEWS_POST_ENDPOINTS) {
    try {
      await api.post(endpoint.buildUrl(productId), endpoint.buildPayload(productId, review))
      return true
    } catch (error) {
      const status = error?.response?.status
      if (status !== 404 && status !== 405) {
        // keep trying fallback endpoint before using cache-only mode
      }
    }
  }

  return false
}

export async function getReviewsByProduct(productId) {
  if (!productId) return []

  const backendReviews = await loadReviewsFromBackend(productId)
  if (Array.isArray(backendReviews)) {
    saveCachedReviews(productId, backendReviews)
    return backendReviews
  }

  return getCachedReviews(productId)
}

export async function addReview(productId, review) {
  if (!productId) return []

  const nextReview = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author: String(review?.author || '').trim() || 'Anonymous',
    rating: toSafeRating(review?.rating),
    comment: String(review?.comment || '').trim(),
    createdAt: Date.now()
  }

  if (!nextReview.comment) return getReviewsByProduct(productId)

  const wasPostedToBackend = await postReviewToBackend(productId, nextReview)
  if (wasPostedToBackend) {
    const backendReviews = await getReviewsByProduct(productId)
    if (Array.isArray(backendReviews)) return backendReviews
  }

  const store = readStore()
  const key = String(productId)
  const list = Array.isArray(store[key]) ? store[key].slice() : []
  list.unshift(nextReview)
  store[key] = list
  writeStore(store)
  return getCachedReviews(productId)
}

export function getAverageRating(reviews) {
  if (!Array.isArray(reviews)) return 0
  if (!reviews.length) return 0
  const total = reviews.reduce((sum, review) => sum + toSafeRating(review.rating), 0)
  return total / reviews.length
}

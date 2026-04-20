import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { addToCart } from '../utils/cart'
import { addReview, getAverageRating, getReviewsByProduct } from '../utils/reviews'
import { isInWishlist, toggleWishlist } from '../utils/wishlist'
import { useLang } from '../i18n.jsx' 
import { formatLocalizedPrice, getLocalizedPriceValue } from '../utils/currency'
import useStorageSync from '../hooks/useStorageSync'
import { STORAGE_EVENTS } from '../constants/storageEvents'

export default function ProductDetail(){
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [reviews, setReviews] = useState([])
  const [formError, setFormError] = useState(null)
  const [reviewForm, setReviewForm] = useState({ author: '', rating: 5, comment: '' })
  const { t, lang } = useLang()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(`/api/products/${id}/`)
      .then(res => { if (!res.ok) throw new Error('Failed to fetch product'); return res.json() })
      .then(data => {
        if (!mounted) return
        const nextProduct = data.product || data
        setProduct(nextProduct)
        setInWishlist(isInWishlist(nextProduct.id))
        setReviews(getReviewsByProduct(nextProduct.id))
      })
      .catch(err => { if (mounted) setError(err.message) })
      .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [id])

  useStorageSync(
    () => {
      if (product?.id === undefined || product?.id === null) return
      setInWishlist(isInWishlist(product.id))
    },
    {
      eventNames: [STORAGE_EVENTS.WISHLIST_UPDATED],
      deps: [product?.id]
    }
  )

  useStorageSync(
    () => {
      if (product?.id === undefined || product?.id === null) return
      setReviews(getReviewsByProduct(product.id))
    },
    {
      eventNames: [STORAGE_EVENTS.REVIEWS_UPDATED],
      deps: [product?.id]
    }
  )

  function renderStars(value) {
    const rating = Math.max(0, Math.min(5, Math.round(Number(value) || 0)))
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  function handleReviewSubmit(e) {
    e.preventDefault()
    setFormError(null)

    if (!reviewForm.comment.trim()) {
      setFormError(t('reviews.error_comment_required'))
      return
    }

    const next = addReview(product.id, reviewForm)
    setReviews(next)
    setReviewForm(prev => ({ ...prev, comment: '' }))
  }

  const averageRating = getAverageRating(product?.id)

  if (loading) return <div className="text-center">{t('loading')}</div>
  if (error) return <div className="text-red-500">{t('error_prefix')} {error}</div> 
  if (!product) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img src={product.image_url} alt={product.name} className="w-full h-80 object-cover" />
          </div>
          <div className="p-6 md:w-1/2 flex flex-col">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-sm mb-3 text-yellow-600">
              {renderStars(averageRating)}
              <span className="ml-2 text-gray-600">{reviews.length} {t('reviews.count')}</span>
            </p>
            <p className="text-gray-600 mb-4">{product.description}</p>
            {getLocalizedPriceValue(product, lang) != null && (
              <p className="text-indigo-600 font-bold text-3xl mb-4">
                {formatLocalizedPrice(product, lang)}
              </p>
            )}
            <div className="mt-auto flex flex-wrap items-center gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
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
                  setTimeout(() => setAdded(false), 1200)
                }}
              >
                {added ? t('added') : t('add_to_cart')}
              </button>
              <button
                className={`py-2 px-4 rounded border ${inWishlist ? 'bg-red-50 text-red-600 border-red-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                onClick={() => {
                  toggleWishlist({
                    id: product.id,
                    name: product.name,
                    image_url: product.image_url,
                    description: product.description,
                    price: product.price,
                    price_usd: product.price_usd ?? product.usd_price ?? product.priceUsd,
                    price_rub: product.price_rub ?? product.rub_price ?? product.priceRub
                  })
                  setInWishlist(prev => !prev)
                }}
              >
                {inWishlist ? t('wishlist.remove') : t('wishlist.add')}
              </button>
              <Link to="/" className="text-sm text-gray-600 hover:text-indigo-600">{t('back_to_home')}</Link>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">{t('reviews.title')}</h2>

        <form onSubmit={handleReviewSubmit} className="mb-6 border-b pb-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t('reviews.name')}</label>
              <input
                className="w-full py-2 px-3 border rounded-lg"
                value={reviewForm.author}
                onChange={e => setReviewForm(prev => ({ ...prev, author: e.target.value }))}
                placeholder={t('reviews.name_placeholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('reviews.rating')}</label>
              <select
                className="w-full py-2 px-3 border rounded-lg"
                value={reviewForm.rating}
                onChange={e => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map(star => (
                  <option key={star} value={star}>{star} - {renderStars(star)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('reviews.comment')}</label>
            <textarea
              className="w-full py-2 px-3 border rounded-lg min-h-24"
              value={reviewForm.comment}
              onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
              placeholder={t('reviews.comment_placeholder')}
            />
          </div>
          {formError && <p className="text-red-600 text-sm mt-2">{formError}</p>}
          <button type="submit" className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">
            {t('reviews.submit')}
          </button>
        </form>

        {!reviews.length ? (
          <p className="text-gray-600">{t('reviews.empty')}</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map(review => (
              <li key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-yellow-600">{renderStars(review.rating)}</p>
                </div>
                <p className="text-sm text-gray-500 mb-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-700">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

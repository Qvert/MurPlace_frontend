import React, { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { fetchProductsBySearch } from '../utils/api'
import { addToCart } from '../utils/cart'
import { useLang } from '../i18n.jsx' 

const ITEMS_PER_PAGE = 20

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const offset = parseInt(searchParams.get('offset') || '0')
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [addedId, setAddedId] = useState(null)
  const { t } = useLang()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    async function load() {
      if (!query.trim()) {
        if (mounted) {
          setError('Please enter a search term')
          setProducts([])
          setTotal(0)
          setLoading(false)
        }
        return
      }

      try {
        const result = await fetchProductsBySearch(query, offset, ITEMS_PER_PAGE)
        if (mounted) {
          setProducts(result.products)
          setTotal(result.total)
        }
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [query, offset])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1

  const handleNextPage = () => {
    const newOffset = offset + ITEMS_PER_PAGE
    navigate(`/search?q=${encodeURIComponent(query)}&offset=${newOffset}`)
  }

  const handlePrevPage = () => {
    const newOffset = Math.max(0, offset - ITEMS_PER_PAGE)
    navigate(`/search?q=${encodeURIComponent(query)}&offset=${newOffset}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('search.title')}</h1>
          {query && <p className="text-gray-600 mt-2">{t('search.showing_for').replace('{q}', query)}</p>}
        </div>
        <div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
            {t('pagination.prev')}
          </button>
        </div>
      </div> 

      {loading && <div className="text-center py-8">{t('loading_products')}</div>}
      {error && <div className="text-red-500 py-8">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-8 text-gray-500">{t('search.no_results')}</div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="text-sm text-gray-600 mb-4">
            {t('search.found').replace('{n}', total).replace('{plural}', total !== 1 ? 's' : '')}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {products.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-[230px] mx-auto flex flex-col h-[260px] border border-gray-100"
              >
                <Link to={`/product/${p.id}`} className="no-underline text-current block flex-1 flex flex-col">
                  <img src={p.image_url} alt={p.name} className="w-full h-[120px] object-cover" />
                  <div className="p-3 flex-grow flex flex-col">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{p.name}</h3>
                    <p className="text-gray-600 text-xs mb-2 flex-grow line-clamp-2">{p.description}</p>
                  </div>
                </Link>
                <div className="p-3 pt-0">
                  <button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-sm transition-colors"
                    onClick={() => {
                      addToCart({ id: p.id, name: p.name, image_url: p.image_url, price: p.price }, 1)
                      setAddedId(p.id)
                      setTimeout(() => setAddedId(null), 1200)
                    }}
                  >
                    {addedId === p.id ? 'Added!' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

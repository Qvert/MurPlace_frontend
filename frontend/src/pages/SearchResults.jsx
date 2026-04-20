import React, { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { fetchProductsBySearch } from '../utils/api'
import { addToCart } from '../utils/cart'
import { useLang } from '../i18n.jsx' 
import { formatLocalizedPrice } from '../utils/currency'

const ITEMS_PER_PAGE = 12

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t, lang } = useLang()

  // Параметры из URL
  const query = searchParams.get('q') || ''
  const offset = parseInt(searchParams.get('offset') || '0')

  // Состояния
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [addedId, setAddedId] = useState(null)

  // Эффект для загрузки данных
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    async function load() {
      if (!query.trim()) {
        setLoading(false)
        return
      }

      try {
        const result = await fetchProductsBySearch(query, offset, ITEMS_PER_PAGE)
        if (mounted) {
          // Убеждаемся, что берем данные из правильных полей объекта
          setProducts(result.products || [])
          setTotal(result.total || 0)
          // Прокрутка вверх при смене страницы
          window.scrollTo({ top: 0, behavior: 'smooth' })
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

  // Расчет пагинации
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1

  const handlePageChange = (newOffset) => {
    navigate(`/search?q=${encodeURIComponent(query)}&offset=${newOffset}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Шапка поиска */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('search.title')}</h1>
          {query && (
            <p className="text-gray-600 mt-2">
              {t('search.showing_for').replace('{q}', query)}
              <span className="ml-2 text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                {total} {t('items_found')}
              </span>
            </p>
          )}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="w-fit px-5 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-sm font-medium"
        >
          {t('back')}
        </button>
      </div>

      {/* Состояния загрузки и ошибок */}
      {loading && <div className="text-center py-20 text-indigo-600 font-medium">{t('loading_products')}</div>}
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{t('error_prefix')} {error}</div>}

      {/* Результаты поиска */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 text-xl">{t('search.no_results')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {products.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-[380px] border border-gray-100 group"
                >
                  <Link to={`/product/${p.id}`} className="flex-1 flex flex-col no-underline">
                    <div className="relative h-44 overflow-hidden bg-gray-50">
                      <img
                        src={p.image_url || "https://via.placeholder.com/300x200?text=No+Photo"}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 h-10">{p.name}</h3>
                      <p className="text-gray-500 text-xs line-clamp-2 h-8 mb-3">{p.description}</p>
                      <div className="mt-auto">
                        <span className="text-indigo-600 font-bold text-xl">{formatLocalizedPrice(p, lang)}</span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4 pt-0">
                    <button
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                        addedId === p.id
                          ? 'bg-green-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                      onClick={() => {
                        addToCart({
                          ...p,
                          price_usd: p.price_usd ?? p.usd_price ?? p.priceUsd,
                          price_rub: p.price_rub ?? p.rub_price ?? p.priceRub
                        }, 1)
                        setAddedId(p.id)
                        setTimeout(() => setAddedId(null), 1500)
                      }}
                    >
                      {addedId === p.id ? `✓ ${t('added')}` : t('add_to_cart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mb-12">
              <button
                onClick={() => handlePageChange(offset - ITEMS_PER_PAGE)}
                disabled={currentPage === 1}
                className="p-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Логика отображения только ближайших страниц, если их много
                  if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(i * ITEMS_PER_PAGE)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(offset + ITEMS_PER_PAGE)}
                disabled={currentPage === totalPages}
                className="p-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
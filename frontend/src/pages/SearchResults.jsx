import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { fetchProductsBySearch } from '../utils/api'
import { useLang } from '../i18n.jsx' 
import ProductCard from '../components/ProductCard'
import AsyncState from '../components/AsyncState'
import EmptyStateCard from '../components/EmptyStateCard'
import Pagination from '../components/Pagination'

const ITEMS_PER_PAGE = 12

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useLang()

  // Параметры из URL
  const query = searchParams.get('q') || ''
  const offset = parseInt(searchParams.get('offset') || '0')

  // Состояния
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

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

  const handlePageChange = (page) => {
    const safePage = Math.max(1, page)
    const nextOffset = (safePage - 1) * ITEMS_PER_PAGE
    navigate(`/search?q=${encodeURIComponent(query)}&offset=${nextOffset}`)
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
      <AsyncState
        loading={loading}
        error={error}
        loadingText={t('loading_products')}
        errorPrefix={t('error_prefix')}
        loadingClassName="text-center py-20 text-indigo-600 font-medium"
        errorClassName="bg-red-50 text-red-600 p-4 rounded-lg mb-6"
      />

      {/* Результаты поиска */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <EmptyStateCard
              title={t('search.no_results')}
              icon="🔍"
              className="text-center py-20"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {products.map(p => (
                <ProductCard key={p.id} product={p} variant="search" />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPageNumbers
            maxVisiblePages={5}
            prevLabel="←"
            nextLabel="→"
          />
        </>
      )}
    </div>
  )
}
import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchProductsByCategory } from '../utils/api'
import { useLang } from '../i18n.jsx'
import ProductCard from '../components/ProductCard'
import AsyncState from '../components/AsyncState'
import Pagination from '../components/Pagination'

export default function Products() {
  const { category } = useParams()
  const [searchParams] = useSearchParams()
  const subcategory = searchParams.get('subcategory') || ''
  const navigate = useNavigate()
  const { t } = useLang()
  const previousCategoryRef = useRef(category)

  // --- Состояния для пагинации ---
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentPage, setCurrentPage] = useState(1) // Текущая страница
  const [totalPages, setTotalPages] = useState(1)   // Всего страниц
  const pageSize = 12; // Должно совпадать с PAGE_SIZE в Django

  useEffect(() => {
    // Avoid fetching an outdated page when category changes.
    if (previousCategoryRef.current !== category) {
      previousCategoryRef.current = category
      setCurrentPage(1)
      return
    }

    let mounted = true
    setLoading(true)
    setError(null)

    async function load() {
      try {
        // Передаем категорию, страницу и подкатегорию (если есть).
        const data = await fetchProductsByCategory(category, currentPage, subcategory)

        if (mounted) {
          const nextProducts = Array.isArray(data?.results)
            ? data.results
            : (Array.isArray(data) ? data : [])
          setProducts(nextProducts)

          const count = Number(data?.count)
          if (Number.isFinite(count) && count >= 0) {
            setTotalPages(Math.max(1, Math.ceil(count / pageSize)))
          } else {
            setTotalPages(1)
          }
        }
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [category, currentPage, subcategory]) // Перезагружаем при смене категории, страницы или подкатегории

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {subcategory || (category ? category.charAt(0).toUpperCase() + category.slice(1) : t('search.title'))}
        </h1>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
            {t('back')}
        </button>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        loadingText={t('loading_products')}
        errorPrefix={t('error_prefix')}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(p => (
          <ProductCard key={p.id} product={p} variant="catalog" />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        prevLabel={t('pagination.prev')}
        nextLabel={t('pagination.next')}
      />
    </div>
  )
}
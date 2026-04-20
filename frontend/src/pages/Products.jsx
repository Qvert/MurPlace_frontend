import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { fetchProductsByCategory } from '../utils/api'
import { addToCart } from '../utils/cart'
import { useLang } from '../i18n.jsx'

export default function Products() {
  const { category } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()

  // --- Состояния для пагинации ---
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedId, setAddedId] = useState(null)

  const [currentPage, setCurrentPage] = useState(1) // Текущая страница
  const [totalPages, setTotalPages] = useState(1)   // Всего страниц
  const pageSize = 12; // Должно совпадать с PAGE_SIZE в Django

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    async function load() {
      try {
        // Передаем категорию И текущую страницу
        const data = await fetchProductsByCategory(category, currentPage)

        if (mounted) {
          // Если Django возвращает стандартный PageNumberPagination,
          // данные будут в data.results, а общее кол-во в data.count
          setProducts(data.results || data)

          if (data.count) {
            setTotalPages(Math.ceil(data.count / pageSize))
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
  }, [category, currentPage]) // Перезагружаем, если изменилась категория ИЛИ страница

  // Сброс на 1 страницу при смене категории
  useEffect(() => {
    setCurrentPage(1)
  }, [category])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : t('search.title')}
        </h1>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
            {t('back')}
        </button>
      </div>

      {loading && <div className="text-center py-10">{t('loading_products')}</div>}
      {error && <div className="text-red-500 mb-4">{t('error_prefix')} {error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden w-full flex flex-col h-[400px] border border-gray-100">
            <Link to={`/product/${p.id}`} className="flex-1 flex flex-col no-underline text-current">
              <div className="w-full h-40 bg-gray-50 overflow-hidden">
                <img
                  src={p.image_url || "https://via.placeholder.com/300x200?text=No+Photo"}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-sm text-gray-800 mb-1 line-clamp-2 h-10">{p.name}</h3>
                <p className="text-gray-500 text-xs mb-2 line-clamp-2 h-8">{p.description}</p>
                <div className="mt-auto">
                  <p className="text-indigo-600 font-bold text-lg">
                    ${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}
                  </p>
                </div>
              </div>
            </Link>
            <div className="p-4 pt-0">
              <button
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  addedId === p.id ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                onClick={() => {
                  addToCart({ id: p.id, name: p.name, image_url: p.image_url, price: p.price }, 1)
                  setAddedId(p.id)
                  setTimeout(() => setAddedId(null), 1200)
                }}
              >
                {addedId === p.id ? `✓ ${t('added')}` : t('add_to_cart')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- БЛОК ПАГИНАЦИИ --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className={`px-4 py-2 rounded-lg border ${currentPage === 1 ? 'text-gray-400 border-gray-200' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-50'}`}
          >
            {t('pagination.prev')}
          </button>

          <span className="font-medium">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className={`px-4 py-2 rounded-lg border ${currentPage === totalPages ? 'text-gray-400 border-gray-200' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-50'}`}
          >
            {t('pagination.next')}
          </button>
        </div>
      )}
    </div>
  )
}
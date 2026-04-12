import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { fetchProductsByCategory } from '../utils/api'
import { addToCart } from '../utils/cart'
import { useLang } from '../i18n.jsx' 

export default function Products() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedId, setAddedId] = useState(null)
  const { t } = useLang()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const prods = await fetchProductsByCategory(category)
        if (mounted) setProducts(prods)
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [category])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{category ? category.charAt(0).toUpperCase() + category.slice(1) : t('search.title')}</h1>
        <div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 rounded">{t('pagination.prev')}</button>
        </div>
      </div>

      {loading && <div className="text-center">{t('loading_products')}</div>}
      {error && <div className="text-red-500">{t('error_prefix')} {error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden w-full flex flex-col h-[400px] border border-gray-100"
            >
              {/* Верхняя часть: Ссылка на товар (занимает всё свободное место) */}
              <Link to={`/product/${p.id}`} className="flex-1 flex flex-col no-underline text-current">

                {/* Контейнер для картинки */}
                <div className="w-full h-40 bg-gray-50 overflow-hidden">
                  <img
                    src={p.image_url || "https://via.placeholder.com/300x200?text=No+Photo"}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=No+Photo" }}
                  />
                </div>

                {/* Контентная часть */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-sm text-gray-800 mb-1 line-clamp-2 h-10">
                    {p.name}
                  </h3>

                  <p className="text-gray-500 text-xs mb-2 line-clamp-2 h-8">
                    {p.description}
                  </p>

                  <div className="mt-auto">
                    <p className="text-indigo-600 font-bold text-lg">
                      ${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Нижняя часть: Кнопка (всегда прижата к низу) */}
              <div className="p-4 pt-0">
                <button
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    addedId === p.id
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  onClick={() => {
                    addToCart({ id: p.id, name: p.name, image_url: p.image_url, price: p.price }, 1)
                    setAddedId(p.id)
                    setTimeout(() => setAddedId(null), 1200)
                  }}
                >
                  {addedId === p.id ? (
                    <span className="flex items-center justify-center">
                       ✓ {t('added')}
                    </span>
                  ) : t('add_to_cart')}
                </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}

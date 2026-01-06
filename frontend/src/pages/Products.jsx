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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                {p.price != null && (
                  <p className="text-indigo-600 font-bold text-lg mt-auto">
                    ${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}
                  </p>
                )}
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
                {addedId === p.id ? t('added') : t('add_to_cart')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

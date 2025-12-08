import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { fetchProductsByCategory } from '../utils/api'
import { addToCart } from '../utils/cart'

export default function Products() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedId, setAddedId] = useState(null)

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
        <h1 className="text-3xl font-bold">{category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Products'}</h1>
        <div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 rounded">Back</button>
        </div>
      </div>

      {loading && <div className="text-center">Loading products...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-xs mx-auto flex flex-col h-72">
            <Link to={`/product/${p.id}`} className="no-underline text-current block flex-1 flex flex-col">
              <img src={p.image_url} alt={p.name} className="w-full h-36 object-cover" />
              <div className="p-3 flex-grow flex flex-col">
                <h3 className="font-semibold text-md mb-1">{p.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex-grow line-clamp-2">{p.description}</p>
              </div>
            </Link>
            <div className="p-3 pt-0">
              <button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition-colors"
                onClick={() => {
                  addToCart({ id: p.id, name: p.name, image_url: p.image_url }, 1)
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
    </div>
  )
}

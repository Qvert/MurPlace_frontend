import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { addToCart } from '../utils/cart'

export default function ProductDetail(){
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/products/')
      .then(res => { if (!res.ok) throw new Error('Failed to fetch products'); return res.json() })
      .then(data => {
        if (!mounted) return
        const found = (data.products || []).find(p => String(p.id) === String(id))
        if (found) setProduct(found)
        else setError('Product not found')
      })
      .catch(err => { if (mounted) setError(err.message) })
      .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="text-center">Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!product) return null

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/2">
          <img src={product.image_url} alt={product.name} className="w-full h-80 object-cover" />
        </div>
        <div className="p-6 md:w-1/2 flex flex-col">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="mt-auto">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded mr-2"
              onClick={() => {
                addToCart({ id: product.id, name: product.name, image_url: product.image_url }, 1)
                setAdded(true)
                setTimeout(() => setAdded(false), 1200)
              }}
            >
              {added ? 'Added!' : 'Add to Cart'}
            </button>
            <Link to="/" className="text-sm text-gray-600 hover:text-indigo-600">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

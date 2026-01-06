import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n.jsx' 

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const navigate = useNavigate()
  const { t } = useLang()

  useEffect(() => {
    let mounted = true
    setLoading(true)

    // Try to fetch protobuf first, fallback to JSON
    async function fetchProducts(){
      try {
        const pbRes = await fetch('/api/products.pb')
        if (pbRes.ok) {
          const buffer = await pbRes.arrayBuffer()
          // dynamic import proto decoder
          const { decodeProductsBuffer } = await import('../utils/proto.js')
          const prods = await decodeProductsBuffer(buffer)
          if (mounted) setProducts(prods)
          return
        }
      } catch (e) {
        // ignore and fallback to JSON
      }

      // fallback to JSON
      try{
        const res = await fetch('/api/products/')
        if (!res.ok) throw new Error('Failed to fetch JSON')
        const data = await res.json()
        if (mounted) setProducts(data.products || [])
      } catch (err){
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProducts()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const handleThemeChange = () => {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored)
      }
    }
    window.addEventListener('storage', handleThemeChange)
    return () => window.removeEventListener('storage', handleThemeChange)
  }, [])

  return (
    <div>
      {/* Deals Carousel */}
      <section className="mb-12">
        <div className="relative rounded-xl overflow-hidden h-64">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
            <h2 className="text-4xl font-bold text-white">{t('hot_deals')}</h2>
          </div>
        </div>
      </section>

      {/* Pet Types Grid */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">{t('shop.by_pet')}</h2>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-wrap justify-between gap-4">
            {[
              { name: t('pet.Dogs'), img: '/static/dogs.png', imgDark: '/static/dogs_dark.png' },
              { name: t('pet.Cats'), img: '/static/cats.png', imgDark: '/static/cats_dark.png' },
              { name: t('pet.Fish'), img: '/static/fish.png', imgDark: '/static/fish_dark.png' },
              { name: t('pet.Reptiles'), img: '/static/reptiles.png', imgDark: '/static/reptiles_dark.png' },
              { name: t('pet.Birds'), img: '/static/birds.png', imgDark: '/static/birds_dark.png' }
            ].map(cat => (
              <button
                key={cat.name}
                onClick={() => navigate(`/products/${cat.name.toLowerCase()}`)}
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 w-full sm:w-auto text-left"
              >
                <img src={theme === 'dark' ? cat.imgDark : cat.img} alt={cat.name} className="w-16 h-16 rounded-full object-cover mr-4" />
                <span className="text-xl font-semibold">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Items - dynamic from API */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">{t('popular_items')}</h2>

        {loading && <div className="text-center">{t('loading_products')}</div>}
        {error && <div className="text-red-500">{t('error_prefix')} {error}</div>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map(p => (
            <Link key={p.id} to={`/product/${p.id}`} className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-xs mx-auto flex flex-col h-64 no-underline text-current">
              <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover" />
              <div className="p-3 flex-grow flex flex-col">
                <h3 className="font-semibold text-md mb-1">{p.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex-grow">{p.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

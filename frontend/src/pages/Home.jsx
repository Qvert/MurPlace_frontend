import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n.jsx' 
import { mockDealsCarousel, mockPopularProducts } from '../utils/mockProducts.js' 

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMock, setIsMock] = useState(false)
  const [deals, setDeals] = useState([])
  const [dealsLoading, setDealsLoading] = useState(true)
  const [activeDeal, setActiveDeal] = useState(0)
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
          if (mounted) {
            setProducts(prods)
            setIsMock(false)
          }
          return
        }
      } catch (e) {
        // ignore and fallback to JSON
      }

      // fallback to JSON
      try{
        const res = await fetch('/api/products/')
        if (!res.ok) {
          // Non-OK responses -> use mock data silently (avoid surfacing 'Failed to fetch JSON' to the UI)
          if (mounted) {
            setProducts(mockPopularProducts)
            setIsMock(true)
          }
        } else {
          const data = await res.json()
          const finalProducts = data.products || []
          if (mounted) {
            if (finalProducts.length === 0) {
              // Use a small mocked list when the API returns nothing
              setProducts(mockPopularProducts)
              setIsMock(true)
            } else {
              setProducts(finalProducts)
              setIsMock(false)
            }
          }
        }
      } catch (err){
        if (mounted) {
          // If the API call fails entirely, show the mock products to keep the UI useful
          setProducts(mockPopularProducts)
          setIsMock(true)
          // Don't show transient fetch errors in UI; log instead
          setError(null)
          console.debug('Products fetch failed:', err)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProducts()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true

    async function fetchDeals() {
      try {
        setDealsLoading(true)
        const res = await fetch('/api/dealscarousel')
        if (!res.ok) {
          if (mounted) {
            setDeals(mockDealsCarousel)
            setActiveDeal(0)
          }
          return
        }

        const data = await res.json()
        const dealCards = Array.isArray(data)
          ? data
          : Array.isArray(data?.deals)
            ? data.deals
            : Array.isArray(data?.cards)
              ? data.cards
              : []
        const finalDeals = dealCards.length > 0 ? dealCards : mockDealsCarousel

        if (mounted) {
          setDeals(finalDeals)
          setActiveDeal(0)
        }
      } catch (err) {
        if (mounted) {
          setDeals(mockDealsCarousel)
          setActiveDeal(0)
          console.debug('Deals carousel fetch failed:', err)
        }
      } finally {
        if (mounted) setDealsLoading(false)
      }
    }

    fetchDeals()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (deals.length <= 1) return

    const timer = setInterval(() => {
      setActiveDeal(current => (current + 1) % deals.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [deals.length])

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

  const showPrevDeal = () => {
    if (deals.length <= 1) return
    setActiveDeal(current => (current - 1 + deals.length) % deals.length)
  }

  const showNextDeal = () => {
    if (deals.length <= 1) return
    setActiveDeal(current => (current + 1) % deals.length)
  }

  return (
    <div>
      {/* Deals Carousel */}
      <section className="mb-12">
        <div className="relative rounded-xl overflow-hidden bg-white shadow-md h-64">
          {dealsLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-lg font-semibold">{t('loading_products')}</span>
            </div>
          )}

          {!dealsLoading && deals.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <h2 className="text-4xl font-bold">{t('hot_deals')}</h2>
            </div>
          )}

          {!dealsLoading && deals.length > 0 && deals.map((deal, index) => {
            const title = deal.title || deal.name || t('hot_deals')
            const description = deal.subtitle || deal.description || ''
            const imageUrl = deal.image_url || deal.imageUrl || deal.image || ''
            const ctaLabel = deal.cta_label || deal.ctaLabel || 'Shop now'
            const linkUrl = deal.link || deal.url || deal.href

            return (
              <div
                key={deal.id || `${title}-${index}`}
                className={`absolute inset-0 transition-opacity duration-500 ${index === activeDeal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/20" />
                <div className="relative z-10 h-full w-full p-6 flex flex-col justify-center text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
                  {description && <p className="text-sm md:text-base max-w-lg mb-4">{description}</p>}
                  {linkUrl && (
                    <a
                      href={linkUrl}
                      className="inline-flex w-fit items-center px-4 py-2 rounded-md bg-white text-gray-900 font-semibold no-underline"
                    >
                      {ctaLabel}
                    </a>
                  )}
                </div>
              </div>
            )
          })}

          {!dealsLoading && deals.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevDeal}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9"
                aria-label="Previous deal"
              >
                &#8249;
              </button>
              <button
                type="button"
                onClick={showNextDeal}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9"
                aria-label="Next deal"
              >
                &#8250;
              </button>
              <div className="absolute z-20 bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {deals.map((deal, index) => (
                  <button
                    key={`dot-${deal.id || index}`}
                    type="button"
                    onClick={() => setActiveDeal(index)}
                    className={`w-2.5 h-2.5 rounded-full ${index === activeDeal ? 'bg-white' : 'bg-white/50'}`}
                    aria-label={`Go to deal ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
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
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 w-full sm:w-auto text-left ${
                  theme === 'dark' ? 'hover:bg-indigo-00' : 'hover:bg-indigo-100'
                }`}
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
        <h2 className="text-3xl font-bold mb-6 flex items-baseline">
          {t('popular_items')}
          {isMock && <span className="ml-3 text-sm text-gray-500 italic">Mock data</span>}
        </h2>

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

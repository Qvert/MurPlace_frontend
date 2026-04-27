import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n.jsx' 
import { mockDealsCarousel, mockPopularProducts } from '../utils/mockProducts.js' 
import { fetchPopularItems } from '../utils/api'
import ProductCard from '../components/ProductCard'
import DealsCarousel from '../components/DealsCarousel'
import PetCategoryGrid from '../components/PetCategoryGrid'
import AsyncState from '../components/AsyncState'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMock, setIsMock] = useState(false)
  const [deals, setDeals] = useState([])
  const [dealsLoading, setDealsLoading] = useState(true)
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
        const finalProducts = await fetchPopularItems()
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
        }
      } catch (err) {
        if (mounted) {
          setDeals(mockDealsCarousel)
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
      <DealsCarousel deals={deals} dealsLoading={dealsLoading} t={t} />

      <PetCategoryGrid
        theme={theme}
        t={t}
        onSelectCategory={slug => navigate(`/products/${slug}`)}
      />

      {/* Popular Items - dynamic from API */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-baseline">
          {t('popular_items')}
          {isMock && <span className="ml-3 text-sm text-gray-500 italic">Mock data</span>}
        </h2>

        <AsyncState
          loading={loading}
          error={error}
          loadingText={t('loading_products')}
          errorPrefix={t('error_prefix')}
          loadingClassName="text-center"
          errorClassName="text-red-500"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p.id} className="w-full max-w-xs mx-auto">
              <ProductCard product={p} variant="home" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

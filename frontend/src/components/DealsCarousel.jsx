import React, { useEffect, useState } from 'react'

export default function DealsCarousel({ deals, dealsLoading, t }) {
  const [activeDeal, setActiveDeal] = useState(0)

  const BASE_URL = 'http://127.0.0.1:8000'

  useEffect(() => {
    setActiveDeal(0)
  }, [deals])

  useEffect(() => {
    if (deals.length <= 1) return

    const timer = setInterval(() => {
      setActiveDeal(current => (current + 1) % deals.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [deals.length])

  const showPrevDeal = () => {
    if (deals.length <= 1) return
    setActiveDeal(current => (current - 1 + deals.length) % deals.length)
  }

  const showNextDeal = () => {
    if (deals.length <= 1) return
    setActiveDeal(current => (current + 1) % deals.length)
  }

  return (
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
          const rawImage = deal.image_url || deal.imageUrl || deal.image || ''
          const imageUrl = (rawImage && !rawImage.startsWith('http'))
            ? `${BASE_URL}${rawImage}`
            : rawImage
          const ctaLabel = deal.cta_label || deal.ctaLabel || t('deals.shop_now')
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
  )
}

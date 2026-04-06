import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n.jsx' 

export default function Footer(){
  const { t } = useLang()
  const [theme, setTheme] = useState(() =>
    document.body.classList.contains('theme-dark') ? 'dark' : 'light'
  )

  useEffect(() => {
    const syncTheme = () => {
      setTheme(document.body.classList.contains('theme-dark') ? 'dark' : 'light')
    }

    syncTheme()
    const observer = new MutationObserver(syncTheme)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  const isDark = theme === 'dark'

  return (
    <footer
      className={`site-footer py-3 mt-6 ${isDark ? 'bg-white text-white' : 'bg-white text-black'}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <span className="site-title font-bold">{t('app.title')}</span>
          <div className="flex gap-6">
            <Link to="/all-products" className="hover:text-indigo-300">{t('footer.all_products')}</Link>
            <Link to="/veterinary" className="hover:text-indigo-300">{t('footer.vet')}</Link>
            <Link to="/about" className="hover:text-indigo-300">{t('footer.about')}</Link>
            <Link to="/contact" className="hover:text-indigo-300">{t('footer.contact')}</Link>
          </div>
          <span className="text-gray-400 text-xs">&copy; 2026 {t('app.title')}</span>
        </div>
      </div>
    </footer>
  )
}

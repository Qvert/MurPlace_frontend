import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCartCount } from '../utils/cart'
import { useLang } from '../i18n.jsx'

const categoryData = {
  Cats: ['Cat Toys', 'Cat Food', 'Cat Litter', 'Cat Beds', 'Cat Scratchers'],
  Dogs: ['Dog Toys', 'Dog Food', 'Dog Beds', 'Dog Grooming', 'Dog Collars'],
  Rodents: ['Rodent Food', 'Rodent Cages', 'Rodent Toys', 'Bedding', 'Water Bottles'],
  Fish: ['Fish Food', 'Fish Tanks', 'Fish Filters', 'Aquatic Plants', 'Fish Decorations'],
  Reptiles: ['Reptile Food', 'Reptile Tanks', 'Heating Lamps', 'Substrate', 'Hides'],
  Birds: ['Bird Food', 'Bird Cages', 'Bird Toys', 'Perches', 'Bird Treats'],
  Vet: ['Medications', 'Supplements', 'First Aid', 'Health Monitors'],
  Groomer: ['Shampoos', 'Brushes', 'Clippers', 'Nail Care', 'Drying Tools']
}

export default function Header(){
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const searchInputRef = useRef(null)
  const languageMenuRef = useRef(null)
  const { lang, setLang, t } = useLang()
  const [langSavedMsg, setLangSavedMsg] = useState('')
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)

  useEffect(() => {
    const onSaved = (e) => {
      const ok = e.detail?.success
      const l = e.detail?.lang
      setLangSavedMsg(ok ? `${l.toUpperCase()} saved` : `Failed to save ${l}`)
      setTimeout(() => setLangSavedMsg(''), 2000)
    }
    window.addEventListener('lang-saved', onSaved)
    return () => window.removeEventListener('lang-saved', onSaved)
  }, [])

  useEffect(() => {
    const sync = () => setCartCount(getCartCount())
    sync()
    window.addEventListener('cart-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('cart-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(!!localStorage.getItem('token'))
    checkAuth()
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('theme-dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target)) {
        setIsLanguageMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', closeOnOutsideClick)
    window.addEventListener('touchstart', closeOnOutsideClick)
    return () => {
      window.removeEventListener('mousedown', closeOnOutsideClick)
      window.removeEventListener('touchstart', closeOnOutsideClick)
    }
  }, [])

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) {
      return
    }
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}&offset=0`)
  }

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')



  return (
    <header className="site-header bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={theme === 'dark' ? '/static/logo_dark.png' : '/static/logo.png'} alt={`${t('app.title')} Logo`} className="h-12 w-12 mr-2" />
          <h1  className="site-title text-2xl font-bold text-indigo-600">{t('app.title')}</h1>
        </Link>

          <div className="flex-1 mx-8">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSearchSubmit}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <i data-feather="search"></i>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 ${
                theme === 'dark' ? 'hover:bg-indigo-700' : 'hover:bg-gray-100'
              }`}
              aria-label="Toggle theme"
            >
              <span className="mr-2" aria-hidden="true">{theme === 'dark' ? '☀' : '🌙'}</span>
              <span>{theme === 'dark' ? t('theme.light') : t('theme.dark')}</span>
            </button>

            <div ref={languageMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsLanguageMenuOpen((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsLanguageMenuOpen(false)
                  }
                }}
                className={`flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 ${
                  theme === 'dark' ? 'hover:bg-indigo-700' : 'hover:bg-gray-100'
                }`}
                aria-label={t('header.select_language')}
                aria-haspopup="listbox"
                aria-expanded={isLanguageMenuOpen}
              >
                <span>{lang.toUpperCase()}</span>
                <span className="ml-2 text-xs" aria-hidden="true">▾</span>
              </button>

              {isLanguageMenuOpen && (
                <ul
                  role="listbox"
                  className={`absolute right-0 mt-1 w-20 border rounded-lg shadow-lg z-[100] py-1 ${
                    theme === 'dark' ? 'bg-white border-indigo-200' : 'bg-white border-gray-300'
                  }`}
                >
                  {['en', 'ru'].map((languageCode) => (
                    <li key={languageCode}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={lang === languageCode}
                        onClick={() => {
                          setLang(languageCode)
                          setIsLanguageMenuOpen(false)
                        }}
                        style={{ 'border-radius': '10px' }}
                        className={`w-full text-left px-3 py-2 ${
                          theme === 'dark' ? 'hover:bg-indigo-700' : 'hover:bg-gray-100'
                        } ${lang === languageCode ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                      >
                        {languageCode.toUpperCase()}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {langSavedMsg && (
              <div className="ml-3 text-sm text-green-600 font-medium">{langSavedMsg}</div>
            )}
          </div>

          {isAuthenticated ? (
            <Link to="/account">
              <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <i data-feather="user" className="mr-1"></i>
                <span>{t('header.account')}</span>
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <button className="flex items-center text-gray-700 hover:text-indigo-600">
                  <i data-feather="user" className="mr-1"></i>
                  <span>{t('header.login')}</span>
                </button>
              </Link>
              <Link to="/signup">
                <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <i data-feather="user-plus" className="mr-1"></i>
                  <span>{t('header.signup')}</span>
                </button>
              </Link>
            </>
          )}
          <Link to="/cart" className="relative flex items-center text-gray-700 hover:text-indigo-600">
            <i data-feather="shopping-cart" className="mr-1"></i>
            <span>{t('header.cart')}</span>
            {cartCount > 0 && (
              <span className="ml-2 text-xs bg-indigo-600 text-white rounded-full px-2 py-0.5">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>

      <nav className="bg-white py-4 border-t border-gray-200 relative z-50">
        <div className="container mx-auto px-4">
          <ul className="flex justify-center overflow-visible py-2 space-x-2">
            {Object.keys(categoryData).map((category) => (
              <li
                key={category}
                className="relative"
                onMouseEnter={() => setOpenDropdown(category)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  to={`/products/${category.toLowerCase()}`}
                  className={`px-4 py-2 rounded-full border border-gray-300 text-gray-700 ${theme === 'dark' ? 'hover:bg-indigo-700' : 'hover:bg-gray-100'} transition-colors block whitespace-nowrap`}
                >
                  {t(`pet.${category}`) || category}
                </Link>
                
                {/* Dropdown Menu */}
                {openDropdown === category && (
                  <div className={`absolute left-0 top-full mt-0 w-48 border rounded-lg shadow-2xl z-50 py-2 ${
                    theme === 'dark' ? 'bg-white border-indigo-200' : 'bg-white border-gray-300'
                  }`}>
                    {categoryData[category].map((subcategory) => (
                      <Link
                        key={subcategory}
                        to={`/products/${category.toLowerCase()}?subcategory=${encodeURIComponent(subcategory)}`}
                        className={`block px-4 py-2 text-gray-700  transition-colors ${
                          theme === 'dark' ? 'hover:bg-indigo-700 hover:text-indigo-400' : 'hover:bg-indigo-100 hover:text-indigo-600'
                        }`}
                      >
                        {t(`subcategory.${category}.${subcategory}`) || subcategory}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}

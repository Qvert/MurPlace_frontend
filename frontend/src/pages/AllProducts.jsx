import React from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n.jsx'

const categories = ['dogs', 'cats', 'fish', 'reptiles', 'birds', 'rodents', 'vet', 'groomer']

export default function AllProducts() {
  const { t } = useLang()

  return (
    <section className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <h1 className="site-title text-3xl font-bold mb-2">{t('footer.all_products')}</h1>
        <p className="text-gray-600 mb-8">
          {t('all_products.description')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/products/${category}`}
              className="block rounded-lg border p-4 bg-gray-100 hover:bg-indigo-700 hover:text-white transition-colors"
            >
              <h2 className="font-semibold text-lg mb-1">{t(`pet.${category.charAt(0).toUpperCase()}${category.slice(1)}`) || category}</h2>
              <p className="text-sm opacity-80">{t('all_products.open_products')}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

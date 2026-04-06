import React from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n.jsx'

export default function Veterinary() {
  const { t } = useLang()

  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <h1 className="site-title text-3xl font-bold mb-2">{t('footer.vet')}</h1>
        <p className="text-gray-600 mb-6">
          {t('veterinary.description')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="border rounded-lg p-4 bg-gray-100">
            <h2 className="font-semibold mb-2">{t('veterinary.popular_categories')}</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>{t('veterinary.list.medications')}</li>
              <li>{t('veterinary.list.supplements')}</li>
              <li>{t('veterinary.list.first_aid_kits')}</li>
              <li>{t('veterinary.list.health_monitors')}</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 bg-gray-100">
            <h2 className="font-semibold mb-2">{t('veterinary.when_to_contact')}</h2>
            <p className="text-sm text-gray-700">
              {t('veterinary.contact_tip')}
            </p>
          </div>
        </div>

        <Link
          to="/products/vet"
          className="inline-flex px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {t('veterinary.browse_button')}
        </Link>
      </div>
    </section>
  )
}

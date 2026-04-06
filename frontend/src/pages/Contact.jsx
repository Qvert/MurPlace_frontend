import React from 'react'
import { useLang } from '../i18n.jsx'

export default function Contact() {
  const { t } = useLang()

  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <h1 className="site-title text-3xl font-bold mb-3">{t('footer.contact')}</h1>
        <p className="text-gray-700 mb-6">
          {t('contact.description')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-gray-100">
            <h2 className="font-semibold mb-2">{t('contact.customer_support')}</h2>
            <p className="text-sm text-gray-700">support@murplace.local</p>
            <p className="text-sm text-gray-700">+1 (555) 010-2448</p>
          </div>
          <div className="border rounded-lg p-4 bg-gray-100">
            <h2 className="font-semibold mb-2">{t('contact.business_inquiries')}</h2>
            <p className="text-sm text-gray-700">partners@murplace.local</p>
            <p className="text-sm text-gray-700">{t('contact.business_hours')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

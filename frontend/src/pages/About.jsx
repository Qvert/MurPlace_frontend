import React from 'react'
import { useLang } from '../i18n.jsx'

export default function About() {
  const { t } = useLang()

  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <h1 className="site-title text-3xl font-bold mb-3">{t('footer.about')}</h1>
        <p className="text-gray-700 mb-4">
          {t('about.p1')}
        </p>
        <p className="text-gray-700 mb-4">
          {t('about.p2')}
        </p>
        <p className="text-gray-700">
          {t('about.p3')}
        </p>
      </div>
    </section>
  )
}

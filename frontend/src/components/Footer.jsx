import React from 'react'
import { useLang } from '../i18n.jsx' 

export default function Footer(){
  const { t } = useLang()
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-4">{t('app.title')}</h3>
            <p>{t('footer.tagline')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold mb-4">{t('footer.shop')}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-300">{t('footer.all_products')}</a></li>
                <li><a href="#" className="hover:text-indigo-300">{t('footer.new_arrivals')}</a></li>
                <li><a href="#" className="hover:text-indigo-300">{t('footer.deals')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('footer.services')}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-300">{t('footer.vet')}</a></li>
                <li><a href="#" className="hover:text-indigo-300">{t('footer.grooming')}</a></li>
                <li><a href="#" className="hover:text-indigo-300">{t('footer.sitting')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-300">{t('footer.about')}</a></li>
                <li><a href="#" className="hover:text-indigo-300">{t('footer.contact')}</a></li>
                <li><a href="#" className="hover:text-indigo-300">{t('footer.careers')}</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p>&copy; 2025 {t('app.title')}. {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}

import React from 'react'

export default function PetCategoryGrid({ theme, t, onSelectCategory }) {
  const categories = [
    { slug: 'dogs', name: t('pet.Dogs'), img: '/static/dogs.png', imgDark: '/static/dogs_dark.png' },
    { slug: 'cats', name: t('pet.Cats'), img: '/static/cats.png', imgDark: '/static/cats_dark.png' },
    { slug: 'fish', name: t('pet.Fish'), img: '/static/fish.png', imgDark: '/static/fish_dark.png' },
    { slug: 'reptiles', name: t('pet.Reptiles'), img: '/static/reptiles.png', imgDark: '/static/reptiles_dark.png' },
    { slug: 'birds', name: t('pet.Birds'), img: '/static/birds.png', imgDark: '/static/birds_dark.png' }
  ]

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6">{t('shop.by_pet')}</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap justify-between gap-4">
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
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
  )
}

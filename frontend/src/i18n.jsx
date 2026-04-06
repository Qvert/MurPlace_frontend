import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from './services/auth'

const translations = {
  en: {
    'app.title': 'MurPlace',
    'search.placeholder': 'Search for pet products...',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'header.account': 'Account',
    'header.login': 'Login',
    'header.signup': 'Sign Up',
    'header.cart': 'Cart',
    'header.select_language': 'Language',

    'account.title': 'My Account',
    'account.subtitle': 'Manage your profile and preferences',
    'account.info': 'Account Information',
    'account.username': 'Username:',
    'account.name': 'Name:',
    'account.email': 'Email:',
    'account.member_since': 'Member since:',
    'account.loading': 'Loading account...',
    'account.load_error': 'Failed to load user data',
    'account.go_to_login': 'Go to Login',
    'account.quick_actions': 'Quick Actions',
    'account.view_cart': 'View Cart',
    'account.check_items': 'Check your items',
    'account.browse_products': 'Browse Products',
    'account.find_products': 'Find pet supplies',
    'account.settings': 'Account Settings',
    'account.edit_profile': 'Edit Profile',
    'account.change_password': 'Change Password',
    'account.logout': 'Logout',
    'account.preferred_language': 'Preferred language',

    'lang.en': 'English',
    'lang.ru': 'Русский',

    'login.title': 'Login to Your Account',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.sign_in': 'Sign In',
    'login.failed': 'Login failed',
    'login.network_error': 'Network error',

    'signup.title': 'Create Your Account',
    'signup.button': 'Create Account',
    'signup.password_hint': 'At least 8 characters with letters and numbers',
    'signup.confirm_password': 'Confirm Password',

    'confirm.title': 'Confirm Your Email',
    'confirm.instructions': 'We have sent a confirmation email. Please follow the link or enter the confirmation code below.',
    'confirm.email_label': 'Email',
    'confirm.code_label': 'Confirmation Code (if you have one)',
    'confirm.confirm_button': 'Confirm',
    'confirm.resend_button': 'Resend',
    'confirm.processing': 'Processing…',
    'confirm.resent_message': 'Confirmation email resent. Please check your inbox.',
    'confirm.dev_code_display': 'Dev confirmation code: {code}',
    'confirm.no_code_found': 'No confirmation code found for this email. Please request a confirmation email.',
    'confirm.invalid_code': 'Invalid confirmation code',
    'confirm.success_login': 'Email confirmed. Please log in.',
    'confirm.error_generic': 'Confirmation failed. Please try again.',

    'hot_deals': 'Hot Deals This Week',
    'shop.by_pet': 'Shop by Pet Type',
    'pet.Dogs': 'Dogs',
    'pet.Cats': 'Cats',
    'pet.Fish': 'Fish',
    'pet.Reptiles': 'Reptiles',
    'pet.Birds': 'Birds',
    'pet.Rodents': 'Rodents',
    'pet.Vet': 'Veterinary',
    'pet.Groomer': 'Grooming',

    // Subcategories (auto-generated)
    'subcategory.Cats.Cat Toys': 'Cat Toys',
    'subcategory.Cats.Cat Food': 'Cat Food',
    'subcategory.Cats.Cat Litter': 'Cat Litter',
    'subcategory.Cats.Cat Beds': 'Cat Beds',
    'subcategory.Cats.Cat Scratchers': 'Cat Scratchers',

    'subcategory.Dogs.Dog Toys': 'Dog Toys',
    'subcategory.Dogs.Dog Food': 'Dog Food',
    'subcategory.Dogs.Dog Beds': 'Dog Beds',
    'subcategory.Dogs.Dog Grooming': 'Dog Grooming',
    'subcategory.Dogs.Dog Collars': 'Dog Collars',

    'subcategory.Rodents.Rodent Food': 'Rodent Food',
    'subcategory.Rodents.Rodent Cages': 'Rodent Cages',
    'subcategory.Rodents.Rodent Toys': 'Rodent Toys',
    'subcategory.Rodents.Bedding': 'Bedding',
    'subcategory.Rodents.Water Bottles': 'Water Bottles',

    'subcategory.Fish.Fish Food': 'Fish Food',
    'subcategory.Fish.Fish Tanks': 'Fish Tanks',
    'subcategory.Fish.Fish Filters': 'Fish Filters',
    'subcategory.Fish.Aquatic Plants': 'Aquatic Plants',
    'subcategory.Fish.Fish Decorations': 'Fish Decorations',

    'subcategory.Reptiles.Reptile Food': 'Reptile Food',
    'subcategory.Reptiles.Reptile Tanks': 'Reptile Tanks',
    'subcategory.Reptiles.Heating Lamps': 'Heating Lamps',
    'subcategory.Reptiles.Substrate': 'Substrate',
    'subcategory.Reptiles.Hides': 'Hides',

    'subcategory.Birds.Bird Food': 'Bird Food',
    'subcategory.Birds.Bird Cages': 'Bird Cages',
    'subcategory.Birds.Bird Toys': 'Bird Toys',
    'subcategory.Birds.Perches': 'Perches',
    'subcategory.Birds.Bird Treats': 'Bird Treats',

    'subcategory.Vet.Medications': 'Medications',
    'subcategory.Vet.Supplements': 'Supplements',
    'subcategory.Vet.First Aid': 'First Aid',
    'subcategory.Vet.Health Monitors': 'Health Monitors',

    'subcategory.Groomer.Shampoos': 'Shampoos',
    'subcategory.Groomer.Brushes': 'Brushes',
    'subcategory.Groomer.Clippers': 'Clippers',
    'subcategory.Groomer.Nail Care': 'Nail Care',
    'subcategory.Groomer.Drying Tools': 'Drying Tools',

    'popular_items': 'Popular Items',
    'loading_products': 'Loading products...',
    'loading': 'Loading...',
    'error_prefix': 'Error:',
    'product_not_found': 'Product not found',
    'add_to_cart': 'Add to Cart',
    'added': 'Added!',
    'back_to_home': 'Back to Home',
    'search.title': 'Search Results',
    'search.showing_for': 'Showing results for "{q}"',
    'search.enter_term': 'Please enter a search term',
    'search.no_results': 'No products found matching your search.',
    'search.found': 'Found {n} result{plural}',
    'pagination.prev': '← Previous',
    'pagination.next': 'Next →',

    'cart.empty_title': 'Your cart is empty',
    'cart.empty_desc': 'Add some goodies for your pet to get started.',
    'cart.continue': 'Continue shopping',
    'cart.title': 'Shopping Cart',
    'cart.review': 'Review your picks before checkout.',
    'cart.qty': 'Qty',
    'cart.remove': 'Remove',
    'cart.clear': 'Clear cart',
    'cart.order_summary': 'Order summary',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.total': 'Total',
    'cart.proceed': 'Proceed to checkout',
    'cart.checkout_placeholder': 'Checkout is a placeholder for now.',
    'cart.free': 'Free',

    'footer.tagline': 'Your one-stop shop for all pet needs.',
    'footer.shop': 'Shop',
    'footer.services': 'Services',
    'footer.company': 'Company',
    'footer.all_products': 'All Products',
    'footer.new_arrivals': 'New Arrivals',
    'footer.deals': 'Deals',
    'footer.vet': 'Veterinary',
    'footer.grooming': 'Grooming',
    'footer.sitting': 'Pet Sitting',
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.careers': 'Careers',
    'footer.copyright': 'All rights reserved.',

    'all_products.description': 'Browse every available category and jump straight into products for your pet.',
    'all_products.open_products': 'Open products',

    'veterinary.description': 'Find products and care essentials recommended for pet health and daily prevention.',
    'veterinary.popular_categories': 'Popular veterinary categories',
    'veterinary.list.medications': 'Medications',
    'veterinary.list.supplements': 'Supplements',
    'veterinary.list.first_aid_kits': 'First aid kits',
    'veterinary.list.health_monitors': 'Health monitors',
    'veterinary.when_to_contact': 'When to contact a vet',
    'veterinary.contact_tip': 'If your pet has urgent symptoms, always contact your veterinarian first before purchasing any treatment.',
    'veterinary.browse_button': 'Browse veterinary products',

    'about.p1': 'MurPlace is a pet-focused marketplace built to help owners quickly find trusted products, compare options, and care for every stage of a pet\'s life.',
    'about.p2': 'Our catalog is organized by pet type and practical needs, from everyday food and grooming to veterinary essentials.',
    'about.p3': 'We are continuously improving search, recommendations, and delivery options to make pet care easier.',

    'contact.description': 'Need help with orders, product availability, or your account? Reach out and we will assist you.',
    'contact.customer_support': 'Customer Support',
    'contact.business_inquiries': 'Business Inquiries',
    'contact.business_hours': 'Mon-Fri, 09:00-18:00'
  },
  ru: {
    'app.title': 'Муркетплейс',
    'search.placeholder': 'Поиск товаров для питомцев...',
    'theme.light': 'Светлая',
    'theme.dark': 'Тёмная',
    'header.account': 'Аккаунт',
    'header.login': 'Войти',
    'header.signup': 'Регистрация',
    'header.cart': 'Корзина',
    'header.select_language': 'Язык',

    'account.title': 'Мой аккаунт',
    'account.subtitle': 'Управляйте профилем и настройками',
    'account.info': 'Информация аккаунта',
    'account.username': 'Имя пользователя:',
    'account.name': 'Имя:',
    'account.email': 'Электронная почта:',
    'account.member_since': 'На сайте с:',
    'account.loading': 'Загрузка аккаунта...',
    'account.load_error': 'Ошибка при загрузке данных пользователя',
    'account.go_to_login': 'Перейти к входу',
    'account.quick_actions': 'Быстрые действия',
    'account.view_cart': 'Посмотреть корзину',
    'account.check_items': 'Проверить товары',
    'account.browse_products': 'Просмотреть товары',
    'account.find_products': 'Найдите товары для питомцев',
    'account.settings': 'Настройки аккаунта',
    'account.edit_profile': 'Редактировать профиль',
    'account.change_password': 'Сменить пароль',
    'account.logout': 'Выйти',
    'account.preferred_language': 'Предпочитаемый язык',

    'lang.en': 'English',
    'lang.ru': 'Русский',

    'login.title': 'Войдите в аккаунт',
    'login.username': 'Имя пользователя',
    'login.password': 'Пароль',
    'login.sign_in': 'Войти',
    'login.failed': 'Ошибка входа',
    'login.network_error': 'Сетевая ошибка',

    'signup.title': 'Создать аккаунт',
    'signup.button': 'Создать аккаунт',

    'footer.tagline': 'Все, что нужно для ваших питомцев в одном месте.',
    'footer.shop': 'Магазин',
    'footer.services': 'Услуги',
    'footer.company': 'Компания',
    'footer.all_products': 'Все товары',
    'footer.new_arrivals': 'Новинки',
    'footer.deals': 'Акции',
    'footer.vet': 'Ветеринария',
    'footer.grooming': 'Груминг',
    'footer.sitting': 'Передержка',
    'footer.about': 'О нас',
    'footer.contact': 'Контакты',
    'footer.careers': 'Карьера',
    'footer.copyright': 'Все права защищены.',

    'all_products.description': 'Просмотрите все доступные категории и сразу переходите к товарам для вашего питомца.',
    'all_products.open_products': 'Открыть товары',

    'veterinary.description': 'Найдите товары и средства ухода, рекомендованные для здоровья питомца и ежедневной профилактики.',
    'veterinary.popular_categories': 'Популярные ветеринарные категории',
    'veterinary.list.medications': 'Лекарства',
    'veterinary.list.supplements': 'Добавки',
    'veterinary.list.first_aid_kits': 'Аптечки первой помощи',
    'veterinary.list.health_monitors': 'Мониторы здоровья',
    'veterinary.when_to_contact': 'Когда обращаться к ветеринару',
    'veterinary.contact_tip': 'Если у питомца есть срочные симптомы, сначала свяжитесь с ветеринаром перед покупкой любого лечения.',
    'veterinary.browse_button': 'Перейти к ветеринарным товарам',

    'about.p1': 'MurPlace — это маркетплейс для питомцев, созданный, чтобы владельцы быстро находили проверенные товары, сравнивали варианты и заботились о питомце на каждом этапе жизни.',
    'about.p2': 'Наш каталог организован по типам питомцев и практическим потребностям: от повседневного корма и груминга до ветеринарных товаров.',
    'about.p3': 'Мы постоянно улучшаем поиск, рекомендации и варианты доставки, чтобы уход за питомцами был проще.',

    'contact.description': 'Нужна помощь с заказами, наличием товаров или аккаунтом? Свяжитесь с нами, и мы поможем.',
    'contact.customer_support': 'Поддержка клиентов',
    'contact.business_inquiries': 'Бизнес-запросы',
    'contact.business_hours': 'Пн-Пт, 09:00-18:00',

    'signup.password_hint': 'По крайней мере 8 символов, буквы и цифры',
    'signup.confirm_password': 'Подтвердите пароль',

    'confirm.title': 'Подтвердите вашу почту',
    'confirm.instructions': 'Мы отправили письмо с подтверждением. Пожалуйста, перейдите по ссылке или введите код подтверждения ниже.',
    'confirm.email_label': 'Электронная почта',
    'confirm.code_label': 'Код подтверждения (если есть)',
    'confirm.confirm_button': 'Подтвердить',
    'confirm.resend_button': 'Отправить снова',
    'confirm.processing': 'Обработка…',
    'confirm.resent_message': 'Письмо с подтверждением отправлено повторно. Пожалуйста, проверьте почту.',
    'confirm.dev_code_display': 'Тестовый код подтверждения: {code}',
    'confirm.no_code_found': 'Код подтверждения для этого адреса не найден. Пожалуйста, запросите письмо с подтверждением.',
    'confirm.invalid_code': 'Неверный код подтверждения',
    'confirm.success_login': 'Почта подтверждена. Пожалуйста, войдите в систему.',
    'confirm.error_generic': 'Ошибка подтверждения. Попробуйте снова.',

    'hot_deals': 'Горячие предложения этой недели',
    'shop.by_pet': 'Магазины по видам питомцев',
    'pet.Dogs': 'Собаки',
    'pet.Cats': 'Кошки',
    'pet.Fish': 'Рыбы',
    'pet.Reptiles': 'Рептилии',
    'pet.Birds': 'Птицы',
    'pet.Rodents': 'Грызуны',
    'pet.Vet': 'Ветеринария',
    'pet.Groomer': 'Груминг',
    
    // Subcategories (auto-generated)
    'subcategory.Cats.Cat Toys': 'Игрушки для кошек',
    'subcategory.Cats.Cat Food': 'Корм для кошек',
    'subcategory.Cats.Cat Litter': 'Наполнитель для лотка',
    'subcategory.Cats.Cat Beds': 'Лежаки для кошек',
    'subcategory.Cats.Cat Scratchers': 'Когтеточки',

    'subcategory.Dogs.Dog Toys': 'Игрушки для собак',
    'subcategory.Dogs.Dog Food': 'Корм для собак',
    'subcategory.Dogs.Dog Beds': 'Лежаки для собак',
    'subcategory.Dogs.Dog Grooming': 'Груминг для собак',
    'subcategory.Dogs.Dog Collars': 'Ошейники',

    'subcategory.Rodents.Rodent Food': 'Корм для грызунов',
    'subcategory.Rodents.Rodent Cages': 'Клетки для грызунов',
    'subcategory.Rodents.Rodent Toys': 'Игрушки для грызунов',
    'subcategory.Rodents.Bedding': 'Подстилка',
    'subcategory.Rodents.Water Bottles': 'Поилки',

    'subcategory.Fish.Fish Food': 'Корм для рыб',
    'subcategory.Fish.Fish Tanks': 'Аквариумы',
    'subcategory.Fish.Fish Filters': 'Фильтры для аквариума',
    'subcategory.Fish.Aquatic Plants': 'Водные растения',
    'subcategory.Fish.Fish Decorations': 'Декор для аквариума',

    'subcategory.Reptiles.Reptile Food': 'Корм для рептилий',
    'subcategory.Reptiles.Reptile Tanks': 'Террариумы',
    'subcategory.Reptiles.Heating Lamps': 'Обогревательные лампы',
    'subcategory.Reptiles.Substrate': 'Субстрат',
    'subcategory.Reptiles.Hides': 'Укрытия',

    'subcategory.Birds.Bird Food': 'Корм для птиц',
    'subcategory.Birds.Bird Cages': 'Клетки для птиц',
    'subcategory.Birds.Bird Toys': 'Игрушки для птиц',
    'subcategory.Birds.Perches': 'Жердочки',
    'subcategory.Birds.Bird Treats': 'Лакомства для птиц',

    'subcategory.Vet.Medications': 'Лекарства',
    'subcategory.Vet.Supplements': 'Добавки',
    'subcategory.Vet.First Aid': 'Первая помощь',
    'subcategory.Vet.Health Monitors': 'Мониторы здоровья',

    'subcategory.Groomer.Shampoos': 'Шампуни',
    'subcategory.Groomer.Brushes': 'Щетки',
    'subcategory.Groomer.Clippers': 'Машинки для стрижки',
    'subcategory.Groomer.Nail Care': 'Уход за когтями',
    'subcategory.Groomer.Drying Tools': 'Средства для сушки',

    'popular_items': 'Популярные товары',
    'loading_products': 'Загрузка товаров...',
    'loading': 'Загрузка...',
    'error_prefix': 'Ошибка:',
    'product_not_found': 'Товар не найден',
    'add_to_cart': 'Добавить в корзину',
    'added': 'Добавлено!',
    'back_to_home': 'Назад на главную',
    'search.title': 'Результаты поиска',
    'search.showing_for': 'Показаны результаты для "{q}"',
    'search.enter_term': 'Пожалуйста, введите поисковый запрос',
    'search.no_results': 'По вашему запросу не найдено товаров.',
    'search.found': 'Найдено {n} результатов',
    'pagination.prev': '← Назад',
    'pagination.next': 'Вперёд →',

    'cart.empty_title': 'Ваша корзина пуста',
    'cart.empty_desc': 'Добавьте товары для питомца, чтобы начать.',
    'cart.continue': 'Продолжить покупки',
    'cart.title': 'Корзина',
    'cart.review': 'Проверьте ваши товары перед оформлением.',
    'cart.qty': 'Кол-во',
    'cart.remove': 'Удалить',
    'cart.clear': 'Очистить корзину',
    'cart.order_summary': 'Итог заказа',
    'cart.subtotal': 'Промежуточный итог',
    'cart.shipping': 'Доставка',
    'cart.total': 'Итого',
    'cart.proceed': 'Перейти к оформлению',
    'cart.checkout_placeholder': 'Оформление временно недоступно.',
    'cart.free': 'Бесплатно'
  }
}

const LanguageContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k })

export function LanguageProvider ({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'en')

  useEffect(() => {
    const onStorage = () => setLangState(localStorage.getItem('lang') || 'en')
    window.addEventListener('storage', onStorage)
    window.addEventListener('lang-changed', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('lang-changed', onStorage)
    }
  }, [])

  const setLang = async (next) => {
    localStorage.setItem('lang', next)
    setLangState(next)
    window.dispatchEvent(new Event('lang-changed'))

    // Persist to backend if logged in
    if (localStorage.getItem('token')) {
      try {
        await authService.updateProfile({ lang: next })
        window.dispatchEvent(new CustomEvent('lang-saved', { detail: { lang: next, success: true } }))
      } catch (err) {
        console.error('Failed to save language preference', err)
        window.dispatchEvent(new CustomEvent('lang-saved', { detail: { lang: next, success: false } }))
      }
    } else {
      // For guests, still indicate saved locally
      window.dispatchEvent(new CustomEvent('lang-saved', { detail: { lang: next, success: true } }))
    }
  }

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)

function parsePriceNumber(value) {
  const amount = Number(value)
  if (Number.isFinite(amount)) return amount

  const raw = String(value ?? '').trim()
  if (!raw) return null

  const cleaned = raw
    .replace(/[\s\u00A0]/g, '')
    .replace(/[₽$€£]/g, '')

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')

  let normalized = cleaned

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      normalized = cleaned.replace(/,/g, '')
    }
  } else if (lastComma > -1) {
    normalized = cleaned.replace(',', '.')
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function firstDefined(obj, keys) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key]
    }
  }
  return null
}

export function getLocalizedPriceValue(source, lang = 'en') {
  if (source === undefined || source === null) return null
  if (typeof source !== 'object') return source

  const isRussian = lang === 'ru'
  const rubKeys = ['price_rub', 'rub_price', 'priceRub']
  const usdKeys = ['price_usd', 'usd_price', 'priceUsd']
  const baseKeys = ['price']

  if (isRussian) {
    return firstDefined(source, [...rubKeys, ...usdKeys, ...baseKeys])
  }

  return firstDefined(source, [...usdKeys, ...baseKeys, ...rubKeys])
}

export function getLocalizedPriceNumber(source, lang = 'en', fallback = 0) {
  const value = getLocalizedPriceValue(source, lang)
  const number = parsePriceNumber(value)
  return number === null ? fallback : number
}

export function formatPrice(value, lang = 'en', currency = 'usd') {
  const isRussian = lang === 'ru'
  const locale = isRussian ? 'ru-RU' : 'en-US'
  const isRub = currency === 'rub'

  const formatAmount = (amount) => {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)

    return isRub ? `${formatted} ₽` : `$${formatted}`
  }

  const parsed = parsePriceNumber(value)
  if (parsed !== null) return formatAmount(parsed)

  const raw = String(value ?? '').trim()

  const text = raw.replace(/\$/g, '').replace(/₽/g, '').trim()
  return isRub ? `${text} ₽` : `$${text}`
}

export function getBaseUsdPriceValue(source) {
  if (source === undefined || source === null) return null
  if (typeof source !== 'object') return source

  const usdKeys = ['price_usd', 'usd_price', 'priceUsd']
  const baseKeys = ['price']
  const rubKeys = ['price_rub', 'rub_price', 'priceRub']

  return firstDefined(source, [...usdKeys, ...baseKeys, ...rubKeys])
}

export function getConvertedPriceNumber(source, currency = 'usd', exchangeRate = 95, fallback = 0) {
  const value = getBaseUsdPriceValue(source)
  const number = parsePriceNumber(value)
  if (number === null) return fallback
  return currency === 'rub' ? number * exchangeRate : number
}

export function formatLocalizedPrice(source, lang = 'en', currency = 'usd', exchangeRate = 95) {
  return formatPrice(getConvertedPriceNumber(source, currency, exchangeRate), lang, currency)
}

export function convertPrice(priceUsd, currency = 'usd', exchangeRate = 95) {
  if (currency === 'rub' && priceUsd) {
    return priceUsd * exchangeRate
  }
  return priceUsd
}
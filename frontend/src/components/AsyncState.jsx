import React from 'react'

export default function AsyncState({
  loading,
  error,
  loadingText,
  errorPrefix,
  loadingClassName = 'text-center py-10',
  errorClassName = 'text-red-500 mb-4'
}) {
  if (!loading && !error) return null

  return (
    <>
      {loading && <div className={loadingClassName}>{loadingText}</div>}
      {error && <div className={errorClassName}>{errorPrefix ? `${errorPrefix} ${error}` : error}</div>}
    </>
  )
}

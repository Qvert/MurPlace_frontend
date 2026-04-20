import React from 'react'
import { Link } from 'react-router-dom'

export default function EmptyStateCard({
  title,
  description,
  actionLabel,
  actionTo = '/',
  icon = null,
  className = 'max-w-3xl mx-auto bg-white rounded-lg shadow p-8 text-center'
}) {
  return (
    <div className={className}>
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      {actionLabel && (
        <Link to={actionTo} className="inline-block px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

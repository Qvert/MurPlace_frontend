import React from 'react'
import { Link } from 'react-router-dom'

export default function Header(){
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img src="http://static.photos/pets/200x200/1" alt="Муркетплейс Logo" className="h-12 mr-2" />
          <h1 className="text-2xl font-bold text-indigo-600">Муркетплейс</h1>
        </div>

        <div className="flex-1 mx-8">
          <div className="relative">
            <input type="text" placeholder="Search for pet products..." className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button className="absolute right-3 top-2.5 text-gray-500">
              <i data-feather="search"></i>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/login">
            <button className="flex items-center text-gray-700 hover:text-indigo-600">
              <i data-feather="user" className="mr-1"></i>
              <span>Login</span>
            </button>
          </Link>
          <Link to="/signup">
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <i data-feather="user-plus" className="mr-1"></i>
              <span>Sign Up</span>
            </button>
          </Link>
          <button className="flex items-center text-gray-700 hover:text-indigo-600">
            <i data-feather="shopping-cart" className="mr-1"></i>
            <span>Cart</span>
          </button>
        </div>
      </div>

      <nav className="bg-white py-4">
        <div className="container mx-auto px-4">
          <ul className="flex justify-center overflow-x-auto py-2 space-x-2">
            <li><a href="#" className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100">Cats</a></li>
            <li><a href="#" className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100">Dogs</a></li>
            <li><a href="#" className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100">Rodents</a></li>
            <li><a href="#" className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100">Fish</a></li>
            <li><a href="#" className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100">Reptiles</a></li>
            <li><a href="#" className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100">Birds</a></li>
            <li><a href="#" className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100">Vet</a></li>
            <li><a href="#" className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100">Groomer</a></li>
          </ul>
        </div>
      </nav>
    </header>
  )
}

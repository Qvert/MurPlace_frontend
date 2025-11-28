import React from 'react'

export default function Footer(){
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Муркетплейс</h3>
            <p>Your one-stop shop for all pet needs.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold mb-4">Shop</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-300">All Products</a></li>
                <li><a href="#" className="hover:text-indigo-300">New Arrivals</a></li>
                <li><a href="#" className="hover:text-indigo-300">Deals</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-300">Veterinary</a></li>
                <li><a href="#" className="hover:text-indigo-300">Grooming</a></li>
                <li><a href="#" className="hover:text-indigo-300">Pet Sitting</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-300">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-300">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-300">Careers</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p>&copy; 2025 Муркетплейс. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

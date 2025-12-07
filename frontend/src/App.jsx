import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProductDetail from './pages/ProductDetail'
import Products from './pages/Products'
import SearchResults from './pages/SearchResults'
import Cart from './pages/Cart'
import Account from './pages/Account'
import Header from './components/Header'
import Footer from './components/Footer'

export default function App() {
  return (
    <div>
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/products/:category" element={<Products />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

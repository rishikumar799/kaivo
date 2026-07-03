/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ShopProvider } from "./contexts/ShopContext";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import NewArrivals from "./pages/NewArrivals";
import Oversized from "./pages/Oversized";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";

import DynamicPage from "./pages/DynamicPage";

// Admin Imports
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminCategories from "./admin/AdminCategories";
import AdminBanners from "./admin/AdminBanners";
import AdminOffers from "./admin/AdminOffers";
import AdminTestimonials from "./admin/AdminTestimonials";
import AdminAbout from "./admin/AdminAbout";
import AdminContact from "./admin/AdminContact";
import AdminSettings from "./admin/AdminSettings";
import AdminMenus from "./admin/AdminMenus";
import AdminPages from "./admin/AdminPages";
import AdminMedia from "./admin/AdminMedia";
import AdminSEO from "./admin/AdminSEO";

export default function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <Routes>
          {/* FRONT-FACING PUBLIC STREETWEAR CUSTOMER PAGES */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="new-arrivals" element={<NewArrivals />} />
            <Route path="oversized" element={<Oversized />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="product/:slug" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="pages/:slug" element={<DynamicPage />} />
          </Route>

          {/* BACK-FACING ADMINISTRATIVE MANAGEMENT CMS PAGES */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            {/* Fallback to Dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="menus" element={<AdminMenus />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="seo" element={<AdminSEO />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="about" element={<AdminAbout />} />
            <Route path="contact" element={<AdminContact />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback wildcard to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ShopProvider>
  );
}

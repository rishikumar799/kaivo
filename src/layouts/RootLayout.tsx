/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useShop } from "../contexts/ShopContext";
import { 
  ShoppingBag, 
  User, 
  Search, 
  Menu, 
  X, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Sparkles
} from "lucide-react";

interface RootLayoutProps {
  children?: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { db, getCartItemsCount } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribedMessage, setSubscribedMessage] = useState(false);

  if (!db) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-sm uppercase tracking-widest text-zinc-400">Loading KAIVO...</p>
        </div>
      </div>
    );
  }

  const { settings, offers } = db;
  const cartCount = getCartItemsCount();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribedMessage(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribedMessage(false), 5000);
    }
  };

  const navLinks = [
    { id: "h", name: "HOME", path: "/", type: "normal" as const, enabled: true },
    { id: "s", name: "SHOP", path: "/shop", type: "normal" as const, enabled: true },
    { id: "n", name: "NEW ARRIVALS", path: "/new-arrivals", type: "normal" as const, enabled: true },
    { id: "o", name: "OVERSIZED COLLECTION", path: "/oversized", type: "normal" as const, enabled: true },
    { id: "a", name: "ABOUT US", path: "/about", type: "normal" as const, enabled: true },
    { id: "c", name: "CONTACT", path: "/contact", type: "normal" as const, enabled: true },
  ];

  const activeMenus = db.menus && db.menus.length > 0
    ? [...db.menus].filter(m => m.enabled).sort((a, b) => (a.order || 0) - (b.order || 0))
    : navLinks;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 font-sans">
      
      {/* 1. TOP OFFER BAR */}
      <AnimatePresence>
        {offers.enabled && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black border-b border-zinc-900 text-center py-2.5 px-4 relative z-50 text-[10px] sm:text-xs font-mono tracking-[0.25em] text-zinc-300 flex items-center justify-center"
          >
            <span>
              FREE SHIPPING ON ALL ORDERS ABOVE <span className="text-[#C9A063] font-bold">₹999</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link 
            to="/" 
            id="nav-logo" 
            className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-white hover:text-[#C9A063] transition-colors flex items-center"
          >
            {settings.logoText}
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {activeMenus.map((link) => {
              const isActive = location.pathname === link.path;
              if (link.type === "dropdown" && link.children && link.children.length > 0) {
                return (
                  <div key={link.id} className="relative group py-2">
                    <button className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 group-hover:text-[#C9A063] transition-colors duration-200 uppercase cursor-pointer flex items-center gap-1">
                      {link.name}
                      <span className="text-[8px] font-mono">▼</span>
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 bg-black border border-zinc-900 rounded-sm p-4 min-w-[180px] hidden group-hover:flex flex-col gap-3 shadow-2xl z-50">
                      {link.children.filter(c => c.enabled).map(child => (
                        <Link
                          key={child.id}
                          to={child.path}
                          className="text-[10px] font-bold tracking-widest text-zinc-400 hover:text-[#C9A063] transition-colors uppercase block"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              const isButton = link.type === "button";
              return (
                <Link
                  key={link.id}
                  to={link.path}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={isButton
                    ? "text-[10px] font-bold tracking-[0.15em] bg-[#C9A063] hover:bg-white text-black px-4 py-2 transition-all rounded-xs font-mono uppercase shrink-0"
                    : `text-[11px] font-bold tracking-[0.2em] transition-colors duration-200 relative py-2 ${
                        isActive ? "text-[#C9A063]" : "text-zinc-400 hover:text-white"
                      }`
                  }
                >
                  {link.name}
                  {isActive && !isButton && (
                    <motion.div 
                      layoutId="navActiveLine"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A063]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Search Trigger */}
            <button 
              onClick={() => setSearchOpen(true)}
              id="action-search-btn"
              className="p-2 text-zinc-350 hover:text-[#C9A063] transition-colors cursor-pointer"
              aria-label="Search Products"
            >
              <Search className="w-5 h-5 sm:w-6.5 sm:h-6.5" />
            </button>

            {/* Admin Dashboard */}
            <Link 
              to="/admin/dashboard"
              id="action-admin-btn"
              className="p-2 text-zinc-350 hover:text-[#C9A063] transition-colors hidden sm:block"
              aria-label="Admin panel"
            >
              <User className="w-5 h-5 sm:w-6.5 sm:h-6.5" />
            </Link>

            {/* Shopping Bag */}
            <Link 
              to="/cart"
              id="action-cart-btn"
              className="p-2 text-zinc-350 hover:text-[#C9A063] transition-colors relative flex items-center"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6.5 sm:h-6.5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-[#C9A063] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              id="action-mobile-menu-btn"
              className="p-2 text-zinc-300 hover:text-[#C9A063] transition-colors lg:hidden cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 sm:w-6.5 sm:h-6.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />

            {/* Content Drawer */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-zinc-950 border-l border-zinc-800 p-6 z-50 flex flex-col justify-between lg:hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-12">
                  <span className="text-xl font-bold tracking-[0.2em]">{settings.logoText}</span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-zinc-400 hover:text-white border border-zinc-800 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-6">
                  {activeMenus.map((link) => {
                    const isActive = location.pathname === link.path;
                    if (link.type === "dropdown" && link.children && link.children.length > 0) {
                      return (
                        <div key={link.id} className="flex flex-col gap-3 border-b border-zinc-900 pb-2">
                          <span className="text-xs font-mono tracking-widest text-[#C9A063] uppercase">
                            {link.name}
                          </span>
                          <div className="pl-4 flex flex-col gap-3">
                            {link.children.filter(c => c.enabled).map(child => (
                              <Link
                                key={child.id}
                                to={child.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-sm font-semibold tracking-widest text-zinc-400 hover:text-white uppercase"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    const isButton = link.type === "button";
                    return (
                      <Link
                        key={link.id}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={isButton
                          ? "text-xs font-mono font-bold tracking-widest bg-[#C9A063] text-black text-center py-3 px-4 rounded-xs uppercase mt-2"
                          : `text-sm font-semibold tracking-widest transition-colors py-2 border-b border-zinc-900 uppercase ${
                              isActive ? "text-[#C9A063]" : "text-zinc-300 hover:text-white"
                            }`
                        }
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                  
                  {/* Admin Login link inside Mobile Drawer */}
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold tracking-widest text-zinc-400 hover:text-white py-2 flex items-center gap-2 mt-4"
                  >
                    <User className="w-4 h-4 text-[#C9A063]" />
                    ADMIN CONSOLE
                  </Link>
                </nav>
              </div>

              {/* Socials at bottom of mobile menu */}
              <div className="border-t border-zinc-900 pt-6">
                <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-4">Follow us</p>
                <div className="flex items-center gap-4 text-zinc-400">
                  <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="hover:text-[#C9A063] transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="hover:text-[#C9A063] transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href={settings.socialLinks.twitter} target="_blank" rel="noreferrer" className="hover:text-[#C9A063] transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href={settings.socialLinks.youtube} target="_blank" rel="noreferrer" className="hover:text-[#C9A063] transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. SEARCH DRAWER */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Drawer Area */}
            <motion.div 
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="absolute top-0 left-0 right-0 bg-zinc-950 border-b border-zinc-800 py-10 px-4 sm:px-6 z-50 shadow-2xl"
            >
              <div className="max-w-3xl mx-auto relative">
                <button 
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-0 -top-4 p-2 text-zinc-400 hover:text-[#C9A063] transition-colors cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>

                <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase mb-4">Search Premium Collection</h3>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search oversized tees, minimal graphics..."
                    className="w-full bg-transparent text-xl sm:text-2xl border-b border-zinc-700 py-3 pr-12 focus:outline-none focus:border-[#C9A063] font-sans tracking-wide text-white placeholder-zinc-600 transition-all"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-[#C9A063] transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </form>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono text-zinc-500">Popular Searches:</span>
                  <button 
                    onClick={() => { setSearchQuery("Oversized"); }}
                    className="text-xs px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-[#C9A063] hover:text-[#C9A063] transition-all rounded"
                  >
                    Oversized
                  </button>
                  <button 
                    onClick={() => { setSearchQuery("Signature Black"); }}
                    className="text-xs px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-[#C9A063] hover:text-[#C9A063] transition-all rounded"
                  >
                    Signature Black
                  </button>
                  <button 
                    onClick={() => { setSearchQuery("Wings"); }}
                    className="text-xs px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-[#C9A063] hover:text-[#C9A063] transition-all rounded"
                  >
                    Wings Graphic
                  </button>
                  <button 
                    onClick={() => { setSearchQuery("Minimal"); }}
                    className="text-xs px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-[#C9A063] hover:text-[#C9A063] transition-all rounded"
                  >
                    Minimal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MAIN CONTENT WRAPPER */}
      <main className="flex-grow">
        {children || <Outlet />}
      </main>

      {/* 6. PREMIUM FOOTER */}
      <footer className="bg-black border-t border-zinc-900 pt-16 pb-8 text-sm text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            
            {/* Col 1: Brand details */}
            <div className="flex flex-col gap-4">
              <span className="text-2xl font-black tracking-[0.2em] text-white">
                {settings.logoText}
              </span>
              <p className="text-xs tracking-widest text-[#C9A063]/80 font-mono uppercase">
                {settings.tagline}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                Premium oversized T-Shirts crafted for comfort, style and individuality. Elevating streetwear with timeless aesthetics.
              </p>
              <div className="flex items-center gap-3 text-zinc-500 mt-2">
                <a 
                  href={settings.socialLinks.instagram} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:border-[#C9A063] hover:text-[#C9A063] transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href={settings.socialLinks.facebook} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:border-[#C9A063] hover:text-[#C9A063] transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a 
                  href={settings.socialLinks.twitter} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:border-[#C9A063] hover:text-[#C9A063] transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a 
                  href={settings.socialLinks.youtube} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:border-[#C9A063] hover:text-[#C9A063] transition-all"
                  aria-label="Youtube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a 
                  href={`mailto:${db.contact.email}`}
                  className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:border-[#C9A063] hover:text-[#C9A063] transition-all"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Quick links */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">QUICK LINKS</h4>
              <ul className="flex flex-col gap-3 text-xs">
                {activeMenus.map((link) => {
                  if (link.type === "dropdown") return null;
                  return (
                    <li key={link.id}>
                      <Link to={link.path} className="hover:text-[#C9A063] transition-colors uppercase tracking-wider">
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Col 3: Customer Support */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">CUSTOMER SUPPORT</h4>
              <ul className="flex flex-col gap-3 text-xs tracking-wider">
                <li><Link to="/shop" className="hover:text-[#C9A063] transition-colors">Shipping Policy</Link></li>
                <li><Link to="/shop" className="hover:text-[#C9A063] transition-colors">Return Policy</Link></li>
                <li><Link to="/about" className="hover:text-[#C9A063] transition-colors">Size Guide</Link></li>
                <li><Link to="/about" className="hover:text-[#C9A063] transition-colors">FAQs</Link></li>
                <li><Link to="/contact" className="hover:text-[#C9A063] transition-colors">Track Order</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact details */}
            <div className="flex flex-col gap-4 text-xs">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-2">CONTACT US</h4>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#C9A063] shrink-0 mt-0.5" />
                <span className="leading-relaxed hover:text-[#C9A063] transition-colors">
                  {db.contact.email}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#C9A063] shrink-0 mt-0.5" />
                <span className="leading-relaxed hover:text-[#C9A063] transition-colors">
                  {db.contact.phone}
                </span>
              </div>
              <div className="flex items-start gap-3 text-zinc-500">
                <MapPin className="w-4 h-4 text-[#C9A063] shrink-0 mt-0.5" />
                <span className="leading-relaxed whitespace-pre-line text-[11px]">
                  {db.contact.address}
                </span>
              </div>
            </div>

            {/* Col 5: Newsletter */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-2">NEWSLETTER</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Subscribe to get special offers, free giveaways and once-in-a-lifetime deals.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-row items-stretch gap-0 mt-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-grow bg-[#0c0c0c] border border-zinc-800 text-xs px-4 py-3 text-white placeholder-zinc-650 focus:outline-none focus:border-[#C9A063] transition-all rounded-l-xs"
                />
                <button
                  type="submit"
                  className="bg-[#C9A063] hover:bg-white text-black font-bold text-[10px] tracking-widest px-4 uppercase transition-all rounded-r-xs font-mono cursor-pointer shrink-0"
                >
                  SUBSCRIBE
                </button>
              </form>
              <AnimatePresence>
                {subscribedMessage && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] text-[#C9A063] font-mono"
                  >
                    Successfully joined the movement!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Bottom Copyright line */}
          <div className="border-t border-zinc-950 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
            <span className="text-xs text-zinc-600 font-mono">
              {settings.footerContent}
            </span>
            <div className="flex items-center gap-6 text-xs text-zinc-600 font-mono">
              <Link to="/about" className="hover:text-[#C9A063] transition-all">Privacy Policy</Link>
              <Link to="/about" className="hover:text-[#C9A063] transition-all">Terms of Service</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

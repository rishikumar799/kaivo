/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useShop } from "../contexts/ShopContext";
import { 
  ArrowRight, 
  Heart, 
  Star, 
  Shirt, 
  Layers, 
  Scissors, 
  Truck, 
  RotateCcw, 
  Sparkles,
  Instagram,
  ShoppingCart
} from "lucide-react";

// Best Sellers exact configuration from the screenshot
const BEST_SELLERS_PRODUCTS = [
  {
    id: "p-1",
    name: "KAIVO Signature Black Tee",
    slug: "kaivo-signature-black-tee",
    price: 799,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600",
    hoverImage: "https://images.unsplash.com/photo-1618354691201-3fbe8766440f?q=80&w=600",
    category: "oversized"
  },
  {
    id: "p-2",
    name: "KAIVO White Minimal Tee",
    slug: "kaivo-white-minimal-tee",
    price: 699,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600",
    hoverImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600",
    category: "minimal"
  },
  {
    id: "p-3",
    name: "KAIVO Embroidered Tee",
    slug: "kaivo-crest-black-tee",
    price: 899,
    image: "https://images.unsplash.com/photo-1616258633660-a1702f33c4c7?q=80&w=600",
    hoverImage: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=600",
    category: "minimal"
  },
  {
    id: "p-4",
    name: "KAIVO Classic Beige Tee",
    slug: "kaivo-sand-beige-tee",
    price: 799,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600",
    hoverImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600",
    category: "oversized"
  }
];

// Premium SVG components designed for the Brand Features
const CottonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A063" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 shrink-0">
    <path d="M12 21a1.5 1.5 0 0 0 1.5-1.5V17m-1.5 4a1.5 1.5 0 0 1-1.5-1.5V17" />
    <path d="M12 17c2.5 0 4.5-1.5 4.5-4s-1.5-3.5-3-4c1-2-1-4.5-3.5-4.5S6.5 7 7.5 9c-1.5.5-3 1.5-3 4s2 4 4.5 4z" />
    <path d="M12 17a4 4 0 0 0 4-4c0-1.2-.6-2.2-1.5-2.8m-2.5 6.8a4 4 0 0 1-4-4c0-1.2.6-2.2 1.5-2.8" opacity="0.3" fill="#C9A063" />
  </svg>
);

const OversizedTshirtIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A063" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 shrink-0">
    <path d="M6 3h12l5 3-2.5 4.5H17V21H7V10.5H3.5L1 6z" />
    <path d="M9 3a3 3 0 0 0 6 0" />
    <path d="M17 14h-1.5M8.5 14H7" opacity="0.6" />
  </svg>
);

const EmbroideryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A063" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 shrink-0">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeDasharray="3 3" opacity="0.4" />
    <path d="M14.5 4.5l-6 11" />
    <path d="M13.5 5.5l.5-.5" />
    <path d="M8.5 15.5c-1 2-3 2.5-4 1s1.5-4 3-5c2-1.3 4.5-.3 5.5 1.5s.5 4-1 4.5-2.5-1-2.5-2.5" />
  </svg>
);

const DeliveryTruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A063" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 shrink-0">
    <path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8v10z" />
    <path d="M14 9h4l3 3v4a2 2 0 0 1-2 2h-5V9z" />
    <path d="M18 9h-2v4h5l-3-4z" opacity="0.3" fill="#C9A063" />
    <circle cx="7.5" cy="18.5" r="1.5" />
    <circle cx="16.5" cy="18.5" r="1.5" />
    <path d="M1 10h2M1 13h1.5M1 16h2" />
  </svg>
);

const ReturnsBoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A063" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 shrink-0">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="M3.27 6.96 12 12.01l8.73-5.05" />
    <path d="M12 22.08V12" />
    <path d="M17 11a4 4 0 1 1-4-4" strokeWidth="1.8" />
    <path d="M15 5l-2 2 2 2" strokeWidth="1.8" />
  </svg>
);

// Brand Features with custom Outlined Premium Icons
const BRAND_FEATURES = [
  {
    icon: <CottonIcon />,
    title: "PREMIUM FABRIC",
    description: "240 GSM Premium Cotton"
  },
  {
    icon: <OversizedTshirtIcon />,
    title: "OVERSIZED FIT",
    description: "Designed for comfort and style"
  },
  {
    icon: <EmbroideryIcon />,
    title: "QUALITY PRINT & EMBROIDERY",
    description: "Long lasting and durable"
  },
  {
    icon: <DeliveryTruckIcon />,
    title: "FAST SHIPPING",
    description: "Pan-India delivery in 3-7 days"
  },
  {
    icon: <ReturnsBoxIcon />,
    title: "EASY RETURNS",
    description: "Hassle free returns within 7 days"
  }
];

// Instagram Feed posts configuration (exactly 7 horizontal images)
const INSTAGRAM_POSTS = [
  { id: "ig-1", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=400", link: "https://instagram.com/kaivo_official" },
  { id: "ig-2", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400", link: "https://instagram.com/kaivo_official" },
  { id: "ig-3", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=400", link: "https://instagram.com/kaivo_official" },
  { id: "ig-4", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400", link: "https://instagram.com/kaivo_official" },
  { id: "ig-5", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400", link: "https://instagram.com/kaivo_official" },
  { id: "ig-6", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400", link: "https://instagram.com/kaivo_official" },
  { id: "ig-7", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400", link: "https://instagram.com/kaivo_official" }
];

export default function Home() {
  const { db, addToCart } = useShop();
  const navigate = useNavigate();

  const [heroSlide, setHeroSlide] = useState(0);
  const [wishlistState, setWishlistState] = useState<Record<string, boolean>>({});
  const [cartNotif, setCartNotif] = useState<string | null>(null);

  // Auto slide hero highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistState((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleQuickAdd = (p: typeof BEST_SELLERS_PRODUCTS[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find matching real product in DB if possible, otherwise use a placeholder fallback
    const dbProduct = db?.products.find(item => item.id === p.id || item.slug === p.slug);
    if (dbProduct) {
      addToCart(dbProduct, 1, "M", dbProduct.colors[0]);
    } else if (db && db.products.length > 0) {
      // Fallback to first product
      addToCart(db.products[0], 1, "M", db.products[0].colors[0]);
    }

    setCartNotif(`Added ${p.name} to cart successfully!`);
    setTimeout(() => setCartNotif(null), 3000);
  };

  // Split layout hero background slides data
  const heroSlides = [
    {
      title: "KAIVO",
      subtitle: "WEAR CONFIDENCE",
      description: "Premium oversized T-Shirts crafted for comfort, style and individuality.",
      image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200", // Duel streetwear studio shot
    },
    {
      title: "KAIVO",
      subtitle: "PREMIUM ESSENTIALS",
      description: "Heavyweight drop-shoulder styles meticulously constructed with absolute precision.",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200", // Dark model photoshoot
    },
    {
      title: "KAIVO",
      subtitle: "SILENT CONFIDENCE",
      description: "Experience organic combed cotton engineered to last and designed to empower.",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200", // Back black tee shot
    }
  ];

  return (
    <div className="bg-[#050505] text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* Toast Notification overlay for Quick Add to cart */}
      <AnimatePresence>
        {cartNotif && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-[#C9A063] text-black px-6 py-4 font-mono text-xs tracking-widest font-black uppercase rounded-xs shadow-2xl flex items-center gap-3 border border-zinc-900"
          >
            <ShoppingCart className="w-4 h-4 text-black stroke-[3]" />
            <span>{cartNotif}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. HERO SECTION (Split Layout closely matching reference) */}
      <section className="relative w-full h-auto min-h-screen lg:h-[90vh] lg:min-h-[650px] flex flex-col lg:flex-row border-b border-zinc-950 bg-[#050505]">
        
        {/* Left Side Content Column */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-start px-6 sm:px-12 md:px-16 lg:px-24 py-16 sm:py-24 lg:py-0 bg-[#050505] z-20 relative h-auto lg:h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-xl"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[0.1em] text-white leading-none uppercase select-none">
                {heroSlides[heroSlide].title}
              </h1>
              
              <h2 className="text-[#C9A063] font-mono tracking-[0.25em] text-sm sm:text-base md:text-lg font-black uppercase mt-3 mb-4">
                {heroSlides[heroSlide].subtitle}
              </h2>
              
              <p className="text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed mb-8 max-w-sm font-sans font-medium">
                {heroSlides[heroSlide].description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/shop"
                  className="bg-[#C9A063] hover:bg-white text-black font-black text-xs tracking-widest px-8 py-4 uppercase rounded-xs transition-all flex items-center gap-2 font-mono group"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-4 h-4 text-black transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/shop?category=oversized"
                  className="bg-transparent hover:bg-white/5 border border-zinc-800 hover:border-white text-white font-bold text-xs tracking-widest px-8 py-4 uppercase rounded-xs transition-all font-mono"
                >
                  EXPLORE COLLECTION
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side Image Column with Dark Overlay */}
        <div className="w-full lg:w-1/2 h-[380px] sm:h-[480px] md:h-[550px] lg:h-full relative overflow-hidden bg-zinc-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Image and multiple gradient layers for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 lg:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent z-10 hidden lg:block" />
              <div className="absolute inset-0 bg-black/25 z-10" />
              <img
                src={heroSlides[heroSlide].image}
                alt="KAIVO Premium Fashion Lifestyle"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Indicators Centered at bottom */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center items-center gap-2.5">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setHeroSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === heroSlide ? "bg-[#C9A063] w-6" : "bg-zinc-600 hover:bg-zinc-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 4. SHOP BY COLLECTION SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Centered Heading with Decorative Divider Lines */}
        <div className="flex items-center justify-center gap-6 mb-16">
          <div className="hidden sm:block h-[1px] flex-grow max-w-xs bg-zinc-900" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-[0.25em] text-white text-center uppercase">
            SHOP BY COLLECTION
          </h2>
          <div className="hidden sm:block h-[1px] flex-grow max-w-xs bg-zinc-900" />
        </div>

        {/* Grid of Three Collection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Oversized Collection */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative h-[480px] bg-[#0c0c0c] border border-zinc-950 rounded-xs overflow-hidden flex flex-col justify-end p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600"
              alt="Oversized Collection"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            
            <div className="relative z-20">
              {/* Gold Outlined Circle Icon */}
              <div className="w-12 h-12 rounded-full border border-[#C9A063]/40 bg-black/45 backdrop-blur-md flex items-center justify-center mb-5">
                <Shirt className="w-5 h-5 text-[#C9A063] stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-black tracking-[0.15em] text-white uppercase mb-1.5">
                Oversized Collection
              </h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-6 max-w-xs">
                Modern oversized tees for everyday streetwear.
              </p>
              <Link
                to="/shop?category=oversized"
                className="inline-block border border-zinc-800 text-white font-mono text-[10px] font-bold tracking-widest px-5 py-2.5 uppercase hover:bg-white hover:text-black hover:border-white transition-all rounded-xs"
              >
                SHOP NOW
              </Link>
            </div>
          </motion.div>

          {/* Minimal Collection */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative h-[480px] bg-[#0c0c0c] border border-zinc-950 rounded-xs overflow-hidden flex flex-col justify-end p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600"
              alt="Minimal Collection"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            
            <div className="relative z-20">
              {/* Gold Outlined Circle Icon */}
              <div className="w-12 h-12 rounded-full border border-[#C9A063]/40 bg-black/45 backdrop-blur-md flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5 text-[#C9A063] stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-black tracking-[0.15em] text-white uppercase mb-1.5">
                Minimal Collection
              </h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-6 max-w-xs">
                Clean, simple and premium logo T-Shirts.
              </p>
              <Link
                to="/shop?category=minimal"
                className="inline-block border border-zinc-800 text-white font-mono text-[10px] font-bold tracking-widest px-5 py-2.5 uppercase hover:bg-white hover:text-black hover:border-white transition-all rounded-xs"
              >
                SHOP NOW
              </Link>
            </div>
          </motion.div>

          {/* Graphic Collection */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative h-[480px] bg-[#0c0c0c] border border-zinc-950 rounded-xs overflow-hidden flex flex-col justify-end p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600"
              alt="Graphic Collection"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            
            <div className="relative z-20">
              {/* Gold Outlined Circle Icon */}
              <div className="w-12 h-12 rounded-full border border-[#C9A063]/40 bg-black/45 backdrop-blur-md flex items-center justify-center mb-5">
                <Star className="w-5 h-5 text-[#C9A063] stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-black tracking-[0.15em] text-white uppercase mb-1.5">
                Graphic Collection
              </h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-6 max-w-xs">
                Bold graphics and embroidered statement pieces.
              </p>
              <Link
                to="/shop?category=graphic"
                className="inline-block border border-zinc-800 text-white font-mono text-[10px] font-bold tracking-widest px-5 py-2.5 uppercase hover:bg-white hover:text-black hover:border-white transition-all rounded-xs"
              >
                SHOP NOW
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 5. BEST SELLERS SECTION */}
      <section className="py-24 border-y border-zinc-950 bg-[#070707]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section title centered with decorative dividers */}
          <div className="flex items-center justify-center gap-6 mb-16">
            <div className="hidden sm:block h-[1px] flex-grow max-w-xs bg-zinc-900" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-[0.25em] text-white text-center uppercase">
              BEST SELLERS
            </h2>
            <div className="hidden sm:block h-[1px] flex-grow max-w-xs bg-zinc-900" />
          </div>

          {/* Product grid of four cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BEST_SELLERS_PRODUCTS.map((prod, idx) => {
              const isFav = !!wishlistState[prod.id];
              return (
                <motion.div 
                  key={prod.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="group flex flex-col items-center"
                >
                  
                  {/* Image card structure */}
                  <div className="relative aspect-[3/4] w-full bg-[#0d0d0d] border border-zinc-900 rounded-xs overflow-hidden mb-5">
                    <Link to={`/product/${prod.slug}`} className="absolute inset-0 block w-full h-full">
                      
                      {/* Main image */}
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Hover alternative image */}
                      <img
                        src={prod.hoverImage}
                        alt={`${prod.name} alternate view`}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                    </Link>

                    {/* Heart wishlist top-right */}
                    <button
                      onClick={(e) => toggleWishlist(prod.id, e)}
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 border border-zinc-900/60 text-zinc-400 hover:text-red-500 hover:bg-black/80 transition-all z-10 cursor-pointer"
                      aria-label="Add to wishlist"
                    >
                      <Heart className={`w-4 h-4 transition-all ${isFav ? "fill-red-500 text-red-500 scale-110" : ""}`} />
                    </button>

                    {/* Quick Add To Bag Hover Bar */}
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 flex justify-center">
                      <button
                        onClick={(e) => handleQuickAdd(prod, e)}
                        className="bg-[#C9A063] hover:bg-white text-black font-mono text-[10px] font-black tracking-widest py-3 px-6 rounded-xs uppercase cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>QUICK ADD</span>
                      </button>
                    </div>

                  </div>

                  {/* Product Metadata */}
                  <div className="text-center">
                    <Link 
                      to={`/product/${prod.slug}`}
                      className="text-sm font-bold tracking-wide text-zinc-200 hover:text-[#C9A063] transition-colors uppercase block mb-1"
                    >
                      {prod.name}
                    </Link>
                    <span className="text-[#C9A063] font-mono font-bold text-sm tracking-widest block">
                      ₹{prod.price}
                    </span>
                  </div>

                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. BRAND FEATURES SECTION */}
      <section className="py-12 bg-[#050505] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-zinc-900/90 bg-[#070707] rounded-sm grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-zinc-900/90">
            {BRAND_FEATURES.map((feat, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4 p-5 md:p-3.5 lg:p-5 text-left transition-colors hover:bg-zinc-950/40"
              >
                {/* Custom Outlined Gold Icon wrapper */}
                <div className="flex-shrink-0 text-[#C9A063]">
                  {feat.icon}
                </div>
                
                {/* Text Metadata Stack */}
                <div className="flex flex-col">
                  <h4 className="text-[10px] lg:text-[11px] font-black tracking-[0.1em] text-white uppercase leading-snug">
                    {feat.title}
                  </h4>
                  <p className="text-[9px] lg:text-[10px] text-zinc-500 font-medium font-sans leading-tight mt-0.5">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ABOUT BRAND + TESTIMONIALS SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: About Brand Content */}
          <div className="lg:col-span-6 flex flex-col items-start gap-8">
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] text-[#C9A063] uppercase block mb-2 font-bold">LEGACY</span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-white uppercase mb-4">
                ABOUT KAIVO
              </h2>
              <div className="w-12 h-0.5 bg-[#C9A063] mb-6" />
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans font-medium mb-6">
                KAIVO is more than just a clothing brand. It's a mindset. We create premium oversized T-Shirts that speak minimalism, comfort, and confidence. Every piece is designed to make you feel your best, every day.
              </p>
              <Link
                to="/about"
                className="inline-block border border-zinc-800 hover:border-white text-white text-[10px] font-mono font-bold tracking-widest px-6 py-3 uppercase transition-colors rounded-xs"
              >
                READ MORE
              </Link>
            </div>

            {/* Brand Portrait Back Print model image */}
            <div className="w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] bg-zinc-950 border border-zinc-900 rounded-xs overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800"
                alt="KAIVO apparel model details"
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <span className="text-lg font-black tracking-widest text-white block uppercase">KAIVO ATELIER</span>
                <span className="text-[9px] text-[#C9A063] font-mono tracking-[0.2em] uppercase">WEAR CONFIDENCE</span>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Testimonials */}
          <div className="lg:col-span-6 flex flex-col gap-10">
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] text-[#C9A063] uppercase block mb-2 font-bold">VERIFIED INSIGHTS</span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-white uppercase mb-4">
                WHAT OUR CUSTOMERS SAY
              </h2>
              <div className="w-12 h-0.5 bg-[#C9A063] mb-6" />
            </div>

            {/* Testimonials 3 column / stack cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Testimonial Card 1 */}
              <div className="bg-[#0b0b0b] border border-zinc-900 p-6 flex flex-col justify-between rounded-xs min-h-[220px] hover:border-zinc-800 transition-colors">
                <div>
                  {/* Gold Stars */}
                  <div className="flex items-center gap-0.5 mb-4 text-[#C9A063]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#C9A063] text-[#C9A063]" />
                    ))}
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed italic font-sans font-medium">
                    "The quality is amazing. The fabric is thick and super soft."
                  </p>
                </div>
                <div className="border-t border-zinc-900/80 pt-3 mt-6">
                  <span className="text-xs font-bold text-white block tracking-wider uppercase">- Rohit</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Mumbai</span>
                </div>
              </div>

              {/* Testimonial Card 2 */}
              <div className="bg-[#0b0b0b] border border-zinc-900 p-6 flex flex-col justify-between rounded-xs min-h-[220px] hover:border-zinc-800 transition-colors">
                <div>
                  {/* Gold Stars */}
                  <div className="flex items-center gap-0.5 mb-4 text-[#C9A063]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#C9A063] text-[#C9A063]" />
                    ))}
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed italic font-sans font-medium">
                    "Perfect oversized fit and the embroidery looks premium."
                  </p>
                </div>
                <div className="border-t border-zinc-900/80 pt-3 mt-6">
                  <span className="text-xs font-bold text-white block tracking-wider uppercase">- Aryan</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Delhi</span>
                </div>
              </div>

              {/* Testimonial Card 3 */}
              <div className="bg-[#0b0b0b] border border-zinc-900 p-6 flex flex-col justify-between rounded-xs min-h-[220px] hover:border-zinc-800 transition-colors">
                <div>
                  {/* Gold Stars */}
                  <div className="flex items-center gap-0.5 mb-4 text-[#C9A063]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#C9A063] text-[#C9A063]" />
                    ))}
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed italic font-sans font-medium">
                    "KAIVO is my go-to brand now. Keep up the great work!"
                  </p>
                </div>
                <div className="border-t border-[#111] pt-3 mt-6">
                  <span className="text-xs font-bold text-white block tracking-wider uppercase">- Sameer</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Hyderabad</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 8. INSTAGRAM FEED SECTION */}
      <section className="py-24 border-t border-zinc-950 bg-[#040404]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-[0.25em] text-white uppercase mb-2">
              FOLLOW US ON INSTAGRAM
            </h2>
            <a 
              href="https://instagram.com/kaivo_official" 
              target="_blank" 
              rel="noreferrer"
              className="text-[#C9A063] font-mono font-bold tracking-widest text-xs hover:underline block uppercase"
            >
              @kaivo_official
            </a>
          </div>

          {/* Grid of 7 square images side-by-side */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {INSTAGRAM_POSTS.map((post) => (
              <a
                key={post.id}
                href={post.link}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square bg-[#0b0b0b] border border-zinc-900 hover:border-[#C9A063]/55 overflow-hidden rounded-xs block shadow-lg"
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <span className="text-[10px] font-mono tracking-wider text-[#C9A063] font-bold">@kaivo_official</span>
                </div>
                
                {/* Instagram image */}
                <img
                  src={post.image}
                  alt="KAIVO instagram streetwear drop"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </a>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ArrowRight, MessageSquare } from "lucide-react";
import { Product } from "../types";
import { useShop } from "../contexts/ShopContext";
import { trackWhatsAppClick } from "../lib/firebaseService";

interface ProductCardProps {
  product: Product;
  key?: React.Key;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { db } = useShop();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");

  // Price calculations
  const hasDiscount = product.discount > 0;
  const discountPrice = hasDiscount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  const generateCardWhatsAppMessage = () => {
    if (!db) return "#";
    const formattedPrice = `₹${Math.round(discountPrice)}`;
    const productUrl = `${window.location.origin}/product/${product.slug}`;
    const text = `Hello KAIVO,

I would like to order the following product.

Product:
${product.name}

Price:
${formattedPrice}

Size:
${selectedSize}

Color:
${selectedColor?.name || "Default"}

Product URL:
${productUrl}

Customer Name:
Not specified

Please assist me with this order.

Thank you.`;

    const encodedText = encodeURIComponent(text);
    const cleanNumber = db.settings.whatsappNumber.replace(/\D/g, ""); // strip + and non-digits for wa.me
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  };

  return (
    <div className="group relative flex flex-col bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden transition-all duration-300 hover:border-amber-500/50">
      
      {/* 1. IMAGE GALLERY CONTAINER */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 block">
        <img
          src={product.images[0] || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600"}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Secondary image overlay if available */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate`}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.newArrival && (
            <span className="bg-white text-black text-[10px] font-black tracking-widest px-2.5 py-1 uppercase rounded-xs shadow-md">
              NEW
            </span>
          )}
          {hasDiscount && (
            <span className="bg-amber-500 text-black text-[10px] font-black tracking-widest px-2.5 py-1 uppercase rounded-xs shadow-md">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Favorite heart toggle button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md rounded-full text-zinc-400 hover:text-red-500 active:scale-90 transition-all z-10 cursor-pointer"
        >
          <Heart className={`w-4.5 h-4.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>

        {/* Quick-add overlay sizing drawer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 hidden sm:block">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400">SELECT SIZE</span>
            <div className="flex gap-1.5 flex-wrap">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedSize(sz);
                  }}
                  className={`text-[10px] font-bold w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                    selectedSize === sz
                      ? "bg-amber-500 text-black border-amber-500"
                      : "bg-black/40 border-zinc-800 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* 2. PRODUCT DETAILS SECTION */}
      <div className="p-4 flex flex-col flex-grow">
        
        {/* Colors and Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">
            {product.category} COLLECTION
          </span>
          {/* Color Dots */}
          <div className="flex items-center gap-1.5">
            {product.colors.map((col) => (
              <button
                key={col.name}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor(col);
                }}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  selectedColor.hex === col.hex 
                    ? "border-amber-500 ring-1 ring-amber-500/50" 
                    : "border-zinc-800"
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
          </div>
        </div>

        {/* Name */}
        <Link 
          to={`/product/${product.slug}`}
          className="text-sm font-semibold tracking-wide text-zinc-100 hover:text-amber-500 transition-colors mb-2 line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Sizes (Mobile view alternative inline sizes) */}
        <div className="flex sm:hidden items-center gap-1 mb-2">
          {product.sizes.slice(0, 4).map((sz) => (
            <span key={sz} className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xs font-semibold">
              {sz}
            </span>
          ))}
          {product.sizes.length > 4 && (
            <span className="text-[9px] text-zinc-500 font-bold">+{product.sizes.length - 4}</span>
          )}
        </div>

        {/* Price and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-auto pt-3 border-t border-zinc-900/50">
          
          {/* Pricing Grid */}
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-amber-500 font-mono">
              ₹{Math.round(discountPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-zinc-500 line-through font-mono">
                ₹{product.price}
              </span>
            )}
          </div>

          {/* Order on WhatsApp */}
          <a
            href={generateCardWhatsAppMessage()}
            onClick={() => {
              trackWhatsAppClick(String(product.id), product.name, window.location.origin + `/product/${product.slug}`);
            }}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-black rounded-sm active:scale-95 transition-all flex items-center justify-center gap-1 font-mono text-[10px] font-bold tracking-wider cursor-pointer uppercase text-center"
            title="Order on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>ORDER NOW</span>
          </a>
        </div>
      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useShop } from "../contexts/ShopContext";
import ProductCard from "../components/ProductCard";
import { 
  Heart, 
  ShoppingCart, 
  MessageSquare, 
  ChevronRight, 
  Sparkles, 
  Ruler, 
  ShieldCheck, 
  RefreshCcw, 
  Truck 
} from "lucide-react";
import { Color } from "../types";

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { db, addToCart } = useShop();

  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);
  const [showCartSuccess, setShowCartSuccess] = useState<boolean>(false);

  // Retrieve product by slug
  const product = db?.products.find((p) => p.slug === slug);

  // Set default values when product changes
  useEffect(() => {
    if (product) {
      setActiveImage(product.images[0]);
      setSelectedSize(product.sizes[0] || "M");
      setSelectedColor(product.colors[0] || null);
      setQuantity(1);
    }
  }, [product]);

  if (!db || !product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center py-20 px-4 text-center">
        <h2 className="text-xl font-mono uppercase tracking-widest text-zinc-500 mb-4">Product Not Found</h2>
        <Link to="/shop" className="bg-amber-500 text-black px-6 py-3 font-mono font-bold text-xs tracking-widest uppercase rounded">
          BACK TO SHOP
        </Link>
      </div>
    );
  }

  // Related products (from same category, excluding current product)
  const relatedProducts = db.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Pricing calculations
  const hasDiscount = product.discount > 0;
  const discountPrice = hasDiscount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  const handleAddToCart = () => {
    if (!selectedColor) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    setShowCartSuccess(true);
    setTimeout(() => setShowCartSuccess(false), 3500);
  };

  // Generate WhatsApp text payload precisely as requested in description
  const generateWhatsAppMessage = () => {
    const formattedPrice = `₹${Math.round(discountPrice)}`;
    const text = `Hello,
I would like to order:

Product:
${product.name}

Size:
${selectedSize}

Color:
${selectedColor?.name || "Default"}

Price:
${formattedPrice}

Please assist.`;

    const encodedText = encodeURIComponent(text);
    const cleanNumber = db.settings.whatsappNumber.replace(/[^+\d]/g, ""); // strip space/dashes
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  };

  return (
    <div className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* 1. BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-10 uppercase tracking-widest">
        <Link to="/" className="hover:text-white transition-colors">HOME</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-white transition-colors">SHOP</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${product.category}`} className="hover:text-white transition-colors">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-300 truncate max-w-[150px]">{product.name}</span>
      </nav>

      {/* 2. MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        
        {/* LEFT COLUMN: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
          
          {/* Active Big Image with Zoom Container */}
          <div className="flex-grow aspect-[3/4] border border-zinc-900 bg-zinc-950 rounded-sm overflow-hidden relative group">
            {/* Hover visual zoom effect */}
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-115"
              referrerPolicy="no-referrer"
            />
            {product.newArrival && (
              <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-black tracking-widest px-3 py-1.5 uppercase rounded-xs">
                NEW
              </span>
            )}
            {hasDiscount && (
              <span className="absolute top-4 left-20 bg-amber-500 text-black text-[10px] font-black tracking-widest px-3 py-1.5 uppercase rounded-xs">
                -{product.discount}% OFF
              </span>
            )}
          </div>

          {/* Sidelist thumbnails list */}
          {product.images.length > 1 && (
            <div className="flex flex-row md:flex-col gap-3 shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 border rounded-sm overflow-hidden bg-zinc-950 transition-all cursor-pointer ${
                    activeImage === img ? "border-amber-500 ring-1 ring-amber-500/35" : "border-zinc-900 hover:border-zinc-600"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Product Details Info */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          
          {/* Subtitle and Badge */}
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-zinc-900 text-amber-500 text-[10px] font-mono tracking-widest px-2.5 py-1 uppercase rounded-xs border border-zinc-800">
              {product.category} COLLECTION
            </span>
            {product.stock > 0 ? (
              <span className="text-emerald-500 text-[10px] font-mono tracking-wider">● IN STOCK</span>
            ) : (
              <span className="text-red-500 text-[10px] font-mono tracking-wider">● OUT OF STOCK</span>
            )}
          </div>

          {/* Name & Heart toggle */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-zinc-100 uppercase">
              {product.name}
            </h1>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="p-3 border border-zinc-900 hover:border-red-500 hover:text-red-500 rounded-full text-zinc-400 transition-all cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>

          {/* Prices */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-extrabold text-amber-500 font-mono">
              ₹{Math.round(discountPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-zinc-500 line-through font-mono">
                  ₹{product.price}
                </span>
                <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-xs font-mono">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="border-t border-zinc-900 pt-6 mb-6">
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans">
              {product.description}
            </p>
          </div>

          {/* Color Select */}
          <div className="mb-6">
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-3">
              SELECT COLOR: {selectedColor?.name}
            </span>
            <div className="flex items-center gap-3">
              {product.colors.map((col) => (
                <button
                  key={col.name}
                  onClick={() => setSelectedColor(col)}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer relative ${
                    selectedColor?.hex === col.hex 
                      ? "border-amber-500 ring-2 ring-amber-500/30 scale-105" 
                      : "border-zinc-800 hover:border-zinc-500"
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {selectedColor?.hex === col.hex && (
                    <span className={`w-2 h-2 rounded-full ${col.name === "White" ? "bg-black" : "bg-white"}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Select with Size Guide indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
                SELECT SIZE: {selectedSize}
              </span>
              <button 
                onClick={() => setSizeGuideOpen(true)}
                className="text-[10px] font-mono tracking-widest text-amber-500 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>SIZE GUIDE</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2.5">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`w-10 h-10 rounded-sm border font-mono text-xs font-bold transition-all cursor-pointer ${
                    selectedSize === sz
                      ? "bg-amber-500 border-amber-500 text-black font-extrabold"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="mb-8 flex items-center gap-4">
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">QUANTITY</span>
            <div className="flex items-center border border-zinc-800 bg-zinc-950 rounded-sm overflow-hidden h-10 w-28">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white font-bold cursor-pointer"
              >
                -
              </button>
              <span className="flex-grow text-center text-xs font-mono font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* PRIMARY CTAS PANEL */}
          <div className="flex flex-col gap-3.5 mt-auto">
            {/* WHATSAPP ACTION - Direct link target blank */}
            <a
              href={generateWhatsAppMessage()}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#25d366] hover:bg-[#20ba5a] active:scale-98 text-black font-bold text-xs tracking-widest py-4.5 uppercase transition-all rounded-sm font-mono flex items-center justify-center gap-2 shadow-lg cursor-pointer text-center"
            >
              <MessageSquare className="w-4.5 h-4.5" />
              <span>ORDER ON WHATSAPP</span>
            </a>

            {/* Local Shopping Cart button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-zinc-900 hover:bg-amber-500 hover:text-black border border-zinc-800 hover:border-amber-500 text-amber-500 font-bold text-xs tracking-widest py-4 uppercase transition-all rounded-sm font-mono flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              <span>ADD TO CART BAG</span>
            </button>
          </div>

          {/* Success toast inside column */}
          <AnimatePresence>
            {showCartSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs rounded-sm font-mono flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>ADDED! Items added successfully to your Cart.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Technical assurances list */}
          <div className="grid grid-cols-3 gap-3 mt-10 pt-8 border-t border-zinc-900 text-center">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-zinc-500 mb-1" />
              <span className="text-[9px] font-mono font-semibold tracking-wider text-zinc-400 block uppercase">Bio-Washed</span>
              <span className="text-[8px] text-zinc-600 font-mono">Premium Softness</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-zinc-500 mb-1" />
              <span className="text-[9px] font-mono font-semibold tracking-wider text-zinc-400 block uppercase">Fast Delivery</span>
              <span className="text-[8px] text-zinc-600 font-mono">3-7 Days</span>
            </div>
            <div className="flex flex-col items-center">
              <RefreshCcw className="w-5 h-5 text-zinc-500 mb-1" />
              <span className="text-[9px] font-mono font-semibold tracking-wider text-zinc-400 block uppercase">7 Days Exchange</span>
              <span className="text-[8px] text-zinc-600 font-mono">Hassle Free</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-zinc-900 pt-16 mb-10">
          <div className="text-center md:text-left mb-10">
            <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase block mb-1">YOU MIGHT ALSO LIKE</span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-white uppercase">RELATED STREETWEAR</h2>
            <div className="w-12 h-0.5 bg-amber-500 mt-3 md:mx-0 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 4. SIZE GUIDE MODAL */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setSizeGuideOpen(false)}
              className="absolute inset-0 bg-black"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-950 border border-zinc-800 p-6 rounded-sm max-w-lg w-full shadow-2xl z-10"
            >
              <button 
                onClick={() => setSizeGuideOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                X
              </button>

              <h3 className="text-lg font-black tracking-widest uppercase mb-1">OVERSIZED FIT GUIDE</h3>
              <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-wider mb-6">Values listed in inches</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300 font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase">
                      <th className="py-2.5">SIZE</th>
                      <th className="py-2.5">CHEST</th>
                      <th className="py-2.5">LENGTH</th>
                      <th className="py-2.5">SHOULDER</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-900">
                      <td className="py-3 font-bold text-white">S</td>
                      <td className="py-3">42"</td>
                      <td className="py-3">28"</td>
                      <td className="py-3">20.5"</td>
                    </tr>
                    <tr className="border-b border-zinc-900">
                      <td className="py-3 font-bold text-white">M</td>
                      <td className="py-3">44"</td>
                      <td className="py-3">29"</td>
                      <td className="py-3">21.5"</td>
                    </tr>
                    <tr className="border-b border-zinc-900">
                      <td className="py-3 font-bold text-white">L</td>
                      <td className="py-3">46"</td>
                      <td className="py-3">30"</td>
                      <td className="py-3">22.5"</td>
                    </tr>
                    <tr className="border-b border-zinc-900">
                      <td className="py-3 font-bold text-white">XL</td>
                      <td className="py-3">48"</td>
                      <td className="py-3">31"</td>
                      <td className="py-3">23.5"</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">XXL</td>
                      <td className="py-3">50"</td>
                      <td className="py-3">31.5"</td>
                      <td className="py-3">24"</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-3 bg-zinc-900 border border-zinc-800 rounded-sm text-[10px] text-zinc-400 font-sans leading-relaxed">
                <strong>Styling tip:</strong> All of our tees are engineered with a drop-shoulder design. We recommend ordering your standard size for a premium oversized slouchy aesthetic, or sizing down if you prefer a standard tailored fit.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from "react-router-dom";
import { useShop } from "../contexts/ShopContext";
import { 
  Trash2, 
  ShoppingBag, 
  MessageSquare, 
  ArrowLeft, 
  ArrowRight,
  ShieldAlert,
  Percent
} from "lucide-react";

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, clearCart, db } = useShop();

  if (!db) return null;

  // Calculates subtotal based on active discount prices
  const subtotal = cart.reduce((total, item) => {
    const hasDiscount = item.product.discount > 0;
    const itemPrice = hasDiscount 
      ? item.product.price * (1 - item.product.discount / 100) 
      : item.product.price;
    return total + itemPrice * item.quantity;
  }, 0);

  // Free shipping above ₹999, else ₹99 flat rate
  const shippingThreshold = 999;
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shippingCost;

  // Compile detailed, readable order report for WhatsApp
  const handleCheckout = () => {
    let orderLines = "";
    cart.forEach((item, index) => {
      const hasDiscount = item.product.discount > 0;
      const finalItemPrice = hasDiscount 
        ? item.product.price * (1 - item.product.discount / 100) 
        : item.product.price;
      const lineSubtotal = Math.round(finalItemPrice * item.quantity);
      
      orderLines += `${index + 1}. ${item.product.name} (Size: ${item.size}, Color: ${item.color.name}) x ${item.quantity} - ₹${lineSubtotal}\n`;
    });

    const shippingLabel = shippingCost === 0 ? "FREE" : `₹${shippingCost}`;

    const text = `Hello KAIVO,
I would like to place an order:

Order Details:
----------------------------------
${orderLines}
----------------------------------
Subtotal: ₹${Math.round(subtotal)}
Delivery: ${shippingLabel}
Total Amount: ₹${Math.round(grandTotal)}

Please confirm and share payment details.`;

    const encodedText = encodeURIComponent(text);
    const cleanNumber = db.settings.whatsappNumber.replace(/[^+\d]/g, ""); // strip space/dashes
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;
    
    // Open in new tab
    window.open(waUrl, "_blank", "noreferrer");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-500 mb-6 bg-zinc-950">
          <ShoppingBag className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-widest text-zinc-300 mb-2">
          YOUR BAG IS EMPTY
        </h1>
        <p className="text-xs text-zinc-500 leading-relaxed font-sans mb-8">
          Looks like you haven't added any of our heavyweight premium streetwear to your bag yet. Start browsing now to find your perfect fit!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link
            to="/shop"
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs tracking-widest px-6 py-3.5 uppercase rounded-sm font-mono transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>BROWSE CATALOGUE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/new-arrivals"
            className="border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white font-bold text-xs tracking-widest px-6 py-3.5 uppercase rounded-sm font-mono transition-all flex items-center justify-center cursor-pointer"
          >
            NEW DROPS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      
      {/* 1. HEADER */}
      <div className="border-b border-zinc-900 pb-6 mb-10">
        <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase block mb-2">YOUR SELECTIONS</span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-widest uppercase">
          SHOPPING BAG
        </h1>
      </div>

      {/* 2. LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: Items List */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono pb-2 border-b border-zinc-950">
            <span>{cart.length} ITEMS SELECTED</span>
            <button
              onClick={clearCart}
              className="text-amber-500 hover:text-red-500 cursor-pointer transition-colors"
            >
              CLEAR BAG
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {cart.map((item) => {
              const hasDiscount = item.product.discount > 0;
              const unitPrice = hasDiscount 
                ? item.product.price * (1 - item.product.discount / 100) 
                : item.product.price;
              const subtotalPrice = unitPrice * item.quantity;

              return (
                <div 
                  key={`${item.product.id}-${item.size}-${item.color.name}`}
                  className="flex flex-col sm:flex-row gap-5 p-5 border border-zinc-900 bg-zinc-950/40 rounded-sm hover:border-zinc-800 transition-all relative group"
                >
                  {/* Thumbnail Image */}
                  <div className="w-20 sm:w-24 aspect-[3/4] rounded-sm overflow-hidden border border-zinc-900 shrink-0 bg-black">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Core details column */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <Link 
                          to={`/product/${item.product.slug}`}
                          className="text-sm font-bold uppercase tracking-wider text-white hover:text-amber-500 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        
                        <button
                          onClick={() => removeFromCart(item.product.id, item.size, item.color.name)}
                          className="text-zinc-500 hover:text-red-500 p-1 transition-colors cursor-pointer sm:opacity-0 sm:group-hover:opacity-100"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Config lines */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 font-mono mt-1">
                        <span className="flex items-center gap-1.5">
                          SIZE: <span className="text-white font-bold">{item.size}</span>
                        </span>
                        <span className="h-3 w-px bg-zinc-800" />
                        <span className="flex items-center gap-1.5">
                          COLOR: 
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-zinc-800 inline-block align-middle"
                            style={{ backgroundColor: item.color.hex }}
                            title={item.color.name}
                          />
                          <span className="text-white font-bold uppercase">{item.color.name}</span>
                        </span>
                      </div>
                    </div>

                    {/* Quantity selectors & price multipliers */}
                    <div className="flex flex-wrap items-end justify-between gap-4 mt-6">
                      
                      <div className="flex items-center border border-zinc-850 bg-black rounded-sm overflow-hidden h-9 w-24">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.size, item.color.name, Math.max(1, item.quantity - 1))}
                          className="w-8 text-xs hover:bg-zinc-900 text-zinc-500 hover:text-white font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="flex-grow text-center text-xs font-mono font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.size, item.color.name, item.quantity + 1)}
                          className="w-8 text-xs hover:bg-zinc-900 text-zinc-500 hover:text-white font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-[10px] text-zinc-600 block mb-0.5">₹{Math.round(unitPrice)} EACH</span>
                        <span className="text-sm font-black text-amber-500">₹{Math.round(subtotalPrice)}</span>
                      </div>

                    </div>
                  </div>

                  {/* Absolute mobile remove button */}
                  <button
                    onClick={() => removeFromCart(item.product.id, item.size, item.color.name)}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 p-1 transition-colors cursor-pointer sm:hidden"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              );
            })}
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-zinc-500 hover:text-amber-500 transition-colors mt-4 self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>CONTINUE BROWSING</span>
          </Link>

        </div>

        {/* RIGHT COLUMN: Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-black tracking-widest font-mono uppercase pb-3 border-b border-zinc-900 text-zinc-300">
              ORDER SUMMARY
            </h3>
          </div>

          {/* Breakdown parameters */}
          <div className="flex flex-col gap-4 text-xs font-mono">
            
            <div className="flex justify-between items-center text-zinc-400">
              <span>BAG SUBTOTAL</span>
              <span className="text-white">₹{Math.round(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-zinc-400">
              <span>ESTIMATED DELIVERY</span>
              {shippingCost === 0 ? (
                <span className="text-emerald-500 uppercase font-bold">FREE</span>
              ) : (
                <span className="text-white">₹{shippingCost}</span>
              )}
            </div>

            {shippingCost > 0 && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-sm text-[10px] text-zinc-500 leading-normal font-sans">
                💡 Add streetwear worth <strong className="text-amber-500 font-mono">₹{shippingThreshold - subtotal}</strong> more to unlock <strong className="text-emerald-500">FREE SHIPPING</strong>.
              </div>
            )}

            {subtotal >= shippingThreshold && (
              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-sm text-[10px] text-emerald-500 leading-normal font-sans flex items-center gap-2">
                <Percent className="w-4 h-4 shrink-0 animate-bounce" />
                <span>Awesome! Your order qualifies for <strong>FREE DELIVERY</strong>.</span>
              </div>
            )}

            <div className="h-px bg-zinc-900 my-2" />

            <div className="flex justify-between items-baseline text-sm">
              <span className="text-zinc-300 uppercase font-black tracking-wider">ORDER TOTAL</span>
              <span className="text-xl font-black text-amber-500">₹{Math.round(grandTotal)}</span>
            </div>

          </div>

          {/* CHECKOUT ACTION BUTTON */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900">
            <button
              onClick={handleCheckout}
              className="w-full bg-[#25d366] hover:bg-[#20ba5a] active:scale-98 text-black font-black text-xs tracking-widest py-4.5 uppercase transition-all rounded-sm font-mono flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <MessageSquare className="w-4.5 h-4.5" />
              <span>PLACE ORDER VIA WHATSAPP</span>
            </button>
          </div>

          {/* Secure assure labels */}
          <div className="mt-2 text-center p-3.5 border border-zinc-900/50 rounded bg-black/30">
            <div className="flex justify-center items-center gap-2 text-zinc-500 text-[10px] uppercase font-mono tracking-widest">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>NO CARD DETAILS REQUIRED</span>
            </div>
            <p className="text-[9px] text-zinc-600 font-sans leading-normal mt-1.5">
              Secure checkouts made easy. Complete your request over WhatsApp chat. COD or UPI payment options available.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

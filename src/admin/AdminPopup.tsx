/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useShop } from "../contexts/ShopContext";
import { Save, Check, Sparkles, AlertCircle, Eye, Sliders, Image as ImageIcon } from "lucide-react";

export default function AdminPopup() {
  const { db, updatePopup } = useShop();
  const [notif, setNotif] = useState("");

  if (!db) return null;

  // Set default values if db.popup is empty
  const defaultPopup = {
    enabled: false,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600",
    title: "GET 10% OFF YOUR FIRST ORDER",
    content: "Subscribe to our exclusive drops newsletter and get 10% off your purchase. Wear your confidence today.",
    buttonText: "JOIN THE CLUB",
    buttonLink: "/shop",
    delay: 3,
    frequency: "once" as const
  };

  const popup = db.popup || defaultPopup;

  const [enabled, setEnabled] = useState(popup.enabled);
  const [image, setImage] = useState(popup.image);
  const [title, setTitle] = useState(popup.title);
  const [content, setContent] = useState(popup.content);
  const [buttonText, setButtonText] = useState(popup.buttonText);
  const [buttonLink, setButtonLink] = useState(popup.buttonLink);
  const [delay, setDelay] = useState(popup.delay);
  const [frequency, setFrequency] = useState(popup.frequency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updatePopup({
      enabled,
      image,
      title,
      content,
      buttonText,
      buttonLink,
      delay: Number(delay),
      frequency
    });

    setNotif("🎉 Promotional popup configuration updated successfully!");
    setTimeout(() => setNotif(""), 3000);
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">PROMOTIONAL MARKETING</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            POPUP MANAGER
          </h1>
        </div>
      </div>

      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT PANEL: CONFIG FORM */}
        <form onSubmit={handleSubmit} className="lg:col-span-6 bg-zinc-950 border border-zinc-900 rounded-sm p-6 sm:p-8 flex flex-col gap-6">
          <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 mb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>POPUP CONFIGURATION</span>
          </h2>

          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="popupEnabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4.5 h-4.5 border border-zinc-800 rounded-xs accent-amber-500 cursor-pointer"
            />
            <label htmlFor="popupEnabled" className="text-xs font-mono font-bold text-white tracking-wider select-none cursor-pointer uppercase">
              ENABLE / ACTIVATE PROMOTION POPUP
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Popup Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. JOIN THE MOVEMENT"
              className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono uppercase font-black"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Popup Message Content</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Explain the promotional offer clearly to visitors..."
              className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-sans resize-none leading-relaxed text-zinc-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Button Text</label>
              <input
                type="text"
                required
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. SHOP COLLECTION"
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono uppercase"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Button Link Path</label>
              <input
                type="text"
                required
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                placeholder="/shop, /oversized..."
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Promo Image URL (Copy from Media Library)</label>
            <input
              type="text"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-zinc-300 focus:outline-none focus:border-amber-500 rounded-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-900 pt-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Display Delay (Seconds)</label>
              <select
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
              >
                <option value="0">Immediate (0s)</option>
                <option value="2">2 Seconds</option>
                <option value="3">3 Seconds</option>
                <option value="5">5 Seconds</option>
                <option value="10">10 Seconds</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Display Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
              >
                <option value="always">Every Page Refresh (Always)</option>
                <option value="once">Once Per Visitor Session (Recommended)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#C9A063] hover:bg-[#B38E55] text-black font-bold text-xs tracking-widest py-4 uppercase transition-all rounded-sm font-mono flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <Save className="w-4 h-4 text-black" />
            <span>SAVE POPUP SETTINGS</span>
          </button>
        </form>

        {/* RIGHT PANEL: LIVE MOCK PREVIEW */}
        <div className="lg:col-span-6 bg-zinc-950 border border-zinc-900 rounded-sm p-6 sm:p-8 flex flex-col gap-6 sticky top-8">
          <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#C9A063]" />
              <span>LIVE POPUP PREVIEW MOCK</span>
            </span>
            <span className={`px-2 py-0.5 text-[8px] font-mono rounded border uppercase ${
              enabled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {enabled ? "Active" : "Inactive"}
            </span>
          </h2>

          <p className="text-[10px] font-mono text-zinc-550 leading-relaxed uppercase border border-dashed border-zinc-900 p-4 rounded bg-black">
            💡 This preview simulates exactly how the premium customer-facing popup will appear overlaying the live website after {delay} second{delay !== 1 ? "s" : ""}.
          </p>

          {/* Interactive Popup Card mockup */}
          <div className="bg-black/80 p-8 rounded border border-zinc-900 aspect-video flex items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black min-h-[320px]">
            <div className="bg-zinc-950 border border-zinc-900 rounded-sm max-w-sm w-full overflow-hidden flex flex-col shadow-2xl relative">
              {/* Image panel */}
              <div className="h-32 bg-zinc-900 relative">
                {image ? (
                  <img src={image} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-650 bg-black">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {/* Close button representation */}
                <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-black border border-zinc-800 rounded-sm flex items-center justify-center text-zinc-400 text-xs font-mono">
                  ×
                </div>
              </div>

              {/* Content panel */}
              <div className="p-5 flex flex-col gap-3.5 text-center items-center">
                <h4 className="text-[11px] font-black tracking-widest text-white uppercase font-sans">
                  {title || "GET PROMO DISCOUNTS"}
                </h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed max-w-xs font-sans">
                  {content || "Promotion message body will reside here. Highly tailored to grab user attention."}
                </p>
                
                <button
                  type="button"
                  className="bg-[#C9A063] text-black text-[9px] font-mono font-bold tracking-widest uppercase py-2.5 px-6 rounded-xs mt-1 cursor-default"
                >
                  {buttonText || "SHOP NOW"}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

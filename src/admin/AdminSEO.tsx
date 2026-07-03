/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useShop } from "../contexts/ShopContext";
import { GlobalSEO } from "../types";
import { Save, Check, Globe, HelpCircle, ArrowUpRight } from "lucide-react";

export default function AdminSEO() {
  const { db, updateGlobalSEO } = useShop();
  const [notif, setNotif] = useState("");

  // SEO Form State
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [favicon, setFavicon] = useState("");

  // Populate state once DB is loaded
  React.useEffect(() => {
    if (db?.seo) {
      setSiteTitle(db.seo.siteTitle || "");
      setSiteDescription(db.seo.siteDescription || "");
      setKeywords(db.seo.keywords || "");
      setOgImage(db.seo.ogImage || "");
      setFavicon(db.seo.favicon || "");
    }
  }, [db]);

  if (!db) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const seo: GlobalSEO = {
      siteTitle,
      siteDescription,
      keywords,
      ogImage,
      favicon
    };

    updateGlobalSEO(seo);
    setNotif("Global SEO settings successfully synced!");
    setTimeout(() => setNotif(""), 3000);
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">METADATA & ROBOTS</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            SEO MANAGER
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
        
        {/* LEFT: SEO Configuration Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-6 text-xs">
          <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3">
            GLOBAL METADATA CONFIGURATION
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <span>SEO Website Title</span>
              <HelpCircle className="w-3.5 h-3.5 text-zinc-650" title="The brand title appearing in search results and browser tabs." />
            </label>
            <input
              type="text"
              required
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="e.g. KAIVO | Premium Oversized Streetwear T-Shirts"
              className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-sans"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <span>SEO Website Description</span>
              <HelpCircle className="w-3.5 h-3.5 text-zinc-650" title="A short descriptive summary of the page indexed by search engines." />
            </label>
            <textarea
              required
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="e.g. Elevating streetwear aesthetics. Discover custom oversized 240 GSM bio-washed heavyweight cotton T-shirts with screen-printed premium graphics."
              rows={4}
              className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-sans resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <span>Search Keywords (Comma Separated)</span>
              <HelpCircle className="w-3.5 h-3.5 text-zinc-650" title="Tags and terms indicating page content. Helps older search engines categorize content." />
            </label>
            <input
              type="text"
              required
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="streetwear, oversized t-shirt, bio-washed cotton, 240 gsm, premium apparel"
              className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              Open Graph Preview Image URL
            </label>
            <input
              type="text"
              required
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200"
              className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              Favicon Icon URL (.png / .ico)
            </label>
            <input
              type="text"
              required
              value={favicon}
              onChange={(e) => setFavicon(e.target.value)}
              placeholder="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=32"
              className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#C9A063] hover:bg-[#B38E55] text-black font-bold text-xs tracking-widest py-4 uppercase rounded-sm font-mono flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <Save className="w-4 h-4 text-black" />
            <span>SAVE METADATA</span>
          </button>
        </form>

        {/* RIGHT: Live SERP Simulation */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-6 font-mono text-xs">
          <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400 border-b border-zinc-900 pb-3">
            GOOGLE SEARCH PREVIEW
          </h2>

          <div className="bg-zinc-900/50 p-5 rounded border border-zinc-900 flex flex-col gap-2 font-sans select-none">
            {/* Top link display */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-white">g</span>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-medium text-zinc-200">Google Search Simulator</span>
                <span className="text-[10px] text-zinc-500 truncate">https://kaivoclothing.com</span>
              </div>
            </div>

            {/* Simulated Heading Link */}
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className="text-[#8ab4f8] hover:underline text-lg font-medium leading-tight block mt-1 tracking-wide"
            >
              {siteTitle || "KAIVO | Wear Confidence"}
            </a>

            {/* Simulated Description */}
            <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">
              {siteDescription || "Please provide a website meta description to see how search engines like Google indexes and represents your storefront to streetwear enthusiasts."}
            </p>
          </div>

          {/* OG Preview */}
          <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400 border-b border-zinc-900 pb-3 pt-4">
            SOCIAL GRAPH CARD PREVIEW
          </h2>

          <div className="border border-zinc-900 rounded-sm bg-black overflow-hidden font-sans select-none flex flex-col">
            <div className="aspect-video bg-zinc-900 overflow-hidden relative">
              {ogImage ? (
                <img 
                  src={ogImage} 
                  alt="OG Card" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Globe className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="p-4 bg-zinc-950 flex flex-col gap-1 border-t border-zinc-900">
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">KAIVOCLOTHING.COM</span>
              <span className="text-white text-xs font-bold font-mono tracking-wide truncate">{siteTitle || "KAIVO"}</span>
              <span className="text-zinc-500 text-[11px] truncate">{siteDescription}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

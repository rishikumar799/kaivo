/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useShop } from "../contexts/ShopContext";
import { Banner } from "../types";
import { Plus, Trash2, Edit3, X, Save, Sparkles } from "lucide-react";

export default function AdminBanners() {
  const { db, updateDatabase } = useShop();

  const [editId, setEditId] = useState<string | number | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [ctaLink, setCtaLink] = useState("/shop");
  const [ctaText, setCtaText] = useState("SHOP NOW");

  const [notif, setNotif] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  if (!db) return null;

  const startEdit = (b: Banner) => {
    setEditId(b.id);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setImage(b.image);
    setCtaLink(b.ctaLink || "/shop");
    setCtaText(b.ctaText || "SHOP NOW");
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setSubtitle("");
    setImage("");
    setCtaLink("/shop");
    setCtaText("SHOP NOW");
    setShowAddForm(false);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();

    if (!image.trim()) {
      alert("Please provide a hero banner image URL.");
      return;
    }

    let updatedBanners = [...db.banners];

    if (editId !== null) {
      updatedBanners = updatedBanners.map((b) =>
        b.id === editId ? { ...b, title, subtitle, image, ctaLink, ctaText } : b
      );
      setNotif("🎉 Carousel Banner updated successfully!");
    } else {
      const newId = `banner-${Date.now()}`;
      const newBanner: Banner = { 
        id: newId, 
        title, 
        subtitle, 
        image, 
        ctaLink, 
        ctaText,
        enabled: true 
      };
      updatedBanners.push(newBanner);
      setNotif("🚀 New Hero Banner added to homepage slider!");
    }

    updateDatabase({ ...db, banners: updatedBanners });
    resetForm();
    setTimeout(() => setNotif(""), 2500);
  };

  const handleDeleteBanner = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this Hero Banner slide?")) {
      const remaining = db.banners.filter((b) => b.id !== id);
      updateDatabase({ ...db, banners: remaining });
      setNotif("🗑️ Hero Banner slide deleted successfully.");
      setTimeout(() => setNotif(""), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">HOMEPAGE HERO SLIDESHOW</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            CAROUSEL BANNERS
          </h1>
        </div>

        {!showAddForm && (
          <button
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs tracking-widest px-4 py-2.5 rounded-sm font-mono flex items-center gap-1.5 uppercase transition-all shadow-lg cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5 text-black stroke-[3]" />
            <span>CREATE BANNER</span>
          </button>
        )}
      </div>

      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>{notif}</span>
        </div>
      )}

      {/* CORE WRAPPERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* EDIT FORM SIDEBAR */}
        {showAddForm && (
          <form 
            onSubmit={handleSaveBanner} 
            className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-5 sticky top-24"
          >
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300">
                {editId !== null ? "EDIT BANNER SLIDE" : "ADD NEW HERO SLIDE"}
              </span>
              <button type="button" onClick={resetForm} className="text-zinc-500 hover:text-white">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Title / Heading */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Slide Big Heading</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CORE OVERSIZED DROP"
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm"
              />
            </div>

            {/* Subtitle */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Slide Subtitle / Subtext</label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Fresh streetwear collections. Made in cotton."
                className="bg-black border border-zinc-855 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm"
              />
            </div>

            {/* Action Text */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Button Text Label</label>
              <input
                type="text"
                required
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. SHOP NOW"
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono text-zinc-400"
              />
            </div>

            {/* Redirect link */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Redirect Button Link</label>
              <input
                type="text"
                required
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="/shop or /oversized"
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono text-zinc-400"
              />
            </div>

            {/* Banner Image path */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Banner Image URL</label>
              <input
                type="url"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Paste slideshow background image URL..."
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
              />
            </div>

            {/* Actions CTA */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-grow border border-zinc-855 text-zinc-400 font-bold font-mono text-[10px] py-3.5 uppercase rounded-sm cursor-pointer hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex-grow bg-amber-500 hover:bg-amber-600 text-black font-bold font-mono text-[10px] py-3.5 uppercase rounded-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE BANNER</span>
              </button>
            </div>
          </form>
        )}

        {/* INDEX DIRECTORY */}
        <div className={showAddForm ? "lg:col-span-8 flex flex-col gap-6" : "lg:col-span-12 flex flex-col gap-6"}>
          {db.banners.map((slide) => (
            <div 
              key={slide.id}
              className="bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden flex flex-col md:flex-row group hover:border-zinc-800 transition-all"
            >
              <div className="md:w-56 h-36 border-b md:border-b-0 md:border-r border-zinc-900 overflow-hidden shrink-0 bg-neutral-900 relative">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Text Meta info */}
              <div className="p-5 flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{slide.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans mt-1">{slide.subtitle}</p>
                  <span className="text-[10px] text-amber-500 font-mono mt-3 block uppercase tracking-wider">Button action: "{slide.ctaText || "SHOP"}" targets {slide.ctaLink}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 border-t border-zinc-900/60 pt-3 sm:pt-0">
                  <button
                    onClick={() => startEdit(slide)}
                    className="p-2 border border-zinc-900 hover:border-amber-500 bg-black text-zinc-400 hover:text-amber-500 rounded transition-colors cursor-pointer"
                    title="Edit Slide"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(slide.id)}
                    className="p-2 border border-zinc-900 hover:border-red-500 bg-black text-zinc-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

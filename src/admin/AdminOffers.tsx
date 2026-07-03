/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useShop } from "../contexts/ShopContext";
import { Save, Sparkles, Megaphone } from "lucide-react";

export default function AdminOffers() {
  const { db, updateDatabase } = useShop();

  const [notif, setNotif] = useState("");

  // Retrieve initial state values directly from db.offers
  const [text, setText] = useState(db?.offers.text || "");
  const [enabled, setEnabled] = useState(db?.offers.enabled ?? true);

  if (!db) return null;

  const handleSaveOffers = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      alert("Please provide the announcement text slogan.");
      return;
    }

    const updatedOffers = {
      ...db.offers,
      text,
      enabled
    };

    updateDatabase({
      ...db,
      offers: updatedOffers
    });

    setNotif("🎉 Top promo announcement bar updated successfully!");
    setTimeout(() => setNotif(""), 3000);
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">PROMOTION MARQUEE BAR</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            TOP ANNOUNCEMENT
          </h1>
        </div>
      </div>

      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>{notif}</span>
        </div>
      )}

      {/* BODY CONFIGURATOR */}
      <div className="max-w-2xl bg-zinc-950 border border-zinc-900 rounded-sm p-6 sm:p-8">
        <form onSubmit={handleSaveOffers} className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-zinc-900 bg-black flex items-center justify-center rounded text-amber-500 shrink-0 mt-0.5">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">PROMOTION TEXT & CAMPAIGN</h2>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans mt-0.5">
                Configure the text scrollable alert bar displaying at the absolute top of every page.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Alert Bar Statement</label>
            <input
              type="text"
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. FREE SHIPPING ON ALL ORDERS ABOVE ₹999"
              className="bg-black border border-zinc-800 text-xs px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 rounded-sm"
            />
          </div>

          <label className="flex items-center gap-3 text-xs text-zinc-400 hover:text-white cursor-pointer select-none border-t border-zinc-900 pt-5 mt-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="accent-amber-500 w-4.5 h-4.5 rounded border-zinc-800 bg-zinc-900"
            />
            <div className="flex flex-col">
              <span className="font-bold uppercase tracking-wider text-[10px]">Show Alert Bar</span>
              <span className="text-[9px] text-zinc-600 font-sans font-medium">Render promotional message at the top of the store</span>
            </div>
          </label>

          {/* SAVE CTA */}
          <div className="border-t border-zinc-900 pt-5 mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs tracking-widest px-6 py-3.5 rounded-sm font-mono flex items-center gap-1.5 uppercase transition-all shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4 text-black" />
              <span>SAVE CHANGES</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

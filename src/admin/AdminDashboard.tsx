/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../contexts/ShopContext";
import { 
  Shirt, 
  Tag, 
  Image, 
  MessageSquare, 
  Download, 
  Upload, 
  RefreshCcw, 
  Plus, 
  ArrowUpRight,
  Sparkles,
  Megaphone,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function AdminDashboard() {
  const { db, resetDatabase, updateDatabase } = useShop();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notification, setNotification] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  if (!db) return null;

  // Stats Counters
  const stats = useMemo(() => {
    return [
      { label: "TOTAL STREETWEAR PRODUCTS", count: db.products.length, icon: <Shirt className="w-5 h-5 text-amber-500" /> },
      { label: "ACTIVE CATEGORIES", count: db.categories.length, icon: <Tag className="w-5 h-5 text-amber-500" /> },
      { label: "HERO BANNERS", count: db.banners.length, icon: <Image className="w-5 h-5 text-amber-500" /> },
      { label: "TESTIMONIALS LOGGED", count: db.testimonials.length, icon: <MessageSquare className="w-5 h-5 text-amber-500" /> },
    ];
  }, [db]);

  // Recents List (Latest 5 products added)
  const recentProducts = useMemo(() => {
    return [...db.products].slice(-5).reverse();
  }, [db.products]);

  // Export database state to JSON file
  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "kaivo-website-backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setNotification("✅ Website data exported successfully!");
      setTimeout(() => setNotification(""), 4000);
    } catch (err) {
      setWarningMsg("❌ Failed to export database state.");
    }
  };

  // Import database from JSON file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        
        // Simple validation checks on structure
        if (parsedData.settings && parsedData.products && parsedData.categories) {
          updateDatabase(parsedData);
          setNotification("🚀 Website database imported successfully! Refreshed cache.");
          setTimeout(() => setNotification(""), 4000);
        } else {
          setWarningMsg("❌ Invalid backup file format. Must contain settings, products, and categories.");
          setTimeout(() => setWarningMsg(""), 4000);
        }
      } catch (err) {
        setWarningMsg("❌ Failed to parse JSON file.");
        setTimeout(() => setWarningMsg(""), 4000);
      }
    };
    fileReader.readAsText(file);
  };

  // Reset database state to defaults
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all website content back to its factory default db.json parameters? Any manual changes you've made will be permanently lost.")) {
      resetDatabase();
      setNotification("🔄 Database reset to factory default parameters successfully.");
      setTimeout(() => setNotification(""), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">SYSTEM OVERVIEW</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            ADMIN DASHBOARD
          </h1>
        </div>

        {/* Action quick shortcut triggers */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products?action=new"
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs tracking-widest px-4 py-2.5 rounded-sm font-mono flex items-center gap-1.5 uppercase transition-all shadow-lg"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>ADD PRODUCT</span>
          </Link>
        </div>
      </div>

      {/* SUCCESS / ERROR TOAST NOTIFICATIONS */}
      {notification && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {warningMsg && (
        <div className="p-4 bg-red-900/15 border border-red-900/30 text-red-400 text-xs rounded-sm font-mono flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{warningMsg}</span>
        </div>
      )}

      {/* 1. STATS METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <div 
            key={idx}
            className="bg-zinc-950 border border-zinc-900 p-6 rounded-sm hover:border-zinc-800 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-bold block">
                {item.label}
              </span>
              {item.icon}
            </div>
            <span className="text-3xl font-mono font-black text-white">
              {item.count}
            </span>
          </div>
        ))}
      </div>

      {/* 2. SPLIT ROW: Recent Products & Quick Portal Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Grid: Recent streetwears */}
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-sm p-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-900">
            <span className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300">RECENTLY ADDED PRODUCTS</span>
            <Link to="/admin/products" className="text-[10px] font-mono text-amber-500 hover:text-white uppercase tracking-wider flex items-center gap-1">
              <span>VIEW ALL</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {recentProducts.map((p) => (
              <div 
                key={p.id}
                className="flex items-center gap-4 p-3 border border-zinc-900 bg-black rounded-sm hover:border-zinc-800 transition-all"
              >
                <div className="w-12 h-16 border border-zinc-900 rounded-sm overflow-hidden shrink-0 bg-zinc-950">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow">
                  <span className="text-xs font-bold text-white block uppercase tracking-wider">{p.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                    <span className="text-amber-500 uppercase">{p.category}</span>
                    <span>•</span>
                    <span>₹{p.price}</span>
                    {p.discount > 0 && (
                      <span className="text-red-400">-{p.discount}% OFF</span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/admin/products?edit=${p.id}`}
                  className="text-[10px] font-mono text-zinc-400 hover:text-amber-500 border border-zinc-850 hover:border-amber-500/40 bg-zinc-950 px-3 py-1.5 uppercase rounded-xs transition-all"
                >
                  EDIT
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Grid: System Actions & Data Backups */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick Actions Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6">
            <h3 className="text-xs font-bold tracking-widest font-mono uppercase mb-4 pb-3 border-b border-zinc-900 text-zinc-300">
              CMS SHORTCUTS
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <Link 
                to="/admin/settings"
                className="flex items-center justify-between p-3.5 border border-zinc-900 bg-black text-xs font-mono tracking-wider hover:border-amber-500/30 transition-all rounded-sm uppercase text-zinc-400 hover:text-white"
              >
                <span>Edit Brand Identity</span>
                <ArrowUpRight className="w-4 h-4 text-amber-500" />
              </Link>
              <Link 
                to="/admin/offers"
                className="flex items-center justify-between p-3.5 border border-zinc-900 bg-black text-xs font-mono tracking-wider hover:border-amber-500/30 transition-all rounded-sm uppercase text-zinc-400 hover:text-white"
              >
                <span>Edit Promo Announcements</span>
                <ArrowUpRight className="w-4 h-4 text-amber-500" />
              </Link>
            </div>
          </div>

          {/* Database Backups Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6">
            <h3 className="text-xs font-bold tracking-widest font-mono uppercase mb-4 pb-3 border-b border-zinc-900 text-zinc-300">
              DATA PORTABILITY
            </h3>
            <p className="text-[10px] text-zinc-500 leading-normal font-sans mb-6">
              All website content resides in local storage cache. Export backups as a JSON file or restore standard configurations.
            </p>

            <div className="flex flex-col gap-3">
              {/* EXPORT BUTTON */}
              <button
                onClick={handleExportData}
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-amber-500 hover:bg-amber-500/10 text-amber-500 text-xs font-bold tracking-widest font-mono py-3.5 uppercase rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>EXPORT DATABASE JSON</span>
              </button>

              {/* IMPORT FILE CHANGER */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportData}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-xs font-bold tracking-widest font-mono py-3.5 uppercase rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4 text-amber-500" />
                <span>IMPORT DATABASE JSON</span>
              </button>

              {/* FACTORY RESET */}
              <button
                onClick={handleResetData}
                className="w-full bg-red-950/20 hover:bg-red-950/80 border border-red-900/30 text-red-400 hover:text-white text-xs font-bold tracking-widest font-mono py-3.5 uppercase rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCcw className="w-4 h-4 text-red-500" />
                <span>FACTORY DATA RESET</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

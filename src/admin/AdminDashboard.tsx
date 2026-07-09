/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef, useEffect } from "react";
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
  AlertTriangle,
  Eye
} from "lucide-react";
import { db as firestoreDb } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend 
} from "recharts";

export default function AdminDashboard() {
  const { db, resetDatabase, updateDatabase } = useShop();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notification, setNotification] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  // Analytics states
  const [whatsappClicks, setWhatsappClicks] = useState<any[]>([]);
  const [productViews, setProductViews] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "year" | "all">("all");

  useEffect(() => {
    // Initial fetch from localStorage so counts are ready immediately
    const initialLocalClicks = JSON.parse(localStorage.getItem("kaivo_local_clicks") || "[]");
    setWhatsappClicks(initialLocalClicks);

    const initialLocalViews = JSON.parse(localStorage.getItem("kaivo_local_views") || "[]");
    setProductViews(initialLocalViews);

    // Set up real-time listener for whatsapp clicks
    const unsubClicks = onSnapshot(
      collection(firestoreDb, "whatsapp_clicks"),
      (snapshot) => {
        const clicksData: any[] = [];
        snapshot.forEach((doc) => {
          clicksData.push({ id: doc.id, ...doc.data() });
        });
        
        // Merge with localStorage clicks, deduplicating with a robust window check
        const localClicks = JSON.parse(localStorage.getItem("kaivo_local_clicks") || "[]");
        const merged = [...clicksData];
        localClicks.forEach((lc: any) => {
          const exists = clicksData.some(c => 
            c.productId === lc.productId && 
            Math.abs(new Date(c.timestamp).getTime() - new Date(lc.timestamp).getTime()) < 3000
          );
          if (!exists) {
            merged.push(lc);
          }
        });
        setWhatsappClicks(merged);
      },
      (err) => {
        console.warn("Firestore clicks subscription bypassed, using local storage:", err);
        const localClicks = JSON.parse(localStorage.getItem("kaivo_local_clicks") || "[]");
        setWhatsappClicks(localClicks);
      }
    );

    // Set up real-time listener for product views
    const unsubViews = onSnapshot(
      collection(firestoreDb, "product_views"),
      (snapshot) => {
        const viewsData: any[] = [];
        snapshot.forEach((doc) => {
          viewsData.push({ id: doc.id, ...doc.data() });
        });
        
        // Merge with localStorage views, deduplicating
        const localViews = JSON.parse(localStorage.getItem("kaivo_local_views") || "[]");
        const merged = [...viewsData];
        localViews.forEach((lv: any) => {
          const exists = viewsData.some(v => 
            v.productId === lv.productId && 
            Math.abs(new Date(v.timestamp).getTime() - new Date(lv.timestamp).getTime()) < 3000
          );
          if (!exists) {
            merged.push(lv);
          }
        });
        setProductViews(merged);
      },
      (err) => {
        console.warn("Firestore views subscription bypassed, using local storage:", err);
        const localViews = JSON.parse(localStorage.getItem("kaivo_local_views") || "[]");
        setProductViews(localViews);
      }
    );

    // Watch for other tabs triggers to sync real-time clicks on same machine instantly
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kaivo_local_clicks") {
        try {
          const updatedClicks = JSON.parse(e.newValue || "[]");
          setWhatsappClicks((prev) => {
            const merged = [...prev];
            updatedClicks.forEach((uc: any) => {
              if (!merged.some(m => m.id === uc.id || (m.productId === uc.productId && m.timestamp === uc.timestamp))) {
                merged.push(uc);
              }
            });
            return merged;
          });
        } catch (_) {}
      } else if (e.key === "kaivo_local_views") {
        try {
          const updatedViews = JSON.parse(e.newValue || "[]");
          setProductViews((prev) => {
            const merged = [...prev];
            updatedViews.forEach((uv: any) => {
              if (!merged.some(m => m.id === uv.id || (m.productId === uv.productId && m.timestamp === uv.timestamp))) {
                merged.push(uv);
              }
            });
            return merged;
          });
        } catch (_) {}
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Clean up real-time subscriptions and storage listener
    return () => {
      unsubClicks();
      unsubViews();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Filter logic for Analytics
  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of week
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Start of year
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const filterFn = (item: any) => {
      if (!item.timestamp) return false;
      const date = new Date(item.timestamp);
      
      switch (timeFilter) {
        case "today":
          return date >= startOfToday;
        case "week":
          return date >= startOfWeek;
        case "month":
          return date >= startOfMonth;
        case "year":
          return date >= startOfYear;
        case "all":
        default:
          return true;
      }
    };
    
    return {
      clicks: whatsappClicks.filter(filterFn),
      views: productViews.filter(filterFn)
    };
  }, [whatsappClicks, productViews, timeFilter]);

  // Aggregate stats
  const topProducts = useMemo(() => {
    const clickCounts: Record<string, { name: string, count: number }> = {};
    filteredData.clicks.forEach(c => {
      const id = c.productId || "unknown";
      const name = c.productName || "Unknown Product";
      if (!clickCounts[id]) {
        clickCounts[id] = { name, count: 0 };
      }
      clickCounts[id].count++;
    });
    const sortedClicks = Object.entries(clickCounts)
      .map(([id, val]) => ({ id, name: val.name, count: val.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const viewCounts: Record<string, { name: string, count: number }> = {};
    filteredData.views.forEach(v => {
      const id = v.productId || "unknown";
      const name = v.productName || "Unknown Product";
      if (!viewCounts[id]) {
        viewCounts[id] = { name, count: 0 };
      }
      viewCounts[id].count++;
    });
    const sortedViews = Object.entries(viewCounts)
      .map(([id, val]) => ({ id, name: val.name, count: val.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      mostClicked: sortedClicks,
      mostViewed: sortedViews
    };
  }, [filteredData]);

  // Generate trend data for the last 7 days
  const trendData = useMemo(() => {
    const days = 7;
    const result = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const isoDateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const clicksCount = whatsappClicks.filter(c => c.timestamp && c.timestamp.startsWith(isoDateStr)).length;
      const viewsCount = productViews.filter(v => v.timestamp && v.timestamp.startsWith(isoDateStr)).length;
      
      result.push({
        name: dateString,
        "WhatsApp Clicks": clicksCount,
        "Product Views": viewsCount
      });
    }
    return result;
  }, [whatsappClicks, productViews]);

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

      {/* REAL-TIME WHATSAPP ORDER ANALYTICS */}
      <div className="border-t border-zinc-900 pt-8 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#25d366] uppercase block mb-1">REAL-TIME CONVERSIONS</span>
            <h2 className="text-xl sm:text-2xl font-black tracking-widest uppercase">WHATSAPP ORDER CLICK ANALYTICS</h2>
          </div>
          
          {/* Time Filter Tabs */}
          <div className="flex border border-zinc-850 bg-zinc-950 p-1 rounded-sm text-[10px] font-mono">
            {(["today", "week", "month", "year", "all"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 rounded-xs uppercase tracking-wider transition-all cursor-pointer ${
                  timeFilter === filter
                    ? "bg-amber-500 text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {filter === "all" ? "All Time" : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* WhatsApp order clicks */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-sm hover:border-zinc-850 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-[#25d366]" />
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">Total WhatsApp Orders Initiated</span>
              </div>
              <span className="text-4xl font-mono font-black text-white">{filteredData.clicks.length}</span>
              <span className="text-[10px] text-zinc-600 block mt-2 font-mono">DIRECT ORDERS INITIATED VIA WHATSAPP CHAT IN THE SELECTED TIMEFRAME</span>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-900/40 flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Conversion Action</span>
              <span className="text-[9px] font-bold text-[#25d366] font-mono bg-[#25d366]/5 border border-[#25d366]/10 px-2 py-1 rounded uppercase">100% Client Order Intent</span>
            </div>
          </div>

          {/* Product card views */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-sm hover:border-zinc-850 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-[#C9A063]" />
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">Total Product Item Clicks</span>
              </div>
              <span className="text-4xl font-mono font-black text-white">{filteredData.views.length}</span>
              <span className="text-[10px] text-zinc-600 block mt-2 font-mono">PRODUCT VIEW CLICKS LOGGED ACROSS ALL CLIENT BROWSER SESSIONS</span>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-900/40 flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Engagement Action</span>
              <span className="text-[9px] font-bold text-[#C9A063] font-mono bg-[#C9A063]/5 border border-[#C9A063]/10 px-2 py-1 rounded uppercase">Interest & Detail Views</span>
            </div>
          </div>
        </div>

        {/* Charts & Trends Grid - Dual Bar Trend Chart */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
              <span className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300 block">7-DAY CUSTOMER ENGAGEMENT & CLICK TRENDS</span>
              <span className="text-[10px] text-zinc-500 font-mono">TRACKING DAILY WHATSAPP AND VIEW CLICK ACTIONS</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#52525b" fontSize={10} fontFamily="monospace" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#fff", fontFamily: "monospace", fontSize: "11px" }}
                  />
                  <Bar dataKey="WhatsApp Clicks" fill="#25d366" radius={[2, 2, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Product Views" fill="#C9A063" radius={[2, 2, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leaderboards Grid (Side by side on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Most Clicked (Orders) */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-sm">
            <span className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300 block mb-4 pb-2 border-b border-zinc-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#25d366]" />
              <span>ORDER CONVERSION LEADERBOARD</span>
            </span>
            {topProducts.mostClicked.length === 0 ? (
              <span className="text-xs text-zinc-600 font-mono block py-4">No WhatsApp order clicks logged yet in this time window.</span>
            ) : (
              <div className="flex flex-col gap-3">
                {topProducts.mostClicked.map((item, idx) => {
                  const productObj = db.products.find(p => String(p.id) === String(item.id));
                  return (
                    <div key={item.id} className="flex items-center gap-3.5 p-2.5 bg-black border border-zinc-900 rounded-sm hover:border-zinc-850 transition-all">
                      <div className="text-xs font-mono text-zinc-500 w-5 font-black text-center">#{idx + 1}</div>
                      {productObj && productObj.images?.[0] ? (
                        <div className="w-9 h-11 border border-zinc-900 rounded-xs overflow-hidden shrink-0 bg-zinc-950">
                          <img src={productObj.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ) : null}
                      <div className="flex-grow min-w-0">
                        <span className="text-xs font-bold text-white uppercase tracking-wider block truncate">{item.name}</span>
                        {productObj && <span className="text-[9px] text-zinc-500 uppercase font-mono">{productObj.category}</span>}
                      </div>
                      <span className="text-[10px] font-mono text-[#25d366] font-bold bg-[#25d366]/5 px-2.5 py-1 rounded-sm border border-[#25d366]/10 shrink-0">
                        {item.count} {item.count === 1 ? 'order' : 'orders'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Most Clicked (Views) */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-sm">
            <span className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300 block mb-4 pb-2 border-b border-zinc-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#C9A063]" />
              <span>ITEM VIEW CLICK LEADERBOARD</span>
            </span>
            {topProducts.mostViewed.length === 0 ? (
              <span className="text-xs text-zinc-600 font-mono block py-4">No product item clicks/views logged yet in this time window.</span>
            ) : (
              <div className="flex flex-col gap-3">
                {topProducts.mostViewed.map((item, idx) => {
                  const productObj = db.products.find(p => String(p.id) === String(item.id));
                  return (
                    <div key={item.id} className="flex items-center gap-3.5 p-2.5 bg-black border border-zinc-900 rounded-sm hover:border-zinc-850 transition-all">
                      <div className="text-xs font-mono text-zinc-500 w-5 font-black text-center">#{idx + 1}</div>
                      {productObj && productObj.images?.[0] ? (
                        <div className="w-9 h-11 border border-zinc-900 rounded-xs overflow-hidden shrink-0 bg-zinc-950">
                          <img src={productObj.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ) : null}
                      <div className="flex-grow min-w-0">
                        <span className="text-xs font-bold text-white uppercase tracking-wider block truncate">{item.name}</span>
                        {productObj && <span className="text-[9px] text-zinc-500 uppercase font-mono">{productObj.category}</span>}
                      </div>
                      <span className="text-[10px] font-mono text-[#C9A063] font-bold bg-[#C9A063]/5 px-2.5 py-1 rounded-sm border border-[#C9A063]/10 shrink-0">
                        {item.count} {item.count === 1 ? 'click' : 'clicks'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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

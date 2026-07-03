/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useShop } from "../contexts/ShopContext";
import ProductCard from "../components/ProductCard";
import { 
  Filter, 
  X, 
  Grid, 
  ArrowUpDown, 
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Shop() {
  const { db } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(1500); // Max limit
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Read query params from URL (search, category)
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

  // Synchronize category selection if changed in URL
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
    setCurrentPage(1);
  }, [categoryParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSizes, selectedColors, priceRange, sortBy]);

  if (!db) return null;

  // Extract all available filters for dynamic sizes and colors counts
  const allSizes = ["S", "M", "L", "XL", "XXL"];
  const colorsPalette = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Beige", hex: "#d4bfa6" },
    { name: "Olive Green", hex: "#556b2f" },
    { name: "Brown", hex: "#5c4033" },
    { name: "Grey", hex: "#808080" }
  ];

  // Apply filters on products
  const filteredProducts = useMemo(() => {
    let result = [...db.products];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // 2. Category Checkbox Filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // 3. Size Filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((size) => selectedSizes.includes(size))
      );
    }

    // 4. Color Filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((col) => selectedColors.includes(col.name))
      );
    }

    // 5. Price Filter (calculated considering discount)
    result = result.filter((p) => {
      const discPrice = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
      return discPrice <= priceRange;
    });

    // 6. Sorting logic
    if (sortBy === "newest") {
      // New arrivals first
      result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
    } else if (sortBy === "price-low") {
      result.sort((a, b) => {
        const pA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
        const pB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
        return pA - pB;
      });
    } else if (sortBy === "price-high") {
      result.sort((a, b) => {
        const pA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
        const pB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
        return pB - pA;
      });
    } else if (sortBy === "discount") {
      result.sort((a, b) => b.discount - a.discount);
    }

    return result;
  }, [db.products, searchQuery, selectedCategories, selectedSizes, selectedColors, priceRange, sortBy]);

  // Pagination logic (12 items per page)
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const toggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== slug));
      // Clean query parameter if manual deselecting
      if (categoryParam === slug) {
        setSearchParams({});
      }
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const toggleColor = (colName: string) => {
    if (selectedColors.includes(colName)) {
      setSelectedColors(selectedColors.filter((c) => c !== colName));
    } else {
      setSelectedColors([...selectedColors, colName]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(1500);
    setSortBy("newest");
    setSearchParams({});
    setCurrentPage(1);
  };

  // Dynamically calculate size stock counters for the filter UI label helper
  const sizeCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    db.products.forEach((p) => {
      p.sizes.forEach((s) => {
        map[s] = (map[s] || 0) + 1;
      });
    });
    return map;
  }, [db.products]);

  return (
    <div className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      
      {/* 1. TOP HEADER / TITLE */}
      <div className="border-b border-zinc-900 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase block mb-2">HOME / SHOP</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-widest uppercase">
            {categoryParam ? `${categoryParam} TEES` : "SHOP ALL"}
          </h1>
          <p className="text-xs text-zinc-500 font-sans mt-2 max-w-lg">
            Explore our curated premium streetwear apparel. Premium heavyweight 240 GSM combed cotton fabrics engineered for confidence.
          </p>
        </div>

        {/* Layout actions + sorting */}
        <div className="flex items-center gap-4 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex lg:hidden items-center gap-2 border border-zinc-800 hover:border-amber-500 px-4 py-2.5 text-xs font-bold tracking-widest font-mono rounded-sm text-zinc-300"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            <span>FILTERS</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs font-mono hidden sm:inline">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs py-2 px-3 text-zinc-300 focus:outline-none focus:border-amber-500 rounded-sm font-sans tracking-wide cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT: Filters Sidebar on left, Product grid on right */}
      <div className="flex gap-10">
        
        {/* DESKTOP SIDEBAR FILTERS PANEL */}
        <aside className="hidden lg:block w-64 shrink-0 bg-black/40 border border-zinc-900 rounded-sm p-6 self-start">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
            <span className="text-xs font-black tracking-widest font-mono">FILTERS</span>
            <button 
              onClick={clearAllFilters}
              className="text-[10px] font-mono tracking-widest text-zinc-500 hover:text-amber-500 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-amber-500" />
              <span>CLEAR ALL</span>
            </button>
          </div>

          {/* Section: Categories */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">CATEGORIES</h3>
            <div className="flex flex-col gap-3">
              {db.categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => toggleCategory(cat.slug)}
                    className="accent-amber-500 w-4 h-4 rounded-xs border-zinc-800 bg-zinc-900"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section: Sizes */}
          <div className="mb-8 border-t border-zinc-900 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">SIZES</h3>
            <div className="flex flex-col gap-3">
              {allSizes.map((size) => (
                <label key={size} className="flex items-center gap-3 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => toggleSize(size)}
                    className="accent-amber-500 w-4 h-4 rounded-xs border-zinc-800 bg-zinc-900"
                  />
                  <span>{size} <span className="text-zinc-600">({sizeCountMap[size] || 0})</span></span>
                </label>
              ))}
            </div>
          </div>

          {/* Section: Colors */}
          <div className="mb-8 border-t border-zinc-900 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">COLORS</h3>
            <div className="flex flex-wrap gap-2.5">
              {colorsPalette.map((col) => {
                const isSelected = selectedColors.includes(col.name);
                return (
                  <button
                    key={col.name}
                    onClick={() => toggleColor(col.name)}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer relative ${
                      isSelected ? "border-amber-500 ring-2 ring-amber-500/30 scale-105" : "border-zinc-800 hover:border-zinc-500"
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {/* Tick icon indicator */}
                    {isSelected && (
                      <span className={`w-1.5 h-1.5 rounded-full ${col.name === "White" ? "bg-black" : "bg-white"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Price Limit */}
          <div className="mb-4 border-t border-zinc-900 pt-6">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
              <span className="font-bold uppercase tracking-wider">PRICE RANGE</span>
              <span className="text-amber-500 font-mono font-bold">Max ₹{priceRange}</span>
            </div>
            <input
              type="range"
              min="499"
              max="1500"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-zinc-600 font-mono mt-2">
              <span>₹499</span>
              <span>₹1500</span>
            </div>
          </div>

          {/* Static promotion badge inside filters column */}
          <div className="mt-8 p-4 border border-zinc-900 bg-neutral-950/50 rounded-sm text-center">
            <span className="text-[9px] font-mono tracking-widest text-amber-500 block mb-1">PROMOTION</span>
            <p className="text-[10px] text-zinc-400">FREE SHIPPING ON ALL ORDERS ABOVE ₹999</p>
          </div>
        </aside>

        {/* RIGHT COLUMN: Grid of Products */}
        <div className="flex-grow flex flex-col justify-between">
          
          {/* Active stats display */}
          <div className="flex items-center justify-between mb-6 text-xs text-zinc-500 font-mono">
            <span>SHOWING {filteredProducts.length} PRODUCTS</span>
            {searchQuery && (
              <span>SEARCH: "{searchQuery}"</span>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-zinc-900 bg-zinc-950/20 p-8 rounded-sm">
              <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest mb-4">No streetwear found</p>
              <p className="text-xs text-zinc-600 max-w-md leading-relaxed mb-6">
                Try adjusting your categories, sizing, colors, or price slider to find available items.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-zinc-900 border border-zinc-800 hover:border-amber-500 text-amber-500 hover:text-black hover:bg-amber-500 font-bold text-[10px] tracking-widest px-6 py-3 uppercase rounded-sm font-mono transition-all cursor-pointer"
              >
                RESET ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* 3. PAGINATION BUTTONS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16 border-t border-zinc-900 pt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-zinc-900 hover:border-amber-500 disabled:opacity-30 disabled:hover:border-zinc-900 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 border rounded text-xs font-mono font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-amber-500 text-black border-amber-500"
                        : "bg-black border-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-zinc-900 hover:border-amber-500 disabled:opacity-30 disabled:hover:border-zinc-900 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 4. RESPONSIVE FILTER DRAWER OVERLAY (MOBILE) */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />

            {/* Content Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-zinc-950 border-r border-zinc-800 p-6 z-50 flex flex-col justify-between overflow-y-auto lg:hidden"
            >
              <div>
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                  <span className="text-sm font-black tracking-widest font-mono">FILTERS</span>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 text-zinc-400 hover:text-white border border-zinc-900 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section: Categories */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">CATEGORIES</h3>
                  <div className="flex flex-col gap-3">
                    {db.categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-3 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.slug)}
                          onChange={() => toggleCategory(cat.slug)}
                          className="accent-amber-500 w-4 h-4 rounded-xs border-zinc-800 bg-zinc-900"
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section: Sizes */}
                <div className="mb-8 border-t border-zinc-900 pt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">SIZES</h3>
                  <div className="flex flex-col gap-3">
                    {allSizes.map((size) => (
                      <label key={size} className="flex items-center gap-3 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(size)}
                          onChange={() => toggleSize(size)}
                          className="accent-amber-500 w-4 h-4 rounded-xs border-zinc-800 bg-zinc-900"
                        />
                        <span>{size} <span className="text-zinc-600">({sizeCountMap[size] || 0})</span></span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section: Colors */}
                <div className="mb-8 border-t border-zinc-900 pt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">COLORS</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {colorsPalette.map((col) => {
                      const isSelected = selectedColors.includes(col.name);
                      return (
                        <button
                          key={col.name}
                          onClick={() => toggleColor(col.name)}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer relative ${
                            isSelected ? "border-amber-500 ring-2 ring-amber-500/30 scale-105" : "border-zinc-800 hover:border-zinc-500"
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        >
                          {isSelected && (
                            <span className={`w-1.5 h-1.5 rounded-full ${col.name === "White" ? "bg-black" : "bg-white"}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Price Limit */}
                <div className="mb-4 border-t border-zinc-900 pt-6">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                    <span className="font-bold uppercase tracking-wider">PRICE RANGE</span>
                    <span className="text-amber-500 font-mono font-bold">Max ₹{priceRange}</span>
                  </div>
                  <input
                    type="range"
                    min="499"
                    max="1500"
                    step="50"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-zinc-600 font-mono mt-2">
                    <span>₹499</span>
                    <span>₹1500</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-6 mt-8 flex flex-col gap-3">
                <button
                  onClick={clearAllFilters}
                  className="w-full border border-zinc-800 text-zinc-400 hover:text-white font-semibold text-xs tracking-widest py-3 uppercase transition-all rounded-xs font-mono"
                >
                  CLEAR ALL
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs tracking-widest py-3 uppercase transition-all rounded-xs font-mono"
                >
                  APPLY FILTERS
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

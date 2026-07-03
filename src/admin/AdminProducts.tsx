/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useShop } from "../contexts/ShopContext";
import { Product, Color } from "../types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  X,
  FileText,
  BadgeAlert,
  Save,
  Grid
} from "lucide-react";

export default function AdminProducts() {
  const { db, updateDatabase } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL triggers
  const editQuery = searchParams.get("edit");
  const actionQuery = searchParams.get("action");

  // Filter products list search state
  const [searchTerm, setSearchTerm] = useState("");

  // Product Form states
  const [formId, setFormId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(799);
  const [discount, setDiscount] = useState(0);
  const [category, setCategory] = useState("oversized");
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [sizes, setSizes] = useState<string[]>(["M", "L", "XL"]);
  const [colors, setColors] = useState<Color[]>([
    { name: "Black", hex: "#000000" }
  ]);
  const [images, setImages] = useState<string[]>([]);
  const [stock, setStock] = useState(50);

  // Helper inputs for adding individual images/colors
  const [newImageUrl, setNewImageUrl] = useState("");
  const [tempColorName, setTempColorName] = useState("");
  const [tempColorHex, setTempColorHex] = useState("#000000");

  const [notif, setNotif] = useState("");

  if (!db) return null;

  // Unsplash Premium Streetwear Preset Image helpers
  const imagePresets = [
    { label: "Black Tee Front", url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=500" },
    { label: "Black Tee Back", url: "https://images.unsplash.com/photo-1618354691229-88d4e1267981?q=80&w=500" },
    { label: "White Minimalist Front", url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=500" },
    { label: "Beige Tee Model", url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=500" },
    { label: "Sage Green Model", url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=500" },
    { label: "Vintage Graphic Tee", url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=500" }
  ];

  // Auto-slug generator on Name change
  const handleNameChange = (val: string) => {
    setName(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .replace(/\s+/g, "-") // replace spaces with -
      .replace(/-+/g, "-"); // merge multi dashes
    setSlug(generated);
  };

  // Synchronize Edit data if editing URL is matched
  useEffect(() => {
    if (editQuery && db) {
      const match = db.products.find((p) => p.id === Number(editQuery));
      if (match) {
        setFormId(match.id);
        setName(match.name);
        setSlug(match.slug);
        setDescription(match.description);
        setPrice(match.price);
        setDiscount(match.discount);
        setCategory(match.category);
        setFeatured(match.featured);
        setNewArrival(match.newArrival);
        setSizes(match.sizes);
        setColors(match.colors);
        setImages(match.images);
        setStock(match.stock);
      }
    } else if (actionQuery === "new") {
      // Clear form for new item
      setFormId(null);
      setName("");
      setSlug("");
      setDescription("");
      setPrice(799);
      setDiscount(0);
      setCategory("oversized");
      setFeatured(false);
      setNewArrival(true);
      setSizes(["M", "L", "XL"]);
      setColors([{ name: "Black", hex: "#000000" }]);
      setImages([]);
      setStock(50);
    }
  }, [editQuery, actionQuery, db]);

  // List filter calculations
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return db.products;
    const q = searchTerm.toLowerCase();
    return db.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [db.products, searchTerm]);

  // Color actions helper
  const addColorItem = () => {
    if (tempColorName.trim()) {
      const newCol: Color = { name: tempColorName.trim(), hex: tempColorHex };
      setColors([...colors, newCol]);
      setTempColorName("");
    }
  };

  const removeColorItem = (idx: number) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  // Image actions helper
  const addImageItem = (urlStr: string) => {
    if (urlStr.trim()) {
      setImages([...images, urlStr.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImageItem = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  // Toggle sizes
  const toggleSizeSelection = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  // Save changes
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please provide at least one product image URL.");
      return;
    }

    if (colors.length === 0) {
      alert("Please provide at least one color configuration.");
      return;
    }

    if (sizes.length === 0) {
      alert("Please provide at least one size option.");
      return;
    }

    let updatedProducts = [...db.products];

    if (formId !== null) {
      // EDIT MODE
      updatedProducts = updatedProducts.map((p) => {
        if (p.id === formId) {
          return {
            ...p,
            name,
            slug,
            description,
            price: Number(price),
            discount: Number(discount),
            category,
            featured,
            newArrival,
            sizes,
            colors,
            images,
            stock: Number(stock)
          };
        }
        return p;
      });
      setNotif("🎉 Product updated successfully!");
    } else {
      // ADD NEW MODE
      const newId = db.products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
      const newProd: Product = {
        id: newId,
        name,
        slug,
        description,
        price: Number(price),
        discount: Number(discount),
        category,
        featured,
        newArrival,
        sizes,
        colors,
        images,
        stock: Number(stock)
      };
      updatedProducts.push(newProd);
      setNotif("🚀 New product created successfully!");
    }

    updateDatabase({
      ...db,
      products: updatedProducts
    });

    setTimeout(() => {
      setNotif("");
      setSearchParams({}); // Close form view
    }, 1500);
  };

  // Delete product action
  const handleDeleteProduct = (id: number, prodName: string) => {
    if (window.confirm(`Are you sure you want to delete "${prodName}" from your catalog?`)) {
      const remaining = db.products.filter((p) => p.id !== id);
      updateDatabase({
        ...db,
        products: remaining
      });
      setNotif("🗑️ Product deleted successfully.");
      setTimeout(() => setNotif(""), 3000);
    }
  };

  // Render form panel if query matches
  const isFormView = editQuery || actionQuery === "new";

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER SEGMENT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">STREETWEAR LOGS</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            {isFormView ? (formId !== null ? "EDIT STREETWEAR" : "ADD NEW STREETWEAR") : "MANAGE PRODUCTS"}
          </h1>
        </div>

        {isFormView ? (
          <button
            onClick={() => setSearchParams({})}
            className="border border-zinc-850 hover:border-zinc-600 bg-zinc-950 text-zinc-400 hover:text-white font-bold text-xs tracking-widest px-4 py-2.5 rounded-sm font-mono flex items-center gap-1.5 uppercase transition-all cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO INDEX</span>
          </button>
        ) : (
          <button
            onClick={() => setSearchParams({ action: "new" })}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs tracking-widest px-4 py-2.5 rounded-sm font-mono flex items-center gap-1.5 uppercase transition-all shadow-lg cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4.5 h-4.5 text-black stroke-[3]" />
            <span>CREATE PRODUCT</span>
          </button>
        )}
      </div>

      {/* NOTIFICATION HUD */}
      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>{notif}</span>
        </div>
      )}

      {/* VIEW PANEL ROUTING */}
      {isFormView ? (
        
        /* FORM VIEW - DOUBLE COLUMN SPLIT */
        <form onSubmit={handleSaveProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Core Metadata */}
          <div className="lg:col-span-7 flex flex-col gap-6 bg-zinc-950 border border-zinc-900 rounded-sm p-6 sm:p-8">
            <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>CORE INFORMATION</span>
            </h2>

            {/* Title / Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Streetwear Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Classic Oversized Logo Tee"
                className="bg-black border border-zinc-800 text-xs px-4 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm"
              />
            </div>

            {/* Slug URL */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Slug URL (Auto-Generated)</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. classic-oversized-logo-tee"
                className="bg-black border border-zinc-850 text-xs px-4 py-3 text-zinc-400 focus:outline-none focus:border-amber-500 rounded-sm font-mono"
              />
            </div>

            {/* Category selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Select Collection Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-black border border-zinc-800 text-xs px-4 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm"
              >
                {db.categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price & Discount & Stock row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Original Price (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="bg-black border border-zinc-800 text-xs px-4 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Active Discount (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="99"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="bg-black border border-zinc-800 text-xs px-4 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Stock Quantities</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="bg-black border border-zinc-800 text-xs px-4 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
                />
              </div>

            </div>

            {/* Description Textarea */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Product Description Specifications</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of material GSM combed cotton fits wash treatments..."
                className="bg-black border border-zinc-800 text-xs px-4 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm resize-none"
              />
            </div>

            {/* Status indicators */}
            <div className="flex gap-8 border-t border-zinc-900 pt-6">
              
              <label className="flex items-center gap-3 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="accent-amber-500 w-4.5 h-4.5 rounded border-zinc-800 bg-zinc-900"
                />
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Featured Item</span>
                  <span className="text-[9px] text-zinc-600 font-sans">Highlight on main page shelves</span>
                </div>
              </label>

              <label className="flex items-center gap-3 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newArrival}
                  onChange={(e) => setNewArrival(e.target.checked)}
                  className="accent-amber-500 w-4.5 h-4.5 rounded border-zinc-800 bg-zinc-900"
                />
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-wider text-[10px]">New Arrival</span>
                  <span className="text-[9px] text-zinc-600 font-sans">Mark as fresh drop drop tag</span>
                </div>
              </label>

            </div>

          </div>

          {/* RIGHT COLUMN: Sizes & Colors & Images */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Sizes Multi-select */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6">
              <h3 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300 pb-3 border-b border-zinc-900 mb-4">
                SIZE MATRIX SELECT
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {["S", "M", "L", "XL", "XXL"].map((sz) => {
                  const active = sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSizeSelection(sz)}
                      className={`w-11 h-11 border rounded-sm font-mono text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? "bg-amber-500 border-amber-500 text-black font-extrabold"
                          : "bg-black border-zinc-850 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors subform manager */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6">
              <h3 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300 pb-3 border-b border-zinc-900 mb-4">
                COLOR METRICS ({colors.length})
              </h3>
              
              {/* Added Colors Stack */}
              <div className="flex flex-wrap gap-3 mb-5">
                {colors.map((col, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 bg-black border border-zinc-850 pl-2.5 pr-1 py-1.5 rounded-sm text-[10px] font-mono tracking-wider text-zinc-300"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-zinc-800" style={{ backgroundColor: col.hex }} />
                    <span className="uppercase font-bold">{col.name}</span>
                    <button
                      type="button"
                      onClick={() => removeColorItem(idx)}
                      className="p-1 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Subform to append color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Color Name (e.g. Sage)"
                  value={tempColorName}
                  onChange={(e) => setTempColorName(e.target.value)}
                  className="bg-black border border-zinc-800 text-[11px] px-3 py-2 rounded-xs focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={tempColorHex}
                    onChange={(e) => setTempColorHex(e.target.value)}
                    className="bg-black border border-zinc-800 h-9 w-12 p-0.5 rounded-xs cursor-pointer inline-block"
                  />
                  <button
                    type="button"
                    onClick={addColorItem}
                    className="flex-grow bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-[10px] font-mono tracking-widest uppercase font-bold text-amber-500 rounded-xs transition-colors cursor-pointer"
                  >
                    ADD COLOR
                  </button>
                </div>
              </div>
            </div>

            {/* Images URL manager */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6">
              <h3 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300 pb-3 border-b border-zinc-900 mb-4">
                IMAGES STACK ({images.length})
              </h3>

              {/* Active Image Thumbnails Grid */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-[3/4] border border-zinc-900 bg-black rounded-sm overflow-hidden relative group">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => removeImageItem(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/80 border border-zinc-800 rounded text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Input path to add image */}
              <div className="flex gap-2 mb-6">
                <input
                  type="url"
                  placeholder="Paste Image URL..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-grow bg-black border border-zinc-800 text-[11px] px-3 py-2 rounded-xs focus:outline-none font-mono text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => addImageItem(newImageUrl)}
                  className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-[10px] font-mono tracking-widest uppercase font-bold text-amber-500 px-4 rounded-xs transition-colors cursor-pointer"
                >
                  ADD URL
                </button>
              </div>

              {/* Suggestions Presets list */}
              <div className="border-t border-zinc-900 pt-4">
                <span className="text-[9px] font-mono tracking-wider text-zinc-600 uppercase block mb-3">Streetwear Preset Mock Suggestions:</span>
                <div className="flex flex-wrap gap-2">
                  {imagePresets.map((preset, idx) => {
                    const alreadyHas = images.includes(preset.url);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={alreadyHas}
                        onClick={() => addImageItem(preset.url)}
                        className="text-[9px] font-mono px-2.5 py-1.5 border border-zinc-900/80 bg-black hover:border-amber-500/30 rounded-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:border-zinc-900 disabled:hover:text-zinc-400 transition-all cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* SAVE BUTTON COMPONENT */}
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-black font-bold text-xs tracking-widest py-4.5 uppercase transition-all rounded-sm font-mono flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <Save className="w-4.5 h-4.5 text-black" />
              <span>SAVE STREETWEAR CHANGES</span>
            </button>

          </div>

        </form>
      ) : (
        
        /* INDEX PRODUCTS LIST VIEW */
        <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6">
          
          {/* List Toolbar search bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-900">
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search catalog by name, slug, or category..."
                className="bg-black border border-zinc-800 text-xs pl-9 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm w-full"
              />
            </div>
            <span className="text-xs font-mono text-zinc-500 self-end sm:self-auto">
              {filteredProducts.length} PRODUCTS INDEXED
            </span>
          </div>

          {/* Catalog Listing Table */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <BadgeAlert className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">No streetwear matching query found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono text-zinc-400 border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 uppercase text-[10px] tracking-widest">
                    <th className="py-3 px-4">ITEM</th>
                    <th className="py-3 px-4">CATEGORY</th>
                    <th className="py-3 px-4">PRICE</th>
                    <th className="py-3 px-4">STOCK</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/20 transition-all">
                      
                      {/* Image + Name column */}
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className="w-10 h-14 border border-zinc-900 rounded-sm overflow-hidden shrink-0 bg-black">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <span className="font-bold text-white block uppercase tracking-wider text-[11px] max-w-[200px] truncate">
                            {p.name}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono tracking-wide max-w-[200px] truncate block">
                            /{p.slug}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                        {p.category}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-white block">₹{p.price}</span>
                        {p.discount > 0 && (
                          <span className="text-[9px] text-red-400 font-bold block">-{p.discount}% OFF</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4">
                        <span className={`font-bold ${p.stock < 10 ? "text-red-400 animate-pulse" : "text-zinc-300"}`}>
                          {p.stock} units
                        </span>
                      </td>

                      {/* Badges/Status */}
                      <td className="py-4 px-4 flex flex-wrap gap-1.5 items-center">
                        {p.featured && (
                          <span className="bg-amber-500/10 border border-amber-500/20 text-[8px] text-amber-500 font-bold font-mono tracking-wider px-2 py-0.5 rounded-xs uppercase">
                            FEAT
                          </span>
                        )}
                        {p.newArrival && (
                          <span className="bg-white/10 border border-white/20 text-[8px] text-white font-bold font-mono tracking-wider px-2 py-0.5 rounded-xs uppercase">
                            NEW
                          </span>
                        )}
                      </td>

                      {/* Edit Delete triggers */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          
                          <button
                            onClick={() => setSearchParams({ edit: String(p.id) })}
                            className="p-2 border border-zinc-900 hover:border-amber-500 bg-black hover:text-amber-500 rounded text-zinc-400 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-2 border border-zinc-900 hover:border-red-500 bg-black hover:text-red-500 rounded text-zinc-400 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

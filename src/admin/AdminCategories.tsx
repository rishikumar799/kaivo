/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useShop } from "../contexts/ShopContext";
import { Category } from "../types";
import { Plus, Trash2, Edit3, X, Save, Sparkles, Tag, Eye } from "lucide-react";

export default function AdminCategories() {
  const { db, updateDatabase } = useShop();

  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");

  const [notif, setNotif] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  if (!db) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
    );
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setImage(cat.image);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setSlug("");
    setImage("");
    setShowAddForm(false);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!image.trim()) {
      alert("Please provide a category collection banner image URL.");
      return;
    }

    let updatedCategories = [...db.categories];

    if (editId !== null) {
      updatedCategories = updatedCategories.map((c) =>
        c.id === editId ? { ...c, name, slug, image } : c
      );
      setNotif("🎉 Collection updated successfully!");
    } else {
      const newId = db.categories.reduce((max, c) => Math.max(max, c.id), 0) + 1;
      const newCat: Category = { id: newId, name, slug, image };
      updatedCategories.push(newCat);
      setNotif("🚀 New collection category created!");
    }

    updateDatabase({ ...db, categories: updatedCategories });
    resetForm();
    setTimeout(() => setNotif(""), 2500);
  };

  const handleDeleteCategory = (id: number, catName: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${catName}"? This will NOT delete products in this category but will remove it from filter menus.`)) {
      const remaining = db.categories.filter((c) => c.id !== id);
      updateDatabase({ ...db, categories: remaining });
      setNotif("🗑️ Category deleted successfully.");
      setTimeout(() => setNotif(""), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">STREETWEAR DICTIONARIES</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            COLLECTIONS
          </h1>
        </div>

        {!showAddForm && (
          <button
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs tracking-widest px-4 py-2.5 rounded-sm font-mono flex items-center gap-1.5 uppercase transition-all shadow-lg cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5 text-black stroke-[3]" />
            <span>CREATE CATEGORY</span>
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
        
        {/* ADD / EDIT CATEGORY FORM SIDEBAR */}
        {showAddForm && (
          <form 
            onSubmit={handleSaveCategory} 
            className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-5 sticky top-24"
          >
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300">
                {editId !== null ? "EDIT CATEGORY" : "ADD NEW CATEGORY"}
              </span>
              <button type="button" onClick={resetForm} className="text-zinc-500 hover:text-white">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Collection Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Graphic Tees"
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm"
              />
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Slug (Auto-Generated)</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. graphic-tees"
                className="bg-black border border-zinc-850 text-xs px-3.5 py-3 text-zinc-400 focus:outline-none font-mono rounded-sm"
              />
            </div>

            {/* Image Banner */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Banner Image URL</label>
              <input
                type="url"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Paste banner image URL..."
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
              />
            </div>

            {/* Save Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-grow border border-zinc-850 text-zinc-400 font-bold font-mono text-[10px] py-3.5 uppercase rounded-sm cursor-pointer hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex-grow bg-amber-500 hover:bg-amber-600 text-black font-bold font-mono text-[10px] py-3.5 uppercase rounded-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE</span>
              </button>
            </div>
          </form>
        )}

        {/* INDEX DIRECTORY LIST */}
        <div className={showAddForm ? "lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6" : "lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {db.categories.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden flex flex-col group hover:border-zinc-800 transition-all"
            >
              <div className="h-44 bg-neutral-900 border-b border-zinc-900 overflow-hidden relative">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all gap-3 z-10">
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-2 border border-zinc-800 bg-black/90 hover:border-amber-500 rounded hover:text-amber-500 text-zinc-300 transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit3 className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-2 border border-zinc-800 bg-black/90 hover:border-red-500 rounded hover:text-red-500 text-zinc-300 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Text metadata */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">{cat.name}</h3>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-wider">slug: /{cat.slug}</span>
                </div>
                <Tag className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

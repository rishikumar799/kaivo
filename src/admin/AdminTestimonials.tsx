/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useShop } from "../contexts/ShopContext";
import { Testimonial } from "../types";
import { Plus, Trash2, Edit3, X, Save, Sparkles, Star } from "lucide-react";

export default function AdminTestimonials() {
  const { db, updateDatabase } = useShop();

  const [editId, setEditId] = useState<string | number | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("Streetwear Enthusiast");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  const [notif, setNotif] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  if (!db) return null;

  const startEdit = (t: Testimonial) => {
    setEditId(t.id);
    setName(t.name);
    setLocation(t.location || "Streetwear Enthusiast");
    setRating(t.rating);
    setText(t.text);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setLocation("Streetwear Enthusiast");
    setRating(5);
    setText("");
    setShowAddForm(false);
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !text.trim()) {
      alert("Please provide the reviewer's name and review comment text.");
      return;
    }

    let updatedTestimonials = [...db.testimonials];

    if (editId !== null) {
      updatedTestimonials = updatedTestimonials.map((t) =>
        t.id === editId ? { ...t, name, location, rating, text } : t
      );
      setNotif("🎉 Review updated successfully!");
    } else {
      const newId = `review-${Date.now()}`;
      const newTestimonial: Testimonial = { id: newId, name, location, rating, text };
      updatedTestimonials.push(newTestimonial);
      setNotif("🚀 New customer testimonial added!");
    }

    updateDatabase({ ...db, testimonials: updatedTestimonials });
    resetForm();
    setTimeout(() => setNotif(""), 2500);
  };

  const handleDeleteTestimonial = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this customer testimonial?")) {
      const remaining = db.testimonials.filter((t) => t.id !== id);
      updateDatabase({ ...db, testimonials: remaining });
      setNotif("🗑️ Testimonial deleted.");
      setTimeout(() => setNotif(""), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">CUSTOMER ACCREDITATIONS</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            TESTIMONIALS
          </h1>
        </div>

        {!showAddForm && (
          <button
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs tracking-widest px-4 py-2.5 rounded-sm font-mono flex items-center gap-1.5 uppercase transition-all shadow-lg cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5 text-black stroke-[3]" />
            <span>CREATE REVIEW</span>
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
            onSubmit={handleSaveTestimonial} 
            className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-5 sticky top-24"
          >
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300">
                {editId !== null ? "EDIT TESTIMONIAL" : "ADD NEW REVIEW"}
              </span>
              <button type="button" onClick={resetForm} className="text-zinc-500 hover:text-white">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Reviewer Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Reviewer Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Malhotra"
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm"
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Role / Location Info</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hyderabad, Streetwear Fanatic"
                className="bg-black border border-zinc-855 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm"
              />
            </div>

            {/* Rating Stars Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span className="tracking-widest uppercase">Review Rating</span>
                <span className="text-amber-500 font-bold">{rating} Stars</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Comment Body */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Review Comment Description</label>
              <textarea
                required
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write review description here..."
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm resize-none"
              />
            </div>

            {/* Actions */}
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
                <span>SAVE</span>
              </button>
            </div>
          </form>
        )}

        {/* INDEX DIRECTORY */}
        <div className={showAddForm ? "lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6" : "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {db.testimonials.map((test) => (
            <div 
              key={test.id}
              className="bg-zinc-950 border border-zinc-900 p-6 rounded-sm flex flex-col justify-between group hover:border-zinc-800 transition-all"
            >
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star 
                      key={idx} 
                      className={`w-3.5 h-3.5 ${idx < test.rating ? "text-amber-500 fill-amber-500" : "text-zinc-800"}`} 
                    />
                  ))}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans italic">"{test.text}"</p>
              </div>

              <div className="border-t border-zinc-900/60 pt-4 mt-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{test.name}</h3>
                  <span className="text-[10px] text-zinc-600 font-mono tracking-wide">{test.location}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => startEdit(test)}
                    className="p-1.5 border border-zinc-900 hover:border-amber-500 bg-black text-zinc-500 hover:text-amber-500 rounded transition-colors cursor-pointer"
                    title="Edit Review"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTestimonial(test.id)}
                    className="p-1.5 border border-zinc-900 hover:border-red-500 bg-black text-zinc-500 hover:text-red-500 rounded transition-colors cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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

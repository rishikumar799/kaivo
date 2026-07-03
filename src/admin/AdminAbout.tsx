/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useShop } from "../contexts/ShopContext";
import { Save, Sparkles, FileText } from "lucide-react";

export default function AdminAbout() {
  const { db, updateAbout } = useShop();

  const [notif, setNotif] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Subtitle/Title
  const [subtitle, setSubtitle] = useState(db?.about.subtitle || "");
  const [title, setTitle] = useState(db?.about.title || "");

  // Story details
  const [storyTitle, setStoryTitle] = useState(db?.about.storyTitle || "");
  const [story, setStory] = useState(db?.about.story || "");
  const [storyImage, setStoryImage] = useState(db?.about.storyImage || "");
  const [midSectionImage, setMidSectionImage] = useState(db?.about.midSectionImage || "");

  // Philosophy points (4 items mapped precisely)
  const [features, setFeatures] = useState(db?.about.features || []);

  // Crafted To Last (4 items mapped precisely)
  const [craftedTitle, setCraftedTitle] = useState(db?.about.craftedToLast.title || "");
  const [craftedDesc, setCraftedDesc] = useState(db?.about.craftedToLast.description || "");
  const [craftedItems, setCraftedItems] = useState(db?.about.craftedToLast.items || []);

  if (!db) return null;

  const handleSaveAboutPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotif("⏳ Committing Story Manifesto changes to Firestore...");

    try {
      const updatedAbout = {
        ...db.about,
        title,
        subtitle,
        storyTitle,
        story,
        storyImage,
        midSectionImage,
        features,
        craftedToLast: {
          title: craftedTitle,
          description: craftedDesc,
          items: craftedItems
        }
      };

      await updateAbout(updatedAbout);
      setNotif("🎉 About page content updated successfully!");
      setTimeout(() => setNotif(""), 3000);
    } catch (err) {
      alert("Failed to save About specifications: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeatureChange = (index: number, field: "title" | "description", val: string) => {
    const updated = features.map((feat, idx) => {
      if (idx === index) {
        return { ...feat, [field]: val };
      }
      return feat;
    });
    setFeatures(updated);
  };

  const handleCraftedItemChange = (index: number, field: "label" | "sub", val: string) => {
    const updated = craftedItems.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: val };
      }
      return item;
    });
    setCraftedItems(updated);
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">STORY MANIFESTO CMS</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            ABOUT BRAND CONTENT
          </h1>
        </div>
      </div>

      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>{notif}</span>
        </div>
      )}

      {/* CORE FIELDS CONTAINER */}
      <form onSubmit={handleSaveAboutPage} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Grid Content */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Main tags */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>PAGE HEADER & INTRO</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Page Subtitle Tagline</label>
                <input
                  type="text"
                  required
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Page Main Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm"
                />
              </div>
            </div>
          </div>

          {/* Story Details Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>OUR STORY MANIFESTO</span>
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Story Section Title</label>
              <input
                type="text"
                required
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Story Description Paragraph (supports markdown / newlines)</label>
              <textarea
                required
                rows={8}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-sans resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Overlapping Collage Image URL 1</label>
                <input
                  type="url"
                  required
                  value={storyImage}
                  onChange={(e) => setStoryImage(e.target.value)}
                  className="bg-black border border-zinc-850 text-xs px-3.5 py-3 text-white focus:outline-none font-mono rounded-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Overlapping Collage Image URL 2</label>
                <input
                  type="url"
                  required
                  value={midSectionImage}
                  onChange={(e) => setMidSectionImage(e.target.value)}
                  className="bg-black border border-zinc-850 text-xs px-3.5 py-3 text-white focus:outline-none font-mono rounded-sm"
                />
              </div>
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>CORE BRAND PHILOSOPHIES</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feat: any, idx: number) => (
                <div key={idx} className="p-4 bg-black border border-zinc-900 rounded-sm flex flex-col gap-4">
                  <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest">Philosophy Point #{idx + 1}</span>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">Heading Title</label>
                    <input
                      type="text"
                      required
                      value={feat.title}
                      onChange={(e) => handleFeatureChange(idx, "title", e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-xs px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">Description Subtitle</label>
                    <textarea
                      required
                      rows={2}
                      value={feat.description}
                      onChange={(e) => handleFeatureChange(idx, "description", e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-xs px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none font-sans"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Grid Content */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Crafted specs card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-5">
            <h3 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300 pb-3 border-b border-zinc-900">
              GARMENT METRICS
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Specs Header Title</label>
              <input
                type="text"
                required
                value={craftedTitle}
                onChange={(e) => setCraftedTitle(e.target.value)}
                className="bg-black border border-zinc-800 text-xs px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Specs Sub description</label>
              <textarea
                required
                rows={3}
                value={craftedDesc}
                onChange={(e) => setCraftedDesc(e.target.value)}
                className="bg-black border border-zinc-800 text-xs px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none font-sans"
              />
            </div>

            {/* Individual technical metrics */}
            <div className="flex flex-col gap-4 border-t border-zinc-900 pt-4 mt-2">
              <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase block">SPEC METRIC LABELS:</span>
              
              {craftedItems.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-black border border-zinc-900 rounded-sm flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-zinc-600 block">Metric #{idx + 1}</span>
                  <input
                    type="text"
                    required
                    value={item.label}
                    onChange={(e) => handleCraftedItemChange(idx, "label", e.target.value)}
                    placeholder="Metric Title (e.g. 240 GSM)"
                    className="bg-zinc-950 border border-zinc-800 text-xs px-3 py-1.5 text-white"
                  />
                  <input
                    type="text"
                    required
                    value={item.sub}
                    onChange={(e) => handleCraftedItemChange(idx, "sub", e.target.value)}
                    placeholder="Metric Sublabel (e.g. Heavy cotton)"
                    className="bg-zinc-950 border border-zinc-800 text-xs px-3 py-1.5 text-zinc-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Core SAVE CTA */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-bold text-xs tracking-widest py-4.5 uppercase transition-all rounded-sm font-mono flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <Save className="w-4.5 h-4.5 text-black" />
            <span>{isSaving ? "SAVING..." : "SAVE ABOUT SPEC CHANGES"}</span>
          </button>

        </div>

      </form>

    </div>
  );
}

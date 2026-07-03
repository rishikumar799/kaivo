/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { useShop } from "../contexts/ShopContext";
import { MediaItem } from "../types";
import { 
  Plus, 
  Trash2, 
  Copy, 
  Search, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  File, 
  X, 
  ExternalLink 
} from "lucide-react";

export default function AdminMedia() {
  const { db, updateMedia } = useShop();
  const [notif, setNotif] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add new media states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!db) return null;

  const mediaList = db.media || [];

  const handleCopy = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setNotif("Image URL copied to clipboard!");
    setTimeout(() => {
      setCopiedId(null);
      setNotif("");
    }, 2000);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this media item?")) return;
    const updated = mediaList.filter(m => m.id !== id);
    updateMedia(updated);
    setNotif("Media item removed from library.");
    setTimeout(() => setNotif(""), 2000);
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) {
      alert("Please enter a name and image URL.");
      return;
    }

    const newItem: MediaItem = {
      id: `m-${Date.now()}`,
      name: newName,
      url: newUrl,
      size: "External URL",
      type: "image"
    };

    updateMedia([...mediaList, newItem]);
    setNewName("");
    setNewUrl("");
    setShowAddForm(false);
    setNotif("Added new image to library.");
    setTimeout(() => setNotif(""), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const sizeInKB = Math.round(file.size / 1024);
    if (sizeInKB > 1024) {
      if (!window.confirm("This image is larger than 1MB. High-resolution images embedded in db.json may slow down local storage. Continue?")) {
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const base64Url = event.target.result as string;
        const newItem: MediaItem = {
          id: `m-${Date.now()}`,
          name: file.name.split(".")[0],
          url: base64Url,
          size: `${sizeInKB} KB`,
          type: file.type
        };

        updateMedia([...mediaList, newItem]);
        setNotif("Image imported & saved in CMS database!");
        setTimeout(() => setNotif(""), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredMedia = mediaList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">ASSET LIBRARY</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            MEDIA STORAGE
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="border border-zinc-800 hover:border-amber-500 hover:text-white bg-zinc-950 text-zinc-300 font-mono font-bold text-xs px-5 py-3 rounded-sm flex items-center justify-center gap-2 cursor-pointer uppercase"
          >
            <Upload className="w-4 h-4" />
            <span>IMPORT LOCAL FILE</span>
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#C9A063] hover:bg-[#B38E55] text-black font-mono font-bold text-xs px-5 py-3 rounded-sm flex items-center justify-center gap-2 cursor-pointer uppercase"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>ADD FROM URL</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* ADD FROM URL FORM PANEL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm w-full max-w-md p-6 flex flex-col gap-6 relative">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold tracking-widest font-mono uppercase text-zinc-300">
              ADD ASSET BY WEB LINK
            </h3>
            <form onSubmit={handleAddUrl} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Asset Friendly Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Hero Winter Cover"
                  className="bg-black border border-zinc-850 px-3 py-2.5 rounded-sm focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Image URL Link</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="bg-black border border-zinc-850 px-3 py-2.5 rounded-sm focus:outline-none focus:border-amber-500 text-zinc-300 font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C9A063] text-black font-bold font-mono tracking-widest py-3 rounded-sm mt-2 cursor-pointer hover:bg-[#B38E55]"
              >
                SAVE TO MEDIA LIBRARY
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SEARCH AND GRID */}
      <div className="flex flex-col gap-6">
        
        {/* Search */}
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </span>
          <input
            type="text"
            placeholder="Search media assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-sm py-3 pl-11 pr-4 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="border border-zinc-900 bg-zinc-950 rounded-sm py-20 text-center flex flex-col items-center justify-center gap-3">
            <ImageIcon className="w-10 h-10 text-zinc-750" />
            <p className="text-zinc-500 text-xs font-mono">
              {searchQuery ? "NO ASSETS MATCH YOUR SEARCH TERM." : "MEDIA LIBRARY IS EMPTY. IMPORT AN IMAGE TO BEGIN."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredMedia.map(item => (
              <div 
                key={item.id} 
                className="bg-zinc-950 border border-zinc-900 rounded-sm p-3 group hover:border-zinc-700 transition-all flex flex-col gap-3.5 relative"
              >
                {/* Image preview box */}
                <div className="aspect-square bg-black border border-zinc-900 rounded-sm overflow-hidden flex items-center justify-center relative">
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  
                  {/* Action buttons over hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopy(item)}
                      className="p-2 bg-black border border-zinc-800 rounded hover:border-[#C9A063] hover:text-[#C9A063] transition-all cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-black border border-zinc-800 rounded hover:border-[#C9A063] hover:text-[#C9A063] transition-all cursor-pointer"
                      title="Open Original"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-black border border-zinc-800 rounded hover:bg-red-950/40 hover:border-red-900/40 hover:text-red-400 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1 text-[11px] font-mono select-all">
                  <span className="text-white font-bold tracking-wide block truncate uppercase">
                    {item.name}
                  </span>
                  <div className="flex items-center justify-between text-[9px] text-zinc-550 pt-1.5 border-t border-zinc-900">
                    <span className="uppercase">{item.size || "Unknown Size"}</span>
                    <button 
                      onClick={() => handleCopy(item)}
                      className="text-amber-500 font-bold hover:text-white transition-all text-[8px] tracking-widest cursor-pointer uppercase"
                    >
                      {copiedId === item.id ? "COPIED" : "COPY URL"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

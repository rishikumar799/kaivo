/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { useShop } from "../contexts/ShopContext";
import { MediaItem } from "../types";
import { uploadImageToStorage } from "../lib/firebaseService";
import { 
  Plus, 
  Trash2, 
  Copy, 
  Search, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  X, 
  ExternalLink,
  Grid,
  List,
  Eye,
  RefreshCw,
  Sparkles,
  Link2,
  FileQuestion,
  Layers,
  FileImage
} from "lucide-react";

export default function AdminMedia() {
  const { db, updateMedia, updatePages, updateProducts } = useShop();
  const [notif, setNotif] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Layout View Mode (Grid vs List)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filtering Options
  const [filterMode, setFilterMode] = useState<"all" | "used" | "unused">("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "size">("recent");

  // Add new media states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replacementFileInputRef = useRef<HTMLInputElement>(null);

  // Asset replacing states
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Full Screen Image Preview Modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  if (!db) return null;

  const mediaList = db.media || [];

  // 1. Trace Asset Usages across the Entire CMS Database
  const getAssetUsage = (url: string) => {
    const usages: { type: string; name: string }[] = [];
    
    // Scan Banners
    db.banners?.forEach(b => {
      if (b.image === url) {
        usages.push({ type: "Banner", name: b.title });
      }
    });
    
    // Scan Products
    db.products?.forEach(p => {
      if (p.image === url || p.images?.includes(url)) {
        usages.push({ type: "Product", name: p.name });
      }
    });
    
    // Scan Page Sections
    db.pages?.forEach(p => {
      p.sections?.forEach(s => {
        if (s.mediaUrl === url) {
          usages.push({ type: "Section", name: `${p.title} > ${s.title || s.type}` });
        }
      });
    });
    
    return usages;
  };

  const handleCopy = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setNotif("Image link copied to clipboard!");
    setTimeout(() => {
      setCopiedId(null);
      setNotif("");
    }, 2000);
  };

  const handleDelete = (id: string) => {
    const item = mediaList.find(m => m.id === id);
    if (!item) return;

    const usages = getAssetUsage(item.url);
    if (usages.length > 0) {
      const usageList = usages.map(u => `[${u.type}] ${u.name}`).join("\n");
      if (!window.confirm(`⚠️ WARNING: This asset is currently active in:\n${usageList}\n\nDeleting it will leave those sections with broken image paths. Continue?`)) {
        return;
      }
    } else {
      if (!window.confirm("Are you sure you want to delete this media item from your library?")) return;
    }

    const updated = mediaList.filter(m => m.id !== id);
    updateMedia(updated);
    setNotif("🗑️ Asset removed from library.");
    setTimeout(() => setNotif(""), 2500);
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
    setNotif("🎉 Added external image link to library!");
    setTimeout(() => setNotif(""), 2500);
  };

  // Direct Firebase Storage File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP, GIF).");
      return;
    }

    setIsUploading(true);
    setNotif("⏳ Uploading high-res asset to Firebase Storage...");

    try {
      // 1. Upload bytes directly to Firebase Storage bucket
      const downloadUrl = await uploadImageToStorage(file, file.name);

      // 2. Insert metadata item into Firestore db
      const newItem: MediaItem = {
        id: `m-${Date.now()}`,
        name: file.name.split(".")[0],
        url: downloadUrl,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type
      };

      updateMedia([...mediaList, newItem]);
      setNotif("🚀 Upload complete! Saved to library.");
      setTimeout(() => setNotif(""), 3000);
    } catch (error) {
      alert("Failed uploading to Firebase Storage. Saving local fallback preview instead. " + (error instanceof Error ? error.message : String(error)));
      
      // Fallback base64
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const newItem: MediaItem = {
            id: `m-${Date.now()}`,
            name: file.name.split(".")[0],
            url: event.target.result as string,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type
          };
          updateMedia([...mediaList, newItem]);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  // Replace Asset / Re-upload New Bytes for existing Item ID
  const handleReplaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !replacingItemId) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const targetItem = mediaList.find(m => m.id === replacingItemId);
    if (!targetItem) return;

    setIsUploading(true);
    setNotif("⏳ Uploading replacement file to Firebase Storage...");

    try {
      const newUrl = await uploadImageToStorage(file, file.name);

      // 1. Update Media Library Entry
      const updatedMediaList = mediaList.map(m => {
        if (m.id === replacingItemId) {
          return {
            ...m,
            name: file.name.split(".")[0],
            url: newUrl,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type
          };
        }
        return m;
      });
      await updateMedia(updatedMediaList);

      // 2. Cascade replace URL across sections and product catalogs so they don't break!
      const oldUrl = targetItem.url;

      // Scan page sections
      if (db.pages) {
        const updatedPages = db.pages.map(p => {
          const updatedSections = p.sections.map(s => {
            if (s.mediaUrl === oldUrl) {
              return { ...s, mediaUrl: newUrl };
            }
            return s;
          });
          return { ...p, sections: updatedSections };
        });
        await updatePages(updatedPages);
      }

      // Scan products
      if (db.products) {
        const updatedProducts = db.products.map(p => {
          let hasChange = false;
          let image = p.image;
          let images = p.images || [];

          if (p.image === oldUrl) {
            image = newUrl;
            hasChange = true;
          }
          if (p.images?.includes(oldUrl)) {
            images = p.images.map(img => img === oldUrl ? newUrl : img);
            hasChange = true;
          }

          if (hasChange) {
            return { ...p, image, images };
          }
          return p;
        });
        await updateProducts(updatedProducts);
      }

      setNotif("🔄 Asset replaced successfully! All active templates updated.");
      setTimeout(() => setNotif(""), 3000);
    } catch (err) {
      alert("Replacement failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploading(false);
      setReplacingItemId(null);
    }
  };

  // Filter and sort the final list
  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.url.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const usages = getAssetUsage(item.url);
    if (filterMode === "used") return usages.length > 0;
    if (filterMode === "unused") return usages.length === 0;
    return true;
  });

  const sortedMedia = [...filteredMedia].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "size") {
      const sizeA = parseFloat(a.size || "0");
      const sizeB = parseFloat(b.size || "0");
      return sizeB - sizeA;
    }
    // "recent": descending order based on timestamp/id
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">ASSET LIBRARY V2</span>
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
          <input
            type="file"
            ref={replacementFileInputRef}
            onChange={handleReplaceUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="border border-zinc-800 hover:border-amber-500 hover:text-white disabled:opacity-40 bg-zinc-950 text-zinc-300 font-mono font-bold text-xs px-5 py-3 rounded-sm flex items-center justify-center gap-2 cursor-pointer uppercase transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>IMPORT LOCAL FILE</span>
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            disabled={isUploading}
            className="bg-[#C9A063] hover:bg-[#B38E55] disabled:opacity-40 text-black font-mono font-bold text-xs px-5 py-3 rounded-sm flex items-center justify-center gap-2 cursor-pointer uppercase transition-all"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>ADD FROM URL</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Check className="w-4 h-4 shrink-0 animate-bounce text-amber-500" />
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
            <form onSubmit={handleAddUrl} className="flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest text-zinc-500 uppercase">Asset Friendly Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Hero Winter Cover"
                  className="bg-black border border-zinc-850 px-3 py-2.5 text-white text-xs rounded-sm focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest text-zinc-500 uppercase">Image URL Link</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="bg-black border border-zinc-850 px-3 py-2.5 text-zinc-300 text-xs rounded-sm focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C9A063] text-black font-bold tracking-widest py-3 rounded-sm mt-2 cursor-pointer hover:bg-[#B38E55] transition-colors"
              >
                SAVE TO MEDIA LIBRARY
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FILTER & SORT AND CONTROLS BAR */}
      <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow">
          
          {/* Search box */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
            </span>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-zinc-850 rounded-sm py-2 pl-9 pr-3 text-xs font-mono text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter Status buttons */}
          <div className="flex rounded overflow-hidden border border-zinc-850 text-[10px] font-mono">
            {(["all", "used", "unused"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3.5 py-2 uppercase font-bold transition-all cursor-pointer ${
                  filterMode === mode 
                    ? "bg-amber-500 text-black" 
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                {mode === "all" ? "All Files" : mode === "used" ? "Used" : "Unused"}
              </button>
            ))}
          </div>

        </div>

        {/* Right Side: Sorting and Layout Toggles */}
        <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end text-xs font-mono">
          
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px]">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black border border-zinc-850 text-white rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="name">Alphabetical</option>
              <option value="size">File Size</option>
            </select>
          </div>

          <div className="flex border border-zinc-850 rounded overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-zinc-850 text-amber-500" : "bg-zinc-900 text-zinc-500 hover:text-white"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-all cursor-pointer ${
                viewMode === "list" ? "bg-zinc-850 text-amber-500" : "bg-zinc-900 text-zinc-500 hover:text-white"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* MEDIA GRID / LIST VIEW */}
      {sortedMedia.length === 0 ? (
        <div className="border border-zinc-900 bg-zinc-950 rounded-sm py-20 text-center flex flex-col items-center justify-center gap-3">
          <ImageIcon className="w-10 h-10 text-zinc-800" />
          <p className="text-zinc-500 text-xs font-mono">
            {searchQuery ? "NO ASSETS MATCH YOUR KEYWORD." : "THE SPECIFIED FILTER CONTAINS NO IMAGES."}
          </p>
        </div>
      ) : (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {sortedMedia.map(item => {
              const usages = getAssetUsage(item.url);
              const isUsed = usages.length > 0;
              return (
                <div 
                  key={item.id} 
                  className="bg-zinc-950 border border-zinc-900 rounded-sm p-3 group hover:border-zinc-700 transition-all flex flex-col gap-3 relative"
                >
                  {/* Image container */}
                  <div className="aspect-square bg-black border border-zinc-900 rounded-sm overflow-hidden flex items-center justify-center relative">
                    <img 
                      src={item.url} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />

                    {/* Hover actions panel */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-2">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleCopy(item)}
                          className="p-2 bg-black border border-zinc-800 rounded hover:border-[#C9A063] hover:text-[#C9A063] transition-all cursor-pointer"
                          title="Copy Link"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setPreviewImageUrl(item.url)}
                          className="p-2 bg-black border border-zinc-800 rounded hover:border-[#C9A063] hover:text-[#C9A063] transition-all cursor-pointer"
                          title="Preview full size"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setReplacingItemId(item.id);
                            replacementFileInputRef.current?.click();
                          }}
                          className="p-2 bg-black border border-zinc-800 rounded hover:border-amber-500 hover:text-amber-500 transition-all cursor-pointer"
                          title="Replace Image bytes"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-black border border-zinc-800 rounded hover:bg-red-950/40 hover:border-red-900/40 hover:text-red-400 transition-all cursor-pointer"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[8px] font-mono text-zinc-500 text-center mt-2 truncate w-full select-all">
                        {item.url}
                      </span>
                    </div>

                    {/* Usage Tag Ribbon */}
                    <div className="absolute top-2 left-2">
                      {isUsed ? (
                        <span className="bg-emerald-500/90 text-black text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">
                          IN USE ({usages.length})
                        </span>
                      ) : (
                        <span className="bg-zinc-800/90 text-zinc-400 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">
                          UNUSED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details metadata */}
                  <div className="flex flex-col gap-1 text-[11px] font-mono">
                    <span className="text-white font-bold tracking-wide block truncate uppercase" title={item.name}>
                      {item.name}
                    </span>
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1.5 border-t border-zinc-900">
                      <span className="uppercase">{item.size || "EXTERNAL"}</span>
                      <button 
                        onClick={() => handleCopy(item)}
                        className="text-amber-500 font-bold hover:text-white transition-all text-[8px] tracking-widest cursor-pointer uppercase"
                      >
                        {copiedId === item.id ? "COPIED" : "COPY LINK"}
                      </button>
                    </div>

                    {/* Trace Usage list in grid */}
                    {isUsed && (
                      <div className="mt-1 text-[8px] text-zinc-500 truncate">
                        🔗 {usages.map(u => u.name).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden text-xs font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] tracking-wider uppercase">
                  <th className="p-4">Preview</th>
                  <th className="p-4">Name / ID</th>
                  <th className="p-4">Usage Tracing</th>
                  <th className="p-4">File Size</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {sortedMedia.map(item => {
                  const usages = getAssetUsage(item.url);
                  const isUsed = usages.length > 0;
                  return (
                    <tr key={item.id} className="hover:bg-zinc-900/40 transition-all">
                      <td className="p-4 w-16">
                        <div 
                          className="w-12 h-12 rounded border border-zinc-850 bg-black overflow-hidden cursor-pointer"
                          onClick={() => setPreviewImageUrl(item.url)}
                        >
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-bold block uppercase">{item.name}</span>
                        <span className="text-[9px] text-zinc-500 select-all block mt-0.5 max-w-xs truncate">{item.url}</span>
                      </td>
                      <td className="p-4">
                        {isUsed ? (
                          <div className="flex flex-col gap-1 max-w-xs">
                            <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-wider">
                              ● ACTIVE IN ({usages.length} PLACES)
                            </span>
                            <div className="text-[9px] text-zinc-450 leading-relaxed truncate">
                              {usages.map(u => `${u.type}: ${u.name}`).join(", ")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-500 font-medium text-[9px] uppercase tracking-wider">
                            ○ UNUSED ORPHAN FILE
                          </span>
                        )}
                      </td>
                      <td className="p-4 uppercase text-zinc-400 text-[10px]">
                        {item.size || "External URL Link"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(item)}
                            className="p-1.5 bg-black border border-zinc-850 rounded text-zinc-400 hover:text-amber-500 cursor-pointer"
                            title="Copy image link"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => {
                              setReplacingItemId(item.id);
                              replacementFileInputRef.current?.click();
                            }}
                            className="p-1.5 bg-black border border-zinc-850 rounded text-zinc-400 hover:text-amber-500 cursor-pointer"
                            title="Replace image bytes"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 bg-black border border-zinc-850 rounded text-red-500 hover:bg-red-950/20 cursor-pointer"
                            title="Delete forever"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* FULL-SIZE IMAGE PREVIEW MODAL */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button 
            onClick={() => setPreviewImageUrl(null)}
            className="absolute top-4 right-4 p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-4xl max-h-[85vh] flex flex-col gap-4 items-center">
            <img 
              src={previewImageUrl} 
              alt="Preview Full Size" 
              className="max-w-full max-h-[75vh] object-contain rounded border border-zinc-900 shadow-2xl" 
              referrerPolicy="no-referrer"
            />
            <span className="text-[10px] font-mono text-zinc-400 select-all tracking-wide bg-black border border-zinc-900 py-1.5 px-4 rounded">
              {previewImageUrl}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

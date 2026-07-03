/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useShop } from "../contexts/ShopContext";
import { MenuItem } from "../types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  X, 
  Link as LinkIcon, 
  Layers, 
  ExternalLink, 
  Play, 
  Save 
} from "lucide-react";

export default function AdminMenus() {
  const { db, updateMenus } = useShop();
  const [notif, setNotif] = useState("");

  // Form State
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [type, setType] = useState<"normal" | "dropdown" | "external" | "button">("normal");
  const [enabled, setEnabled] = useState(true);
  const [parentId, setParentId] = useState<string>(""); // For nested items

  if (!db) return null;

  const menus = db.menus || [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim()) {
      alert("Please fill in Name and Path/Slug.");
      return;
    }

    let updatedMenus = [...menus];

    if (editingItem) {
      // Editing item
      if (parentId) {
        // Move or update as a child
        updatedMenus = updatedMenus.map(m => {
          if (m.id === parentId) {
            const children = m.children || [];
            const isExistingChild = children.some(c => c.id === editingItem.id);
            const updatedChildren = isExistingChild
              ? children.map(c => c.id === editingItem.id ? { ...c, name, path, type, enabled } : c)
              : [...children, { id: editingItem.id, name, path, type, enabled, order: children.length }];
            return { ...m, children: updatedChildren };
          } else {
            // Remove from old parent or main level if parent changed
            const updatedChildren = (m.children || []).filter(c => c.id !== editingItem.id);
            return { ...m, children: updatedChildren };
          }
        });
      } else {
        // Main level item
        updatedMenus = updatedMenus.map(m => {
          if (m.id === editingItem.id) {
            return { ...m, name, path, type, enabled };
          }
          // Also check and remove from children if it was nested and moved to main level
          if (m.children) {
            return { ...m, children: m.children.filter(c => c.id !== editingItem.id) };
          }
          return m;
        });
      }
      setNotif("Menu item updated successfully!");
    } else {
      // Create new item
      const newItem: MenuItem = {
        id: `menu-${Date.now()}`,
        name,
        path,
        type,
        enabled,
        order: menus.length,
        children: type === "dropdown" ? [] : undefined
      };

      if (parentId) {
        updatedMenus = updatedMenus.map(m => {
          if (m.id === parentId) {
            return { ...m, children: [...(m.children || []), newItem] };
          }
          return m;
        });
      } else {
        updatedMenus.push(newItem);
      }
      setNotif("New menu item created!");
    }

    updateMenus(updatedMenus);
    resetForm();
    setTimeout(() => setNotif(""), 3000);
  };

  const handleEdit = (item: MenuItem, parentMenuId?: string) => {
    setEditingItem(item);
    setName(item.name);
    setPath(item.path);
    setType(item.type);
    setEnabled(item.enabled);
    setParentId(parentMenuId || "");
  };

  const handleDelete = (id: string, parentMenuId?: string) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;

    let updatedMenus = [...menus];
    if (parentMenuId) {
      updatedMenus = updatedMenus.map(m => {
        if (m.id === parentMenuId) {
          return { ...m, children: (m.children || []).filter(c => c.id !== id) };
        }
        return m;
      });
    } else {
      updatedMenus = updatedMenus.filter(m => m.id !== id);
    }

    updateMenus(updatedMenus);
    setNotif("Menu item deleted.");
    setTimeout(() => setNotif(""), 3000);
  };

  const toggleEnable = (item: MenuItem, parentMenuId?: string) => {
    let updatedMenus = [...menus];
    if (parentMenuId) {
      updatedMenus = updatedMenus.map(m => {
        if (m.id === parentMenuId) {
          return {
            ...m,
            children: (m.children || []).map(c => c.id === item.id ? { ...c, enabled: !c.enabled } : c)
          };
        }
        return m;
      });
    } else {
      updatedMenus = updatedMenus.map(m => m.id === item.id ? { ...m, enabled: !m.enabled } : m);
    }
    updateMenus(updatedMenus);
  };

  const moveOrder = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= menus.length) return;

    const updated = [...menus];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-order
    const ordered = updated.map((m, idx) => ({ ...m, order: idx }));
    updateMenus(ordered);
  };

  const moveChildOrder = (parentIdx: number, childIdx: number, direction: "up" | "down") => {
    const parent = menus[parentIdx];
    const children = [...(parent.children || [])];
    const targetIdx = direction === "up" ? childIdx - 1 : childIdx + 1;
    if (targetIdx < 0 || targetIdx >= children.length) return;

    const temp = children[childIdx];
    children[childIdx] = children[targetIdx];
    children[targetIdx] = temp;

    const updatedMenus = [...menus];
    updatedMenus[parentIdx] = { ...parent, children };
    updateMenus(updatedMenus);
  };

  const resetForm = () => {
    setEditingItem(null);
    setName("");
    setPath("");
    setType("normal");
    setEnabled(true);
    setParentId("");
  };

  const getIcon = (itemType: string) => {
    switch (itemType) {
      case "dropdown": return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
      case "external": return <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />;
      case "button": return <Play className="w-3.5 h-3.5 text-amber-500" />;
      default: return <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">NAVIGATION CONTROLS</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            MENU BUILDER
          </h1>
        </div>
      </div>

      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT: Menu list tree structure */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-4">
          <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3">
            NAVIGATION HIERARCHY
          </h2>

          {menus.length === 0 ? (
            <div className="py-12 text-center text-zinc-600 text-xs font-mono">
              NO MENU ITEMS CONFIGURED. CREATE A MENU ITEM IN THE FORM.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {menus.map((item, idx) => (
                <div key={item.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-4 bg-black border border-zinc-900 rounded-sm hover:border-zinc-800 transition-all">
                    <div className="flex items-center gap-3">
                      {getIcon(item.type)}
                      <span className="text-xs font-bold tracking-wider text-white uppercase">{item.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500">({item.path})</span>
                      {item.children && item.children.length > 0 && (
                        <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded font-mono">
                          {item.children.length} SUBITEMS
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Order Controls */}
                      <button 
                        onClick={() => moveOrder(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-400 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => moveOrder(idx, "down")}
                        disabled={idx === menus.length - 1}
                        className="p-1 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-400 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Enable Toggle */}
                      <button
                        onClick={() => toggleEnable(item)}
                        className={`px-2 py-1 text-[9px] font-mono rounded uppercase border ${
                          item.enabled 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}
                      >
                        {item.enabled ? "Active" : "Disabled"}
                      </button>

                      {/* Edit */}
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-1.5 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 text-amber-500 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 border border-zinc-900 rounded bg-zinc-950 hover:bg-red-950/40 text-red-400 hover:border-red-900/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Render Nested Children if any */}
                  {item.children && item.children.length > 0 && (
                    <div className="ml-8 border-l border-zinc-900 pl-4 flex flex-col gap-2">
                      {item.children.map((child, cIdx) => (
                        <div key={child.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-900 rounded-xs">
                          <div className="flex items-center gap-2.5">
                            {getIcon(child.type)}
                            <span className="text-xs font-bold tracking-wider text-zinc-350 uppercase">{child.name}</span>
                            <span className="text-[9px] font-mono text-zinc-650">({child.path})</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => moveChildOrder(idx, cIdx, "up")}
                              disabled={cIdx === 0}
                              className="p-0.5 border border-zinc-900 rounded bg-black hover:bg-zinc-900 text-zinc-400 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => moveChildOrder(idx, cIdx, "down")}
                              disabled={cIdx === (item.children || []).length - 1}
                              className="p-0.5 border border-zinc-900 rounded bg-black hover:bg-zinc-900 text-zinc-400 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => toggleEnable(child, item.id)}
                              className={`px-1.5 py-0.5 text-[8px] font-mono rounded uppercase border ${
                                child.enabled 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                  : "bg-red-500/10 border-red-500/20 text-red-400"
                              }`}
                            >
                              {child.enabled ? "Active" : "Disabled"}
                            </button>

                            <button 
                              onClick={() => handleEdit(child, item.id)}
                              className="p-1 border border-zinc-900 rounded bg-black hover:bg-zinc-900 text-amber-500 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            <button 
                              onClick={() => handleDelete(child.id, item.id)}
                              className="p-1 border border-zinc-900 rounded bg-black hover:bg-red-950/20 text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Add/Edit item form */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-6">
          <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 flex items-center justify-between">
            <span>{editingItem ? "EDIT MENU ITEM" : "CREATE MENU ITEM"}</span>
            {editingItem && (
              <button onClick={resetForm} className="text-[9px] font-mono text-zinc-500 hover:text-white uppercase flex items-center gap-1">
                <X className="w-3 h-3" /> CANCEL
              </button>
            )}
          </h2>

          <form onSubmit={handleSave} className="flex flex-col gap-5 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Menu Text Label</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SHOP, OVERSIZED, OUR STORY"
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono uppercase"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Destination URL / Slug Path</label>
              <input
                type="text"
                required
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="e.g. /shop, /about, or external link http://"
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono text-zinc-300"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Menu Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
              >
                <option value="normal">Normal Page Link</option>
                <option value="dropdown">Dropdown Container (supports nesting)</option>
                <option value="external">External Link</option>
                <option value="button">CTA Accent Button Link</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Parent Item (Nest inside a Dropdown)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                disabled={type === "dropdown"}
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono disabled:opacity-45"
              >
                <option value="">None (Top-Level Item)</option>
                {menus
                  .filter(m => m.type === "dropdown" && m.id !== editingItem?.id)
                  .map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))
                }
              </select>
            </div>

            <div className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                id="menuEnabled"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4.5 h-4.5 border border-zinc-800 rounded-xs accent-amber-500 cursor-pointer"
              />
              <label htmlFor="menuEnabled" className="text-[11px] font-mono text-zinc-400 select-none cursor-pointer">
                Enable / Show in Navigation Bar
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#C9A063] hover:bg-[#B38E55] text-black font-bold text-xs tracking-widest py-4 uppercase rounded-sm font-mono flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <Save className="w-4 h-4 text-black" />
              <span>{editingItem ? "SAVE MENU ITEM" : "CREATE MENU ITEM"}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

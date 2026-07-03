/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useShop } from "../contexts/ShopContext";
import { Page, Section, SectionStyle } from "../types";
import { 
  Plus, 
  Trash2, 
  Copy, 
  Edit, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  X, 
  Layout, 
  Save, 
  Eye, 
  EyeOff, 
  Settings as SettingsIcon, 
  Sparkles,
  Search,
  Grid
} from "lucide-react";

export default function AdminPages() {
  const { db, updatePages } = useShop();
  const [notif, setNotif] = useState("");

  // Selected Page
  const [selectedPageId, setSelectedPageId] = useState<string>("page-home");
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  // Active section editing
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  if (!db) return null;

  const pages = db.pages || [];
  const selectedPage = pages.find(p => p.id === selectedPageId) || pages[0];

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !newPageSlug.trim()) {
      alert("Please provide page title and URL slug.");
      return;
    }

    const cleanSlug = newPageSlug.toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    const isDuplicate = pages.some(p => p.slug === cleanSlug);
    if (isDuplicate) {
      alert("A page with this slug already exists.");
      return;
    }

    const newPage: Page = {
      id: `page-${Date.now()}`,
      title: newPageTitle,
      slug: cleanSlug,
      published: true,
      sections: [
        {
          id: `sec-${Date.now()}`,
          type: "text-only",
          enabled: true,
          title: `Welcome to ${newPageTitle}`,
          subtitle: "DYNAMIC CONTENT SECTION",
          description: "Use the CMS section builder to style, customize and populate this page without code.",
          styles: {
            bgColor: "#050505",
            textColor: "#ffffff",
            paddingTop: "py-16",
            paddingBottom: "py-16",
            alignment: "center"
          }
        }
      ]
    };

    const updatedPages = [...pages, newPage];
    updatePages(updatedPages);
    setSelectedPageId(newPage.id);
    setShowNewPageModal(false);
    setNewPageTitle("");
    setNewPageSlug("");
    setNotif("New page created! You can now edit its sections.");
    setTimeout(() => setNotif(""), 3000);
  };

  const handleUpdatePageSEO = (field: keyof Omit<Page, "id" | "sections">, value: any) => {
    if (!selectedPage) return;
    const updated = pages.map(p => p.id === selectedPage.id ? { ...p, [field]: value } : p);
    updatePages(updated);
    setNotif("Page settings updated.");
    setTimeout(() => setNotif(""), 1500);
  };

  const handleDeletePage = (id: string) => {
    if (id === "page-home") {
      alert("The home page cannot be deleted.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this entire page and all its custom sections?")) return;

    const updated = pages.filter(p => p.id !== id);
    updatePages(updated);
    setSelectedPageId("page-home");
    setNotif("Page deleted.");
    setTimeout(() => setNotif(""), 2000);
  };

  const handleDuplicatePage = (pageToDup: Page) => {
    const dup: Page = {
      ...pageToDup,
      id: `page-${Date.now()}`,
      title: `${pageToDup.title} (Copy)`,
      slug: `${pageToDup.slug}-copy`,
      sections: pageToDup.sections.map(s => ({ ...s, id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` }))
    };
    updatePages([...pages, dup]);
    setSelectedPageId(dup.id);
    setNotif(`Duplicated page: ${dup.title}`);
    setTimeout(() => setNotif(""), 3000);
  };

  // --- SECTION BUILDER ACTIONS ---

  const handleAddSection = (type: string) => {
    if (!selectedPage) return;

    const newSection: Section = {
      id: `sec-${Date.now()}`,
      type,
      enabled: true,
      title: "New Section Title",
      subtitle: "SUBTITLE CAPTION",
      description: "Customize this description using the style and editor panels on the right side.",
      buttonText: "LEARN MORE",
      buttonLink: "/shop",
      mediaUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600",
      mediaLayout: "image-left",
      styles: {
        bgColor: "#050505",
        textColor: "#ffffff",
        paddingTop: "py-16",
        paddingBottom: "py-16",
        alignment: "center"
      }
    };

    const updatedSections = [...selectedPage.sections, newSection];
    const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
    updatePages(updatedPages);
    setEditingSectionId(newSection.id);
    setNotif(`Added a new ${type} section.`);
    setTimeout(() => setNotif(""), 3000);
  };

  const handleUpdateSection = (sectionId: string, updatedFields: Partial<Section>) => {
    if (!selectedPage) return;

    const updatedSections = selectedPage.sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, ...updatedFields };
      }
      return s;
    });

    const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
    updatePages(updatedPages);
  };

  const handleUpdateSectionStyles = (sectionId: string, updatedStyles: Partial<SectionStyle>) => {
    if (!selectedPage) return;

    const updatedSections = selectedPage.sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, styles: { ...(s.styles || {}), ...updatedStyles } };
      }
      return s;
    });

    const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
    updatePages(updatedPages);
  };

  const handleMoveSection = (idx: number, direction: "up" | "down") => {
    if (!selectedPage) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= selectedPage.sections.length) return;

    const updatedSections = [...selectedPage.sections];
    const temp = updatedSections[idx];
    updatedSections[idx] = updatedSections[targetIdx];
    updatedSections[targetIdx] = temp;

    const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
    updatePages(updatedPages);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!selectedPage) return;
    if (!window.confirm("Are you sure you want to delete this section?")) return;

    const updatedSections = selectedPage.sections.filter(s => s.id !== sectionId);
    const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
    updatePages(updatedPages);
    if (editingSectionId === sectionId) setEditingSectionId(null);
    setNotif("Section deleted.");
    setTimeout(() => setNotif(""), 2000);
  };

  const handleDuplicateSection = (section: Section) => {
    if (!selectedPage) return;
    const dup: Section = {
      ...section,
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${section.title || "Section"} (Copy)`
    };

    const idx = selectedPage.sections.findIndex(s => s.id === section.id);
    const updatedSections = [...selectedPage.sections];
    updatedSections.splice(idx + 1, 0, dup);

    const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
    updatePages(updatedPages);
    setEditingSectionId(dup.id);
    setNotif("Section duplicated.");
    setTimeout(() => setNotif(""), 2000);
  };

  const toggleSectionEnabled = (sectionId: string) => {
    if (!selectedPage) return;
    const updatedSections = selectedPage.sections.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s);
    const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
    updatePages(updatedPages);
  };

  const sectionTypes = [
    { value: "hero-banner", label: "Hero Banner" },
    { value: "image-text", label: "Image + Text" },
    { value: "text-image", label: "Text + Image" },
    { value: "text-only", label: "Text Only Block" },
    { value: "features-grid", label: "Features Grid" },
    { value: "product-grid", label: "Products Showcase" },
    { value: "category-grid", label: "Categories Grid" },
    { value: "testimonials", label: "Testimonials Carousel" },
    { value: "faq", label: "FAQ Accordion" },
    { value: "newsletter", label: "Newsletter Capture" },
    { value: "custom-html", label: "Custom HTML Injection" },
    { value: "cta", label: "Call To Action Card" },
    { value: "divider", label: "Spacer & Divider" }
  ];

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">PAGE DESIGN & BUILDER</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            WEBSITE PAGES & SECTIONS
          </h1>
        </div>

        <button 
          onClick={() => setShowNewPageModal(true)}
          className="bg-[#C9A063] hover:bg-[#B38E55] text-black font-mono font-bold text-xs px-5 py-3 rounded-sm flex items-center justify-center gap-2 cursor-pointer uppercase shrink-0"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>NEW CUSTOM PAGE</span>
        </button>
      </div>

      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* NEW PAGE MODAL */}
      {showNewPageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm w-full max-w-md p-6 flex flex-col gap-6 relative">
            <button 
              onClick={() => setShowNewPageModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold tracking-widest font-mono uppercase text-zinc-300">
              CREATE NEW WEBPAGE
            </h3>
            <form onSubmit={handleCreatePage} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Page Title</label>
                <input
                  type="text"
                  required
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-"));
                  }}
                  placeholder="e.g. Winter Collection"
                  className="bg-black border border-zinc-850 px-3 py-2.5 rounded-sm focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">URL Slug Path</label>
                <div className="flex items-center bg-black border border-zinc-850 rounded-sm px-3 py-2.5 font-mono text-zinc-400">
                  <span className="text-zinc-600 mr-1 select-none">/pages/</span>
                  <input
                    type="text"
                    required
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    placeholder="winter-collection"
                    className="bg-transparent focus:outline-none text-white w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#C9A063] text-black font-bold font-mono tracking-widest py-3 rounded-sm mt-2 cursor-pointer hover:bg-[#B38E55]"
              >
                PROVISION PAGE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT BAR: Pages List & Page Configuration */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Page Selector Panel */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-4 flex flex-col gap-3">
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">ACTIVE CMS PAGE</span>
            <select
              value={selectedPageId}
              onChange={(e) => {
                setSelectedPageId(e.target.value);
                setEditingSectionId(null);
              }}
              className="w-full bg-black border border-zinc-850 text-xs px-3 py-3 rounded-sm text-white font-mono focus:outline-none focus:border-amber-500"
            >
              {pages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title.toUpperCase()} {p.slug === "home" ? "(Home)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Page Settings & SEO Panel */}
          {selectedPage && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-5 flex flex-col gap-5 text-xs">
              <h3 className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase border-b border-zinc-900 pb-2">
                PAGE SETTINGS
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">SEO Page Title</label>
                <input
                  type="text"
                  value={selectedPage.seoTitle || ""}
                  onChange={(e) => handleUpdatePageSEO("seoTitle", e.target.value)}
                  placeholder="Meta title tags..."
                  className="bg-black border border-zinc-850 px-3 py-2 text-white font-mono rounded focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">SEO Page Description</label>
                <textarea
                  value={selectedPage.seoDescription || ""}
                  onChange={(e) => handleUpdatePageSEO("seoDescription", e.target.value)}
                  placeholder="Meta description tags for crawlers..."
                  rows={3}
                  className="bg-black border border-zinc-850 px-3 py-2 text-white font-mono rounded focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">Background Header Banner Image</label>
                <input
                  type="text"
                  value={selectedPage.pageBanner || ""}
                  onChange={(e) => handleUpdatePageSEO("pageBanner", e.target.value)}
                  placeholder="https://image-url-here..."
                  className="bg-black border border-zinc-850 px-3 py-2 text-white font-mono rounded focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                <span className="text-zinc-500 font-mono text-[10px]">PUBLISH STATUS</span>
                <button
                  onClick={() => handleUpdatePageSEO("published", !selectedPage.published)}
                  className={`px-3 py-1 font-mono text-[9px] font-bold rounded uppercase border ${
                    selectedPage.published 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
                >
                  {selectedPage.published ? "Published" : "Hidden"}
                </button>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-zinc-900">
                <button
                  onClick={() => handleDuplicatePage(selectedPage)}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono py-2 rounded flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> DUPLICATE PAGE
                </button>
                {selectedPage.slug !== "home" && (
                  <button
                    onClick={() => handleDeletePage(selectedPage.id)}
                    className="w-full bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 font-mono py-2 rounded flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> DELETE PAGE
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* MIDDLE: Sections Stack (Visual stack of sections on the selected page) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-6">
          
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400">
              PAGE SECTIONS STACK
            </h2>
            {selectedPage && (
              <span className="text-[10px] font-mono text-zinc-500">
                {selectedPage.sections.length} SECTIONS
              </span>
            )}
          </div>

          {(!selectedPage || selectedPage.sections.length === 0) ? (
            <div className="py-16 text-center text-zinc-600 text-xs font-mono">
              NO SECTIONS DEFINED. ADD ONE BELOW.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {selectedPage.sections.map((sec, idx) => {
                const isActive = editingSectionId === sec.id;
                return (
                  <div 
                    key={sec.id}
                    className={`border rounded bg-black transition-all ${
                      isActive ? "border-amber-500 shadow-lg shadow-amber-500/5" : "border-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Layout className="w-4 h-4 text-amber-500/80 shrink-0" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-white">
                            {sec.title || "Untitled Section"}
                          </p>
                          <span className="text-[9px] font-mono text-[#C9A063] uppercase tracking-widest">
                            {sec.type.replace("-", " ")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Move controls */}
                        <button 
                          onClick={() => handleMoveSection(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 disabled:opacity-25 text-zinc-400 cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleMoveSection(idx, "down")}
                          disabled={idx === selectedPage.sections.length - 1}
                          className="p-1 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 disabled:opacity-25 text-zinc-400 cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Enable Toggler */}
                        <button 
                          onClick={() => toggleSectionEnabled(sec.id)}
                          className="p-1.5 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-400 cursor-pointer"
                          title={sec.enabled ? "Disable section" : "Enable section"}
                        >
                          {sec.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
                        </button>

                        {/* Edit Section */}
                        <button 
                          onClick={() => setEditingSectionId(isActive ? null : sec.id)}
                          className={`p-1.5 border rounded cursor-pointer ${
                            isActive ? "bg-[#C9A063] border-[#C9A063] text-black" : "border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-amber-500"
                          }`}
                        >
                          <SettingsIcon className="w-3.5 h-3.5" />
                        </button>

                        {/* Options */}
                        <button 
                          onClick={() => handleDuplicateSection(sec)}
                          className="p-1.5 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-400 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-1.5 border border-zinc-900 rounded bg-zinc-950 hover:bg-red-950/20 text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Add Section Panel */}
          <div className="border-t border-zinc-900 pt-6 mt-4 flex flex-col gap-3">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
              ADD NEW CONTENT SECTION
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {sectionTypes.map(st => (
                <button
                  key={st.value}
                  onClick={() => handleAddSection(st.value)}
                  className="py-2.5 px-3 bg-zinc-900 border border-zinc-800 hover:border-amber-500 hover:text-white rounded text-left flex items-center justify-between text-[11px] font-mono tracking-wider cursor-pointer"
                >
                  <span>{st.label}</span>
                  <Plus className="w-3 h-3 text-amber-500" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT: Section Customizer Form (Visible when section settings is selected) */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-6 min-h-[500px]">
          <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 flex items-center justify-between">
            <span>SECTION CUSTOMIZER</span>
            {editingSectionId && (
              <button onClick={() => setEditingSectionId(null)} className="text-zinc-500 hover:text-white flex items-center gap-1 text-[10px]">
                <X className="w-3.5 h-3.5" /> CLOSE
              </button>
            )}
          </h2>

          {!editingSectionId ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-900 rounded-sm text-zinc-500">
              <Sparkles className="w-8 h-8 text-[#C9A063]/20 mb-3" />
              <p className="text-xs font-mono leading-relaxed">
                SELECT A SECTION STACK COMPONENT SETTING BUTTON TO CONFIGURE LABELS, CONTENT, STYLES, AND DEVICE LAYOUT RESPONSIVENESS.
              </p>
            </div>
          ) : (
            (() => {
              const sec = selectedPage.sections.find(s => s.id === editingSectionId);
              if (!sec) return null;
              return (
                <div className="flex flex-col gap-6 text-xs font-mono">
                  
                  {/* General Config */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] text-amber-500 font-bold border-b border-zinc-900 pb-1.5">CONTENT VALUES</h3>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase">Section Main Title</label>
                      <input
                        type="text"
                        value={sec.title || ""}
                        onChange={(e) => handleUpdateSection(sec.id, { title: e.target.value })}
                        className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase">Section Subtitle / Tagline</label>
                      <input
                        type="text"
                        value={sec.subtitle || ""}
                        onChange={(e) => handleUpdateSection(sec.id, { subtitle: e.target.value })}
                        className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase">Section Description</label>
                      <textarea
                        value={sec.description || ""}
                        onChange={(e) => handleUpdateSection(sec.id, { description: e.target.value })}
                        rows={3}
                        className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 font-sans resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Button Text</label>
                        <input
                          type="text"
                          value={sec.buttonText || ""}
                          onChange={(e) => handleUpdateSection(sec.id, { buttonText: e.target.value })}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Button Link Path</label>
                        <input
                          type="text"
                          value={sec.buttonLink || ""}
                          onChange={(e) => handleUpdateSection(sec.id, { buttonLink: e.target.value })}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Image / Media upload fields */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase">Media Content / Image URL</label>
                      <input
                        type="text"
                        value={sec.mediaUrl || ""}
                        onChange={(e) => handleUpdateSection(sec.id, { mediaUrl: e.target.value })}
                        className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {sec.type === "custom-html" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Custom HTML Code Injection</label>
                        <textarea
                          value={sec.customHtml || ""}
                          onChange={(e) => handleUpdateSection(sec.id, { customHtml: e.target.value })}
                          rows={6}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Styling Configuration */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] text-amber-500 font-bold border-b border-zinc-900 pb-1.5">LAYOUTS & STYLES</h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">BG Color Hex</label>
                        <input
                          type="text"
                          value={sec.styles?.bgColor || "#050505"}
                          onChange={(e) => handleUpdateSectionStyles(sec.id, { bgColor: e.target.value })}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Text Color Hex</label>
                        <input
                          type="text"
                          value={sec.styles?.textColor || "#ffffff"}
                          onChange={(e) => handleUpdateSectionStyles(sec.id, { textColor: e.target.value })}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Padding Top</label>
                        <select
                          value={sec.styles?.paddingTop || "py-16"}
                          onChange={(e) => handleUpdateSectionStyles(sec.id, { paddingTop: e.target.value })}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500"
                        >
                          <option value="py-4">Small (py-4)</option>
                          <option value="py-8">Medium (py-8)</option>
                          <option value="py-16">Large (py-16)</option>
                          <option value="py-24">X-Large (py-24)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Text Alignment</label>
                        <select
                          value={sec.styles?.alignment || "center"}
                          onChange={(e) => handleUpdateSectionStyles(sec.id, { alignment: e.target.value as any })}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500"
                        >
                          <option value="left">Left Align</option>
                          <option value="center">Center Align</option>
                          <option value="right">Right Align</option>
                        </select>
                      </div>
                    </div>

                    {/* Responsive Multi-Device Arrangement */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] text-zinc-500 uppercase">Responsive Grid Layout Configurations</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] text-zinc-600">DESKTOP</span>
                          <select
                            value={sec.styles?.desktopLayout || "grid-cols-3"}
                            onChange={(e) => handleUpdateSectionStyles(sec.id, { desktopLayout: e.target.value })}
                            className="bg-black border border-zinc-850 px-1 py-1 rounded text-[10px]"
                          >
                            <option value="grid-cols-1">1 Col</option>
                            <option value="grid-cols-2">2 Cols</option>
                            <option value="grid-cols-3">3 Cols</option>
                            <option value="grid-cols-4">4 Cols</option>
                            <option value="grid-cols-5">5 Cols</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] text-zinc-600">TABLET</span>
                          <select
                            value={sec.styles?.tabletLayout || "grid-cols-2"}
                            onChange={(e) => handleUpdateSectionStyles(sec.id, { tabletLayout: e.target.value })}
                            className="bg-black border border-zinc-850 px-1 py-1 rounded text-[10px]"
                          >
                            <option value="grid-cols-1">1 Col</option>
                            <option value="grid-cols-2">2 Cols</option>
                            <option value="grid-cols-3">3 Cols</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] text-zinc-600">MOBILE</span>
                          <select
                            value={sec.styles?.mobileLayout || "grid-cols-1"}
                            onChange={(e) => handleUpdateSectionStyles(sec.id, { mobileLayout: e.target.value })}
                            className="bg-black border border-zinc-850 px-1 py-1 rounded text-[10px]"
                          >
                            <option value="grid-cols-1">1 Col</option>
                            <option value="grid-cols-2">2 Cols</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase">Entrance Animation Effect</label>
                      <select
                        value={sec.styles?.animation || "none"}
                        onChange={(e) => handleUpdateSectionStyles(sec.id, { animation: e.target.value })}
                        className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500"
                      >
                        <option value="none">No Animation</option>
                        <option value="fade-in">Fade In</option>
                        <option value="slide-up">Slide Up Entrance</option>
                        <option value="scale-up">Gentle Scale Up</option>
                      </select>
                    </div>

                  </div>

                </div>
              );
            })()
          )}
        </div>

      </div>

    </div>
  );
}

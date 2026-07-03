/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useShop } from "../contexts/ShopContext";
import { Page, Section, SectionStyle, MediaItem } from "../types";
import { uploadImageToStorage } from "../lib/firebaseService";
import { 
  Plus, 
  Trash2, 
  Copy, 
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
  Grid,
  FileText,
  BadgeAlert,
  HelpCircle,
  FolderOpen
} from "lucide-react";

export default function AdminPages() {
  const { db, updatePages, updateMedia } = useShop();
  const [notif, setNotif] = useState("");

  // Selected Page
  const [selectedPageId, setSelectedPageId] = useState<string>("page-home");
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  // Active section editing
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Local Page settings state to prevent Firestore write spam
  const [localPageTitle, setLocalPageTitle] = useState("");
  const [localPageSlug, setLocalPageSlug] = useState("");
  const [localPageSeoTitle, setLocalPageSeoTitle] = useState("");
  const [localPageSeoDescription, setLocalPageSeoDescription] = useState("");
  const [localPageBanner, setLocalPageBanner] = useState("");
  const [localPagePublished, setLocalPagePublished] = useState(true);

  // Local Section Customizer state to prevent Firestore write spam
  const [localTitle, setLocalTitle] = useState("");
  const [localSubtitle, setLocalSubtitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  const [localButtonText, setLocalButtonText] = useState("");
  const [localButtonLink, setLocalButtonLink] = useState("");
  const [localMediaUrl, setLocalMediaUrl] = useState("");
  const [localCustomHtml, setLocalCustomHtml] = useState("");
  const [localBgColor, setLocalBgColor] = useState("#050505");
  const [localTextColor, setLocalTextColor] = useState("#ffffff");
  const [localPaddingTop, setLocalPaddingTop] = useState("py-16");
  const [localAlignment, setLocalAlignment] = useState<"left" | "center" | "right">("center");
  const [localDesktopLayout, setLocalDesktopLayout] = useState("grid-cols-3");
  const [localTabletLayout, setLocalTabletLayout] = useState("grid-cols-2");
  const [localMobileLayout, setLocalMobileLayout] = useState("grid-cols-1");
  const [localAnimation, setLocalAnimation] = useState("none");

  // Rebuilt Section Image System states
  const [imageSourceMode, setImageSourceMode] = useState<"url" | "library" | "upload">("url");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Global Saving states
  const [isSavingPage, setIsSavingPage] = useState(false);
  const [isSavingSection, setIsSavingSection] = useState(false);

  if (!db) return null;

  const pages = db.pages || [];
  const selectedPage = pages.find(p => p.id === selectedPageId) || pages[0];

  // Synchronization of Page Settings local states
  useEffect(() => {
    if (selectedPage) {
      setLocalPageTitle(selectedPage.title || "");
      setLocalPageSlug(selectedPage.slug || "");
      setLocalPageSeoTitle(selectedPage.seoTitle || "");
      setLocalPageSeoDescription(selectedPage.seoDescription || "");
      setLocalPageBanner(selectedPage.pageBanner || "");
      setLocalPagePublished(selectedPage.published ?? true);
    }
  }, [selectedPageId, pages.length]);

  // Synchronization of Section Customizer local states
  useEffect(() => {
    if (editingSectionId && selectedPage) {
      const sec = selectedPage.sections.find(s => s.id === editingSectionId);
      if (sec) {
        setLocalTitle(sec.title || "");
        setLocalSubtitle(sec.subtitle || "");
        setLocalDescription(sec.description || "");
        setLocalButtonText(sec.buttonText || "");
        setLocalButtonLink(sec.buttonLink || "");
        setLocalMediaUrl(sec.mediaUrl || "");
        setLocalCustomHtml(sec.customHtml || "");
        setLocalBgColor(sec.styles?.bgColor || "#050505");
        setLocalTextColor(sec.styles?.textColor || "#ffffff");
        setLocalPaddingTop(sec.styles?.paddingTop || "py-16");
        setLocalAlignment(sec.styles?.alignment || "center");
        setLocalDesktopLayout(sec.styles?.desktopLayout || "grid-cols-3");
        setLocalTabletLayout(sec.styles?.tabletLayout || "grid-cols-2");
        setLocalMobileLayout(sec.styles?.mobileLayout || "grid-cols-1");
        setLocalAnimation(sec.styles?.animation || "none");
        
        // Match source mode to help admin
        if (sec.mediaUrl?.startsWith("https://images.unsplash.com")) {
          setImageSourceMode("library");
        } else {
          setImageSourceMode("url");
        }
      }
    }
  }, [editingSectionId, selectedPageId]);

  // Unsplash Preset Suggestion images
  const imagePresets = [
    { label: "Oversized Fit Model", url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600" },
    { label: "Minimal Street Studio", url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600" },
    { label: "Vintage Storefront", url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600" },
    { label: "Cyberpunk Streetwear Hood", url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600" }
  ];

  // Provision New Webpage (Creates new blank page)
  const handleCreatePage = async (e: React.FormEvent) => {
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

    setNotif("⏳ Provisioning webpage on Firestore...");
    try {
      const updatedPages = [...pages, newPage];
      await updatePages(updatedPages);
      setSelectedPageId(newPage.id);
      setShowNewPageModal(false);
      setNewPageTitle("");
      setNewPageSlug("");
      setNotif("🚀 New webpage created and synced successfully!");
      setTimeout(() => setNotif(""), 3000);
    } catch (err) {
      alert("Failed to provision page: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Commit Page Settings and SEO directly to Firestore
  const handleSavePageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    // Validate duplicate slug if changing it
    if (localPageSlug !== selectedPage.slug) {
      const isDuplicate = pages.some(p => p.id !== selectedPage.id && p.slug === localPageSlug);
      if (isDuplicate) {
        alert("A page with this URL slug already exists. Slugs must be globally unique.");
        return;
      }
    }

    setIsSavingPage(true);
    setNotif("⏳ Saving page settings & metadata to cloud database...");
    try {
      const updatedPages = pages.map(p => {
        if (p.id === selectedPage.id) {
          return {
            ...p,
            title: localPageTitle,
            slug: localPageSlug.toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
            seoTitle: localPageSeoTitle,
            seoDescription: localPageSeoDescription,
            pageBanner: localPageBanner,
            published: localPagePublished
          };
        }
        return p;
      });
      await updatePages(updatedPages);
      setNotif("🎉 Webpage settings synced successfully!");
      setTimeout(() => setNotif(""), 2000);
    } catch (err) {
      alert("Firestore Error: Failed to save page metadata. " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSavingPage(false);
    }
  };

  // Delete Webpage from Database
  const handleDeletePage = async (id: string) => {
    if (id === "page-home") {
      alert("The home page cannot be deleted.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this entire page and all its custom sections?")) return;

    setNotif("⏳ Deleting webpage from Firestore...");
    try {
      const updated = pages.filter(p => p.id !== id);
      await updatePages(updated);
      setSelectedPageId("page-home");
      setNotif("🗑️ Page deleted successfully.");
      setTimeout(() => setNotif(""), 2000);
    } catch (err) {
      alert("Failed to delete page: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Duplicate Webpage from Database
  const handleDuplicatePage = async (pageToDup: Page) => {
    const dup: Page = {
      ...pageToDup,
      id: `page-${Date.now()}`,
      title: `${pageToDup.title} (Copy)`,
      slug: `${pageToDup.slug}-copy-${Date.now().toString().slice(-4)}`,
      sections: pageToDup.sections.map(s => ({ 
        ...s, 
        id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` 
      }))
    };
    
    setNotif("⏳ Duplicating page...");
    try {
      await updatePages([...pages, dup]);
      setSelectedPageId(dup.id);
      setNotif(`✨ Duplicated page: "${dup.title}"`);
      setTimeout(() => setNotif(""), 3000);
    } catch (err) {
      alert("Failed to duplicate page: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // --- SECTION BUILDER ACTIONS ---

  // Add section and sync asynchronously
  const handleAddSection = async (type: string) => {
    if (!selectedPage) return;

    const newSection: Section = {
      id: `sec-${Date.now()}`,
      type,
      enabled: true,
      title: `Fresh ${type.replace("-", " ")} Block`,
      subtitle: "CUSTOM SUBTITLE",
      description: "Style, text layout and media for this component can be configured via the customizer panel.",
      buttonText: "LEARN MORE",
      buttonLink: "/shop",
      mediaUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600",
      mediaLayout: "image-left",
      styles: {
        bgColor: "#050505",
        textColor: "#ffffff",
        paddingTop: "py-16",
        paddingBottom: "py-16",
        alignment: "center",
        desktopLayout: "grid-cols-3",
        tabletLayout: "grid-cols-2",
        mobileLayout: "grid-cols-1",
        animation: "none"
      }
    };

    setNotif("⏳ Adding new section to page...");
    try {
      const updatedSections = [...selectedPage.sections, newSection];
      const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
      await updatePages(updatedPages);
      setEditingSectionId(newSection.id);
      setNotif(`🎉 Section "${newSection.title}" created!`);
      setTimeout(() => setNotif(""), 2000);
    } catch (err) {
      alert("Failed to add section: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Move sections up/down asynchronously
  const handleMoveSection = async (idx: number, direction: "up" | "down") => {
    if (!selectedPage) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= selectedPage.sections.length) return;

    const updatedSections = [...selectedPage.sections];
    const temp = updatedSections[idx];
    updatedSections[idx] = updatedSections[targetIdx];
    updatedSections[targetIdx] = temp;

    try {
      const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
      await updatePages(updatedPages);
      setNotif("⚡ Section reordered and published!");
      setTimeout(() => setNotif(""), 1500);
    } catch (err) {
      alert("Failed to move section: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Delete section asynchronously
  const handleDeleteSection = async (sectionId: string) => {
    if (!selectedPage) return;
    if (!window.confirm("Are you sure you want to delete this section?")) return;

    setNotif("⏳ Removing section...");
    try {
      const updatedSections = selectedPage.sections.filter(s => s.id !== sectionId);
      const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
      await updatePages(updatedPages);
      if (editingSectionId === sectionId) setEditingSectionId(null);
      setNotif("🗑️ Section deleted from webpage.");
      setTimeout(() => setNotif(""), 2000);
    } catch (err) {
      alert("Failed to delete section: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Duplicate section asynchronously
  const handleDuplicateSection = async (section: Section) => {
    if (!selectedPage) return;
    const dup: Section = {
      ...section,
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${section.title || "Section"} (Copy)`
    };

    const idx = selectedPage.sections.findIndex(s => s.id === section.id);
    const updatedSections = [...selectedPage.sections];
    updatedSections.splice(idx + 1, 0, dup);

    setNotif("⏳ Duplicating section...");
    try {
      const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
      await updatePages(updatedPages);
      setEditingSectionId(dup.id);
      setNotif("✨ Section duplicated successfully.");
      setTimeout(() => setNotif(""), 2000);
    } catch (err) {
      alert("Failed to duplicate section: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Toggle active visibility of section asynchronously
  const toggleSectionEnabled = async (sectionId: string) => {
    if (!selectedPage) return;
    
    const updatedSections = selectedPage.sections.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s);
    try {
      const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
      await updatePages(updatedPages);
      setNotif("⚡ Section visibility toggled.");
      setTimeout(() => setNotif(""), 1500);
    } catch (err) {
      alert("Failed to toggle section state: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Save the currently local section customizations to Firestore (Fixes write performance spam!)
  const handleSaveSectionChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage || !editingSectionId) return;

    setIsSavingSection(true);
    setNotif("⏳ Saving section customizations directly to Firestore...");

    try {
      const updatedSections = selectedPage.sections.map(s => {
        if (s.id === editingSectionId) {
          return {
            ...s,
            title: localTitle,
            subtitle: localSubtitle,
            description: localDescription,
            buttonText: localButtonText,
            buttonLink: localButtonLink,
            mediaUrl: localMediaUrl,
            customHtml: localCustomHtml,
            styles: {
              ...(s.styles || {}),
              bgColor: localBgColor,
              textColor: localTextColor,
              paddingTop: localPaddingTop,
              alignment: localAlignment,
              desktopLayout: localDesktopLayout,
              tabletLayout: localTabletLayout,
              mobileLayout: localMobileLayout,
              animation: localAnimation
            }
          };
        }
        return s;
      });

      const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, sections: updatedSections } : p);
      await updatePages(updatedPages);
      setNotif("🎉 Content section saved and published successfully!");
      setTimeout(() => setNotif(""), 2000);
    } catch (err) {
      alert("Firestore Error: Failed to save section changes. " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSavingSection(false);
    }
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
          className="bg-[#C9A063] hover:bg-[#B38E55] text-black font-mono font-bold text-xs px-5 py-3 rounded-sm flex items-center justify-center gap-2 cursor-pointer uppercase shrink-0 transition-colors"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>NEW CUSTOM PAGE</span>
        </button>
      </div>

      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Sparkles className="w-4 h-4 shrink-0 animate-spin text-amber-500" />
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
            <form onSubmit={handleCreatePage} className="flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest text-zinc-500 uppercase">Page Title</label>
                <input
                  type="text"
                  required
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-"));
                  }}
                  placeholder="e.g. Winter Collection"
                  className="bg-black border border-zinc-850 px-3 py-2.5 text-white text-xs rounded-sm focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest text-zinc-500 uppercase">URL Slug Path</label>
                <div className="flex items-center bg-black border border-zinc-850 rounded-sm px-3 py-2.5 text-zinc-400">
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
                className="w-full bg-[#C9A063] text-black font-bold tracking-widest py-3 rounded-sm mt-2 cursor-pointer hover:bg-[#B38E55] transition-colors"
              >
                PROVISION PAGE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT BAR: Pages List & Interactive Page Settings */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Page Selector Panel */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-4 flex flex-col gap-3">
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>ACTIVE CMS PAGE</span>
            </span>
            <select
              value={selectedPageId}
              onChange={(e) => {
                setSelectedPageId(e.target.value);
                setEditingSectionId(null);
              }}
              className="w-full bg-black border border-zinc-850 text-xs px-3 py-3 rounded-sm text-white font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {pages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title.toUpperCase()} {p.slug === "home" ? "(Home)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Page settings & SEO Panel (Fixed with deliberate Save Button!) */}
          {selectedPage && (
            <form onSubmit={handleSavePageSettings} className="bg-zinc-950 border border-zinc-900 rounded-sm p-5 flex flex-col gap-5 text-xs font-mono">
              <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase border-b border-zinc-900 pb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>PAGE CONFIGURATION</span>
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-widest text-zinc-500 uppercase">Page Name / Menu Title</label>
                <input
                  type="text"
                  required
                  value={localPageTitle}
                  onChange={(e) => setLocalPageTitle(e.target.value)}
                  placeholder="Page title..."
                  className="bg-black border border-zinc-850 px-3 py-2 text-white font-mono rounded focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-widest text-zinc-500 uppercase">URL Subpath Slug</label>
                <input
                  type="text"
                  required
                  disabled={selectedPage.slug === "home"}
                  value={localPageSlug}
                  onChange={(e) => setLocalPageSlug(e.target.value)}
                  placeholder="Slug..."
                  className="bg-black border border-zinc-850 px-3 py-2 text-white font-mono rounded focus:outline-none focus:border-amber-500 disabled:opacity-40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-widest text-zinc-500 uppercase">SEO Browser Title</label>
                <input
                  type="text"
                  value={localPageSeoTitle}
                  onChange={(e) => setLocalPageSeoTitle(e.target.value)}
                  placeholder="Meta title tag..."
                  className="bg-black border border-zinc-850 px-3 py-2 text-white font-mono rounded focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-widest text-zinc-500 uppercase">SEO Page Meta Description</label>
                <textarea
                  value={localPageSeoDescription}
                  onChange={(e) => setLocalPageSeoDescription(e.target.value)}
                  placeholder="Search engine blurb description..."
                  rows={3}
                  className="bg-black border border-zinc-850 px-3 py-2 text-white font-mono rounded focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-widest text-zinc-500 uppercase">Header Background Banner Image</label>
                <input
                  type="text"
                  value={localPageBanner}
                  onChange={(e) => setLocalPageBanner(e.target.value)}
                  placeholder="Header banner URL..."
                  className="bg-black border border-zinc-850 px-3 py-2 text-white font-mono rounded focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                <span className="text-zinc-500 font-mono text-[9px]">WEBPAGE PUBLISH STATUS</span>
                <button
                  type="button"
                  onClick={() => setLocalPagePublished(!localPagePublished)}
                  className={`px-3 py-1 font-mono text-[9px] font-bold rounded uppercase border transition-all ${
                    localPagePublished 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
                >
                  {localPagePublished ? "PUBLISHED" : "DRAFT"}
                </button>
              </div>

              {/* SAVE PAGE BUTTON WITH STATES */}
              <button
                type="submit"
                disabled={isSavingPage}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-bold py-2.5 rounded font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-black" />
                <span>{isSavingPage ? "SAVING..." : "SAVE PAGE SETTINGS"}</span>
              </button>

              <div className="flex flex-col gap-2 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => handleDuplicatePage(selectedPage)}
                  className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-mono py-2 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> DUPLICATE PAGE
                </button>
                {selectedPage.slug !== "home" && (
                  <button
                    type="button"
                    onClick={() => handleDeletePage(selectedPage.id)}
                    className="w-full bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 font-mono py-2 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> DELETE PAGE
                  </button>
                )}
              </div>
            </form>
          )}

          {/* PAGE OVERVIEW & INTERACTIVE SECTION TREE PANEL */}
          {selectedPage && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-5 flex flex-col gap-4 text-xs font-mono">
              <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase border-b border-zinc-900 pb-2">
                PAGE OVERVIEW
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Page Status:</span>
                  <span className={selectedPage.published ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                    {selectedPage.published ? "● PUBLISHED" : "○ DRAFT"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Sections:</span>
                  <span className="text-white font-bold">{selectedPage.sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Page URL Path:</span>
                  <span className="text-amber-500 font-bold">/pages/{selectedPage.slug}</span>
                </div>
              </div>
              
              <div className="border-t border-zinc-900 pt-3 flex flex-col gap-2">
                <span className="text-[8px] text-zinc-500 uppercase tracking-widest">SECTION TREE STRUCTURE</span>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedPage.sections.map((s, index) => (
                    <div 
                      key={s.id} 
                      onClick={() => setEditingSectionId(s.id)}
                      className={`p-2 border rounded-sm text-[10px] cursor-pointer transition-all flex items-center justify-between ${
                        editingSectionId === s.id 
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-500" 
                          : "bg-black border-zinc-900 hover:border-zinc-850 text-zinc-400"
                      }`}
                    >
                      <span className="truncate max-w-[130px] font-sans font-bold uppercase">{s.title || `Untitled Section`}</span>
                      <span className="text-[8px] bg-zinc-900 border border-zinc-850 px-1 py-0.5 rounded text-zinc-500 uppercase font-mono">{s.type.replace("-", " ")}</span>
                    </div>
                  ))}
                </div>
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
                    } ${!sec.enabled ? "opacity-40" : ""}`}
                  >
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Layout className="w-4 h-4 text-amber-500/80 shrink-0" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-white truncate max-w-[150px]">
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
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleMoveSection(idx, "down")}
                          disabled={idx === selectedPage.sections.length - 1}
                          className="p-1 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 disabled:opacity-25 text-zinc-400 cursor-pointer"
                          title="Move Down"
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

                        {/* Edit Section settings toggle */}
                        <button 
                          onClick={() => setEditingSectionId(isActive ? null : sec.id)}
                          className={`p-1.5 border rounded cursor-pointer ${
                            isActive ? "bg-[#C9A063] border-[#C9A063] text-black" : "border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-amber-500"
                          }`}
                          title="Customize section"
                        >
                          <SettingsIcon className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate Section */}
                        <button 
                          onClick={() => handleDuplicateSection(sec)}
                          className="p-1.5 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-400 cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Section */}
                        <button 
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-1.5 border border-zinc-900 rounded bg-zinc-950 hover:bg-red-950/20 text-red-400 cursor-pointer"
                          title="Delete"
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
                  className="py-2.5 px-3 bg-zinc-900 border border-zinc-800 hover:border-[#C9A063] hover:text-white rounded text-left flex items-center justify-between text-[11px] font-mono tracking-wider cursor-pointer transition-all"
                >
                  <span>{st.label}</span>
                  <Plus className="w-3 h-3 text-amber-500 stroke-[3]" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT: Section Customizer Form (Fixed with localized form state & deliberate Save button!) */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-6 min-h-[500px]">
          <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 flex items-center justify-between">
            <span>SECTION CUSTOMIZER</span>
            {editingSectionId && (
              <button onClick={() => setEditingSectionId(null)} className="text-zinc-500 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer">
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
                <form onSubmit={handleSaveSectionChanges} className="flex flex-col gap-6 text-xs font-mono">
                  
                  {/* General Config */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] text-amber-500 font-bold border-b border-zinc-900 pb-1.5 uppercase">Section Content Values</h3>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase">Section Main Title</label>
                      <input
                        type="text"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase">Section Subtitle / Tagline</label>
                      <input
                        type="text"
                        value={localSubtitle}
                        onChange={(e) => setLocalSubtitle(e.target.value)}
                        className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase">Section Description Text</label>
                      <textarea
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        rows={3}
                        className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 font-sans resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Button Action Label</label>
                        <input
                          type="text"
                          value={localButtonText}
                          onChange={(e) => setLocalButtonText(e.target.value)}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 font-sans"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Button Redirect Path</label>
                        <input
                          type="text"
                          value={localButtonLink}
                          onChange={(e) => setLocalButtonLink(e.target.value)}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* REBUILT SECTION IMAGE SYSTEM */}
                    <div className="flex flex-col gap-2.5 bg-black border border-zinc-900 p-3.5 rounded mt-1">
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Choose Image Source</span>
                      
                      <div className="flex border border-zinc-850 rounded overflow-hidden">
                        {(["url", "library", "upload"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setImageSourceMode(mode)}
                            className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                              imageSourceMode === mode 
                                ? "bg-amber-500 text-black" 
                                : "bg-zinc-950 text-zinc-450 hover:text-white"
                            }`}
                          >
                            {mode === "url" ? "Direct URL" : mode === "library" ? "Saved Media" : "Upload Local"}
                          </button>
                        ))}
                      </div>

                      {imageSourceMode === "url" && (
                        <div className="flex flex-col gap-1">
                          <input
                            type="url"
                            value={localMediaUrl}
                            onChange={(e) => setLocalMediaUrl(e.target.value)}
                            placeholder="https://image-path..."
                            className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 w-full"
                          />
                        </div>
                      )}

                      {imageSourceMode === "library" && (
                        <div className="flex flex-col gap-1.5">
                          <select
                            value={localMediaUrl}
                            onChange={(e) => setLocalMediaUrl(e.target.value)}
                            className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 font-sans cursor-pointer"
                          >
                            <option value="">-- Choose Media File --</option>
                            {(db.media || []).map((m) => (
                              <option key={m.id} value={m.url}>{m.name.slice(0, 30)}</option>
                            ))}
                            {imagePresets.map((p, index) => (
                              <option key={`preset-${index}`} value={p.url}>Street Preset: {p.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {imageSourceMode === "upload" && (
                        <div className="flex flex-col gap-2">
                          <label className="border border-dashed border-zinc-800 hover:border-amber-500/30 bg-zinc-950/60 p-4 rounded text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5">
                            <Plus className="w-5 h-5 text-amber-500" />
                            <span className="text-[9px] font-mono text-zinc-400">CHOOSE IMAGE FILE</span>
                            <span className="text-[8px] text-zinc-600 uppercase">JPG, PNG, WEBP, GIF</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadingImage(true);
                                try {
                                  // Asynchronously upload to Firebase Storage
                                  const downloadUrl = await uploadImageToStorage(file, file.name);
                                  setLocalMediaUrl(downloadUrl);
                                  
                                  // Save meta directly into in-memory list so they have it instantly
                                  const newMedia: MediaItem = {
                                    id: `med-${Date.now()}`,
                                    name: file.name,
                                    url: downloadUrl,
                                    size: `${(file.size / 1024).toFixed(1)} KB`,
                                    type: file.type
                                  };
                                  const updatedMedia = [...(db.media || []), newMedia];
                                  await updateMedia(updatedMedia);
                                  alert("Image saved directly to Firebase Storage and added to Media Library!");
                                } catch (err) {
                                  alert("Failed uploading to Firebase Storage. Fallback to base64 preview: " + (err instanceof Error ? err.message : String(err)));
                                  
                                  // Fallback base64 conversion
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      setLocalMediaUrl(reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                } finally {
                                  setUploadingImage(false);
                                }
                              }}
                            />
                          </label>
                          {uploadingImage && (
                            <div className="flex items-center gap-2 justify-center text-[9px] text-amber-500 animate-pulse">
                              <Sparkles className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading to Cloud Storage...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Live Image Preview (Instant before and after saving!) */}
                      {localMediaUrl && (
                        <div className="mt-1 border border-zinc-900 rounded bg-zinc-950/40 p-2 text-center relative group">
                          <span className="text-[8px] text-zinc-500 block mb-1 font-mono uppercase">Instant Preview (Live)</span>
                          <div className="aspect-[4/3] w-full rounded overflow-hidden border border-zinc-900 bg-black">
                            <img src={localMediaUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setLocalMediaUrl("")}
                            className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black border border-zinc-850 rounded text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {sec.type === "custom-html" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Custom HTML Code Injection</label>
                        <textarea
                          value={localCustomHtml}
                          onChange={(e) => setLocalCustomHtml(e.target.value)}
                          rows={6}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Styling Configuration */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] text-amber-500 font-bold border-b border-zinc-900 pb-1.5 uppercase">Layouts & Typography</h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Background Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={localBgColor}
                            onChange={(e) => setLocalBgColor(e.target.value)}
                            className="bg-black border border-zinc-850 h-8 w-10 p-0.5 rounded cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={localBgColor}
                            onChange={(e) => setLocalBgColor(e.target.value)}
                            className="bg-black border border-zinc-850 px-2 py-1 text-white text-xs rounded focus:outline-none w-full"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Text Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={localTextColor}
                            onChange={(e) => setLocalTextColor(e.target.value)}
                            className="bg-black border border-zinc-850 h-8 w-10 p-0.5 rounded cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={localTextColor}
                            onChange={(e) => setLocalTextColor(e.target.value)}
                            className="bg-black border border-zinc-850 px-2 py-1 text-white text-xs rounded focus:outline-none w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Vertical Padding</label>
                        <select
                          value={localPaddingTop}
                          onChange={(e) => setLocalPaddingTop(e.target.value)}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="py-4">Compact (py-4)</option>
                          <option value="py-8">Medium (py-8)</option>
                          <option value="py-16">Comfortable (py-16)</option>
                          <option value="py-24">Spacious (py-24)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase">Text Alignment</label>
                        <select
                          value={localAlignment}
                          onChange={(e) => setLocalAlignment(e.target.value as any)}
                          className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="left">Left Align</option>
                          <option value="center">Center Align</option>
                          <option value="right">Right Align</option>
                        </select>
                      </div>
                    </div>

                    {/* Responsive Multi-Device Arrangement */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] text-zinc-500 uppercase">Responsive Grids (Device Layouts)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] text-zinc-600">DESKTOP</span>
                          <select
                            value={localDesktopLayout}
                            onChange={(e) => setLocalDesktopLayout(e.target.value)}
                            className="bg-black border border-zinc-850 px-1.5 py-1 text-white rounded text-[10px] focus:outline-none"
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
                            value={localTabletLayout}
                            onChange={(e) => setLocalTabletLayout(e.target.value)}
                            className="bg-black border border-zinc-850 px-1.5 py-1 text-white rounded text-[10px] focus:outline-none"
                          >
                            <option value="grid-cols-1">1 Col</option>
                            <option value="grid-cols-2">2 Cols</option>
                            <option value="grid-cols-3">3 Cols</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] text-zinc-600">MOBILE</span>
                          <select
                            value={localMobileLayout}
                            onChange={(e) => setLocalMobileLayout(e.target.value)}
                            className="bg-black border border-zinc-850 px-1.5 py-1 text-white rounded text-[10px] focus:outline-none"
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
                        value={localAnimation}
                        onChange={(e) => setLocalAnimation(e.target.value)}
                        className="bg-black border border-zinc-850 px-3 py-2 text-white text-xs rounded focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="none">No Entrance Animation</option>
                        <option value="fade-in">Fade In</option>
                        <option value="slide-up">Slide Up Entrance</option>
                        <option value="scale-up">Gentle Scale Up</option>
                      </select>
                    </div>

                  </div>

                  {/* SAVE SECTION BUTTON */}
                  <button
                    type="submit"
                    disabled={isSavingSection}
                    className="w-full bg-[#C9A063] hover:bg-[#B38E55] disabled:opacity-40 text-black font-bold py-3.5 rounded font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer mt-4"
                  >
                    <Save className="w-4 h-4 text-black" />
                    <span>{isSavingSection ? "COMMITING..." : "SAVE SECTION"}</span>
                  </button>

                </form>
              );
            })()
          )}
        </div>

      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { useShop } from "../contexts/ShopContext";
import { Save, Sparkles, Settings, MessageSquare, ShieldAlert, Upload } from "lucide-react";
import { uploadImageToStorage } from "../lib/firebaseService";

export default function AdminSettings() {
  const { db, updateSettings } = useShop();

  const [notif, setNotif] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [siteName, setSiteName] = useState(db?.settings.siteName || "KAIVO");
  const [logoText, setLogoText] = useState(db?.settings.logoText || "KAIVO");
  const [logoType, setLogoType] = useState<"text" | "image">(db?.settings.logoType || "text");
  const [logoImage, setLogoImage] = useState(db?.settings.logoImage || "");
  const [logoHeight, setLogoHeight] = useState<number>(db?.settings.logoHeight || 32);
  const [whatsappNumber, setWhatsappNumber] = useState(db?.settings.whatsappNumber || "+919876543210");
  const [footerText, setFooterText] = useState(db?.settings.footerText || "");
  const [seoDescription, setSeoDescription] = useState(db?.settings.seoDescription || "");

  // Social Links
  const [instagram, setInstagram] = useState(db?.settings.socialLinks.instagram || "");
  const [facebook, setFacebook] = useState(db?.settings.socialLinks.facebook || "");
  const [twitter, setTwitter] = useState(db?.settings.socialLinks.twitter || "");

  const logoInputRef = useRef<HTMLInputElement>(null);

  if (!db) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP, GIF).");
      return;
    }

    setNotif("⏳ Uploading logo to Firebase Storage...");
    try {
      const downloadUrl = await uploadImageToStorage(file, `logo-${Date.now()}-${file.name}`);
      setLogoImage(downloadUrl);
      setNotif("🎉 Logo uploaded successfully!");
      setTimeout(() => setNotif(""), 3000);
    } catch (error) {
      alert("Failed to upload logo: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!siteName.trim() || !whatsappNumber.trim()) {
      alert("Website Name and WhatsApp Gateway Number are required parameters.");
      return;
    }

    setIsSaving(true);
    setNotif("⏳ Committing brand configurations to Firestore...");

    try {
      const updatedSettings = {
        ...db.settings,
        siteName,
        logoText,
        logoType,
        logoImage,
        logoHeight,
        whatsappNumber,
        footerText,
        seoDescription,
        socialLinks: {
          instagram,
          facebook: "",
          twitter: "",
          youtube: ""
        }
      };

      await updateSettings(updatedSettings);
      setNotif("🎉 Global Brand Configurations saved successfully!");
      setTimeout(() => setNotif(""), 3000);
    } catch (err) {
      alert("Failed to save settings: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">GLOBAL CONFIGURATIONS CMS</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            GENERAL SETTINGS
          </h1>
        </div>
      </div>

      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>{notif}</span>
        </div>
      )}

      {/* SETTINGS FORMS */}
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side fields */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Identity */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              <span>BRAND & WEBSITE IDENTITY</span>
            </h2>

            {/* Logo Style Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Logo Style</label>
              <div className="flex rounded overflow-hidden border border-zinc-800 text-xs font-mono max-w-xs">
                {(["text", "image"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLogoType(type)}
                    className={`flex-1 py-2.5 px-4 font-bold uppercase transition-all cursor-pointer text-center ${
                      logoType === type
                        ? "bg-amber-500 text-black animate-pulse-once"
                        : "bg-zinc-950 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {type === "text" ? "Text Logo" : "Image Logo"}
                  </button>
                ))}
              </div>
            </div>

            {logoType === "text" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Website Name</label>
                  <input
                    type="text"
                    required
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono uppercase font-black"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Header Logo Brand Text</label>
                  <input
                    type="text"
                    required
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono uppercase font-black text-amber-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Website Name</label>
                    <input
                      type="text"
                      required
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono uppercase font-black"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Logo Height (px)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="16"
                        max="80"
                        value={logoHeight}
                        onChange={(e) => setLogoHeight(parseInt(e.target.value))}
                        className="flex-grow accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs font-mono text-zinc-300 w-12 text-right">{logoHeight}px</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Logo Image URL</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={logoImage}
                      onChange={(e) => setLogoImage(e.target.value)}
                      placeholder="e.g. https://example.com/logo.png"
                      className="flex-grow bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-sans"
                    />
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="bg-zinc-900 border border-zinc-850 hover:border-amber-500 hover:text-white text-zinc-300 text-xs font-mono font-bold px-5 py-3.5 rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 uppercase"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-500" />
                      <span>UPLOAD LOGO IMAGE</span>
                    </button>
                  </div>
                </div>

                {logoImage && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Header Logo Preview</span>
                    <div className="bg-black border border-zinc-900 rounded-sm p-6 flex items-center justify-center min-h-[100px]">
                      <img
                        src={logoImage}
                        alt="Logo Preview"
                        style={{ height: `${logoHeight}px` }}
                        className="object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Global Search SEO Description</label>
              <textarea
                required
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-sans resize-none"
              />
            </div>
          </div>

          {/* WhatsApp gateway */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>WHATSAPP ORDER GATEWAY</span>
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">WhatsApp Gateway Number (with country code, no spaces)</label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. +919876543210"
                className="bg-black border border-zinc-800 text-xs px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono text-emerald-400 font-bold"
              />
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-sm text-[11px] text-zinc-500 font-sans leading-relaxed">
              ⚠️ <strong>IMPORTANT NUMBER CONVENTIONS:</strong><br />
              Always input numbers with country prefixes (e.g. <strong>+91</strong> for India) and exclude spaces, symbols, or leading zeros. Standard: <strong className="text-emerald-500 font-mono">+919876543210</strong>. This ensures WhatsApp URLs redirect successfully on mobile clicks.
            </div>
          </div>

        </div>

        {/* Right Side Settings */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Footer Text */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300 pb-3 border-b border-zinc-900">
              FOOTER COPYRIGHTS
            </h3>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Copyright Statement</label>
              <textarea
                required
                rows={3}
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="bg-black border border-zinc-800 text-xs px-3 py-2 text-white font-sans resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Social connections */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300 pb-3 border-b border-zinc-900">
              SOCIAL CONNECTS
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Instagram Link</label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Instagram profile link"
                className="bg-black border border-zinc-800 px-3 py-2.5 text-zinc-200 font-mono focus:outline-none focus:border-amber-500 rounded-sm"
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-bold text-xs tracking-widest py-4.5 uppercase transition-all rounded-sm font-mono flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <Save className="w-4.5 h-4.5 text-black" />
            <span>{isSaving ? "SAVING CHANGES..." : "SAVE BRAND SETTINGS"}</span>
          </button>

        </div>

      </form>

    </div>
  );
}

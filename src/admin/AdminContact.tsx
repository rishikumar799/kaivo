/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useShop } from "../contexts/ShopContext";
import { Save, Sparkles, Mail } from "lucide-react";

export default function AdminContact() {
  const { db, updateContact } = useShop();

  const [notif, setNotif] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [subtitle, setSubtitle] = useState(db?.contact.subtitle || "");
  const [title, setTitle] = useState(db?.contact.title || "");
  const [description, setDescription] = useState(db?.contact.description || "");

  // Coordinates
  const [address, setAddress] = useState(db?.contact.address || "");
  const [email, setEmail] = useState(db?.contact.email || "");
  const [phone, setPhone] = useState(db?.contact.phone || "");
  const [workingHours, setWorkingHours] = useState(db?.contact.workingHours || "");

  // Social Links
  const [instagram, setInstagram] = useState(db?.contact.socialLinks.instagram || "");
  const [facebook, setFacebook] = useState(db?.contact.socialLinks.facebook || "");
  const [twitter, setTwitter] = useState(db?.contact.socialLinks.twitter || "");

  if (!db) return null;

  const handleSaveContactPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotif("⏳ Synchronizing contact coordinates with Firestore...");

    try {
      const updatedContact = {
        ...db.contact,
        title,
        subtitle,
        description,
        address,
        email,
        phone,
        workingHours,
        socialLinks: {
          instagram,
          facebook,
          twitter
        }
      };

      await updateContact(updatedContact);
      setNotif("🎉 Contact details and locator positions updated successfully!");
      setTimeout(() => setNotif(""), 3000);
    } catch (err) {
      alert("Failed to save contact specifications: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-1">STREET COORDINATES CMS</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            CONTACT INFO & LOCATOR
          </h1>
        </div>
      </div>

      {notif && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-sm font-mono flex items-center gap-3">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>{notif}</span>
        </div>
      )}

      {/* FIELDS GRID */}
      <form onSubmit={handleSaveContactPage} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side Content */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Header text settings */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-500" />
              <span>PAGE HEADERS</span>
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
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Page Title Tagline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Intro description text</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm resize-none"
              />
            </div>
          </div>

          {/* Core Address / Working values */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-400 border-b border-zinc-900 pb-3 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-500" />
              <span>CORE LOCATION INFO</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Support Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Support Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Physical Address (newlines supported)</label>
                <textarea
                  required
                  rows={4}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-sans resize-none leading-relaxed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Working Hours (newlines supported)</label>
                <textarea
                  required
                  rows={4}
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="bg-black border border-zinc-800 text-xs px-3.5 py-3 text-white focus:outline-none focus:border-amber-500 rounded-sm font-sans resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Side Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Social connections */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-5">
            <h3 className="text-xs font-bold tracking-widest font-mono uppercase text-zinc-300 pb-3 border-b border-zinc-900">
              SOCIAL CHANNELS
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Instagram URL</label>
              <input
                type="url"
                required
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="bg-black border border-zinc-800 text-xs px-3 py-2 text-white font-mono text-zinc-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Facebook URL</label>
              <input
                type="url"
                required
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="bg-black border border-zinc-800 text-xs px-3 py-2 text-white font-mono text-zinc-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Twitter URL</label>
              <input
                type="url"
                required
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="bg-black border border-zinc-800 text-xs px-3 py-2 text-white font-mono text-zinc-400"
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
            <span>{isSaving ? "SAVING..." : "SAVE COORDINATE METRICS"}</span>
          </button>

        </div>

      </form>

    </div>
  );
}

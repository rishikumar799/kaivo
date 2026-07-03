/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShop } from "../contexts/ShopContext";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Instagram, 
  Facebook, 
  Twitter, 
  ArrowRight,
  Send,
  Navigation,
  CheckCircle2
} from "lucide-react";

export default function Contact() {
  const { db } = useShop();

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  if (!db) return null;

  const { contact } = db;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formName && formEmail && formMessage) {
      setIsSent(true);
      setFormName("");
      setFormEmail("");
      setFormPhone("");
      setFormSubject("");
      setFormMessage("");
      setTimeout(() => setIsSent(false), 5000);
    }
  };

  return (
    <div className="bg-black text-white relative min-h-screen">
      
      {/* 1. TOP HEADER HERO */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-zinc-900 text-center">
        <span className="text-[10px] font-mono tracking-[0.3em] text-[#C9A063] uppercase block mb-3">
          {contact.subtitle}
        </span>
        <h1 className="text-4xl sm:text-6xl font-black tracking-widest uppercase mb-6">
          {contact.title}
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-sans">
          {contact.description}
        </p>
      </section>

      {/* 2. CORE INFORMATION GRID */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* GET IN TOUCH COLUMN */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase block mb-3">GET IN TOUCH</span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-white uppercase mb-4">OUR OFFICE</h2>
              <div className="w-12 h-0.5 bg-[#C9A063]" />
            </div>

            {/* Info items */}
            <div className="flex flex-col gap-8 text-sm">
              <div className="flex gap-4">
                <div className="w-10 h-10 border border-zinc-800 rounded-sm flex items-center justify-center shrink-0 text-[#C9A063]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-zinc-500 font-bold block mb-1 uppercase text-xs tracking-wider">ADDRESS</span>
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                    {contact.address}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 border border-zinc-800 rounded-sm flex items-center justify-center shrink-0 text-[#C9A063]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-zinc-500 font-bold block mb-1 uppercase text-xs tracking-wider">EMAIL</span>
                  <p className="text-zinc-300 leading-relaxed font-sans">
                    {contact.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 border border-zinc-800 rounded-sm flex items-center justify-center shrink-0 text-[#C9A063]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-zinc-500 font-bold block mb-1 uppercase text-xs tracking-wider">PHONE</span>
                  <p className="text-zinc-300 leading-relaxed font-sans">
                    {contact.phone}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 border border-zinc-800 rounded-sm flex items-center justify-center shrink-0 text-[#C9A063]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-zinc-500 font-bold block mb-1 uppercase text-xs tracking-wider">WORKING HOURS</span>
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                    {contact.workingHours}
                  </p>
                </div>
              </div>
            </div>

            {/* Social handles */}
            <div className="border-t border-zinc-900 pt-8">
              <span className="text-zinc-500 font-bold block mb-4 uppercase text-xs tracking-wider">FOLLOW US</span>
              <div className="flex items-center gap-4 text-zinc-400">
                <a href={contact.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 border border-zinc-800 hover:border-[#C9A063] hover:text-[#C9A063] flex items-center justify-center rounded-sm transition-all">
                  <Instagram className="w-4.5 h-4.5" />
                </a>
                <a href={contact.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 border border-zinc-800 hover:border-[#C9A063] hover:text-[#C9A063] flex items-center justify-center rounded-sm transition-all">
                  <Facebook className="w-4.5 h-4.5" />
                </a>
                <a href={contact.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 border border-zinc-800 hover:border-[#C9A063] hover:text-[#C9A063] flex items-center justify-center rounded-sm transition-all">
                  <Twitter className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>
          </div>

          {/* SEND MESSAGE FORM COLUMN */}
          <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 p-8 rounded-sm">
            <div className="mb-8">
              <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase block mb-3">SEND US A MESSAGE</span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-white uppercase mb-4">GET IN TOUCH</h2>
              <div className="w-12 h-0.5 bg-[#C9A063]" />
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    className="bg-black border border-zinc-800 text-xs px-4 py-3 text-white focus:outline-none focus:border-[#C9A063] rounded-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Your Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. rohit@gmail.com"
                    className="bg-black border border-zinc-800 text-xs px-4 py-3 text-white focus:outline-none focus:border-[#C9A063] rounded-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="bg-black border border-zinc-800 text-xs px-4 py-3 text-white focus:outline-none focus:border-[#C9A063] rounded-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Subject</label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Delivery Query"
                    className="bg-black border border-zinc-800 text-xs px-4 py-3 text-white focus:outline-none focus:border-[#C9A063] rounded-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Your Message</label>
                <textarea
                  rows={5}
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="bg-black border border-zinc-800 text-xs px-4 py-3 text-white focus:outline-none focus:border-[#C9A063] rounded-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="bg-[#C9A063] hover:bg-[#B38E55] active:scale-98 text-black font-bold text-xs tracking-widest py-4 uppercase transition-all rounded-sm font-mono flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>SEND MESSAGE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isSent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-[#C9A063]/10 border border-[#C9A063]/30 text-[#C9A063] text-xs rounded-sm flex items-center gap-3 font-mono"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Thank you! Your message has been sent successfully. We will get back to you shortly.</span>
                  </motion.div>
                )}
              </AnimatePresence>

            </form>
          </div>

        </div>
      </section>

      {/* 3. STORE LOCATOR MAP */}
      <section className="bg-zinc-950 border-t border-zinc-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Map Graphic container */}
          <div className="lg:col-span-8 h-80 sm:h-96 w-full rounded-sm overflow-hidden border border-zinc-800 relative bg-neutral-900">
            {/* Dark Styled Map Graphics */}
            <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
              {/* Complex concentric rings mimicking topographic grids or maps */}
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Abstract road lines */}
                <path d="M0,100 L800,200" stroke="gray" strokeWidth="2" />
                <path d="M200,0 L150,400" stroke="gray" strokeWidth="1" />
                <path d="M100,300 C300,350 400,250 800,280" stroke="gray" strokeWidth="2.5" />
                <path d="M500,0 C480,150 550,200 600,400" stroke="gray" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Glowing Coordinate pointer */}
            <div className="absolute left-[45%] top-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
              <div className="relative">
                {/* Ripple waves */}
                <div className="absolute -inset-2 bg-[#C9A063] rounded-full animate-ping opacity-45" />
                <div className="w-5 h-5 bg-[#C9A063] rounded-full border-4 border-black relative z-10" />
              </div>
              <div className="bg-black border border-zinc-800 px-3 py-1.5 rounded-xs text-[10px] font-mono tracking-wider font-bold shadow-2xl">
                Hyderabad
              </div>
            </div>

            {/* Scale watermark */}
            <div className="absolute bottom-4 right-4 text-[9px] font-mono text-zinc-600 tracking-widest">
              GPS REF: 17.4065° N, 78.4772° E
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-4 lg:pl-6 flex flex-col gap-6">
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] text-[#C9A063] uppercase block mb-2">FIND US</span>
              <h2 className="text-2xl font-bold tracking-widest text-white uppercase mb-4">VISIT OUR STORE</h2>
              <div className="w-12 h-0.5 bg-[#C9A063]" />
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Experience KAIVO in person. Visit our store to explore the latest drop collections and feel the weight and quality of our premium fabrics close up.
            </p>
            <a
              href="https://maps.google.com/?q=Hyderabad"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 border border-zinc-800 hover:border-[#C9A063] text-xs font-bold font-mono tracking-widest uppercase px-6 py-3.5 hover:bg-[#C9A063] hover:text-black transition-all rounded-xs text-zinc-300 self-start"
            >
              <Navigation className="w-4 h-4 text-[#C9A063] group-hover:text-black" />
              <span>GET DIRECTIONS</span>
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}

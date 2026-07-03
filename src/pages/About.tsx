/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useShop } from "../contexts/ShopContext";
import { 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Heart, 
  ArrowRight,
  Tv,
  Cpu,
  Scissors,
  CheckCircle2
} from "lucide-react";

export default function About() {
  const { db } = useShop();

  if (!db) return null;

  const { about } = db;

  const philosophyIcons = [
    <ShieldCheck className="w-8 h-8 text-[#C9A063] mb-4" />,
    <Layers className="w-8 h-8 text-[#C9A063] mb-4" />,
    <Sparkles className="w-8 h-8 text-[#C9A063] mb-4" />,
    <Heart className="w-8 h-8 text-[#C9A063] mb-4" />
  ];

  const craftedIcons = [
    <Tv className="w-6 h-6 text-[#C9A063] mb-2" />,
    <Cpu className="w-6 h-6 text-[#C9A063] mb-2" />,
    <Scissors className="w-6 h-6 text-[#C9A063] mb-2" />,
    <CheckCircle2 className="w-6 h-6 text-[#C9A063] mb-2" />
  ];

  return (
    <div className="bg-black text-white relative">
      
      {/* 1. TOP HEADER SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-zinc-900 text-center">
        <span className="text-[10px] font-mono tracking-[0.3em] text-[#C9A063] uppercase block mb-3">
          {about.subtitle}
        </span>
        <h1 className="text-4xl sm:text-6xl font-black tracking-widest uppercase mb-6">
          {about.title}
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-sans">
          KAIVO is more than just a clothing brand. It's a mindset. We create premium oversized T-Shirts that speak minimalism, comfort, and confidence. Every piece is designed to make you feel your best, every day.
        </p>
      </section>

      {/* 2. OUR STORY SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Manifesto text column */}
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase block mb-3">OUR STORY</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-widest text-white uppercase mb-6 leading-tight">
              {about.storyTitle}
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A063] mb-8" />
            
            {/* Display paragraphs split by double newline */}
            <div className="flex flex-col gap-6 text-zinc-400 text-sm leading-relaxed font-sans max-w-xl">
              {about.story.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

          {/* Model collage column on the right */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-sm overflow-hidden aspect-[4/5] border border-zinc-900 bg-zinc-950">
              <img
                src={about.storyImage}
                alt="KAIVO back logo model tee"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="rounded-sm overflow-hidden aspect-[4/5] border border-zinc-900 bg-zinc-950 translate-y-6">
              <img
                src={about.midSectionImage}
                alt="KAIVO white minimal model tee"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 3. PHILOSOPHY GRID SECTION */}
      <section className="py-20 bg-neutral-950/40 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {about.features.map((feat, idx) => (
              <div 
                key={idx}
                className="bg-black border border-zinc-900 p-8 rounded-sm hover:border-amber-500/30 transition-all text-center md:text-left"
              >
                {philosophyIcons[idx] || <ShieldCheck className="w-8 h-8 text-[#C9A063] mb-4" />}
                <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-3">
                  {feat.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CRAFTED TO LAST - TECHNICAL SPECS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase block mb-2">CRAFTED TO LAST</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-widest text-white uppercase">
            {about.craftedToLast.title}
          </h2>
          <p className="text-zinc-500 text-xs font-sans max-w-md mx-auto mt-3">
            {about.craftedToLast.description}
          </p>
          <div className="w-16 h-0.5 bg-[#C9A063] mx-auto mt-4" />
        </div>

        {/* Technical specs row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {about.craftedToLast.items.map((item, idx) => (
            <div 
              key={idx}
              className="bg-zinc-950 border border-zinc-900 p-6 rounded-sm text-center flex flex-col items-center justify-center hover:border-[#C9A063]/20 transition-all"
            >
              <div className="w-12 h-12 rounded-full border border-zinc-800 bg-black flex items-center justify-center mb-4">
                {craftedIcons[idx] || <Tv className="w-6 h-6 text-[#C9A063]" />}
              </div>
              <span className="text-sm font-bold text-white block uppercase tracking-widest mb-1">
                {item.label}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. JOIN THE MOVEMENT HERO BANNER SECTION */}
      <section className="relative h-[400px] w-full overflow-hidden border-t border-zinc-900 bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black z-10" />
        <img
          src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200"
          alt="KAIVO clothing collection background"
          className="absolute inset-0 w-full h-full object-cover object-center filter grayscale contrast-125"
          referrerPolicy="no-referrer"
        />

        {/* Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-widest text-white uppercase mb-4 leading-tight">
            JOIN THE MOVEMENT. <br className="sm:hidden" />
            <span className="text-[#C9A063]">WEAR CONFIDENCE.</span>
          </h2>
          <div className="w-12 h-0.5 bg-[#C9A063] mb-8" />
          <Link
            to="/shop"
            className="bg-[#C9A063] hover:bg-[#B38E55] active:scale-95 text-black font-bold text-xs tracking-widest px-8 py-4 uppercase rounded-sm transition-all flex items-center gap-2 font-mono shadow-xl"
          >
            <span>SHOP NOW</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}

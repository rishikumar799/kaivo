/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useParams, Link } from "react-router-dom";
import { useShop } from "../contexts/ShopContext";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Grid, LayoutGrid, Heart } from "lucide-react";

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { db } = useShop();

  if (!db) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#C9A063] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const pages = db.pages || [];
  const page = pages.find(p => p.slug === slug);

  if (!page || !page.published) {
    return (
      <div className="min-h-[70vh] bg-[#050505] text-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <span className="text-[10px] font-mono tracking-[0.3em] text-[#C9A063] uppercase block mb-2">404 OUT OF STOCK</span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-widest uppercase mb-4">
          PAGE NOT FOUND
        </h1>
        <p className="text-sm text-zinc-500 max-w-md leading-relaxed mb-8">
          The page you are looking for does not exist or has been unpublished by the administrator. Discover our active streetwear lineup below.
        </p>
        <Link 
          to="/shop" 
          className="bg-[#C9A063] text-black font-mono font-bold text-xs px-6 py-4 uppercase tracking-widest rounded-xs hover:bg-white transition-all flex items-center gap-2"
        >
          <span>BROWSE RELEASES</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // --- RENDERING VARIOUS DYNAMIC SECTION TYPES ---
  const renderSection = (sec: any) => {
    if (!sec.enabled) return null;

    const alignClass = sec.styles?.alignment === "left" ? "text-left items-start" : sec.styles?.alignment === "right" ? "text-right items-end" : "text-center items-center";
    const bg = sec.styles?.bgColor || "#050505";
    const tc = sec.styles?.textColor || "#ffffff";
    const py = sec.styles?.paddingTop || "py-16";

    // CSS variables to inject custom colors safely on section containers
    const customStyle = {
      backgroundColor: bg,
      color: tc
    };

    switch (sec.type) {
      case "hero-banner":
        return (
          <section 
            key={sec.id} 
            style={customStyle}
            className={`${py} relative overflow-hidden min-h-[50vh] flex items-center justify-center`}
          >
            {sec.mediaUrl && (
              <div className="absolute inset-0 bg-black/60 z-0">
                <img 
                  src={sec.mediaUrl} 
                  alt="" 
                  className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center gap-4">
              {sec.subtitle && (
                <span className="text-[11px] font-mono tracking-[0.3em] text-[#C9A063] uppercase">
                  {sec.subtitle}
                </span>
              )}
              {sec.title && (
                <h2 className="text-4xl sm:text-6xl font-black tracking-widest uppercase text-white leading-tight">
                  {sec.title}
                </h2>
              )}
              {sec.description && (
                <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                  {sec.description}
                </p>
              )}
              {sec.buttonText && sec.buttonLink && (
                <Link 
                  to={sec.buttonLink} 
                  className="mt-4 bg-[#C9A063] text-black hover:bg-white font-mono font-bold text-xs px-6 py-3.5 uppercase tracking-widest transition-all rounded-xs"
                >
                  {sec.buttonText}
                </Link>
              )}
            </div>
          </section>
        );

      case "image-text":
      case "text-image":
        const isImageLeft = sec.type === "image-text";
        return (
          <section key={sec.id} style={customStyle} className={`${py} px-6`}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className={isImageLeft ? "md:order-1" : "md:order-2"}>
                {sec.mediaUrl && (
                  <div className="aspect-[4/3] overflow-hidden bg-zinc-950 border border-zinc-900 rounded-sm">
                    <img 
                      src={sec.mediaUrl} 
                      alt={sec.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
              <div className={`flex flex-col gap-4 ${isImageLeft ? "md:order-2" : "md:order-1"}`}>
                {sec.subtitle && (
                  <span className="text-[10px] font-mono tracking-[0.2em] text-[#C9A063] uppercase">
                    {sec.subtitle}
                  </span>
                )}
                {sec.title && (
                  <h3 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
                    {sec.title}
                  </h3>
                )}
                {sec.description && (
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                    {sec.description}
                  </p>
                )}
                {sec.buttonText && sec.buttonLink && (
                  <Link 
                    to={sec.buttonLink} 
                    className="mt-2 text-[#C9A063] hover:text-white text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1.5"
                  >
                    <span>{sec.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </section>
        );

      case "text-only":
        return (
          <section key={sec.id} style={customStyle} className={`${py} px-6`}>
            <div className={`max-w-4xl mx-auto flex flex-col gap-4 ${alignClass}`}>
              {sec.subtitle && (
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A063] uppercase">
                  {sec.subtitle}
                </span>
              )}
              {sec.title && (
                <h3 className="text-2xl sm:text-4xl font-black tracking-widest uppercase">
                  {sec.title}
                </h3>
              )}
              {sec.description && (
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl whitespace-pre-line">
                  {sec.description}
                </p>
              )}
              {sec.buttonText && sec.buttonLink && (
                <Link 
                  to={sec.buttonLink} 
                  className="mt-4 bg-[#C9A063] hover:bg-white text-black font-mono font-bold text-xs px-5 py-3.5 uppercase tracking-widest rounded-xs"
                >
                  {sec.buttonText}
                </Link>
              )}
            </div>
          </section>
        );

      case "features-grid":
        return (
          <section key={sec.id} style={customStyle} className={`${py} px-6`}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center flex flex-col items-center gap-2 mb-12">
                {sec.subtitle && <span className="text-[10px] font-mono text-[#C9A063] tracking-[0.25em] uppercase">{sec.subtitle}</span>}
                {sec.title && <h3 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">{sec.title}</h3>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(sec.items || [
                  { title: "240 GSM FABRIC", desc: "Super heavyweight bio-washed cotton built to hold boxy oversized frames perfectly." },
                  { title: "REINFORCED CUFFS", desc: "Double-needle stitching wraps collars and shoulders preventing stretching over time." },
                  { title: "SUSTAINABLE INK", desc: "Zero-bleed premium waterbased silkscreen printing process ensuring graphical longevity." }
                ]).map((item: any, i: number) => (
                  <div key={i} className="bg-black/40 border border-zinc-900 rounded-sm p-6 flex flex-col gap-3">
                    <span className="text-xs font-mono font-bold text-[#C9A063]">0{i + 1}.</span>
                    <h4 className="text-sm font-bold tracking-widest uppercase text-white">{item.title}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "category-grid":
        return (
          <section key={sec.id} style={customStyle} className={`${py} px-6`}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center flex flex-col items-center gap-2 mb-12">
                {sec.subtitle && <span className="text-[10px] font-mono text-[#C9A063] tracking-[0.25em] uppercase">{sec.subtitle}</span>}
                {sec.title && <h3 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">{sec.title}</h3>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {db.categories.map((cat) => (
                  <Link 
                    key={cat.id} 
                    to={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className="group flex flex-col gap-3 relative"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-zinc-950 border border-zinc-900 rounded-sm relative">
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 mix-blend-luminosity hover:mix-blend-normal"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-all"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-white text-xs font-bold tracking-widest uppercase block">{cat.name}</span>
                        <span className="text-[9px] font-mono text-[#C9A063] uppercase tracking-wider block mt-1">EXPLORE COLLECTION</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );

      case "product-grid":
        return (
          <section key={sec.id} style={customStyle} className={`${py} px-6`}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center flex flex-col items-center gap-2 mb-12">
                {sec.subtitle && <span className="text-[10px] font-mono text-[#C9A063] tracking-[0.25em] uppercase">{sec.subtitle}</span>}
                {sec.title && <h3 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">{sec.title}</h3>}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {db.products.slice(0, 4).map((p) => (
                  <Link key={p.id} to={`/product/${p.slug}`} className="group flex flex-col gap-3.5">
                    <div className="aspect-[3/4] overflow-hidden bg-zinc-950 border border-zinc-900 rounded-sm relative">
                      <img 
                        src={p.images[0]} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {p.isNew && (
                        <span className="absolute top-3 left-3 bg-[#C9A063] text-black text-[9px] font-mono font-bold px-2 py-0.5 tracking-wider uppercase">
                          NEW ARRIVAL
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs font-mono">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-white font-bold tracking-wider uppercase block truncate max-w-[70%]">{p.name}</span>
                        <span className="text-zinc-400 font-bold font-sans">₹{p.price}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">{p.category}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );

      case "testimonials":
        return (
          <section key={sec.id} style={customStyle} className={`${py} px-6`}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center flex flex-col items-center gap-2 mb-12">
                {sec.subtitle && <span className="text-[10px] font-mono text-[#C9A063] tracking-[0.25em] uppercase">{sec.subtitle}</span>}
                {sec.title && <h3 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">{sec.title}</h3>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {db.testimonials.slice(0, 3).map((item, idx) => (
                  <div key={item.id} className="bg-zinc-950 border border-zinc-900 rounded-sm p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-[#C9A063]">
                      {[...Array(5)].map((_, i) => (
                        <Heart key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed italic">
                      "{item.text}"
                    </p>
                    <div className="flex flex-col pt-3 border-t border-zinc-900">
                      <span className="text-xs font-bold uppercase tracking-widest text-white">{item.name}</span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block mt-0.5">{item.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "faq":
        return (
          <section key={sec.id} style={customStyle} className={`${py} px-6`}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center flex flex-col items-center gap-2 mb-12">
                {sec.subtitle && <span className="text-[10px] font-mono text-[#C9A063] tracking-[0.25em] uppercase">{sec.subtitle}</span>}
                {sec.title && <h3 className="text-2xl sm:text-3xl font-black tracking-widest uppercase">{sec.title}</h3>}
              </div>

              <div className="flex flex-col gap-4">
                {(sec.items || [
                  { q: "What is your shipping duration?", a: "We process order dispatches within 24-48 working hours. Normal domestic shipping deliveries takes 3-7 business days." },
                  { q: "Do you offer returns or size exchanges?", a: "Yes, we accept unwashed/unworn items for returns or size replacements within 7 calendar days of order delivery." },
                  { q: "How should I wash my KAIVO T-shirts?", a: "We strongly advise washing inside-out with cold water on gentle cycles. Air drying prevents shrinkage." }
                ]).map((item: any, i: number) => (
                  <details key={i} className="group bg-zinc-950 border border-zinc-900 rounded-sm p-4 cursor-pointer">
                    <summary className="text-xs font-bold tracking-widest uppercase text-white list-none flex items-center justify-between select-none">
                      <span>{item.q}</span>
                      <span className="text-[#C9A063] font-mono">+</span>
                    </summary>
                    <p className="text-xs text-zinc-500 leading-relaxed mt-3 pt-3 border-t border-zinc-900">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        );

      case "newsletter":
        return (
          <section key={sec.id} style={customStyle} className={`${py} px-6 border-y border-zinc-950`}>
            <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-4">
              {sec.subtitle && <span className="text-[10px] font-mono tracking-[0.2em] text-[#C9A063] uppercase">{sec.subtitle}</span>}
              {sec.title && <h3 className="text-2xl sm:text-3xl font-black tracking-widest uppercase text-white">{sec.title}</h3>}
              {sec.description && <p className="text-xs text-zinc-500 leading-relaxed">{sec.description}</p>}
              
              <div className="w-full flex items-stretch mt-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow bg-[#0c0c0c] border border-zinc-800 text-xs px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A063] rounded-l-xs"
                />
                <button className="bg-[#C9A063] hover:bg-white text-black font-bold text-[10px] tracking-widest px-6 uppercase font-mono rounded-r-xs cursor-pointer">
                  JOIN US
                </button>
              </div>
            </div>
          </section>
        );

      case "custom-html":
        return (
          <section key={sec.id} style={customStyle} className={py}>
            <div className="max-w-7xl mx-auto px-6">
              <div dangerouslySetInnerHTML={{ __html: sec.customHtml || "" }}></div>
            </div>
          </section>
        );

      case "cta":
        return (
          <section key={sec.id} style={customStyle} className={`${py} px-6`}>
            <div className="max-w-5xl mx-auto bg-zinc-950 border border-zinc-900 p-8 sm:p-12 rounded-sm text-center flex flex-col items-center gap-4">
              {sec.subtitle && <span className="text-[10px] font-mono text-[#C9A063] tracking-[0.25em] uppercase">{sec.subtitle}</span>}
              {sec.title && <h3 className="text-xl sm:text-3xl font-black tracking-widest uppercase text-white">{sec.title}</h3>}
              {sec.description && <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-2xl">{sec.description}</p>}
              {sec.buttonText && sec.buttonLink && (
                <Link
                  to={sec.buttonLink}
                  className="mt-4 bg-[#C9A063] text-black font-bold font-mono tracking-widest text-xs px-6 py-3.5 hover:bg-white transition-all rounded-xs"
                >
                  {sec.buttonText}
                </Link>
              )}
            </div>
          </section>
        );

      case "divider":
        return (
          <div key={sec.id} className="max-w-7xl mx-auto py-8 px-6">
            <div className="border-t border-zinc-900"></div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white">
      {/* Banner Header if any */}
      {page.pageBanner && (
        <div className="h-64 sm:h-80 relative overflow-hidden flex items-center justify-center">
          <img 
            src={page.pageBanner} 
            alt={page.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
          <div className="relative z-10 text-center flex flex-col items-center gap-2 px-4">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#C9A063] uppercase">COLLECTION LINE</span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-widest uppercase text-white">
              {page.title}
            </h1>
          </div>
        </div>
      )}

      {/* Dynamic Sections Loop */}
      <div className="flex flex-col">
        {page.sections.map(sec => renderSection(sec))}
      </div>
    </div>
  );
}

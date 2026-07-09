/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Database, Product, Category, Banner, OfferBar, Testimonial, AboutContent, ContactContent, Settings, CartItem, Color, MenuItem, Page, MediaItem, GlobalSEO, PopupSettings } from "../types";
import { 
  initializeDatabaseWithFallback,
  saveSettings,
  saveOffers,
  saveAbout,
  saveContact,
  saveMenus,
  saveGlobalSEO,
  savePopup,
  saveBanner,
  removeBanner,
  saveCategory,
  removeCategory,
  saveProduct,
  removeProduct,
  saveTestimonial,
  removeTestimonial,
  savePage,
  removePage,
  saveMediaItem,
  removeMediaItem
} from "../lib/firebaseService";
import { auth } from "../lib/firebase";

interface ShopContextType {
  db: Database | null;
  loading: boolean;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, size: string, color: Color) => void;
  removeFromCart: (productId: string, size: string, colorHex: string) => void;
  updateCartQuantity: (productId: string, size: string, colorHex: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  
  // Admin functions (asynchronous for Firebase integration)
  updateSettings: (settings: Settings) => Promise<void>;
  updateOffers: (offers: OfferBar) => Promise<void>;
  addBanner: (banner: Banner) => Promise<void>;
  updateBanner: (banner: Banner) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addTestimonial: (testimonial: Testimonial) => Promise<void>;
  updateTestimonial: (testimonial: Testimonial) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  updateAbout: (about: AboutContent) => Promise<void>;
  updateContact: (contact: ContactContent) => Promise<void>;
  updateMenus: (menus: MenuItem[]) => Promise<void>;
  updatePages: (pages: Page[]) => Promise<void>;
  updateMedia: (media: MediaItem[]) => Promise<void>;
  updateGlobalSEO: (seo: GlobalSEO) => Promise<void>;
  updatePopup: (popup: PopupSettings) => Promise<void>;
  updateDatabase: (db: Database) => Promise<void>;
  resetDatabase: () => Promise<void>;
  exportData: () => string;
  importData: (jsonData: string) => Promise<boolean>;
  resetData: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Built-in static fallback database for instant rendering and absolute reliability
const fallbackDb: Database = {
  settings: {
    siteName: "KAIVO",
    tagline: "WEAR CONFIDENCE",
    whatsappNumber: "+919876543210",
    logoText: "KAIVO",
    currencySymbol: "₹",
    shippingThreshold: 999,
    shippingFee: 99,
    seoTitle: "KAIVO | Wear Confidence - Premium Streetwear & Oversized Tees",
    seoDescription: "Premium oversized T-Shirts crafted for comfort, style and individuality. Experience the finest fabrics and elegant minimal designs.",
    socialLinks: {
      instagram: "https://www.instagram.com/thekaivo?utm_source=qr&igsh=aGV5YmZhMWx3NWgy",
      facebook: "",
      twitter: "",
      youtube: ""
    },
    footerContent: "© 2026 KAIVO. All Rights Reserved."
  },
  offers: {
    enabled: true,
    text: "FREE SHIPPING ON ALL ORDERS ABOVE ₹999 • DELIVERING ALL OVER INDIA",
    displayType: "marquee",
    marqueeRepeat: "infinite",
    marqueeSpeed: "normal"
  },
  banners: [
    {
      id: "banner-1",
      title: "KAIVO",
      subtitle: "WEAR CONFIDENCE",
      description: "Premium oversized T-Shirts crafted for comfort, style and individuality.",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200",
      ctaText: "SHOP NOW",
      ctaLink: "/shop",
      secondaryCtaText: "EXPLORE COLLECTION",
      secondaryCtaLink: "/oversized",
      enabled: true
    },
    {
      id: "banner-2",
      title: "NEW DROP",
      subtitle: "NEW ARRIVALS",
      description: "Fresh styles. Premium comfort. Made to stand out.",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200",
      ctaText: "EXPLORE COLLECTION",
      ctaLink: "/new-arrivals",
      enabled: true
    }
  ],
  categories: [
    {
      id: "cat-oversized",
      slug: "oversized",
      name: "Oversized Tees",
      description: "Relaxed fit. Premium fabric. Made for everyday confidence.",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600"
    },
    {
      id: "cat-minimal",
      slug: "minimal",
      name: "Minimal Tees",
      description: "Clean, simple and premium logo T-shirts.",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600"
    },
    {
      id: "cat-graphic",
      slug: "graphic",
      name: "Graphic Tees",
      description: "Bold graphics and embroidered statement pieces.",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600"
    },
    {
      id: "cat-embroidered",
      slug: "embroidered",
      name: "Embroidered Tees",
      description: "Long lasting and intricate custom embroidery.",
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600"
    }
  ],
  products: [
    {
      id: "p-1",
      name: "KAIVO Signature Black Tee",
      slug: "kaivo-signature-black-tee",
      description: "Premium heavyweight 240 GSM oversized tee featuring a clean premium logo print. Detailed stitching with ribbed crew neck. Made of 100% combed cotton, bio-washed for extreme comfort and longevity.",
      price: 999,
      discount: 20,
      category: "oversized",
      featured: true,
      newArrival: true,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Black", hex: "#000000" },
        { name: "White", hex: "#FFFFFF" }
      ],
      images: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600",
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600"
      ],
      stock: 100
    },
    {
      id: "p-2",
      name: "KAIVO White Minimal Tee",
      slug: "kaivo-white-minimal-tee",
      description: "Clean, simple and premium logo white T-shirt. Extremely breathable 240 GSM organic cotton with an flawless oversized drop-shoulder fit.",
      price: 799,
      discount: 12,
      category: "minimal",
      featured: true,
      newArrival: true,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "White", hex: "#FFFFFF" }
      ],
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600"
      ],
      stock: 150
    },
    {
      id: "p-3",
      name: "KAIVO Wings Graphic Tee",
      slug: "kaivo-wings-graphic-tee",
      description: "Bold graphic back-print featuring our signature wings illustration. Made from 240 GSM long-staple combed cotton with high-fidelity screen print.",
      price: 1099,
      discount: 10,
      category: "graphic",
      featured: true,
      newArrival: true,
      sizes: ["M", "L", "XL", "XXL"],
      colors: [
        { name: "Black", hex: "#000000" }
      ],
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600"
      ],
      stock: 80
    },
    {
      id: "p-4",
      name: "KAIVO Sand Beige Tee",
      slug: "kaivo-sand-beige-tee",
      description: "A refined aesthetic neutral oversized tee in high-quality 240 GSM bio-washed cotton. Exceptional earth tone finish with extreme comfort.",
      price: 999,
      discount: 10,
      category: "oversized",
      featured: true,
      newArrival: true,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        { name: "Beige", hex: "#d4bfa6" }
      ],
      images: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600"
      ],
      stock: 95
    },
    {
      id: "p-5",
      name: "KAIVO Brown Essential Tee",
      slug: "kaivo-brown-essential-tee",
      description: "Deep rich cocoa brown streetwear tee. Minimal branding on the front chest and premium oversized drop shoulders.",
      price: 949,
      discount: 0,
      category: "oversized",
      featured: true,
      newArrival: true,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Brown", hex: "#5c4033" }
      ],
      images: [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600"
      ],
      stock: 110
    },
    {
      id: "p-6",
      name: "KAIVO Confidence Print Tee",
      slug: "kaivo-confidence-print-tee",
      description: "'Confidence is Silent' screen print back detailing. Made from pre-shrunk, bio-washed premium single-jersey 100% cotton.",
      price: 999,
      discount: 0,
      category: "graphic",
      featured: true,
      newArrival: true,
      sizes: ["M", "L", "XL", "XXL"],
      colors: [
        { name: "White", hex: "#FFFFFF" }
      ],
      images: [
        "https://images.unsplash.com/photo-1616258633660-a1702f33c4c7?q=80&w=600"
      ],
      stock: 70
    },
    {
      id: "p-7",
      name: "KAIVO Crest Black Tee",
      slug: "kaivo-crest-black-tee",
      description: "Embroidered medieval crest logo on the front left chest. A clean, sophisticated streetwear staple built in 240 GSM loopback jersey cotton.",
      price: 899,
      discount: 0,
      category: "minimal",
      featured: true,
      newArrival: false,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        { name: "Black", hex: "#000000" }
      ],
      images: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600"
      ],
      stock: 120
    },
    {
      id: "p-8",
      name: "KAIVO Minimal Grey Tee",
      slug: "kaivo-minimal-grey-tee",
      description: "Perfect heather grey oversized t-shirt. Clean aesthetics and premium comfort fabric. Soft brushed cotton that stays perfect wash after wash.",
      price: 799,
      discount: 10,
      category: "minimal",
      featured: true,
      newArrival: false,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Grey", hex: "#808080" }
      ],
      images: [
        "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=600"
      ],
      stock: 140
    },
    {
      id: "p-9",
      name: "KAIVO Circle Back Tee",
      slug: "kaivo-circle-back-tee",
      description: "Abstract circular geometry front pocket print and giant high-definition back print. Perfect for styling with dark cargo or denim pants.",
      price: 899,
      discount: 15,
      category: "graphic",
      featured: false,
      newArrival: true,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        { name: "Black", hex: "#000000" }
      ],
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600"
      ],
      stock: 50
    },
    {
      id: "p-10",
      name: "KAIVO Olive Green Tee",
      slug: "kaivo-olive-green-tee",
      description: "Rich military-inspired dark olive green shade. Subtle high-density branding on neck cuff. Built using combed premium-grade heavy cotton.",
      price: 899,
      discount: 10,
      category: "oversized",
      featured: false,
      newArrival: true,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Olive Green", hex: "#556b2f" }
      ],
      images: [
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600"
      ],
      stock: 65
    },
    {
      id: "p-11",
      name: "KAIVO Embroidered Tee",
      slug: "kaivo-embroidered-tee",
      description: "Symmetrical luxury typography embroidered across the front chest with over 20,000 premium stitches. Stiff ribbed mock neck collars.",
      price: 999,
      discount: 20,
      category: "embroidered",
      featured: true,
      newArrival: false,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        { name: "Black", hex: "#000000" }
      ],
      images: [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600"
      ],
      stock: 45
    },
    {
      id: "p-12",
      name: "KAIVO Abstract Print Tee",
      slug: "kaivo-abstract-print-tee",
      description: "Bold abstract illustration combining gothic typography with surreal artwork. A true limited edition drop item from our premier season.",
      price: 999,
      discount: 15,
      category: "graphic",
      featured: false,
      newArrival: true,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Black", hex: "#000000" }
      ],
      images: [
        "https://images.unsplash.com/photo-1616258633660-a1702f33c4c7?q=80&w=600"
      ],
      stock: 35
    }
  ],
  "testimonials": [
    {
      "id": "test-1",
      "name": "Rohit",
      "location": "Mumbai",
      "rating": 5,
      "text": "The quality is amazing. The fabric is thick and super comfortable!"
    },
    {
      "id": "test-2",
      "name": "Aryan",
      "location": "Delhi",
      "rating": 5,
      "text": "Perfect oversized fit and the embroidery looks premium."
    },
    {
      "id": "test-3",
      "name": "Sameer",
      "location": "Hyderabad",
      "rating": 5,
      "text": "KAIVO is my go-to brand now. Keep up the great work!"
    }
  ],
  "instagram": [
    { "id": "ig-1", "image": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=400", "link": "https://instagram.com/kaivo_official" },
    { "id": "ig-2", "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400", "link": "https://instagram.com/kaivo_official" },
    { "id": "ig-3", "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=400", "link": "https://instagram.com/kaivo_official" },
    { "id": "ig-4", "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400", "link": "https://instagram.com/kaivo_official" },
    { "id": "ig-5", "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400", "link": "https://instagram.com/kaivo_official" },
    { "id": "ig-6", "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400", "link": "https://instagram.com/kaivo_official" }
  ],
  "about": {
    "title": "WEAR CONFIDENCE",
    "subtitle": "ABOUT KAIVO",
    "storyTitle": "BUILT ON SIMPLICITY. DRIVEN BY PURPOSE.",
    "story": "KAIVO is more than just a clothing brand. It's a mindset. We create premium oversized T-Shirts that speak minimalism, comfort, and confidence. Every piece is designed to make you feel your best, every day.\n\nKAIVO was born from the idea that style doesn't have to be loud to stand out. We started with a simple goal - to create oversized tees that feel good, look timeless, and make you feel confident in your own skin. Every piece is designed with attention to detail, crafted from premium fabrics, and made to be your everyday essential.",
    "storyImage": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800",
    "midSectionImage": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800",
    "features": [
      {
        "title": "PREMIUM QUALITY",
        "description": "We use high-grade fabrics that are soft, durable, and made to last."
      },
      {
        "title": "OVERSIZED FIT",
        "description": "Designed for comfort and freedom. Our fit is relaxed, modern, and effortless."
      },
      {
        "title": "MINIMAL DESIGN",
        "description": "Clean aesthetics, subtle branding, and timeless pieces that never go out of style."
      },
      {
        "title": "MADE WITH PURPOSE",
        "description": "Every collection is a reflection of our belief - wear what makes you feel like your best self."
      }
    ],
    "craftedToLast": {
      "title": "QUALITY YOU CAN FEEL",
      "description": "From the fabric we choose to the way it's stitched, we focus on quality in every step. Because we believe your everyday tee should be anything but ordinary.",
      "items": [
        { "label": "240 GSM", "sub": "Premium Cotton" },
        { "label": "Bio Washed", "sub": "For Softness" },
        { "label": "Reinforced", "sub": "Stitching" },
        { "label": "Quality Checked", "sub": "Every Piece" }
      ]
    }
  },
  "contact": {
    "title": "WE'D LOVE TO HEAR FROM YOU",
    "subtitle": "CONTACT US",
    "description": "Have a question, feedback or just want to say hi? We're here for you. Reach out to us anytime.",
    "address": "KAIVO Clothing\nVuyyuru, Vijayawada\nAndhra Pradesh - 521165",
    "email": "thekaivoofficial@gmail.com",
    "phone": "+91 82896 16300",
    "workingHours": "Monday - Saturday\n10:00 AM - 7:00 PM\nSunday - Closed",
    "socialLinks": {
      "instagram": "https://www.instagram.com/thekaivo?utm_source=qr&igsh=aGV5YmZhMWx3NWgy",
      "facebook": "",
      "twitter": ""
    }
  },
  "menus": [
    { "id": "menu-1", "name": "HOME", "path": "/", "type": "normal", "enabled": true, "order": 0 },
    { "id": "menu-2", "name": "SHOP", "path": "/shop", "type": "normal", "enabled": true, "order": 1 },
    { "id": "menu-3", "name": "NEW ARRIVALS", "path": "/new-arrivals", "type": "normal", "enabled": true, "order": 2 },
    { "id": "menu-4", "name": "OVERSIZED COLLECTION", "path": "/oversized", "type": "normal", "enabled": true, "order": 3 },
    { "id": "menu-5", "name": "ABOUT US", "path": "/about", "type": "normal", "enabled": true, "order": 4 },
    { "id": "menu-6", "name": "CONTACT", "path": "/contact", "type": "normal", "enabled": true, "order": 5 }
  ],
  "pages": [
    {
      "id": "page-home",
      "title": "Home",
      "slug": "home",
      "published": true,
      "sections": [
        {
          "id": "sec-hero",
          "type": "hero-banner",
          "enabled": true,
          "title": "KAIVO",
          "subtitle": "WEAR CONFIDENCE",
          "description": "Premium oversized T-Shirts crafted for comfort, style and individuality.",
          "mediaUrl": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200",
          "buttonText": "SHOP NOW",
          "buttonLink": "/shop",
          "styles": {
            "bgColor": "#000000",
            "textColor": "#ffffff",
            "paddingTop": "py-24",
            "paddingBottom": "py-24",
            "alignment": "center"
          }
        }
      ]
    },
    {
      "id": "page-privacy-policy",
      "title": "Privacy Policy",
      "slug": "privacy-policy",
      "published": true,
      "sections": [
        {
          "id": "sec-pp-text",
          "type": "text-only",
          "enabled": true,
          "title": "PRIVACY POLICY",
          "subtitle": "LEGAL INFORMATION",
          "description": "At KAIVO, we respect your privacy and are committed to protecting your personal data.\n\n1. INFORMATION WE COLLECT\nWe collect information when you register on our site, place an order, or subscribe to our newsletter. This includes your name, email address, mailing address, phone number, and payment details.\n\n2. HOW WE USE YOUR INFORMATION\nWe use the information we collect to process transactions, send periodic emails about your order status, and improve our customer service.\n\n3. SECURE PAYMENTS\nWe use secure encryption protocols to protect sensitive financial details. Your card information is processed directly by authorized payment gateways and is never stored on our servers.\n\n4. COOKIES\nWe use cookies to help remember and process the items in your shopping cart and understand your preferences for future visits.",
          "styles": {
            "bgColor": "#050505",
            "textColor": "#ffffff",
            "paddingTop": "py-16",
            "paddingBottom": "py-16",
            "alignment": "left"
          }
        }
      ]
    },
    {
      "id": "page-terms-of-service",
      "title": "Terms of Service",
      "slug": "terms-of-service",
      "published": true,
      "sections": [
        {
          "id": "sec-tos-text",
          "type": "text-only",
          "enabled": true,
          "title": "TERMS OF SERVICE",
          "subtitle": "TERMS & CONDITIONS",
          "description": "Welcome to KAIVO. By accessing our website, you agree to comply with and be bound by the following terms of service.\n\n1. TERMS OF PURCHASE\nBy placing an order on our store, you confirm that you are of legal age and that the billing information provided is complete and accurate.\n\n2. PRICING & PRODUCTS\nAll prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. We reserve the right to change prices or discontinue products at any time without prior notice.\n\n3. SHIPPING & ORDERS\nOrders are shipped to the address specified during checkout. Standard shipping takes 3-7 business days across India. Free shipping is provided for all orders above ₹999.\n\n4. INTELLECTUAL PROPERTY\nAll visual design assets, clothing designs, trademarks, logos, and graphics displayed on this website are the intellectual property of KAIVO.",
          "styles": {
            "bgColor": "#050505",
            "textColor": "#ffffff",
            "paddingTop": "py-16",
            "paddingBottom": "py-16",
            "alignment": "left"
          }
        }
      ]
    },
    {
      "id": "page-shipping-policy",
      "title": "Shipping Policy",
      "slug": "shipping-policy",
      "published": true,
      "sections": [
        {
          "id": "sec-shp-text",
          "type": "text-only",
          "enabled": true,
          "title": "SHIPPING POLICY",
          "subtitle": "DELIVERY & DISPATCH",
          "description": "KAIVO delivers confidence all over India with express, reliable courier services.\n\n1. SHIPPING CHARGES\n- We offer FREE SHIPPING on all orders above ₹999.\n- A nominal shipping fee of ₹99 is charged for orders below ₹999.\n\n2. ESTIMATED DELIVERY TIMES\n- Metro cities: 2 to 4 business days.\n- Rest of India: 4 to 7 business days.\n- Dispatch takes place within 24-48 hours of placing your order.\n\n3. TRACKING YOUR ORDER\nOnce dispatched, you will receive a tracking link via email and WhatsApp. You can follow your package live from our dispatch center directly to your doorstep.",
          "styles": {
            "bgColor": "#050505",
            "textColor": "#ffffff",
            "paddingTop": "py-16",
            "paddingBottom": "py-16",
            "alignment": "left"
          }
        }
      ]
    },
    {
      "id": "page-return-policy",
      "title": "Return Policy",
      "slug": "return-policy",
      "published": true,
      "sections": [
        {
          "id": "sec-ret-text",
          "type": "text-only",
          "enabled": true,
          "title": "RETURN POLICY",
          "subtitle": "RETURNS & EXCHANGES",
          "description": "At KAIVO Clothing, we maintain an exclusive drop model with highly limited streetwear quantities. Because of this high-demand, low-volume release strategy, we operate on a strict NO RETURN and NO EXCHANGE policy on all of our items.\n\n1. ALL SALES ARE FINAL\nOnce an order is successfully placed, processed, or dispatched, it cannot be returned, cancelled, or exchanged for other items, different graphics, or different sizes. We encourage you to carefully consult our Size Guide before completing your checkout.\n\n2. QUALITY ASSURED\nEvery single KAIVO garment undergoes meticulous multi-point quality control checks prior to packaging and dispatch. We guarantee that only flawless, premium-grade heavyweight clothing is delivered to our customer family.\n\n3. DEFECT OR DISCREPANCY EXCEPTIONS\nIn the highly unlikely event that you receive an incorrect product or a genuine manufacturing defect, please contact our support team on WhatsApp or Email within 24 hours of package delivery. Please ensure you provide a continuous, uncut package unboxing video as validation of the issue so we can assist you immediately.",
          "styles": {
            "bgColor": "#050505",
            "textColor": "#ffffff",
            "paddingTop": "py-16",
            "paddingBottom": "py-16",
            "alignment": "left"
          }
        }
      ]
    },
    {
      "id": "page-size-guide",
      "title": "Size Guide",
      "slug": "size-guide",
      "published": true,
      "sections": [
        {
          "id": "sec-sg-text",
          "type": "text-only",
          "enabled": true,
          "title": "SIZE GUIDE",
          "subtitle": "FIND YOUR FIT",
          "description": "Our oversized t-shirts are designed for a relaxed, boxy street silhouette. We recommend selecting your true size for the intended oversized look, or sizing down if you prefer a standard fit.\n\nOVERSIZED FIT MEASUREMENTS (IN INCHES)\n\n- SMALL (S):\n  Chest: 44\" | Length: 27\" | Sleeve: 9\"\n\n- MEDIUM (M):\n  Chest: 46\" | Length: 28\" | Sleeve: 9.5\"\n\n- LARGE (L):\n  Chest: 48\" | Length: 29\" | Sleeve: 10\"\n\n- X-LARGE (XL):\n  Chest: 50\" | Length: 30\" | Sleeve: 10.5\"\n\n- XX-LARGE (XXL):\n  Chest: 52\" | Length: 31\" | Sleeve: 11\"",
          "styles": {
            "bgColor": "#050505",
            "textColor": "#ffffff",
            "paddingTop": "py-16",
            "paddingBottom": "py-16",
            "alignment": "left"
          }
        }
      ]
    },
    {
      "id": "page-faqs",
      "title": "FAQs",
      "slug": "faqs",
      "published": true,
      "sections": [
        {
          "id": "sec-faq-text",
          "type": "text-only",
          "enabled": true,
          "title": "FREQUENTLY ASKED QUESTIONS",
          "subtitle": "GET ANSWERS",
          "description": "Have questions about KAIVO? Here are some of our most frequently asked queries.\n\nQ: What are the shipping rates and free shipping threshold?\nA: We offer free shipping on all orders above ₹999. For orders below this amount, a flat rate of ₹99 is charged.\n\nQ: Do you deliver all over India?\nA: Yes! We deliver to over 26,000 pin codes across India with premium courier partners.\n\nQ: What fabric do you use for your Oversized T-Shirts?\nA: We use premium 240 GSM heavy cotton fabric that has been pre-shrunk and bio-washed for ultimate softness and drape.\n\nQ: Can I change my delivery address after placing the order?\nA: Address modifications can be processed if requested via WhatsApp or Email within 2 hours of placing your order.",
          "styles": {
            "bgColor": "#050505",
            "textColor": "#ffffff",
            "paddingTop": "py-16",
            "paddingBottom": "py-16",
            "alignment": "left"
          }
        }
      ]
    },
    {
      "id": "page-track-order",
      "title": "Track Order",
      "slug": "track-order",
      "published": true,
      "sections": [
        {
          "id": "sec-to-text",
          "type": "text-only",
          "enabled": true,
          "title": "TRACK YOUR ORDER",
          "subtitle": "SHIPMENT STATUS",
          "description": "Easily track your package and stay updated with delivery estimates.\n\n1. CHECK YOUR WHATSAPP OR EMAIL\nUpon dispatch, our automated system sends an email and a WhatsApp notification containing your direct courier tracking number and partner tracking link (such as Delhivery, BlueDart, or Xpressbees).\n\n2. TRACK VIA COURIER PORTAL\nSimply copy the tracking ID (AWB) from your dispatch confirmation and paste it into our partner courier's website to see current status, transit checkpoints, and expected delivery date.\n\n3. NEED ASSISTANCE?\nIf you haven't received your tracking details or experience delays, contact our team via the email or WhatsApp options in the footer. We'll track it down for you instantly.",
          "styles": {
            "bgColor": "#050505",
            "textColor": "#ffffff",
            "paddingTop": "py-16",
            "paddingBottom": "py-16",
            "alignment": "left"
          }
        }
      ]
    }
  ],
  "media": [
    { "id": "m-1", "name": "Black Signature Tee Mockup", "url": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600" },
    { "id": "m-2", "name": "White Minimal Tee Mockup", "url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600" },
    { "id": "m-3", "name": "Wings Graphic Design Closeup", "url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600" },
    { "id": "m-4", "name": "Sand Beige Lifestyle Shot", "url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600" }
  ],
  "seo": {
    "siteTitle": "KAIVO | Wear Confidence",
    "siteDescription": "Premium oversized T-Shirts crafted for comfort, style and individuality.",
    "keywords": "streetwear, oversized, minimal, premium cotton",
    "ogImage": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200",
    "favicon": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=32"
  },
  "popup": {
    "enabled": true,
    "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600",
    "title": "GET 10% OFF YOUR FIRST ORDER",
    "content": "Subscribe to our exclusive drops newsletter and get 10% off your purchase. Wear your confidence today.",
    "buttonText": "JOIN DROPS CLUB",
    "buttonLink": "/shop",
    "delay": 3,
    "frequency": "once"
  }
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load Database and Cart on mount
  useEffect(() => {
    const localDb = localStorage.getItem("kaivo_db");
    const localCart = localStorage.getItem("kaivo_cart");

    if (localCart) {
      try {
        setCart(JSON.parse(localCart));
      } catch (e) {
        console.error("Error parsing cart", e);
      }
    }

    // Instant bootstrap with localStorage cache for responsive feel
    if (localDb) {
      try {
        setDb(JSON.parse(localDb));
        setLoading(false);
      } catch (e) {
        console.error("Error parsing database from localStorage", e);
      }
    }

    // Sync with Firestore in the background
    const syncFirestore = async () => {
      try {
        const initialSeed = localDb ? JSON.parse(localDb) : fallbackDb;
        const firestoreDb = await initializeDatabaseWithFallback(initialSeed);

        // Check if the current user is an authenticated admin
        const isAdmin = auth.currentUser !== null || (typeof window !== 'undefined' && localStorage.getItem("kaivo_admin_auth") === "true");

        // Auto-migrate address if outdated
        if (firestoreDb && firestoreDb.contact && (!firestoreDb.contact.address || !firestoreDb.contact.address.includes("521165") || !firestoreDb.contact.address.includes("Vijayawada"))) {
          firestoreDb.contact.address = "KAIVO Clothing\nVuyyuru, Vijayawada\nAndhra Pradesh - 521165";
          if (isAdmin) {
            try {
              await saveContact(firestoreDb.contact);
            } catch (e) {
              console.warn("Auto-migration: Failed to save updated contact to Firestore:", e);
            }
          }
        }

        // Auto-migrate announcement text if it doesn't contain delivering all over India
        if (firestoreDb && firestoreDb.offers && (!firestoreDb.offers.text || !firestoreDb.offers.text.includes("DELIVERING ALL OVER INDIA"))) {
          firestoreDb.offers.text = "FREE SHIPPING ON ALL ORDERS ABOVE ₹999 • DELIVERING ALL OVER INDIA";
          if (isAdmin) {
            try {
              await saveOffers(firestoreDb.offers);
            } catch (e) {
              console.warn("Auto-migration: Failed to save updated offers to Firestore:", e);
            }
          }
        }

        // Auto-migrate missing default pages if any are absent
        if (firestoreDb) {
          const existingPageSlugs = firestoreDb.pages ? firestoreDb.pages.map((p: any) => p.slug) : [];
          const pagesToAdd = fallbackDb.pages.filter(p => p.slug !== 'home' && !existingPageSlugs.includes(p.slug));
          if (pagesToAdd.length > 0) {
            firestoreDb.pages = [...(firestoreDb.pages || []), ...pagesToAdd];
            if (isAdmin) {
              try {
                await Promise.all(pagesToAdd.map(page => savePage(page)));
              } catch (e) {
                console.warn("Auto-migration: Failed to save missing pages to Firestore:", e);
              }
            }
          }
        }

        setDb(firestoreDb);
        localStorage.setItem("kaivo_db", JSON.stringify(firestoreDb));
      } catch (e) {
        console.warn("Firestore offline/inaccessible, using local backup:", e);
        if (!localDb) {
          setDb(fallbackDb);
          localStorage.setItem("kaivo_db", JSON.stringify(fallbackDb));
        }
      } finally {
        setLoading(false);
      }
    };

    syncFirestore();
  }, []);

  // Helper to save state DB to localStorage
  const saveDb = (updatedDb: Database) => {
    setDb(updatedDb);
    localStorage.setItem("kaivo_db", JSON.stringify(updatedDb));
  };

  // Cart actions
  const addToCart = (product: Product, quantity: number, size: string, color: Color) => {
    const updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedSize === size &&
        item.selectedColor.hex === color.hex
    );

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({
        product,
        quantity,
        selectedSize: size,
        selectedColor: color,
      });
    }

    setCart(updatedCart);
    localStorage.setItem("kaivo_cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId: string, size: string, colorHex: string) => {
    const updatedCart = cart.filter(
      (item) =>
        !(
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor.hex === colorHex
        )
    );
    setCart(updatedCart);
    localStorage.setItem("kaivo_cart", JSON.stringify(updatedCart));
  };

  const updateCartQuantity = (productId: string, size: string, colorHex: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, colorHex);
      return;
    }

    const updatedCart = cart.map((item) => {
      if (
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor.hex === colorHex
      ) {
        return { ...item, quantity };
      }
      return item;
    });

    setCart(updatedCart);
    localStorage.setItem("kaivo_cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("kaivo_cart");
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.discount > 0 
        ? item.product.price * (1 - item.product.discount / 100) 
        : item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Admin Mutations
  const updateSettings = async (settings: Settings) => {
    if (!db) return;
    const updated = { ...db, settings };
    saveDb(updated);
    await saveSettings(settings);
  };

  const updateOffers = async (offers: OfferBar) => {
    if (!db) return;
    const updated = { ...db, offers };
    saveDb(updated);
    await saveOffers(offers);
  };

  const addBanner = async (banner: Banner) => {
    if (!db) return;
    const updated = { ...db, banners: [...db.banners, banner] };
    saveDb(updated);
    await saveBanner(banner);
  };

  const updateBanner = async (banner: Banner) => {
    if (!db) return;
    const updated = {
      ...db,
      banners: db.banners.map((b) => (b.id === banner.id ? banner : b)),
    };
    saveDb(updated);
    await saveBanner(banner);
  };

  const deleteBanner = async (id: string) => {
    if (!db) return;
    const updated = {
      ...db,
      banners: db.banners.filter((b) => b.id !== id),
    };
    saveDb(updated);
    await removeBanner(id);
  };

  const addCategory = async (category: Category) => {
    if (!db) return;
    const updated = { ...db, categories: [...db.categories, category] };
    saveDb(updated);
    await saveCategory(category);
  };

  const updateCategory = async (category: Category) => {
    if (!db) return;
    const updated = {
      ...db,
      categories: db.categories.map((c) => (c.id === category.id ? category : c)),
    };
    saveDb(updated);
    await saveCategory(category);
  };

  const deleteCategory = async (id: string) => {
    if (!db) return;
    const updated = {
      ...db,
      categories: db.categories.filter((c) => c.id !== id),
    };
    saveDb(updated);
    await removeCategory(id);
  };

  const addProduct = async (product: Product) => {
    if (!db) return;
    const updated = { ...db, products: [...db.products, product] };
    saveDb(updated);
    await saveProduct(product);
  };

  const updateProduct = async (product: Product) => {
    if (!db) return;
    const updated = {
      ...db,
      products: db.products.map((p) => (p.id === product.id ? product : p)),
    };
    saveDb(updated);
    await saveProduct(product);
  };

  const deleteProduct = async (id: string) => {
    if (!db) return;
    const updated = {
      ...db,
      products: db.products.filter((p) => p.id !== id),
    };
    saveDb(updated);
    await removeProduct(id);
  };

  const addTestimonial = async (testimonial: Testimonial) => {
    if (!db) return;
    const updated = { ...db, testimonials: [...db.testimonials, testimonial] };
    saveDb(updated);
    await saveTestimonial(testimonial);
  };

  const updateTestimonial = async (testimonial: Testimonial) => {
    if (!db) return;
    const updated = {
      ...db,
      testimonials: db.testimonials.map((t) => (t.id === testimonial.id ? testimonial : t)),
    };
    saveDb(updated);
    await saveTestimonial(testimonial);
  };

  const deleteTestimonial = async (id: string) => {
    if (!db) return;
    const updated = {
      ...db,
      testimonials: db.testimonials.filter((t) => t.id !== id),
    };
    saveDb(updated);
    await removeTestimonial(id);
  };

  const updateAbout = async (about: AboutContent) => {
    if (!db) return;
    const updated = { ...db, about };
    saveDb(updated);
    await saveAbout(about);
  };

  const updateContact = async (contact: ContactContent) => {
    if (!db) return;
    const updated = { ...db, contact };
    saveDb(updated);
    await saveContact(contact);
  };

  const updateMenus = async (menus: MenuItem[]) => {
    if (!db) return;
    const updated = { ...db, menus };
    saveDb(updated);
    await saveMenus(menus);
  };

  const updatePages = async (pages: Page[]) => {
    if (!db) return;
    const updated = { ...db, pages };
    saveDb(updated);
    await Promise.all(pages.map(page => savePage(page)));
  };

  const updateMedia = async (media: MediaItem[]) => {
    if (!db) return;
    const updated = { ...db, media };
    saveDb(updated);
    await Promise.all(media.map(item => saveMediaItem(item)));
  };

  const updateGlobalSEO = async (seo: GlobalSEO) => {
    if (!db) return;
    const updated = { ...db, seo };
    saveDb(updated);
    await saveGlobalSEO(seo);
  };

  const updatePopup = async (popup: PopupSettings) => {
    if (!db) return;
    const updated = { ...db, popup };
    saveDb(updated);
    await savePopup(popup);
  };

  const updateDatabase = async (updatedDb: Database) => {
    saveDb(updatedDb);
    await Promise.all([
      saveSettings(updatedDb.settings),
      saveOffers(updatedDb.offers),
      saveAbout(updatedDb.about),
      saveContact(updatedDb.contact),
      saveMenus(updatedDb.menus),
      updatedDb.seo ? saveGlobalSEO(updatedDb.seo) : Promise.resolve(),
      updatedDb.popup ? savePopup(updatedDb.popup) : Promise.resolve()
    ]);
    await Promise.all([
      ...updatedDb.banners.map(b => saveBanner(b)),
      ...updatedDb.categories.map(c => saveCategory(c)),
      ...updatedDb.products.map(p => saveProduct(p)),
      ...updatedDb.testimonials.map(t => saveTestimonial(t)),
      ...(updatedDb.pages || []).map(page => savePage(page)),
      ...(updatedDb.media || []).map(m => saveMediaItem(m))
    ]);
  };

  const resetDatabase = async () => {
    await resetData();
  };

  const exportData = () => {
    return JSON.stringify(db || fallbackDb, null, 2);
  };

  const importData = async (jsonData: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.settings && parsed.products && parsed.categories) {
        await updateDatabase(parsed);
        return true;
      }
    } catch (e) {
      console.error("Failed to import database JSON", e);
    }
    return false;
  };

  const resetData = async () => {
    localStorage.removeItem("kaivo_db");
    setDb(fallbackDb);
    localStorage.setItem("kaivo_db", JSON.stringify(fallbackDb));
    
    // Reset Firestore too!
    await Promise.all([
      saveSettings(fallbackDb.settings),
      saveOffers(fallbackDb.offers),
      saveAbout(fallbackDb.about),
      saveContact(fallbackDb.contact),
      saveMenus(fallbackDb.menus),
      fallbackDb.seo ? saveGlobalSEO(fallbackDb.seo) : Promise.resolve(),
      fallbackDb.popup ? savePopup(fallbackDb.popup) : Promise.resolve()
    ]);

    await Promise.all([
      ...fallbackDb.banners.map(b => saveBanner(b)),
      ...fallbackDb.categories.map(c => saveCategory(c)),
      ...fallbackDb.products.map(p => saveProduct(p)),
      ...fallbackDb.testimonials.map(t => saveTestimonial(t)),
      ...(fallbackDb.pages || []).map(page => savePage(page)),
      ...(fallbackDb.media || []).map(m => saveMediaItem(m))
    ]);
  };

  return (
    <ShopContext.Provider
      value={{
        db,
        loading,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        updateSettings,
        updateOffers,
        addBanner,
        updateBanner,
        deleteBanner,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        updateAbout,
        updateContact,
        updateMenus,
        updatePages,
        updateMedia,
        updateGlobalSEO,
        updatePopup,
        updateDatabase,
        resetDatabase,
        exportData,
        importData,
        resetData,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}

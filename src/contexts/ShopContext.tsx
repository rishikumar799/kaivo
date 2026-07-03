/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Database, Product, Category, Banner, OfferBar, Testimonial, AboutContent, ContactContent, Settings, CartItem, Color, MenuItem, Page, MediaItem, GlobalSEO } from "../types";

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
  
  // Admin functions
  updateSettings: (settings: Settings) => void;
  updateOffers: (offers: OfferBar) => void;
  addBanner: (banner: Banner) => void;
  updateBanner: (banner: Banner) => void;
  deleteBanner: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addTestimonial: (testimonial: Testimonial) => void;
  updateTestimonial: (testimonial: Testimonial) => void;
  deleteTestimonial: (id: string) => void;
  updateAbout: (about: AboutContent) => void;
  updateContact: (contact: ContactContent) => void;
  updateMenus: (menus: MenuItem[]) => void;
  updatePages: (pages: Page[]) => void;
  updateMedia: (media: MediaItem[]) => void;
  updateGlobalSEO: (seo: GlobalSEO) => void;
  updateDatabase: (db: Database) => void;
  resetDatabase: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  resetData: () => void;
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
      instagram: "https://instagram.com/kaivo_official",
      facebook: "https://facebook.com/kaivoclothing",
      twitter: "https://twitter.com/kaivo",
      youtube: "https://youtube.com/kaivo"
    },
    footerContent: "© 2026 KAIVO. All Rights Reserved."
  },
  offers: {
    enabled: true,
    text: "FREE SHIPPING ON ALL ORDERS ABOVE ₹999"
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
    "address": "KAIVO Clothing Pvt. Ltd.\nHyderabad, Telangana 500081\nIndia",
    "email": "hello@kaivoclothing.com",
    "phone": "+91 98765 43210",
    "workingHours": "Monday - Saturday\n10:00 AM - 7:00 PM\nSunday - Closed",
    "socialLinks": {
      "instagram": "https://instagram.com/kaivo_official",
      "facebook": "https://facebook.com/kaivoclothing",
      "twitter": "https://twitter.com/kaivo"
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

    if (localDb) {
      try {
        setDb(JSON.parse(localDb));
        setLoading(false);
      } catch (e) {
        console.error("Error parsing database from localStorage", e);
        loadDefaultDb();
      }
    } else {
      loadDefaultDb();
    }
  }, []);

  const loadDefaultDb = async () => {
    try {
      const response = await fetch("/data/db.json");
      if (response.ok) {
        const data = await response.json();
        setDb(data);
        localStorage.setItem("kaivo_db", JSON.stringify(data));
      } else {
        throw new Error("Failed to fetch default db.json");
      }
    } catch (e) {
      console.warn("Could not fetch db.json from server, loading fallback static db", e);
      setDb(fallbackDb);
      localStorage.setItem("kaivo_db", JSON.stringify(fallbackDb));
    } finally {
      setLoading(false);
    }
  };

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
  const updateSettings = (settings: Settings) => {
    if (!db) return;
    const updated = { ...db, settings };
    saveDb(updated);
  };

  const updateOffers = (offers: OfferBar) => {
    if (!db) return;
    const updated = { ...db, offers };
    saveDb(updated);
  };

  const addBanner = (banner: Banner) => {
    if (!db) return;
    const updated = { ...db, banners: [...db.banners, banner] };
    saveDb(updated);
  };

  const updateBanner = (banner: Banner) => {
    if (!db) return;
    const updated = {
      ...db,
      banners: db.banners.map((b) => (b.id === banner.id ? banner : b)),
    };
    saveDb(updated);
  };

  const deleteBanner = (id: string) => {
    if (!db) return;
    const updated = {
      ...db,
      banners: db.banners.filter((b) => b.id !== id),
    };
    saveDb(updated);
  };

  const addCategory = (category: Category) => {
    if (!db) return;
    const updated = { ...db, categories: [...db.categories, category] };
    saveDb(updated);
  };

  const updateCategory = (category: Category) => {
    if (!db) return;
    const updated = {
      ...db,
      categories: db.categories.map((c) => (c.id === category.id ? category : c)),
    };
    saveDb(updated);
  };

  const deleteCategory = (id: string) => {
    if (!db) return;
    const updated = {
      ...db,
      categories: db.categories.filter((c) => c.id !== id),
    };
    saveDb(updated);
  };

  const addProduct = (product: Product) => {
    if (!db) return;
    const updated = { ...db, products: [...db.products, product] };
    saveDb(updated);
  };

  const updateProduct = (product: Product) => {
    if (!db) return;
    const updated = {
      ...db,
      products: db.products.map((p) => (p.id === product.id ? product : p)),
    };
    saveDb(updated);
  };

  const deleteProduct = (id: string) => {
    if (!db) return;
    const updated = {
      ...db,
      products: db.products.filter((p) => p.id !== id),
    };
    saveDb(updated);
  };

  const addTestimonial = (testimonial: Testimonial) => {
    if (!db) return;
    const updated = { ...db, testimonials: [...db.testimonials, testimonial] };
    saveDb(updated);
  };

  const updateTestimonial = (testimonial: Testimonial) => {
    if (!db) return;
    const updated = {
      ...db,
      testimonials: db.testimonials.map((t) => (t.id === testimonial.id ? testimonial : t)),
    };
    saveDb(updated);
  };

  const deleteTestimonial = (id: string) => {
    if (!db) return;
    const updated = {
      ...db,
      testimonials: db.testimonials.filter((t) => t.id !== id),
    };
    saveDb(updated);
  };

  const updateAbout = (about: AboutContent) => {
    if (!db) return;
    const updated = { ...db, about };
    saveDb(updated);
  };

  const updateContact = (contact: ContactContent) => {
    if (!db) return;
    const updated = { ...db, contact };
    saveDb(updated);
  };

  const updateMenus = (menus: MenuItem[]) => {
    if (!db) return;
    const updated = { ...db, menus };
    saveDb(updated);
  };

  const updatePages = (pages: Page[]) => {
    if (!db) return;
    const updated = { ...db, pages };
    saveDb(updated);
  };

  const updateMedia = (media: MediaItem[]) => {
    if (!db) return;
    const updated = { ...db, media };
    saveDb(updated);
  };

  const updateGlobalSEO = (seo: GlobalSEO) => {
    if (!db) return;
    const updated = { ...db, seo };
    saveDb(updated);
  };

  const updateDatabase = (updatedDb: Database) => {
    saveDb(updatedDb);
  };

  const resetDatabase = () => {
    resetData();
  };

  const exportData = () => {
    return JSON.stringify(db || fallbackDb, null, 2);
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.settings && parsed.products && parsed.categories) {
        saveDb(parsed);
        return true;
      }
    } catch (e) {
      console.error("Failed to import database JSON", e);
    }
    return false;
  };

  const resetData = () => {
    localStorage.removeItem("kaivo_db");
    setDb(fallbackDb);
    localStorage.setItem("kaivo_db", JSON.stringify(fallbackDb));
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

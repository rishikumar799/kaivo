/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Color {
  name: string;
  hex: string;
}

export interface Product {
  id: string | number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number; // Percentage, e.g. 20 for 20%
  category: string; // matches Category slug
  featured: boolean;
  newArrival: boolean;
  sizes: string[];
  colors: Color[];
  images: string[];
  stock: number;
}

export interface Category {
  id: string | number;
  slug: string;
  name: string;
  description?: string;
  image: string;
}

export interface Banner {
  id: string | number;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  enabled?: boolean;
}

export interface OfferBar {
  enabled: boolean;
  text: string;
}

export interface Testimonial {
  id: string | number;
  name: string;
  location: string;
  rating: number;
  text: string;
}

export interface InstagramItem {
  id: string;
  image: string;
  link: string;
}

export interface Feature {
  title: string;
  description: string;
}

export interface CraftedItem {
  label: string;
  sub: string;
}

export interface AboutContent {
  title: string;
  subtitle: string;
  storyTitle: string;
  story: string;
  storyImage: string;
  midSectionImage: string;
  features: Feature[];
  craftedToLast: {
    title: string;
    description: string;
    items: CraftedItem[];
  };
}

export interface ContactContent {
  title: string;
  subtitle: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  workingHours: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

export interface Settings {
  siteName: string;
  tagline: string;
  whatsappNumber: string;
  logoText: string;
  currencySymbol: string;
  shippingThreshold: number;
  shippingFee: number;
  seoTitle: string;
  seoDescription: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };
  footerContent: string;
}

export interface MenuItem {
  id: string;
  name: string;
  path: string;
  type: "normal" | "dropdown" | "external" | "button";
  enabled: boolean;
  order: number;
  children?: MenuItem[];
}

export interface SectionStyle {
  bgColor?: string;
  textColor?: string;
  paddingTop?: string;
  paddingBottom?: string;
  marginTop?: string;
  marginBottom?: string;
  alignment?: "left" | "center" | "right";
  animation?: string;
  desktopLayout?: string;
  tabletLayout?: string;
  mobileLayout?: string;
}

export interface Section {
  id: string;
  type: string;
  enabled: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  bgImage?: string;
  videoUrl?: string;
  mediaUrl?: string;
  mediaLayout?: string;
  customHtml?: string;
  customContent?: string;
  styles?: SectionStyle;
  items?: any[];
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  pageBanner?: string;
  sections: Section[];
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export interface GlobalSEO {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  ogImage: string;
  favicon: string;
}

export interface Database {
  settings: Settings;
  offers: OfferBar;
  banners: Banner[];
  categories: Category[];
  products: Product[];
  testimonials: Testimonial[];
  instagram: InstagramItem[];
  about: AboutContent;
  contact: ContactContent;
  menus?: MenuItem[];
  pages?: Page[];
  media?: MediaItem[];
  seo?: GlobalSEO;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: Color;
}

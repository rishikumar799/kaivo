/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, auth, storage } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  addDoc
} from "firebase/firestore";
import { 
  ref, 
  uploadString, 
  getDownloadURL, 
  deleteObject,
  uploadBytes
} from "firebase/storage";
import { Database, Product, Category, Banner, OfferBar, Testimonial, AboutContent, ContactContent, Settings, MenuItem, Page, MediaItem, GlobalSEO, PopupSettings } from "../types";

// Operation types for Firestore error reporting as requested by the skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Handles Firestore errors by packaging them into a specific JSON string structure.
 * This is critical for platform debugging and diagnostic validation.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Sub-document paths for singular objects
const GLOBAL_SETTINGS_PATH = "settings/global";
const GLOBAL_OFFERS_PATH = "offers/global";
const GLOBAL_ABOUT_PATH = "about/global";
const GLOBAL_CONTACT_PATH = "contact/global";
const GLOBAL_MENUS_PATH = "menus/global";
const GLOBAL_SEO_PATH = "seo/global";
const GLOBAL_POPUP_PATH = "popup/global";

/**
 * Upload a file/image to Firebase Storage and return its public URL.
 * Supports base64 string upload or File blob upload.
 */
export async function uploadImageToStorage(fileOrBase64: File | string, fileName: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const cleanName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");
    const storageRef = ref(storage, `media/${timestamp}_${cleanName}`);

    if (typeof fileOrBase64 === 'string') {
      // Check if it is data URI
      let uploadStringData = fileOrBase64;
      let format: 'base64' | 'data_url' = 'base64';
      
      if (fileOrBase64.startsWith('data:')) {
        format = 'data_url';
      }
      
      await uploadString(storageRef, uploadStringData, format);
    } else {
      await uploadBytes(storageRef, fileOrBase64);
    }

    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Firebase Storage Upload Error:", error);
    throw error;
  }
}

/**
 * Delete a file from Firebase Storage given its absolute download URL
 */
export async function deleteImageFromStorage(url: string): Promise<void> {
  if (!url || !url.includes("firebasestorage.googleapis.com")) return;
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn("Storage deletion warning (file might already be deleted):", error);
  }
}

/**
 * Set/Save settings document
 */
export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await setDoc(doc(db, GLOBAL_SETTINGS_PATH), settings);
    try {
      const genSnap = await getDoc(doc(db, "settings/general"));
      const currentGen = genSnap.exists() ? genSnap.data() : {};
      await setDoc(doc(db, "settings/general"), {
        brandName: settings.siteName || currentGen.brandName || "KAIVO",
        email: currentGen.email || "thekaivoofficial@gmail.com",
        whatsapp: settings.whatsappNumber || currentGen.whatsapp || "9182896163"
      });
    } catch (e) {
      console.warn("Failed to sync settings/general in saveSettings:", e);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GLOBAL_SETTINGS_PATH);
  }
}

/**
 * Set/Save offers document
 */
export async function saveOffers(offers: OfferBar): Promise<void> {
  try {
    await setDoc(doc(db, GLOBAL_OFFERS_PATH), offers);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GLOBAL_OFFERS_PATH);
  }
}

/**
 * Set/Save about document
 */
export async function saveAbout(about: AboutContent): Promise<void> {
  try {
    await setDoc(doc(db, GLOBAL_ABOUT_PATH), about);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GLOBAL_ABOUT_PATH);
  }
}

/**
 * Set/Save contact document
 */
export async function saveContact(contact: ContactContent): Promise<void> {
  try {
    await setDoc(doc(db, GLOBAL_CONTACT_PATH), contact);
    try {
      const genSnap = await getDoc(doc(db, "settings/general"));
      const currentGen = genSnap.exists() ? genSnap.data() : {};
      await setDoc(doc(db, "settings/general"), {
        brandName: currentGen.brandName || "KAIVO",
        email: contact.email || currentGen.email || "thekaivoofficial@gmail.com",
        whatsapp: contact.phone || currentGen.whatsapp || "9182896163"
      });
    } catch (e) {
      console.warn("Failed to sync settings/general in saveContact:", e);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GLOBAL_CONTACT_PATH);
  }
}

/**
 * Set/Save menus document
 */
export async function saveMenus(menus: MenuItem[]): Promise<void> {
  try {
    await setDoc(doc(db, GLOBAL_MENUS_PATH), { items: menus });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GLOBAL_MENUS_PATH);
  }
}

/**
 * Set/Save global SEO document
 */
export async function saveGlobalSEO(seo: GlobalSEO): Promise<void> {
  try {
    await setDoc(doc(db, GLOBAL_SEO_PATH), seo);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GLOBAL_SEO_PATH);
  }
}

/**
 * Set/Save popup document
 */
export async function savePopup(popup: PopupSettings): Promise<void> {
  try {
    await setDoc(doc(db, GLOBAL_POPUP_PATH), popup);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GLOBAL_POPUP_PATH);
  }
}

/**
 * CRUD functions for collections (Products, Categories, Banners, Testimonials, Pages, Media)
 */

// Banners
export async function saveBanner(banner: Banner): Promise<void> {
  const path = `banners/${banner.id}`;
  try {
    await setDoc(doc(db, path), banner);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeBanner(id: string): Promise<void> {
  const path = `banners/${id}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Categories
export async function saveCategory(category: Category): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    await setDoc(doc(db, path), category);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Products
export async function saveProduct(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, path), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeProduct(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Testimonials
export async function saveTestimonial(testimonial: Testimonial): Promise<void> {
  const path = `testimonials/${testimonial.id}`;
  try {
    await setDoc(doc(db, path), testimonial);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeTestimonial(id: string): Promise<void> {
  const path = `testimonials/${id}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Pages
export async function savePage(page: Page): Promise<void> {
  const path = `pages/${page.id}`;
  try {
    await setDoc(doc(db, path), page);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removePage(id: string): Promise<void> {
  const path = `pages/${id}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Media
export async function saveMediaItem(mediaItem: MediaItem): Promise<void> {
  const path = `media/${mediaItem.id}`;
  try {
    await setDoc(doc(db, path), mediaItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeMediaItem(id: string): Promise<void> {
  const path = `media/${id}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Initializes the database in Firestore using static fallbackDb if Firestore is empty.
 * This guarantees immediate uptime, no empty screens, and seamless local-to-cloud transition.
 */
export async function initializeDatabaseWithFallback(fallback: Database): Promise<Database> {
  try {
    // 1. Load or initialize settings/general
    let generalSettings = {
      brandName: "KAIVO",
      email: "thekaivoofficial@gmail.com",
      whatsapp: "9182896163"
    };
    try {
      const genSnap = await getDoc(doc(db, "settings/general"));
      if (genSnap.exists()) {
        generalSettings = { ...generalSettings, ...genSnap.data() };
      } else {
        await setDoc(doc(db, "settings/general"), generalSettings);
      }
    } catch (e) {
      console.warn("Failed to load or write settings/general:", e);
    }

    // Check settings first
    const settingsSnap = await getDoc(doc(db, GLOBAL_SETTINGS_PATH));
    
    if (settingsSnap.exists()) {
      // Data exists in Firestore! Load all other fields.
      console.log("Firestore data found, fetching entire CMS tree...");
      
      const [
        settingsDoc,
        offersDoc,
        aboutDoc,
        contactDoc,
        menusDoc,
        seoDoc,
        popupDoc,
        bannersSnap,
        categoriesSnap,
        productsSnap,
        testimonialsSnap,
        pagesSnap,
        mediaSnap
      ] = await Promise.all([
        getDoc(doc(db, GLOBAL_SETTINGS_PATH)),
        getDoc(doc(db, GLOBAL_OFFERS_PATH)),
        getDoc(doc(db, GLOBAL_ABOUT_PATH)),
        getDoc(doc(db, GLOBAL_CONTACT_PATH)),
        getDoc(doc(db, GLOBAL_MENUS_PATH)),
        getDoc(doc(db, GLOBAL_SEO_PATH)),
        getDoc(doc(db, GLOBAL_POPUP_PATH)),
        getDocs(collection(db, "banners")),
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "products")),
        getDocs(collection(db, "testimonials")),
        getDocs(collection(db, "pages")),
        getDocs(collection(db, "media"))
      ]);

      const fetchedBanners: Banner[] = [];
      bannersSnap.forEach(doc => fetchedBanners.push(doc.data() as Banner));
      
      const fetchedCategories: Category[] = [];
      categoriesSnap.forEach(doc => fetchedCategories.push(doc.data() as Category));

      const fetchedProducts: Product[] = [];
      productsSnap.forEach(doc => fetchedProducts.push(doc.data() as Product));

      const fetchedTestimonials: Testimonial[] = [];
      testimonialsSnap.forEach(doc => fetchedTestimonials.push(doc.data() as Testimonial));

      const fetchedPages: Page[] = [];
      pagesSnap.forEach(doc => fetchedPages.push(doc.data() as Page));

      const fetchedMedia: MediaItem[] = [];
      mediaSnap.forEach(doc => fetchedMedia.push(doc.data() as MediaItem));

      const finalSettings = settingsDoc.exists() ? settingsDoc.data() as Settings : { ...fallback.settings };
      finalSettings.siteName = generalSettings.brandName || finalSettings.siteName;
      finalSettings.logoText = generalSettings.brandName || finalSettings.logoText;
      finalSettings.whatsappNumber = generalSettings.whatsapp || finalSettings.whatsappNumber;

      const finalContact = contactDoc.exists() ? contactDoc.data() as ContactContent : { ...fallback.contact };
      finalContact.email = generalSettings.email || finalContact.email;
      finalContact.phone = generalSettings.whatsapp || finalContact.phone;

      return {
        settings: finalSettings,
        offers: offersDoc.exists() ? offersDoc.data() as OfferBar : fallback.offers,
        about: aboutDoc.exists() ? aboutDoc.data() as AboutContent : fallback.about,
        contact: finalContact,
        menus: menusDoc.exists() ? (menusDoc.data() as { items: MenuItem[] }).items || [] : fallback.menus,
        seo: seoDoc.exists() ? seoDoc.data() as GlobalSEO : fallback.seo,
        popup: popupDoc.exists() ? popupDoc.data() as PopupSettings : fallback.popup,
        banners: fetchedBanners.length > 0 ? fetchedBanners : fallback.banners,
        categories: fetchedCategories.length > 0 ? fetchedCategories : fallback.categories,
        products: fetchedProducts.length > 0 ? fetchedProducts : fallback.products,
        testimonials: fetchedTestimonials.length > 0 ? fetchedTestimonials : fallback.testimonials,
        pages: fetchedPages.length > 0 ? fetchedPages : fallback.pages || [],
        media: fetchedMedia.length > 0 ? fetchedMedia : fallback.media || [],
        instagram: fallback.instagram || []
      };
    } else {
      // Firestore is empty! Seed it only if the user is logged in as an administrator
      const isAdmin = typeof window !== 'undefined' && localStorage.getItem("kaivo_admin_auth") === "true";
      if (isAdmin) {
        console.log("Firestore empty and user is admin. Seeding Firestore with default parameters...");
        try {
          await Promise.all([
            setDoc(doc(db, GLOBAL_SETTINGS_PATH), fallback.settings),
            setDoc(doc(db, GLOBAL_OFFERS_PATH), fallback.offers),
            setDoc(doc(db, GLOBAL_ABOUT_PATH), fallback.about),
            setDoc(doc(db, GLOBAL_CONTACT_PATH), fallback.contact),
            setDoc(doc(db, GLOBAL_MENUS_PATH), { items: fallback.menus }),
            fallback.seo ? setDoc(doc(db, GLOBAL_SEO_PATH), fallback.seo) : Promise.resolve(),
            fallback.popup ? setDoc(doc(db, GLOBAL_POPUP_PATH), fallback.popup) : Promise.resolve()
          ]);

          await Promise.all([
            ...fallback.banners.map(b => setDoc(doc(db, `banners/${b.id}`), b)),
            ...fallback.categories.map(c => setDoc(doc(db, `categories/${c.id}`), c)),
            ...fallback.products.map(p => setDoc(doc(db, `products/${p.id}`), p)),
            ...fallback.testimonials.map(t => setDoc(doc(db, `testimonials/${t.id}`), t)),
            ...(fallback.pages || []).map(page => setDoc(doc(db, `pages/${page.id}`), page)),
            ...(fallback.media || []).map(m => setDoc(doc(db, `media/${m.id}`), m))
          ]);
          console.log("Firestore seeded successfully!");
        } catch (seedError) {
          console.warn("Seeding Firestore failed, might be lacking write permissions:", seedError);
        }
      } else {
        console.log("Firestore empty. User is not admin, using static fallbackDb.");
      }
      
      const finalSettings = { ...fallback.settings };
      finalSettings.siteName = generalSettings.brandName || finalSettings.siteName;
      finalSettings.logoText = generalSettings.brandName || finalSettings.logoText;
      finalSettings.whatsappNumber = generalSettings.whatsapp || finalSettings.whatsappNumber;

      const finalContact = { ...fallback.contact };
      finalContact.email = generalSettings.email || finalContact.email;
      finalContact.phone = generalSettings.whatsapp || finalContact.phone;

      return {
        ...fallback,
        settings: finalSettings,
        contact: finalContact
      };
    }
  } catch (error) {
    console.warn("Firestore initialize failed, using offline fallback:", error);
    return fallback;
  }
}

/**
 * Analytics and Click Tracking Helpers
 */
export async function trackProductView(productId: string, productName: string): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Track to localStorage immediately for bulletproof offline fallback and real-time response
  try {
    const localViews = JSON.parse(localStorage.getItem("kaivo_local_views") || "[]");
    localViews.push({
      id: "local_v_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      productId,
      productName,
      timestamp
    });
    localStorage.setItem("kaivo_local_views", JSON.stringify(localViews.slice(-1000)));
  } catch (e) {
    console.warn("localStorage view tracking failed", e);
  }

  try {
    // 1. Add to product_views
    await addDoc(collection(db, "product_views"), {
      productId,
      productName,
      timestamp
    });
    // 2. Add to analytics for general views
    await addDoc(collection(db, "analytics"), {
      eventType: "product_view",
      productId,
      productName,
      timestamp
    });
  } catch (error) {
    console.warn("Error tracking product view:", error);
  }
}

export async function trackWhatsAppClick(productId: string, productName: string, pageUrl: string): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Track to localStorage immediately for bulletproof offline fallback and real-time response
  try {
    const localClicks = JSON.parse(localStorage.getItem("kaivo_local_clicks") || "[]");
    localClicks.push({
      id: "local_c_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      productId,
      productName,
      timestamp,
      pageUrl,
      eventType: "whatsapp_click"
    });
    localStorage.setItem("kaivo_local_clicks", JSON.stringify(localClicks.slice(-1000)));
  } catch (e) {
    console.warn("localStorage click tracking failed", e);
  }

  try {
    // 1. Add to whatsapp_clicks
    await addDoc(collection(db, "whatsapp_clicks"), {
      productId,
      productName,
      timestamp,
      pageUrl,
      eventType: "whatsapp_click"
    });
    // 2. Add to analytics
    await addDoc(collection(db, "analytics"), {
      eventType: "whatsapp_click",
      productId,
      productName,
      pageUrl,
      timestamp
    });
  } catch (error) {
    console.warn("Error tracking whatsapp click:", error);
  }
}

export async function trackPageView(pageUrl: string): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Also track page views to local storage
  try {
    const localPageViews = JSON.parse(localStorage.getItem("kaivo_local_page_views") || "[]");
    localPageViews.push({
      id: "local_pv_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      pageUrl,
      timestamp
    });
    localStorage.setItem("kaivo_local_page_views", JSON.stringify(localPageViews.slice(-1000)));
  } catch (e) {
    console.warn("localStorage page view tracking failed", e);
  }

  try {
    await addDoc(collection(db, "analytics"), {
      eventType: "page_view",
      pageUrl,
      timestamp
    });
  } catch (error) {
    console.warn("Error tracking page view:", error);
  }
}

export async function trackCategoryView(categoryName: string): Promise<void> {
  const timestamp = new Date().toISOString();
  
  try {
    const localCatViews = JSON.parse(localStorage.getItem("kaivo_local_category_views") || "[]");
    localCatViews.push({
      id: "local_cv_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      categoryName,
      timestamp
    });
    localStorage.setItem("kaivo_local_category_views", JSON.stringify(localCatViews.slice(-1000)));
  } catch (e) {
    console.warn("localStorage category view tracking failed", e);
  }

  try {
    await addDoc(collection(db, "analytics"), {
      eventType: "category_view",
      categoryName,
      timestamp
    });
  } catch (error) {
    console.warn("Error tracking category view:", error);
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useShop } from "../contexts/ShopContext";
import { X, Gift } from "lucide-react";

export default function PromoPopup() {
  const { db } = useShop();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!db || !db.popup || !db.popup.enabled) return;

    const { delay, frequency } = db.popup;

    // Check if the user has already seen the popup in this session (for frequency: once)
    if (frequency === "once") {
      const alreadySeen = sessionStorage.getItem("kaivo_popup_dismissed") || localStorage.getItem("kaivo_popup_dismissed_permanently");
      if (alreadySeen) return;
    }

    // Set a timer based on the delay setting
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, (delay || 0) * 1000);

    return () => clearTimeout(timer);
  }, [db]);

  if (!db || !db.popup || !db.popup.enabled) return null;

  const { image, title, content, buttonText, buttonLink, frequency } = db.popup;

  const handleClose = () => {
    setIsVisible(false);
    if (frequency === "once") {
      sessionStorage.setItem("kaivo_popup_dismissed", "true");
    }
  };

  const handleAction = () => {
    setIsVisible(false);
    if (frequency === "once") {
      sessionStorage.setItem("kaivo_popup_dismissed", "true");
    }
    navigate(buttonLink);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Ambient Blurred Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            id="popup-backdrop"
          />

          {/* Centered Popup Card Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.55 }}
            className="bg-zinc-950 border border-zinc-900 rounded-sm w-full max-w-lg overflow-hidden flex flex-col md:flex-row shadow-2xl relative z-10"
            id="promo-popup-card"
          >
            {/* Corner Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2 bg-black/60 border border-zinc-800 rounded-sm hover:border-[#C9A063] hover:text-[#C9A063] text-zinc-400 transition-all cursor-pointer"
              aria-label="Close promotion"
              id="popup-close-btn"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left/Top Image (Hidden if URL is empty, taking up full width of column on desktop) */}
            {image && (
              <div className="md:w-1/2 h-44 md:h-auto bg-zinc-900 relative">
                <img
                  src={image}
                  alt="Exclusive offer promotional cover"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent to-zinc-950/40" />
              </div>
            )}

            {/* Right/Bottom Content Side */}
            <div className={`p-6 sm:p-8 flex flex-col justify-center items-center text-center ${image ? "md:w-1/2" : "w-full"}`}>
              {/* Badge Icon */}
              <div className="w-10 h-10 rounded-full border border-[#C9A063]/20 bg-[#C9A063]/5 flex items-center justify-center text-[#C9A063] mb-4">
                <Gift className="w-5 h-5" />
              </div>

              {/* Bold Title */}
              <h3 className="text-sm sm:text-base font-black tracking-widest text-white uppercase font-sans mb-3 text-balance">
                {title}
              </h3>

              {/* Offer Description Text */}
              <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed font-sans mb-6 text-balance">
                {content}
              </p>

              {/* Action Button */}
              <button
                onClick={handleAction}
                id="popup-action-btn"
                className="w-full bg-[#C9A063] hover:bg-white text-black font-mono font-bold text-[10px] sm:text-xs tracking-widest py-3 px-6 rounded-xs transition-all uppercase cursor-pointer"
              >
                {buttonText}
              </button>

              {/* Secondary Close link text */}
              <button
                onClick={handleClose}
                className="text-[9px] font-mono tracking-widest text-zinc-550 hover:text-white uppercase mt-4 transition-all"
              >
                No thanks, keep browsing
              </button>
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}

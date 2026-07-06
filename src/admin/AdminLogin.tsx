/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, User } from "lucide-react";
import { db } from "../lib/firebase";
import { getDoc, doc } from "firebase/firestore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // If already authorized, skip to dashboard
    if (localStorage.getItem("kaivo_admin_auth") === "true") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settingsSnap = await getDoc(doc(db, "settings/general"));
      let allowedEmail = "thekaivoofficial@gmail.com";
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (data.email) {
          allowedEmail = data.email;
        }
      }
      
      const cleanUser = username.trim().toLowerCase();
      const cleanEmail = allowedEmail.trim().toLowerCase();
      
      if ((cleanUser === "admin" || cleanUser === cleanEmail) && password === "adMin @123#*") {
        localStorage.setItem("kaivo_admin_auth", "true");
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("Incorrect email/username or password. Please try again.");
      }
    } catch (err) {
      const cleanUser = username.trim().toLowerCase();
      if ((cleanUser === "admin" || cleanUser === "thekaivoofficial@gmail.com") && password === "adMin @123#*") {
        localStorage.setItem("kaivo_admin_auth", "true");
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("Incorrect email/username or password. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-sm p-8 relative z-10 shadow-2xl">
        
        {/* Header Branding */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500 uppercase block mb-2">KAIVO STREETWEAR</span>
          <h1 className="text-3xl font-black tracking-widest uppercase">MANAGEMENT</h1>
          <div className="w-10 h-0.5 bg-amber-500 mx-auto mt-4" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-900/10 border border-red-900/30 text-red-400 text-xs rounded-sm font-mono text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Username/Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span>Username or Email</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              className="bg-black border border-zinc-800 text-xs px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 rounded-sm font-sans"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-black border border-zinc-800 text-xs px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 rounded-sm font-sans"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-black font-bold text-xs tracking-widest py-4.5 uppercase transition-all rounded-sm font-mono mt-4 cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-amber-500/5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATE AND LOGIN</span>
          </button>
        </form>

      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Tag, 
  Shirt, 
  Image, 
  Megaphone, 
  MessageSquare, 
  FileText, 
  Mail, 
  Settings, 
  LogOut, 
  Globe,
  Menu,
  X,
  Sliders,
  FolderOpen,
  AppWindow,
  Sparkles
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authorization check (Client-side token)
  const isAuthorized = localStorage.getItem("kaivo_admin_auth") === "true";

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/admin/login", { replace: true });
    }
  }, [isAuthorized, navigate]);

  if (!isAuthorized) return null;

  const handleLogout = () => {
    localStorage.removeItem("kaivo_admin_auth");
    navigate("/admin/login", { replace: true });
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Menu Builder", path: "/admin/menus", icon: <Menu className="w-4 h-4" /> },
    { label: "Page Builder", path: "/admin/pages", icon: <AppWindow className="w-4 h-4" /> },
    { label: "Media Library", path: "/admin/media", icon: <FolderOpen className="w-4 h-4" /> },
    { label: "SEO Manager", path: "/admin/seo", icon: <Sliders className="w-4 h-4" /> },
    { label: "Products", path: "/admin/products", icon: <Shirt className="w-4 h-4" /> },
    { label: "Categories", path: "/admin/categories", icon: <Tag className="w-4 h-4" /> },
    { label: "Hero Banners", path: "/admin/banners", icon: <Image className="w-4 h-4" /> },
    { label: "Announcements", path: "/admin/offers", icon: <Megaphone className="w-4 h-4" /> },
    { label: "Popup Manager", path: "/admin/popup", icon: <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> },
    { label: "Testimonials", path: "/admin/testimonials", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "About Page", path: "/admin/about", icon: <FileText className="w-4 h-4" /> },
    { label: "Contact Info", path: "/admin/contact", icon: <Mail className="w-4 h-4" /> },
    { label: "General Settings", path: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans">
      
      {/* MOBILE ADMIN NAV HEADER */}
      <div className="md:hidden bg-zinc-950 border-b border-zinc-900 p-4 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 font-mono text-xs tracking-widest font-black uppercase">KAIVO</span>
          <span className="bg-zinc-900 text-zinc-500 text-[9px] px-2 py-0.5 rounded font-mono border border-zinc-850">ADMIN</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 border border-zinc-900 rounded bg-black"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-amber-500" /> : <Menu className="w-5 h-5 text-zinc-400" />}
        </button>
      </div>

      {/* MOBILE NAV DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[61px] bottom-0 bg-black z-20 flex flex-col justify-between p-6 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-mono tracking-widest uppercase transition-all border ${
                    active 
                      ? "bg-amber-500 text-black border-amber-500 font-black" 
                      : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 mt-10 border-t border-zinc-900 pt-6">
            <button
              onClick={handleLogout}
              className="w-full bg-red-900/20 hover:bg-red-900 border border-red-900/50 text-red-400 hover:text-white py-3 rounded-sm font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>LOGOUT SESSION</span>
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 shrink-0 bg-zinc-950 border-r border-zinc-900 p-6 flex-col justify-between sticky top-0 h-screen overflow-y-auto z-10">
        <div className="flex flex-col gap-10">
          
          {/* Logo element */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-widest text-white uppercase font-mono">KAIVO</span>
              <span className="text-[10px] text-amber-500 tracking-[0.3em] font-mono uppercase block mt-1">MANAGEMENT PLATFORM</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-sm text-[10px] font-mono tracking-widest uppercase transition-all border ${
                    active 
                      ? "bg-amber-500 text-black border-amber-500 font-extrabold shadow-lg shadow-amber-500/10" 
                      : "bg-black border-zinc-900/60 hover:border-zinc-700 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className={active ? "text-black" : "text-amber-500"}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer of Sidebar */}
        <div className="flex flex-col gap-4 border-t border-zinc-900 pt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-950/20 hover:bg-red-900 border border-red-900/40 text-red-400 hover:text-white py-3 rounded-sm font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT SESSION</span>
          </button>
        </div>

      </aside>

      {/* VIEWPORT CONTENT CONTAINER */}
      <main className="flex-grow p-4 sm:p-8 md:p-10 bg-black overflow-y-auto max-w-7xl mx-auto w-full min-h-screen">
        <Outlet />
      </main>

    </div>
  );
}

import React, { useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";
import { Menu, Search, Moon, Sun, Bell } from "lucide-react";

const pageTitles = {
  "/dashboard":  "Dashboard",
  "/properties": "Property Ledger",
  "/insights":   "Analytics & Insights",
  "/settings":   "Account Settings",
};

const TopBar = () => {
  const {
    searchTerm, setSearchTerm,
    theme, toggleTheme,
    notifications, setNotifications,
    userProfile,
    isMobileMenuOpen, setIsMobileMenuOpen,
  } = useAppContext();

  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
    };
    if (isNotifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  const markAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const title = pageTitles[location.pathname] || "UPYOG";

  return (
    <header className="fixed top-0 left-64 right-0 z-50 max-lg:left-0 bg-surface border-b border-outline-variant flex justify-between items-center px-4 sm:px-8 py-3 transition-colors duration-300">
      {/* Left */}
      <div className="flex items-center space-x-4">
        <button className="lg:hidden text-on-surface p-1 hover:bg-surface-container rounded-md" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={20} />
        </button>
        <h1 className="hidden sm:block text-sm font-black uppercase tracking-widest text-on-surface">{title}</h1>
        <div className="hidden md:flex items-center bg-surface-container-high rounded-full px-4 py-2 border border-outline-variant w-60">
          <Search size={14} className="text-on-surface-variant mr-2" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-on-surface w-full placeholder:text-on-surface-variant"
            placeholder="Search properties, owners..."
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-3">
        {/* Theme */}
        <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all" title="Toggle theme">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all">
            <Bell size={18} />
          </button>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tertiary rounded-full border-2 border-surface" />
          )}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-surface border border-outline-variant shadow-2xl rounded-xl overflow-hidden z-[100] animate-fade-in">
              <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
                <h3 className="font-bold text-sm text-on-surface">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAsRead} className="text-primary text-[10px] uppercase font-bold tracking-widest hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 hover:bg-surface-container-high border-b border-outline-variant cursor-pointer relative transition-colors ${n.isRead ? "opacity-50" : ""}`}>
                    {!n.isRead && <div className="absolute left-0 top-0 w-1 h-full bg-primary" />}
                    <p className={`${n.color} text-[10px] uppercase font-bold tracking-widest mb-1`}>{n.type}</p>
                    <p className="text-sm font-bold text-on-surface mb-0.5">{n.title}</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{n.desc}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center space-x-3 pl-3 border-l border-outline-variant">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface">{userProfile.fullName}</p>
            <p className="text-[10px] text-on-surface-variant">UPYOG Platform</p>
          </div>
          <img alt="Profile" className="w-8 h-8 rounded-full border border-primary/30" src={userProfile.avatar} />
        </div>
      </div>
    </header>
  );
};

export default TopBar;

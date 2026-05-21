import React from "react";
import { NavLink } from "react-router-dom";
import { navItems, footerItems } from "../configs/navigationConfig";
import { useAppContext } from "../context/AppContext";
import { LayoutDashboard, Building2, BarChart2, Settings, LifeBuoy, LogOut, X } from "lucide-react";
import upyogLogo from "../assets/upyog-logo.png";

const SideNav = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useAppContext();

  const iconMap = {
    dashboard:  LayoutDashboard,
    properties: Building2,
    insights:   BarChart2,
    settings:   Settings,
    support:    LifeBuoy,
    logout:     LogOut,
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col space-y-8 border-r border-outline-variant bg-surface p-6 uppercase tracking-widest text-[10px] transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={upyogLogo} alt="UPYOG" className="h-9 w-9 object-contain" />
            <div>
              <h1 className="text-base font-black tracking-tight text-on-surface normal-case">UPYOG</h1>
              <p className="text-[8px] text-on-surface-variant normal-case">Property Tax Analytics</p>
            </div>
          </div>
          <button className="lg:hidden text-on-surface-variant" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ id, path, label }) => {
            const Icon = iconMap[id] || LayoutDashboard;
            return (
              <NavLink
                key={id}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-4 py-3 transition-all duration-150 ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`
                }
              >
                <Icon size={17} />
                <span className="text-[11px] font-bold">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer links */}
        <div className="space-y-1">
          {footerItems.map(({ id, path, label }) => {
            const Icon = iconMap[id] || LifeBuoy;
            return (
              <a key={id} href={path}
                className="flex items-center space-x-3 rounded-lg px-4 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              >
                <Icon size={15} />
                <span className="text-[10px] font-bold">{label}</span>
              </a>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default SideNav;

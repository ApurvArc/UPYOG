import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";
import toast, { Toaster } from "react-hot-toast";

const Settings = () => {
  const { userProfile, setUserProfile, toggleTheme, theme } = useAppContext();
  const [form, setForm] = useState({ ...userProfile });

  const handleSave = () => {
    setUserProfile(form);
    toast.success("Profile updated successfully!");
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-20"
    >
      <Toaster position="bottom-right" />
      <div className="mx-auto w-full max-w-3xl px-8 pb-12 max-md:px-4">
        <div className="mb-8 pt-6">
          <h2 className="text-2xl font-black tracking-tight text-on-surface">Account Settings</h2>
          <p className="text-sm text-on-surface-variant mt-1">Manage your profile and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 mb-4 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-4">Profile</h3>
          <div className="flex items-center gap-4 mb-6">
            <img src={form.avatar} className="w-16 h-16 rounded-full border-2 border-primary/30" alt="avatar" />
            <div>
              <p className="font-bold text-on-surface">{form.fullName}</p>
              <p className="text-xs text-on-surface-variant">{form.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name", key: "fullName", type: "text" },
              { label: "Email",     key: "email",    type: "email" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:brightness-110 transition-all"
          >
            Save Changes
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 mb-4 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-4">Preferences</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-on-surface">Theme</p>
              <p className="text-xs text-on-surface-variant">Currently: {theme === "dark" ? "Dark Mode" : "Light Mode"}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-5 py-2 rounded-lg text-xs font-bold border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Switch to {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-4">About</h3>
          <div className="space-y-2 text-sm">
            {[
              ["Platform", "UPYOG Multi-Tenant Property Tax"],
              ["Version",  "1.0.0 — Assessment Build"],
              ["Dataset",  "1,000 records · 10 cities"],
              ["AI Model", "Mistral / Groq (LLaMA-3.3)"],
              ["Stack",    "React + Vite + TailwindCSS"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b border-outline-variant/40 last:border-0">
                <span className="text-on-surface-variant font-medium">{k}</span>
                <span className="text-on-surface font-bold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.main>
  );
};

export default Settings;

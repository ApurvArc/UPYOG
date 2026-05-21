import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import SideNav from "./components/SideNav";
import TopBar from "./components/TopBar";
import ChatAssistant from "./components/ChatAssistant";
import Dashboard from "./pages/dashboard/Dashboard";
import Properties from "./pages/properties/Properties";
import Insights from "./pages/insights/Insights";
import Settings from "./pages/settings/Settings";

const AppShell = () => (
  <div className="min-h-screen bg-background text-on-surface transition-colors duration-300">
    <SideNav />
    <div className="ml-64 max-lg:ml-0">
      <TopBar />
      <Outlet />
    </div>
    <ChatAssistant />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--surface-container-high)",
          color: "var(--on-surface)",
          border: "1px solid var(--outline-variant)",
          fontSize: "13px",
        },
      }}
    />
  </div>
);

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route element={<AppShell />}>
      <Route path="/dashboard"   element={<Dashboard />} />
      <Route path="/properties"  element={<Properties />} />
      <Route path="/insights"    element={<Insights />} />
      <Route path="/settings"    element={<Settings />} />
    </Route>
  </Routes>
);

export default App;

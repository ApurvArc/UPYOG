import { createContext, useContext, useMemo, useState, useEffect } from "react";
import PROPERTIES_DATA from "../assets/properties.json";

export const AppContext = createContext();

const THEME_KEY        = "upyog_theme";
const USER_PROFILE_KEY = "upyog_userProfile";

const THEMES = { LIGHT: "light", DARK: "dark" };

const DEFAULT_USER_PROFILE = {
  fullName: "UPYOG Administrator",
  email:    "admin@upyog.gov.in",
  bio:      "Platform administrator for UPYOG multi-tenant property tax management system across 10 Indian cities.",
  avatar:   "https://ui-avatars.com/api/?name=UPYOG+Admin&background=4f8ef7&color=fff&size=128",
};

export const AppProvider = ({ children }) => {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    const s = localStorage.getItem(THEME_KEY);
    return s === THEMES.DARK || s === THEMES.LIGHT ? s : THEMES.DARK;
  });
  const toggleTheme = () =>
    setTheme(prev => {
      const next = prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  useEffect(() => {
    if (theme === THEMES.DARK) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, [theme]);

  // ── Profile ────────────────────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const s = localStorage.getItem(USER_PROFILE_KEY);
      return s ? { ...DEFAULT_USER_PROFILE, ...JSON.parse(s) } : DEFAULT_USER_PROFILE;
    } catch { return DEFAULT_USER_PROFILE; }
  });
  useEffect(() => localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile)), [userProfile]);

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([
    { id: 1, type: "System Alert", title: "Data Sync Complete", desc: "All 1,000 property records successfully loaded across 10 city tenants.", time: "Just now", isRead: false, color: "text-primary" },
    { id: 2, type: "Collection Alert", title: "Mumbai Leads Collection", desc: "Mumbai has crossed ₹3.5L in tax collection — highest among all cities this period.", time: "2 hours ago", isRead: false, color: "text-secondary" },
  ]);

  // ── Tenant / Filter State ──────────────────────────────────────────────────
  const [selectedTenant, setSelectedTenant] = useState("All Cities");
  const [searchTerm,     setSearchTerm]     = useState("");
  const [statusFilter,   setStatusFilter]   = useState("All");
  const [typeFilter,     setTypeFilter]     = useState("All");
  const [sortOrder,      setSortOrder]      = useState("latest");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── Raw data ───────────────────────────────────────────────────────────────
  const properties = PROPERTIES_DATA;

  // ── Derived: list of tenants ───────────────────────────────────────────────
  const tenants = useMemo(
    () => ["All Cities", ...[...new Set(properties.map(p => p.tenant))].sort()],
    [properties]
  );

  // ── Derived: filtered by selected tenant ──────────────────────────────────
  const tenantProperties = useMemo(
    () => selectedTenant === "All Cities"
      ? properties
      : properties.filter(p => p.tenant === selectedTenant),
    [properties, selectedTenant]
  );

  // ── Derived: KPIs (updates with tenant filter) ─────────────────────────────
  const kpis = useMemo(() => {
    const total      = tenantProperties.length;
    const approved   = tenantProperties.filter(p => p.status === "Approved").length;
    const rejected   = tenantProperties.filter(p => p.status === "Rejected").length;
    const pending    = tenantProperties.filter(p => p.status === "Pending").length;
    const collection = tenantProperties.reduce((s, p) => s + p.collection_inr, 0);
    return { total, approved, rejected, pending, collection };
  }, [tenantProperties]);

  // ── Derived: city-level summary for charts ─────────────────────────────────
  const citySummary = useMemo(() => {
    const cities = [...new Set(properties.map(p => p.tenant))].sort();
    return cities.map(city => {
      const cd = properties.filter(p => p.tenant === city);
      return {
        city,
        name: city.slice(0, 3).toUpperCase(),
        total:      cd.length,
        approved:   cd.filter(p => p.status === "Approved").length,
        rejected:   cd.filter(p => p.status === "Rejected").length,
        pending:    cd.filter(p => p.status === "Pending").length,
        collection: parseFloat(cd.reduce((s, p) => s + p.collection_inr, 0).toFixed(2)),
        residential:  cd.filter(p => p.property_type === "Residential").length,
        commercial:   cd.filter(p => p.property_type === "Commercial").length,
        industrial:   cd.filter(p => p.property_type === "Industrial").length,
        agricultural: cd.filter(p => p.property_type === "Agricultural").length,
        mixedUse:     cd.filter(p => p.property_type === "Mixed Use").length,
      };
    });
  }, [properties]);

  // ── Derived: property type breakdown (for donut) ──────────────────────────
  const typeBreakdown = useMemo(() => {
    const types = ["Residential","Commercial","Industrial","Agricultural","Mixed Use"];
    const COLORS = ["#4f8ef7","#10b981","#f59e0b","#7c3aed","#ef4444"];
    return types.map((t, i) => ({
      name:  t,
      count: tenantProperties.filter(p => p.property_type === t).length,
      color: COLORS[i],
    })).filter(t => t.count > 0);
  }, [tenantProperties]);

  // ── Derived: filtered properties for the ledger table ─────────────────────
  const filteredProperties = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let data = tenantProperties;
    if (q) data = data.filter(p =>
      p.owner_name.toLowerCase().includes(q) ||
      p.property_id.toLowerCase().includes(q) ||
      p.ward.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    );
    if (statusFilter !== "All") data = data.filter(p => p.status === statusFilter);
    if (typeFilter   !== "All") data = data.filter(p => p.property_type === typeFilter);

    return [...data].sort((a, b) => {
      if (sortOrder === "latest") return new Date(b.registration_date) - new Date(a.registration_date);
      if (sortOrder === "oldest") return new Date(a.registration_date) - new Date(b.registration_date);
      if (sortOrder === "tax-high")  return b.annual_tax_inr  - a.annual_tax_inr;
      if (sortOrder === "tax-low")   return a.annual_tax_inr  - b.annual_tax_inr;
      if (sortOrder === "area-high") return b.area_sqft - a.area_sqft;
      return 0;
    });
  }, [tenantProperties, searchTerm, statusFilter, typeFilter, sortOrder]);

  // ── Derived: insights signals ──────────────────────────────────────────────
  const signals = useMemo(() => {
    const top = [...citySummary].sort((a, b) => b.collection - a.collection)[0];
    const mostPending = [...citySummary].sort((a, b) => b.pending - a.pending)[0];
    const lowestApproval = [...citySummary].sort((a, b) =>
      (a.approved / a.total) - (b.approved / b.total)
    )[0];
    return [
      {
        iconColor: "text-secondary",
        bgColor:   "bg-secondary/10",
        title:     "Top Collecting City",
        description: `${top?.city} leads all cities with ₹${Math.round(top?.collection || 0).toLocaleString("en-IN")} in total tax collection.`,
        highlight: top?.city,
        highlightClass: "text-secondary font-bold",
      },
      {
        iconColor: "text-tertiary",
        bgColor:   "bg-tertiary/10",
        title:     "Highest Pending City",
        description: `${mostPending?.city} has the most pending properties (${mostPending?.pending}) — follow-up action recommended.`,
        highlight: `${mostPending?.pending} pending`,
        highlightClass: "text-tertiary font-bold",
      },
      {
        iconColor: "text-amber-500",
        bgColor:   "bg-amber-500/10",
        title:     "Lowest Approval Rate",
        description: `${lowestApproval?.city} has the lowest approval rate at ${lowestApproval?.total ? ((lowestApproval.approved / lowestApproval.total) * 100).toFixed(1) : 0}% — review pending applications.`,
        highlight: `${lowestApproval?.city}`,
        highlightClass: "text-amber-500 font-bold",
      },
    ];
  }, [citySummary]);

  const value = {
    // Data
    properties, tenants, tenantProperties, filteredProperties,
    citySummary, kpis, typeBreakdown, signals,
    // Filters
    selectedTenant, setSelectedTenant,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    sortOrder, setSortOrder,
    // UI
    isMobileMenuOpen, setIsMobileMenuOpen,
    // Theme
    theme, toggleTheme,
    // Profile
    userProfile, setUserProfile,
    // Notifications
    notifications, setNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

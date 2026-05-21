import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../../context/AppContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  Home, CheckCircle2, XCircle, IndianRupee, Globe,
  Building, Factory, Wheat, Wrench, BarChart3, Coins,
} from "lucide-react";

// ── Animated count-up ─────────────────────────────────────────────────────────
const useCountUp = (target, duration = 900) => {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setVal(Math.round(eased * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KPICard = ({ title, value, Icon, accent, prefix = "", suffix = "", delay = 0 }) => {
  const counted = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="p-6 rounded-xl bg-surface border border-outline-variant shadow-sm hover:-translate-y-1 transition-transform cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${accent}22` }}>
          <Icon size={20} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-3xl font-black tracking-tight tabular-nums" style={{ color: accent }}>
        {prefix}{counted.toLocaleString("en-IN")}{suffix}
      </p>
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-2">{title}</p>
    </motion.div>
  );
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-3 shadow-xl text-xs">
      <p className="font-bold text-on-surface mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill }} className="font-semibold">
          {p.name.includes("collection") ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
        </p>
      ))}
    </div>
  );
};

const BAR_COLORS = ["#4f8ef7","#7c3aed","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316"];

// ── Dashboard ──────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { kpis, citySummary, tenantProperties, typeBreakdown, selectedTenant, setSelectedTenant, tenants } = useAppContext();
  const [chartTab, setChartTab] = React.useState("collection");
  const [hoveredType, setHoveredType] = React.useState(null);

  const kpiCards = [
    { title: "Total Properties Registered", value: kpis.total,                  Icon: Home,          accent: "#4f8ef7", prefix: "" },
    { title: "Total Properties Approved",   value: kpis.approved,               Icon: CheckCircle2,  accent: "#10b981", prefix: "" },
    { title: "Total Properties Rejected",   value: kpis.rejected,               Icon: XCircle,       accent: "#ef4444", prefix: "" },
    { title: "Total Collection (₹)",         value: Math.round(kpis.collection), Icon: IndianRupee,   accent: "#f59e0b", prefix: "₹" },
  ];

  // Donut
  const total = typeBreakdown.reduce((s, t) => s + t.count, 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen pt-20"
    >
      <div className="mx-auto w-full max-w-7xl px-8 pb-12 max-md:px-4">

        {/* Page Header */}
        <div className="mb-6 pt-6">
          <h2 className="text-2xl font-black tracking-tight text-on-surface">Property Tax Analytics</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Real-time insights · {selectedTenant === "All Cities" ? "All 10 Cities" : selectedTenant} · UPYOG Platform
          </p>
        </div>

        {/* Tenant Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {tenants.map(city => (
            <button
              key={city}
              id={`filter-${city.replace(/\s+/g,"-").toLowerCase()}`}
              onClick={() => setSelectedTenant(city)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all ${
                selectedTenant === city
                  ? "bg-primary text-white border-transparent shadow-lg shadow-primary/25"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/50 hover:text-primary"
              }`}
            >
              {city === "All Cities" && <Globe size={11} className="inline mr-1 -mt-0.5" />}{city}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {kpiCards.map((card, i) => (
            <KPICard key={card.title} {...card} delay={i * 0.08} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

          {/* Bar Chart — city comparison */}
          <div className="lg:col-span-8 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-black text-on-surface">City Comparison</h3>
                <p className="text-xs text-on-surface-variant">All 10 cities side by side</p>
              </div>
              <div className="flex rounded-lg bg-surface-container p-1 gap-1 flex-wrap">
                {[
                  { id: "collection", label: "Collection", TabIcon: Coins },
                  { id: "status",     label: "Status",     TabIcon: BarChart3 },
                  { id: "total",      label: "Total",      TabIcon: Home },
                ].map(({ id, label, TabIcon }) => (
                  <button
                    key={id}
                    id={`chart-tab-${id}`}
                    onClick={() => setChartTab(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                      chartTab === id ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <TabIcon size={12} />{label}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              {chartTab === "status" ? (
                <BarChart data={citySummary} barSize={8} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--on-surface-variant)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--on-surface-variant)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(79,142,247,0.05)" }} />
                  <Bar dataKey="approved" name="approved" fill="#10b981" radius={[3,3,0,0]} />
                  <Bar dataKey="pending"  name="pending"  fill="#f59e0b" radius={[3,3,0,0]} />
                  <Bar dataKey="rejected" name="rejected" fill="#ef4444" radius={[3,3,0,0]} />
                </BarChart>
              ) : (
                <BarChart
                  data={citySummary}
                  margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--on-surface-variant)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--on-surface-variant)", fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => chartTab === "collection" ? `₹${(v/1000).toFixed(0)}k` : v}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(79,142,247,0.05)" }} />
                  <Bar dataKey={chartTab === "collection" ? "collection" : "total"} name={chartTab} radius={[6,6,0,0]}>
                    {citySummary.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Donut — property type breakdown */}
          <div className="lg:col-span-4 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-on-surface mb-0.5">Property Types</h3>
            <p className="text-xs text-on-surface-variant mb-4">Breakdown by category</p>

            <div className="flex flex-col items-center flex-1 justify-center">
              <div className="relative mb-6 h-52 w-52">
                <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                  <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--outline-variant)" strokeWidth="11" />
                  {typeBreakdown.map((t, i) => {
                    const length = total > 0 ? (t.count / total) * circumference : 0;
                    const prevSum = typeBreakdown.slice(0, i).reduce((s, c) => s + c.count, 0);
                    const offset = -(prevSum / total) * circumference;
                    const isInactive = hoveredType !== null && hoveredType !== i;
                    return (
                      <motion.circle
                        key={t.name}
                        cx="50" cy="50" r={radius}
                        fill="none"
                        stroke={isInactive ? "var(--outline-variant)" : t.color}
                        strokeWidth="11"
                        strokeLinecap="round"
                        strokeDasharray={`${length} ${circumference}`}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: [0.4,0,0.2,1] }}
                        style={{ filter: isInactive ? "saturate(0.2)" : "none", transition: "filter 0.3s, stroke 0.3s" }}
                        onMouseEnter={() => setHoveredType(i)}
                        onMouseLeave={() => setHoveredType(null)}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <AnimatePresence mode="wait">
                    {hoveredType !== null ? (
                      <motion.div key={`type-${hoveredType}`} initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.85 }} transition={{ duration: 0.15 }} className="flex flex-col items-center">
                        <p className="text-2xl font-black" style={{ color: typeBreakdown[hoveredType]?.color }}>{typeBreakdown[hoveredType]?.count}</p>
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold text-center">{typeBreakdown[hoveredType]?.name}</p>
                      </motion.div>
                    ) : (
                      <motion.div key="total" initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.85 }} transition={{ duration: 0.15 }} className="flex flex-col items-center">
                        <p className="text-2xl font-black text-on-surface">{total}</p>
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Total</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="w-full space-y-2">
                {typeBreakdown.map((t, i) => (
                  <motion.div
                    key={t.name}
                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.07 + 0.3, duration: 0.3 }}
                    className={`flex justify-between items-center cursor-pointer transition-opacity ${hoveredType !== null && hoveredType !== i ? "opacity-30" : "opacity-100"}`}
                    onMouseEnter={() => setHoveredType(i)}
                    onMouseLeave={() => setHoveredType(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                      <span className="text-sm text-on-surface font-medium">{t.name}</span>
                    </div>
                    <span className="text-sm font-bold text-on-surface tabular-nums">{t.count}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Properties */}
        <section className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-on-surface">Recent Properties</h3>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-0.5">Latest registrations</p>
            </div>
            <Link to="/properties" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-1">
            {tenantProperties.slice(0, 5).map((p) => (
              <div key={p.property_id} className="flex items-center justify-between p-3 hover:bg-surface-container-high transition-colors rounded-lg cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {p.property_type === "Residential" ? <Home size={18} className="text-primary" /> :
                     p.property_type === "Commercial"  ? <Building size={18} className="text-violet-500" /> :
                     p.property_type === "Industrial"  ? <Factory size={18} className="text-cyan-500" /> :
                     p.property_type === "Agricultural"? <Wheat size={18} className="text-amber-500" /> :
                                                         <Wrench size={18} className="text-rose-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{p.owner_name}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">{p.property_id} · {p.ward} · {p.tenant}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                    p.status === "Approved" ? "bg-secondary/10 text-secondary" :
                    p.status === "Rejected" ? "bg-tertiary/10 text-tertiary" :
                    "bg-amber-500/10 text-amber-500"
                  }`}>{p.status}</span>
                  <p className="text-xs font-bold text-on-surface mt-1">₹{p.annual_tax_inr.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.main>
  );
};

export default Dashboard;

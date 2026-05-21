import React from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Trophy, AlertTriangle, TrendingDown } from "lucide-react";

const COLORS = ["#4f8ef7","#7c3aed","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316"];

const SignalCard = ({ signal, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className={`p-5 rounded-xl border border-outline-variant ${signal.bgColor} flex gap-4`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${signal.bgColor}`}>
      {signal.iconColor.includes("secondary") ? <Trophy size={18} className={signal.iconColor} /> : signal.iconColor.includes("tertiary") ? <AlertTriangle size={18} className={signal.iconColor} /> : <TrendingDown size={18} className={signal.iconColor} />}
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1">{signal.title}</p>
      <p className="text-sm text-on-surface leading-relaxed">
        {signal.description.split(signal.highlight).map((part, i, arr) =>
          i < arr.length - 1
            ? [part, <span key={i} className={signal.highlightClass}>{signal.highlight}</span>]
            : part
        )}
      </p>
    </div>
  </motion.div>
);

const Insights = () => {
  const { citySummary, signals, properties } = useAppContext();
  const [activeChart, setActiveChart] = React.useState("types");

  // Property type data across all cities
  const typeData = ["Residential","Commercial","Industrial","Agricultural","Mixed Use"].map((t, i) => ({
    name: t,
    count: properties.filter(p => p.property_type === t).length,
    fill: COLORS[i],
  }));

  // Approval rate per city
  const approvalData = citySummary.map(c => ({
    name: c.name,
    city: c.city,
    rate: parseFloat(((c.approved / c.total) * 100).toFixed(1)),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-surface border border-outline-variant rounded-xl p-3 shadow-xl text-xs">
        <p className="font-bold text-on-surface mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || p.color || "#4f8ef7" }} className="font-semibold">
            {p.name}: {p.value}{activeChart === "approval" ? "%" : ""}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-20"
    >
      <div className="mx-auto w-full max-w-7xl px-8 pb-12 max-md:px-4">
        <div className="mb-8 pt-6">
          <h2 className="text-2xl font-black tracking-tight text-on-surface">Analytics & Insights</h2>
          <p className="text-sm text-on-surface-variant mt-1">AI-generated signals from 1,000 property records</p>
        </div>

        {/* Signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {signals.map((s, i) => <SignalCard key={i} signal={s} delay={i * 0.1} />)}
        </div>

        {/* Charts */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-black text-on-surface">Distribution Analysis</h3>
              <p className="text-xs text-on-surface-variant">Across all 10 cities</p>
            </div>
            <div className="flex gap-1 bg-surface-container rounded-lg p-1 flex-wrap">
              {[
                { id: "types",    label: "By Type" },
                { id: "approval", label: "Approval %" },
                { id: "pending",  label: "Pending" },
              ].map(t => (
                <button key={t.id} id={`insight-tab-${t.id}`}
                  onClick={() => setActiveChart(t.id)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${activeChart === t.id ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            {activeChart === "types" ? (
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                <XAxis dataKey="name" tick={{ fill: "var(--on-surface-variant)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--on-surface-variant)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(79,142,247,0.05)" }} />
                <Bar dataKey="count" name="count" radius={[6,6,0,0]}>
                  {typeData.map((t, i) => <Cell key={i} fill={t.fill} />)}
                </Bar>
              </BarChart>
            ) : activeChart === "approval" ? (
              <BarChart data={approvalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                <XAxis dataKey="name" tick={{ fill: "var(--on-surface-variant)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--on-surface-variant)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(79,142,247,0.05)" }} />
                <Bar dataKey="rate" name="Approval Rate" fill="#10b981" radius={[6,6,0,0]} />
              </BarChart>
            ) : (
              <BarChart data={citySummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                <XAxis dataKey="name" tick={{ fill: "var(--on-surface-variant)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--on-surface-variant)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(79,142,247,0.05)" }} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[6,6,0,0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* City Summary Table */}
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline-variant">
            <h3 className="text-lg font-black text-on-surface">City-wise Summary</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Complete breakdown per city tenant</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container">
                  {["City","Total","Approved","Rejected","Pending","Approval %","Collection (₹)"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-b border-outline-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...citySummary].sort((a, b) => b.collection - a.collection).map((c, i) => (
                  <motion.tr key={c.city}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-high transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-on-surface">{c.city}</td>
                    <td className="px-4 py-3 text-on-surface-variant tabular-nums">{c.total}</td>
                    <td className="px-4 py-3 text-secondary font-semibold tabular-nums">{c.approved}</td>
                    <td className="px-4 py-3 text-tertiary font-semibold tabular-nums">{c.rejected}</td>
                    <td className="px-4 py-3 text-amber-500 font-semibold tabular-nums">{c.pending}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-outline-variant rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${(c.approved / c.total) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-on-surface tabular-nums">{((c.approved / c.total) * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-primary tabular-nums">₹{c.collection.toLocaleString("en-IN")}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.main>
  );
};

export default Insights;

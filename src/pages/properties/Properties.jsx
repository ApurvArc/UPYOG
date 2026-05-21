import React from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";
import { Search, Filter } from "lucide-react";

const STATUSES = ["All", "Approved", "Rejected", "Pending"];
const TYPES    = ["All", "Residential", "Commercial", "Industrial", "Agricultural", "Mixed Use"];

const Properties = () => {
  const {
    filteredProperties, selectedTenant, setSelectedTenant, tenants,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    typeFilter, setTypeFilter, sortOrder, setSortOrder,
  } = useAppContext();

  const [page, setPage] = React.useState(1);
  const PER_PAGE = 15;
  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PER_PAGE));
  const paged = filteredProperties.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  React.useEffect(() => setPage(1), [filteredProperties]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen pt-20"
    >
      <div className="mx-auto w-full max-w-7xl px-8 pb-12 max-md:px-4">
        <div className="mb-6 pt-6">
          <h2 className="text-2xl font-black tracking-tight text-on-surface">Property Ledger</h2>
          <p className="text-sm text-on-surface-variant mt-1">{filteredProperties.length} records · {selectedTenant}</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface border border-outline-variant rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <Filter size={14} className="text-on-surface-variant" />

          {/* City */}
          <select
            id="filter-city"
            value={selectedTenant}
            onChange={e => setSelectedTenant(e.target.value)}
            className="bg-surface-container-high border border-outline-variant text-on-surface text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer"
          >
            {tenants.map(t => <option key={t}>{t}</option>)}
          </select>

          {/* Status */}
          <select
            id="filter-status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-surface-container-high border border-outline-variant text-on-surface text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer"
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Type */}
          <select
            id="filter-type"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-surface-container-high border border-outline-variant text-on-surface text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer"
          >
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>

          {/* Sort */}
          <select
            id="filter-sort"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="bg-surface-container-high border border-outline-variant text-on-surface text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="tax-high">Tax: High → Low</option>
            <option value="tax-low">Tax: Low → High</option>
            <option value="area-high">Area: Largest</option>
          </select>

          {/* Search */}
          <div className="flex items-center bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 gap-2 flex-1 min-w-[180px]">
            <Search size={13} className="text-on-surface-variant flex-shrink-0" />
            <input
              id="property-search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search owner, ID, ward..."
              className="bg-transparent outline-none text-xs text-on-surface w-full placeholder:text-on-surface-variant"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container">
                  {["Property ID","Owner","Type","City","Ward","Status","Area (sqft)","Annual Tax","Collection","Date"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-b border-outline-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((p, i) => (
                  <motion.tr
                    key={p.property_id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.25 }}
                    className="hover:bg-surface-container-high transition-colors border-b border-outline-variant/50 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-primary">{p.property_id}</td>
                    <td className="px-4 py-3 font-medium text-on-surface whitespace-nowrap">{p.owner_name}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{p.property_type}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{p.tenant}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{p.ward}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${
                        p.status === "Approved" ? "bg-secondary/10 text-secondary" :
                        p.status === "Rejected" ? "bg-tertiary/10 text-tertiary" :
                        "bg-amber-500/10 text-amber-500"
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs tabular-nums">{p.area_sqft.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-on-surface font-semibold text-xs tabular-nums">₹{p.annual_tax_inr.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 font-bold text-xs tabular-nums" style={{ color: p.collection_inr > 0 ? "var(--secondary)" : "var(--on-surface-variant)" }}>
                      {p.collection_inr > 0 ? `₹${p.collection_inr.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs whitespace-nowrap">{p.registration_date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant bg-surface-container">
            <p className="text-xs text-on-surface-variant">
              {filteredProperties.length === 0
                ? "No results found"
                : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filteredProperties.length)} of ${filteredProperties.length}`
              }
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg text-xs font-bold border border-outline-variant text-on-surface-variant disabled:opacity-40 hover:bg-surface-container-high transition-colors"
              >← Prev</button>
              <span className="px-3 py-1 text-xs font-bold text-on-surface">{page}/{totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg text-xs font-bold border border-outline-variant text-on-surface-variant disabled:opacity-40 hover:bg-surface-container-high transition-colors"
              >Next →</button>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
};

export default Properties;

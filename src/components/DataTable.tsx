import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Calendar,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { FilterOptions, RoiEntry } from '../types';
import {
  formatDate,
  formatInr,
  formatNumber,
  STANDARD_CATEGORIES,
} from '../utils/calculations';

interface DataTableProps {
  entries: RoiEntry[];
  onEdit: (entry: RoiEntry) => void;
  onDelete: (entry: RoiEntry) => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  allParties: string[];
}

export const DataTable: React.FC<DataTableProps> = ({
  entries,
  onEdit,
  onDelete,
  filters,
  setFilters,
  allParties,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<'invDate' | 'valueInInr' | 'finalPerKgRate'>('invDate');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter logic
  const filteredEntries = entries.filter((entry) => {
    // Search query matches party, invoice, items, notes
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchParty = entry.partyName.toLowerCase().includes(q);
      const matchInv = entry.invoiceNo.toLowerCase().includes(q);
      const matchNotes = (entry.notes || '').toLowerCase().includes(q);
      const matchItem = entry.items?.some(
        (i) => i.itemName.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      );
      if (!matchParty && !matchInv && !matchNotes && !matchItem) return false;
    }

    // Party filter
    if (filters.partyName && entry.partyName !== filters.partyName) {
      return false;
    }

    // Invoice No filter
    if (filters.invoiceNo && !entry.invoiceNo.toLowerCase().includes(filters.invoiceNo.toLowerCase())) {
      return false;
    }

    // Date filters
    if (filters.startDate && entry.invDate < filters.startDate) {
      return false;
    }
    if (filters.endDate && entry.invDate > filters.endDate) {
      return false;
    }

    // Category filter
    if (filters.category) {
      const hasCategory = entry.items?.some((i) => i.category === filters.category);
      if (!hasCategory) return false;
    }

    return true;
  });

  // Sorting
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    let diff = 0;
    if (sortField === 'invDate') {
      diff = new Date(a.invDate).getTime() - new Date(b.invDate).getTime();
    } else if (sortField === 'valueInInr') {
      diff = a.valueInInr - b.valueInInr;
    } else if (sortField === 'finalPerKgRate') {
      diff = a.finalPerKgRate - b.finalPerKgRate;
    }
    return sortAsc ? diff : -diff;
  });

  const handleSort = (field: 'invDate' | 'valueInInr' | 'finalPerKgRate') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    Boolean(filters.partyName) ||
    Boolean(filters.invoiceNo) ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate) ||
    Boolean(filters.category);

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      startDate: '',
      endDate: '',
      partyName: '',
      invoiceNo: '',
      category: '',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Filter Controls Bar */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export Shipments Costing Ledger
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {sortedEntries.length} of {entries.length} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
                placeholder="Search party, invoice, item..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, searchQuery: '' }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Drawer Toggle */}
            <button
              id="btn-toggle-filters"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                hasActiveFilters || showFilters
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs animate-in fade-in duration-150">
            {/* Party Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Filter by Party
              </label>
              <select
                value={filters.partyName}
                onChange={(e) => setFilters((f) => ({ ...f, partyName: e.target.value }))}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              >
                <option value="">All Parties</option>
                {allParties.map((party) => (
                  <option key={party} value={party}>
                    {party}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Filter by Item Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              >
                <option value="">All Categories</option>
                {STANDARD_CATEGORIES.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Start */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>

            {/* Clear button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full p-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE CARD VIEW (Optimized for Phones / Touch screens) */}
      <div className="md:hidden divide-y divide-slate-200">
        {sortedEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No shipment entries found matching criteria.
          </div>
        ) : (
          sortedEntries.map((entry) => {
            const isExpanded = expandedRowId === entry.id;
            return (
              <div key={entry.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                      {entry.invoiceNo}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {entry.partyName}
                    </h4>
                    <span className="text-xs text-slate-500">{formatDate(entry.invDate)}</span>
                  </div>

                  {/* Final Rate Highlight */}
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-800 font-bold block">
                      NET REALIZED RATE / KG
                    </span>
                    <span className="text-sm font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                      ₹{formatNumber(entry.finalPerKgRate, 3)}
                    </span>
                    <span className="text-[10px] text-blue-700 block mt-0.5 font-mono">
                      Gross: ₹{formatNumber(entry.withoutExpPerKg, 2)}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Net Weight</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatNumber(entry.totalQtyKg, 2)} KG
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Gross Inv Value</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatInr(entry.valueInInr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-700 block">Gross Rate (Without Exp)</span>
                    <span className="font-mono font-bold text-blue-800">
                      ₹{formatNumber(entry.withoutExpPerKg, 2)}/KG
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 block">Total Expense</span>
                    <span className="font-mono font-bold text-rose-600">
                      {formatInr(entry.totalExpense)}
                    </span>
                  </div>
                </div>

                {/* Expanded Details on Mobile */}
                {isExpanded && (
                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2 border border-slate-200">
                    <div className="font-semibold text-slate-700">Expense Breakdown:</div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                      <div>Transport Freight: ₹{formatNumber(entry.expenses.transportFreight)}</div>
                      <div>CHA Expense: ₹{formatNumber(entry.expenses.chaExpense)}</div>
                      <div>CIF / Ocean: ₹{formatNumber(entry.expenses.cifOceanFreight)}</div>
                      <div>Other exp: ₹{formatNumber(entry.expenses.otherExp)}</div>
                      <div>FSU: ₹{formatNumber(entry.expenses.fsu)}</div>
                      <div>Sampling: ₹{formatNumber(entry.expenses.sampling)}</div>
                      <div>Cup/Tray: ₹{formatNumber(entry.expenses.cupTray)}</div>
                      <div>Other Expenses: ₹{formatNumber(entry.expenses.otherExpenses)}</div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold">
                      <span>Net Realization (Value − Exp):</span>
                      <span className="text-amber-700 font-mono">{formatInr(entry.netValueInr)}</span>
                    </div>

                    {entry.items && entry.items.length > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Items in Shipment:
                        </span>
                        {entry.items.map((it) => (
                          <div key={it.id} className="text-[11px] flex justify-between text-slate-700 py-0.5">
                            <span>{it.category} ({it.packingSizeGm}g)</span>
                            <span className="font-mono">{formatNumber(it.netWeightKg, 2)} KG</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setExpandedRowId(isExpanded ? null : entry.id)}
                    className="text-xs text-indigo-600 font-medium flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Full Breakdown'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1 text-xs font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(entry)}
                      className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center gap-1 text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP DATA TABLE (Formatted strictly aligned with PDF) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header exactly matching the PDF */}
          <thead>
            <tr className="bg-slate-900 text-white border-b border-slate-800">
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                PARTY NAME
              </th>
              <th
                onClick={() => handleSort('invDate')}
                className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap cursor-pointer hover:bg-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>Inv Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                INVOICE NO
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right">
                TOTAL NET WEIGHT (KG)
              </th>
              <th
                onClick={() => handleSort('valueInInr')}
                className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right cursor-pointer hover:bg-slate-800"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>GROSS VALUE IN INR</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-blue-900/60 text-blue-200">
                GROSS RATE / KG (WITHOUT EXP)
              </th>
              {/* Freight Expenses Group */}
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-slate-800/80 text-slate-200">
                TRANSPORT FREIGHT
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-slate-800/80 text-slate-200">
                CHA EXP
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-slate-800/80 text-slate-200">
                CIF EXP (Ocian Freight)
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-slate-800/80 text-slate-200">
                Other exp
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-slate-800 text-rose-300 font-extrabold">
                TOTAL
              </th>
              {/* Handling Expenses Group */}
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-slate-850 text-slate-300">
                FSU
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-slate-850 text-slate-300">
                Sampling
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-slate-850 text-slate-300">
                Cup / Tray
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-slate-850 text-slate-300">
                Other Expenses
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-rose-950 text-rose-300 font-extrabold">
                TOTAL EXPENSE
              </th>
              {/* Result Realization & Rate */}
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-slate-800 text-amber-300">
                NET VALUE (VALUE − EXP)
              </th>
              {/* Green Cell matching PDF */}
              <th
                onClick={() => handleSort('finalPerKgRate')}
                className="p-2.5 font-extrabold uppercase tracking-wider text-[11px] whitespace-nowrap text-right bg-emerald-800 text-white cursor-pointer hover:bg-emerald-700"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>NET REALIZED RATE / KG (AFTER EXP)</span>
                  <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                </div>
              </th>
              <th className="p-2.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-center">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {sortedEntries.length === 0 ? (
              <tr>
                <td colSpan={19} className="p-8 text-center text-slate-400 font-sans">
                  No records match the applied criteria. Click &quot;New Entry&quot; to add a shipment.
                </td>
              </tr>
            ) : (
              sortedEntries.map((entry, index) => {
                const freightTotal =
                  (Number(entry.expenses.transportFreight) || 0) +
                  (Number(entry.expenses.chaExpense) || 0) +
                  (Number(entry.expenses.cifOceanFreight) || 0) +
                  (Number(entry.expenses.otherExp) || 0);

                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    {/* PARTY NAME */}
                    <td className="p-2.5 font-sans font-bold text-slate-900 whitespace-nowrap">
                      {entry.partyName}
                    </td>

                    {/* Inv Date */}
                    <td className="p-2.5 text-slate-700 whitespace-nowrap">
                      {formatDate(entry.invDate)}
                    </td>

                    {/* INVOICE NO */}
                    <td className="p-2.5 text-indigo-700 font-semibold whitespace-nowrap">
                      {entry.invoiceNo}
                    </td>

                    {/* TOTAL QTY in KG */}
                    <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatNumber(entry.totalQtyKg, 2)}
                    </td>

                    {/* VALUE IN INR */}
                    <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatNumber(entry.valueInInr, 2)}
                    </td>

                    {/* WITHOUT EXP Per KG */}
                    <td className="p-2.5 text-right text-slate-700 whitespace-nowrap">
                      {formatNumber(entry.withoutExpPerKg, 2)}
                    </td>

                    {/* TRANSPORT FREIGHT */}
                    <td className="p-2.5 text-right text-slate-600 whitespace-nowrap bg-slate-50/50">
                      {formatNumber(entry.expenses.transportFreight, 0)}
                    </td>

                    {/* CHA EXP */}
                    <td className="p-2.5 text-right text-slate-600 whitespace-nowrap bg-slate-50/50">
                      {formatNumber(entry.expenses.chaExpense, 0)}
                    </td>

                    {/* CIF EXP (Ocian Freight) */}
                    <td className="p-2.5 text-right text-slate-600 whitespace-nowrap bg-slate-50/50">
                      {formatNumber(entry.expenses.cifOceanFreight, 0)}
                    </td>

                    {/* Other exp */}
                    <td className="p-2.5 text-right text-slate-600 whitespace-nowrap bg-slate-50/50">
                      {formatNumber(entry.expenses.otherExp, 0)}
                    </td>

                    {/* TOTAL (Freight) */}
                    <td className="p-2.5 text-right font-bold text-rose-700 whitespace-nowrap bg-rose-50/40">
                      {formatNumber(freightTotal, 0)}
                    </td>

                    {/* FSU */}
                    <td className="p-2.5 text-right text-slate-600 whitespace-nowrap">
                      {formatNumber(entry.expenses.fsu, 0)}
                    </td>

                    {/* Sampling */}
                    <td className="p-2.5 text-right text-slate-600 whitespace-nowrap">
                      {formatNumber(entry.expenses.sampling, 0)}
                    </td>

                    {/* Cup/Tray */}
                    <td className="p-2.5 text-right text-slate-600 whitespace-nowrap">
                      {formatNumber(entry.expenses.cupTray, 0)}
                    </td>

                    {/* Other Expenses */}
                    <td className="p-2.5 text-right text-slate-600 whitespace-nowrap">
                      {formatNumber(entry.expenses.otherExpenses, 0)}
                    </td>

                    {/* TOTAL EXPENSE */}
                    <td className="p-2.5 text-right font-bold text-rose-700 whitespace-nowrap bg-rose-50">
                      {formatNumber(entry.totalExpense, 0)}
                    </td>

                    {/* INVOICE VALUE - EXPENSE */}
                    <td className="p-2.5 text-right font-bold text-amber-800 whitespace-nowrap bg-amber-50/40">
                      {formatNumber(entry.netValueInr, 2)}
                    </td>

                    {/* FINAL PER KG RATE - Styled like PDF emerald green cell */}
                    <td className="p-2.5 text-right font-extrabold text-emerald-950 whitespace-nowrap bg-emerald-200/80 border-l border-r border-emerald-300">
                      {formatNumber(entry.finalPerKgRate, 3)}
                    </td>

                    {/* Action buttons (Edit & Delete) */}
                    <td className="p-2.5 text-center whitespace-nowrap font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(entry)}
                          className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Entry"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(entry)}
                          className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

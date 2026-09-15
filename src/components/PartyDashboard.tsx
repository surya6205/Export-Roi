import React, { useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  Search,
  Filter,
  X,
  Layers,
  TrendingUp,
  CreditCard,
  DollarSign,
  Scale,
  Package,
  Receipt,
  Percent,
  Calculator,
  Edit2,
  Trash2,
  BarChart3,
  PieChart as PieIcon,
  ArrowRight,
  Sparkles,
  Plus,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { RoiEntry } from '../types';
import { formatDate, formatInr, formatNumber } from '../utils/calculations';

interface PartyDashboardProps {
  entries: RoiEntry[];
  allParties: string[];
  selectedParty: string;
  setSelectedParty: (party: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onEdit: (entry: RoiEntry) => void;
  onDelete: (entry: RoiEntry) => void;
  onOpenNewEntry: () => void;
}

const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

export const PartyDashboard: React.FC<PartyDashboardProps> = ({
  entries,
  allParties,
  selectedParty,
  setSelectedParty,
  selectedMonth,
  setSelectedMonth,
  onEdit,
  onDelete,
  onOpenNewEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'breakdown' | 'charts'>('invoices');

  // Available months from entries
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, string>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    entries.forEach((e) => {
      if (!e.invDate) return;
      const d = new Date(e.invDate);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthMap.set(key, label);
    });
    return Array.from(monthMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [entries]);

  // Filter entries by party, month, and search query
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (selectedParty && e.partyName.toLowerCase() !== selectedParty.toLowerCase()) {
        return false;
      }
      if (selectedMonth) {
        if (!e.invDate || !e.invDate.startsWith(selectedMonth)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchParty = e.partyName.toLowerCase().includes(q);
        const matchInv = e.invoiceNo.toLowerCase().includes(q);
        const matchNotes = (e.notes || '').toLowerCase().includes(q);
        if (!matchParty && !matchInv && !matchNotes) return false;
      }
      return true;
    });
  }, [entries, selectedParty, selectedMonth, searchQuery]);

  // Consolidated KPIs for the filtered dataset
  const totalInvoiceVal = filteredEntries.reduce((acc, curr) => acc + (curr.valueInInr || 0), 0);
  const totalNetKg = filteredEntries.reduce((acc, curr) => acc + (curr.totalQtyKg || 0), 0);
  const totalExp = filteredEntries.reduce((acc, curr) => acc + (curr.totalExpense || 0), 0);
  const netRealizedVal = totalInvoiceVal - totalExp;

  const withoutExpRate = totalNetKg > 0 ? totalInvoiceVal / totalNetKg : 0;
  const finalRealizedRate = totalNetKg > 0 ? netRealizedVal / totalNetKg : 0;
  const expensePercentage = totalInvoiceVal > 0 ? (totalExp / totalInvoiceVal) * 100 : 0;
  const realizationPercentage = totalInvoiceVal > 0 ? (netRealizedVal / totalInvoiceVal) * 100 : 0;

  // Aggregate Items Quantities and Weights
  const itemSummary = useMemo(() => {
    let namkeenQty = 0;
    let namkeenKg = 0;
    let chikkiQty = 0;
    let chikkiKg = 0;
    let laddooQty = 0;
    let laddooKg = 0;

    filteredEntries.forEach((e) => {
      namkeenQty += e.namkeenQty || 0;
      namkeenKg += e.namkeenKg || 0;
      chikkiQty += e.chikkiQty || 0;
      chikkiKg += e.chikkiKg || 0;
      laddooQty += e.laddooQty || 0;
      laddooKg += e.laddooKg || 0;
    });

    const sumKg = (namkeenKg + chikkiKg + laddooKg) || totalNetKg || 1;

    return {
      namkeen: {
        name: '340/300 GM Namkeen',
        qty: namkeenQty,
        kg: namkeenKg,
        pct: Number(((namkeenKg / sumKg) * 100).toFixed(1)),
      },
      chikki: {
        name: 'Chikki (150/75g)',
        qty: chikkiQty,
        kg: chikkiKg,
        pct: Number(((chikkiKg / sumKg) * 100).toFixed(1)),
      },
      laddoo: {
        name: 'Laddoo (120/60g)',
        qty: laddooQty,
        kg: laddooKg,
        pct: Number(((laddooKg / sumKg) * 100).toFixed(1)),
      },
      totalItemsKg: namkeenKg + chikkiKg + laddooKg,
    };
  }, [filteredEntries, totalNetKg]);

  // Aggregate Expenses
  const expSummary = useMemo(() => {
    let transport = 0;
    let cha = 0;
    let cif = 0;
    let other = 0;
    let handling = 0;

    filteredEntries.forEach((e) => {
      transport += Number(e.expenses?.transportFreight) || 0;
      cha += Number(e.expenses?.chaExpense) || 0;
      cif += Number(e.expenses?.cifOceanFreight) || 0;
      other += Number(e.expenses?.otherExp) || 0;
      handling +=
        Number(e.expenses?.fsuSamplingCupTray) ||
        (Number(e.expenses?.fsu) || 0) +
          (Number(e.expenses?.sampling) || 0) +
          (Number(e.expenses?.cupTray) || 0) +
          (Number(e.expenses?.otherExpenses) || 0);
    });

    const total = transport + cha + cif + other + handling || 1;

    return [
      { name: 'Transport Freight', amount: transport, pct: (transport / total) * 100, perKg: totalNetKg > 0 ? transport / totalNetKg : 0 },
      { name: 'CHA Expense', amount: cha, pct: (cha / total) * 100, perKg: totalNetKg > 0 ? cha / totalNetKg : 0 },
      { name: 'CIF / Ocean Freight', amount: cif, pct: (cif / total) * 100, perKg: totalNetKg > 0 ? cif / totalNetKg : 0 },
      { name: 'Other Expense', amount: other, pct: (other / total) * 100, perKg: totalNetKg > 0 ? other / totalNetKg : 0 },
      { name: 'FSU / Sampling / Cup / Tray', amount: handling, pct: (handling / total) * 100, perKg: totalNetKg > 0 ? handling / totalNetKg : 0 },
    ];
  }, [filteredEntries, totalNetKg]);

  // Chart Data: Invoice-wise or Party-wise
  const chartData = useMemo(() => {
    return filteredEntries.map((e) => ({
      invoiceNo: e.invoiceNo,
      partyName: e.partyName,
      date: formatDate(e.invDate),
      invoiceVal: e.valueInInr,
      totalExp: e.totalExpense,
      netVal: e.netValueInr,
      finalRate: e.finalPerKgRate,
      weightKg: e.totalQtyKg,
    }));
  }, [filteredEntries]);

  // Weight distribution pie data
  const pieData = useMemo(() => {
    return [
      { name: '340/300 GM Namkeen', value: itemSummary.namkeen.kg },
      { name: 'Chikki', value: itemSummary.chikki.kg },
      { name: 'Laddoo', value: itemSummary.laddoo.kg },
    ].filter((d) => d.value > 0);
  }, [itemSummary]);

  return (
    <div className="space-y-6">
      {/* 1. PROMINENT PARTY SEARCH & DATE/MONTH FILTER BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Prominent Party Search / Selector */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                Select / Search Export Party
              </label>
              {selectedParty && (
                <button
                  onClick={() => setSelectedParty('')}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Show All Parties</span>
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                list="dashboard-parties-list"
                value={selectedParty || searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  // If exact party matches, select it
                  if (allParties.includes(val)) {
                    setSelectedParty(val);
                    setSearchQuery('');
                  } else {
                    setSearchQuery(val);
                    if (selectedParty && val !== selectedParty) {
                      setSelectedParty('');
                    }
                  }
                }}
                placeholder="Search or select buyer (e.g. Multiplex, Al Maya Trading Dubai, Lulu...)"
                className="w-full pl-9 pr-24 py-2.5 text-xs sm:text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs bg-white text-slate-900"
              />
              <datalist id="dashboard-parties-list">
                {allParties.map((party) => (
                  <option key={party} value={party} />
                ))}
              </datalist>

              {/* Clear button inside input */}
              {(selectedParty || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedParty('');
                    setSearchQuery('');
                  }}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-xs text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Month / Period Filter */}
          <div className="w-full sm:w-64 space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Date / Month Filter
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 shadow-2xs"
              >
                <option value="">All Months &amp; Years</option>
                {availableMonths.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Party Selector Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">
            Quick Filter:
          </span>
          <button
            onClick={() => {
              setSelectedParty('');
              setSearchQuery('');
            }}
            className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-colors ${
              !selectedParty
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Parties ({entries.length})
          </button>

          {allParties.map((party) => {
            const count = entries.filter((e) => e.partyName === party).length;
            const isSelected = selectedParty.toLowerCase() === party.toLowerCase();
            return (
              <button
                key={party}
                onClick={() => {
                  setSelectedParty(party);
                  setSearchQuery('');
                }}
                className={`px-3 py-1 rounded-lg font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{party}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACTIVE CONTEXT BANNER */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                selectedParty
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}
            >
              {selectedParty ? 'Party Specific ROI Profile' : 'Consolidated Export ROI Profile'}
            </span>
            {selectedMonth && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                Month: {availableMonths.find(([k]) => k === selectedMonth)?.[1] || selectedMonth}
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span>{selectedParty || 'All Export Buyers & Destinations'}</span>
            <span className="text-xs font-normal text-slate-500">
              ({filteredEntries.length} {filteredEntries.length === 1 ? 'Shipment' : 'Shipments'} Found)
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewEntry}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add ROI Entry</span>
          </button>
        </div>
      </div>

      {/* 3. CORE ROI METRICS CARDS (Calculated for Selected Party / Filter) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Total Invoice Value */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Invoice Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            {formatInr(totalInvoiceVal)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {filteredEntries.length} shipment invoice(s)
          </div>
        </div>

        {/* Total Net Weight */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Net Weight
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            {formatNumber(totalNetKg, 2)}{' '}
            <span className="text-xs font-medium text-slate-500 font-sans">KG</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 font-semibold">
            Consolidated Net Weight
          </div>
        </div>

        {/* Gross Rate / KG (Without Exp) - PROMINENT AS REQUESTED */}
        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-2xs bg-gradient-to-br from-white to-blue-50/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                Gross Rate / KG
              </span>
              <span className="text-[10px] text-blue-600 font-medium">Without Expense</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-blue-950 font-mono">
            ₹{formatNumber(withoutExpRate, 2)}
            <span className="text-xs font-normal text-slate-500 ml-1 font-sans">/ KG</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-700 font-medium">
            Invoice Rate before expenses
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Expense
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-rose-600 font-mono">
            {formatInr(totalExp)}
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <Percent className="w-3 h-3" />
            <span>{expensePercentage.toFixed(1)}% of Invoice Value</span>
          </div>
        </div>

        {/* Net Value (Realized) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Net Value (Realized)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            {formatInr(netRealizedVal)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold">
            {realizationPercentage.toFixed(1)}% Net Realization
          </div>
        </div>

        {/* Net Realized Rate / KG (After Exp) - RENAMED FROM FINAL RATE */}
        <div className="bg-emerald-900 rounded-xl p-4 border border-emerald-700 shadow-sm text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider block">
                  Net Realized Rate / KG
                </span>
                <span className="text-[10px] text-emerald-300 font-medium">After All Expenses</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-300 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-300 font-mono">
              ₹{formatNumber(finalRealizedRate, 3)}
              <span className="text-xs font-normal text-emerald-200 ml-1 font-sans">/ KG</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-200">
            Final Yield after all Ocean &amp; CHA charges
          </div>
        </div>
      </div>

      {/* Realization Rate Bridge Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <span className="px-2 py-0.5 rounded bg-blue-900/80 text-blue-300 text-[11px] font-bold uppercase tracking-wider border border-blue-700/60">
            Rate Realization Bridge
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Export Realization Analysis (Per KG Impact):
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <span className="text-slate-400 font-sans text-[11px]">Gross Rate (Without Exp):</span>
            <span className="font-bold text-blue-300">₹{formatNumber(withoutExpRate, 2)}/KG</span>
          </div>
          <span className="text-slate-500 font-sans font-bold">−</span>
          <div className="flex items-center gap-1.5 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/50">
            <span className="text-rose-300/90 font-sans text-[11px]">Expense Load:</span>
            <span className="font-bold text-rose-300">₹{formatNumber(totalNetKg > 0 ? totalExp / totalNetKg : 0, 2)}/KG</span>
            <span className="text-[10px] text-rose-400 font-sans">({expensePercentage.toFixed(1)}%)</span>
          </div>
          <span className="text-slate-500 font-sans font-bold">=</span>
          <div className="flex items-center gap-1.5 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-600/80 shadow-xs">
            <span className="text-emerald-300 font-sans font-bold text-[11px]">Net Realized Rate:</span>
            <span className="font-extrabold text-emerald-300 text-sm">₹{formatNumber(finalRealizedRate, 3)}/KG</span>
          </div>
        </div>
      </div>

      {/* 4. SUB-SECTION NAVIGATION */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'invoices'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Invoice-Wise Details ({filteredEntries.length})
          </button>
          <button
            onClick={() => setActiveSubTab('breakdown')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'breakdown'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Items &amp; Expense Breakdown
          </button>
          <button
            onClick={() => setActiveSubTab('charts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'charts'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            ROI Charts &amp; Analysis
          </button>
        </div>
      </div>

      {/* VIEW A: INVOICE-WISE DETAILS TABLE */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {selectedParty ? `${selectedParty} — Invoice Ledger` : 'All Export Shipment Invoices'}
            </h3>
            <span className="text-[11px] text-slate-500">
              Matches Reference ROI PDF PI/E-22/26-27 format
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider whitespace-nowrap">
                  <th className="py-3 px-3">Party Name</th>
                  <th className="py-3 px-3">Inv Date</th>
                  <th className="py-3 px-3">Invoice No</th>
                  <th className="py-3 px-3 text-right">Namkeen (KG)</th>
                  <th className="py-3 px-3 text-right">Chikki (KG)</th>
                  <th className="py-3 px-3 text-right">Laddoo (KG)</th>
                  <th className="py-3 px-3 text-right bg-indigo-50 text-indigo-900">Total Net KG</th>
                  <th className="py-3 px-3 text-right">Gross Inv Value</th>
                  <th className="py-3 px-3 text-right bg-blue-50/70 text-blue-900">Gross Rate / KG (Without Exp)</th>
                  <th className="py-3 px-3 text-right text-rose-700">Total Exp</th>
                  <th className="py-3 px-3 text-right">Net Value</th>
                  <th className="py-3 px-3 text-right bg-emerald-100 text-emerald-950 font-extrabold">Net Realized Rate / KG (After Exp)</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-slate-400 text-xs">
                      No invoices found matching selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors whitespace-nowrap">
                      {/* Party Name */}
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <button
                          onClick={() => setSelectedParty(entry.partyName)}
                          className="hover:text-emerald-700 hover:underline text-left"
                          title="Click to filter by this party"
                        >
                          {entry.partyName}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {formatDate(entry.invDate)}
                      </td>

                      {/* Invoice No */}
                      <td className="py-3 px-3 font-mono font-semibold text-indigo-700">
                        {entry.invoiceNo}
                      </td>

                      {/* Namkeen (KG) */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {entry.namkeenKg ? `${formatNumber(entry.namkeenKg, 1)} KG` : '—'}
                      </td>

                      {/* Chikki (KG) */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {entry.chikkiKg ? `${formatNumber(entry.chikkiKg, 1)} KG` : '—'}
                      </td>

                      {/* Laddoo (KG) */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {entry.laddooKg ? `${formatNumber(entry.laddooKg, 1)} KG` : '—'}
                      </td>

                      {/* Total Net KG */}
                      <td className="py-3 px-3 text-right font-mono font-bold bg-indigo-50/50 text-indigo-900">
                        {formatNumber(entry.totalQtyKg, 2)} KG
                      </td>

                      {/* Invoice Value */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatInr(entry.valueInInr)}
                      </td>

                      {/* Gross Rate / KG (Without Exp) */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-900 bg-blue-50/40">
                        ₹{formatNumber(entry.withoutExpPerKg, 2)}
                      </td>

                      {/* Total Exp */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-rose-600">
                        {formatInr(entry.totalExpense)}
                      </td>

                      {/* Net Value */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                        {formatInr(entry.netValueInr)}
                      </td>

                      {/* Net Realized Rate / KG (After Exp) */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-950 bg-emerald-50">
                        ₹{formatNumber(entry.finalPerKgRate, 3)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEdit(entry)}
                            className="p-1.5 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Edit this shipment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(entry)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete this shipment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW B: ITEM & EXPENSE BREAKDOWN */}
      {activeSubTab === 'breakdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card: Item-wise Quantity & Weight Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                Item-Wise Quantity &amp; Net Weight Analysis
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Total: {formatNumber(totalNetKg, 2)} KG
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Namkeen */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{itemSummary.namkeen.name}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Packets: ≈ {formatNumber(itemSummary.namkeen.qty, 0)} pouches
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      {formatNumber(itemSummary.namkeen.kg, 2)} KG
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {itemSummary.namkeen.pct}% of total weight
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(itemSummary.namkeen.pct, 100)}%` }}
                  />
                </div>
              </div>

              {/* Chikki */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{itemSummary.chikki.name}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Packets: ≈ {formatNumber(itemSummary.chikki.qty, 0)} pouches
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-indigo-700 text-sm">
                      {formatNumber(itemSummary.chikki.kg, 2)} KG
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {itemSummary.chikki.pct}% of total weight
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.min(itemSummary.chikki.pct, 100)}%` }}
                  />
                </div>
              </div>

              {/* Laddoo */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{itemSummary.laddoo.name}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Packets: ≈ {formatNumber(itemSummary.laddoo.qty, 0)} pouches
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-700 text-sm">
                      {formatNumber(itemSummary.laddoo.kg, 2)} KG
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {itemSummary.laddoo.pct}% of total weight
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${Math.min(itemSummary.laddoo.pct, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Expense Details Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-rose-600" />
                Expense Details &amp; Cost Per KG Impact
              </h3>
              <span className="text-[11px] text-rose-600 font-mono font-bold">
                Total: {formatInr(totalExp)}
              </span>
            </div>

            <div className="space-y-3">
              {expSummary.map((exp) => (
                <div key={exp.name} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{exp.name}</span>
                    <span className="font-mono font-bold text-slate-900">{formatInr(exp.amount)}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                    <span>{exp.pct.toFixed(1)}% of total expenses</span>
                    <span className="font-mono text-rose-700 font-semibold">
                      ₹{formatNumber(exp.perKg, 2)} / KG impact
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex justify-between items-center">
              <span className="font-bold">Total Expense per KG Load:</span>
              <span className="font-mono font-extrabold text-sm">
                ₹{totalNetKg > 0 ? formatNumber(totalExp / totalNetKg, 2) : 0} / KG
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: CHARTS & ANALYSIS */}
      {activeSubTab === 'charts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Value vs Expenses */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Invoice Value vs Expense vs Net Realized (INR)
              </h4>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey={selectedParty ? 'invoiceNo' : 'partyName'}
                      tick={{ fontSize: 11, fill: '#475569' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#475569' }}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: number) => formatInr(val)}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="invoiceVal" name="Invoice Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalExp" name="Total Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="netVal" name="Net Realized" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Final Rate Trend (₹/KG) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Final Realization Rate (₹/KG) Trend
              </h4>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey={selectedParty ? 'invoiceNo' : 'partyName'}
                      tick={{ fontSize: 11, fill: '#475569' }}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#475569' }}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip
                      formatter={(val: number) => [`₹${formatNumber(val, 3)} / KG`, 'Final Rate']}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="finalRate"
                      name="Final Rate (₹/KG)"
                      stroke="#059669"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#059669' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 3: Item Net Weight Distribution */}
          {pieData.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                Product Net Weight Distribution (KG)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={(entry) => `${entry.name} (${formatNumber(entry.value, 0)} kg)`}
                      labelLine={true}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${formatNumber(val, 2)} KG`, 'Net Weight']}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

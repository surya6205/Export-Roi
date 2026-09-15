import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { RoiEntry } from '../types';
import { formatInr, formatNumber } from '../utils/calculations';
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react';

interface AnalyticsChartsProps {
  entries: RoiEntry[];
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ entries }) => {
  const [chartView, setChartView] = useState<'party' | 'item' | 'month'>('party');

  // 1. Party-wise aggregation
  const partyMap: {
    [party: string]: {
      party: string;
      invoiceValue: number;
      totalExpense: number;
      netValue: number;
      totalWeight: number;
      shipmentsCount: number;
    };
  } = {};

  entries.forEach((e) => {
    if (!partyMap[e.partyName]) {
      partyMap[e.partyName] = {
        party: e.partyName,
        invoiceValue: 0,
        totalExpense: 0,
        netValue: 0,
        totalWeight: 0,
        shipmentsCount: 0,
      };
    }
    partyMap[e.partyName].invoiceValue += e.valueInInr || 0;
    partyMap[e.partyName].totalExpense += e.totalExpense || 0;
    partyMap[e.partyName].netValue += e.netValueInr || 0;
    partyMap[e.partyName].totalWeight += e.totalQtyKg || 0;
    partyMap[e.partyName].shipmentsCount += 1;
  });

  const partyData = Object.values(partyMap).map((p) => ({
    ...p,
    avgFinalRate: p.totalWeight > 0 ? Number((p.netValue / p.totalWeight).toFixed(2)) : 0,
  }));

  // 2. Item Category aggregation
  const categoryMap: {
    [cat: string]: {
      name: string;
      weightKg: number;
      valueInr: number;
    };
  } = {};

  entries.forEach((e) => {
    if (e.items && e.items.length > 0) {
      e.items.forEach((item) => {
        const cat = item.category || 'Other Export Items';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { name: cat, weightKg: 0, valueInr: 0 };
        }
        categoryMap[cat].weightKg += item.netWeightKg || 0;
        categoryMap[cat].valueInr += item.itemValueInr || 0;
      });
    } else {
      const cat = 'Uncategorized';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { name: cat, weightKg: 0, valueInr: 0 };
      }
      categoryMap[cat].weightKg += e.totalQtyKg || 0;
      categoryMap[cat].valueInr += e.valueInInr || 0;
    }
  });

  const categoryData = Object.values(categoryMap).map((c) => ({
    ...c,
    weightKg: Number(c.weightKg.toFixed(2)),
    valueInr: Number(c.valueInr.toFixed(2)),
  }));

  // 3. Month-wise aggregation
  const monthMap: {
    [key: string]: {
      monthKey: string;
      label: string;
      invoiceValue: number;
      totalExpense: number;
      netValue: number;
      totalWeight: number;
    };
  } = {};

  entries.forEach((e) => {
    if (!e.invDate) return;
    const date = new Date(e.invDate);
    if (isNaN(date.getTime())) return;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const label = `${months[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;

    if (!monthMap[monthKey]) {
      monthMap[monthKey] = {
        monthKey,
        label,
        invoiceValue: 0,
        totalExpense: 0,
        netValue: 0,
        totalWeight: 0,
      };
    }
    monthMap[monthKey].invoiceValue += e.valueInInr || 0;
    monthMap[monthKey].totalExpense += e.totalExpense || 0;
    monthMap[monthKey].netValue += e.netValueInr || 0;
    monthMap[monthKey].totalWeight += e.totalQtyKg || 0;
  });

  const monthData = Object.keys(monthMap)
    .sort()
    .map((key) => {
      const m = monthMap[key];
      return {
        ...m,
        finalPerKgRate: m.totalWeight > 0 ? Number((m.netValue / m.totalWeight).toFixed(2)) : 0,
      };
    });

  return (
    <div className="space-y-6">
      {/* Sub-view Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Export ROI &amp; Realization Analytics
          </h3>
          <p className="text-xs text-slate-500">
            Visual comparisons across export buyers, item categories, and monthly shipment cycles
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setChartView('party')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              chartView === 'party' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Party-Wise ROI
          </button>
          <button
            onClick={() => setChartView('item')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              chartView === 'item' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Item &amp; Category
          </button>
          <button
            onClick={() => setChartView('month')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              chartView === 'month' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Month-Wise Trend
          </button>
        </div>
      </div>

      {/* 1. PARTY-WISE CHART VIEW */}
      {chartView === 'party' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Party Value vs Expense Bar Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Party-Wise Value Realization vs Expense (INR)
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partyData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="party"
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
                  <Bar dataKey="invoiceValue" name="Invoice Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalExpense" name="Total Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netValue" name="Net Realized Value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Party Final ₹/KG Rate Comparison Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Realized Rate (₹/KG) by Party
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Higher final ₹/KG rate indicates better net export margin after ocean freight and CHA costs.
              </p>

              <div className="space-y-3">
                {partyData.map((p, idx) => (
                  <div key={p.party} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{p.party}</span>
                      <span className="font-mono font-extrabold text-emerald-700 text-sm">
                        ₹{p.avgFinalRate.toFixed(3)}/KG
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                      <span>{p.shipmentsCount} shipment(s)</span>
                      <span>Total Net: {formatNumber(p.totalWeight, 0)} KG</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
              <span className="font-bold">Summary:</span> Top yielding party is{' '}
              <strong className="underline">
                {[...partyData].sort((a, b) => b.avgFinalRate - a.avgFinalRate)[0]?.party || 'N/A'}
              </strong>
              .
            </div>
          </div>
        </div>
      )}

      {/* 2. ITEM & CATEGORY-WISE CHART VIEW */}
      {chartView === 'item' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Net Weight Share */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              Net Weight (KG) Distribution by Category
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="weightKg"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={(entry) => `${entry.name.slice(0, 14)} (${entry.weightKg}kg)`}
                    labelLine={true}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${formatNumber(val, 2)} KG`, 'Weight']}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Export Volume breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Category Weight Breakdown (KG)
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip
                    formatter={(val: number) => [`${formatNumber(val, 2)} KG`, 'Net Weight']}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="weightKg" name="Net Weight (KG)" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 3. MONTH-WISE TREND VIEW */}
      {chartView === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Value vs Expense Trend */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Monthly Invoice Value &amp; Expense Realization
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val: number) => formatInr(val)}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="invoiceValue" name="Invoice Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalExpense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netValue" name="Net Realized" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Final Rate ₹/KG Line Trend */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Monthly Final Realization Yield (₹/KG)
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(val: number) => [`₹${formatNumber(val, 3)} / KG`, 'Final Rate']}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="finalPerKgRate"
                    name="Final Realization Rate (₹/KG)"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

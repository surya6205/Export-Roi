import React from 'react';
import {
  DollarSign,
  Scale,
  CreditCard,
  TrendingUp,
  Percent,
  Calculator,
  ArrowUpRight,
  ReceiptText,
} from 'lucide-react';
import { formatInr, formatNumber } from '../utils/calculations';
import { RoiEntry } from '../types';

interface SummaryCardsProps {
  entries: RoiEntry[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ entries }) => {
  const totalInvoiceValue = entries.reduce((acc, curr) => acc + (curr.valueInInr || 0), 0);
  const totalNetWeight = entries.reduce((acc, curr) => acc + (curr.totalQtyKg || 0), 0);
  const totalExpense = entries.reduce((acc, curr) => acc + (curr.totalExpense || 0), 0);
  const totalNetValue = totalInvoiceValue - totalExpense;

  const overallWithoutExpRate =
    totalNetWeight > 0 ? totalInvoiceValue / totalNetWeight : 0;
  const overallFinalRate = totalNetWeight > 0 ? totalNetValue / totalNetWeight : 0;

  const expenseRatio =
    totalInvoiceValue > 0 ? (totalExpense / totalInvoiceValue) * 100 : 0;
  const netRealizationRatio =
    totalInvoiceValue > 0 ? (totalNetValue / totalInvoiceValue) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {/* 1. Total Invoice Value */}
      <div
        id="card-total-invoice-value"
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-slate-300 transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Invoice Value
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 font-mono">
          {formatInr(totalInvoiceValue)}
        </div>
        <div className="mt-2 flex items-center text-xs text-slate-500">
          <ReceiptText className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <span>{entries.length} export shipments</span>
        </div>
      </div>

      {/* 2. Total Net Weight (KG) */}
      <div
        id="card-total-net-weight"
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-slate-300 transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Net Weight
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 font-mono">
          {formatNumber(totalNetWeight, 2)}{' '}
          <span className="text-sm font-medium text-slate-500 font-sans">KG</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-indigo-600 font-medium">
          <span>Consolidated Net Weight</span>
        </div>
      </div>

      {/* 3. Gross Rate / KG (Without Exp) - PROMINENT AS REQUESTED */}
      <div
        id="card-gross-rate-per-kg"
        className="bg-white rounded-xl p-4 border border-blue-200 shadow-2xs hover:border-blue-300 transition-shadow bg-gradient-to-br from-white to-blue-50/40"
      >
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
          ₹{formatNumber(overallWithoutExpRate, 2)}
          <span className="text-xs font-normal text-slate-500 ml-1 font-sans">/ KG</span>
        </div>
        <div className="mt-2 text-xs text-blue-700 font-medium">
          Invoice Rate before expenses
        </div>
      </div>

      {/* 4. Total Expense */}
      <div
        id="card-total-expense"
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-slate-300 transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Expense
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-bold text-rose-600 font-mono">
          {formatInr(totalExpense)}
        </div>
        <div className="mt-2 flex items-center text-xs text-rose-600 font-medium">
          <Percent className="w-3.5 h-3.5 mr-1" />
          <span>{expenseRatio.toFixed(1)}% of Invoice Value</span>
        </div>
      </div>

      {/* 5. Net Value (Invoice Value - Expense) */}
      <div
        id="card-net-value"
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-slate-300 transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Value (Realized)
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 font-mono">
          {formatInr(totalNetValue)}
        </div>
        <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
          <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
          <span>{netRealizationRatio.toFixed(1)}% Net Realization</span>
        </div>
      </div>

      {/* 6. Net Realized Rate / KG (After Exp) */}
      <div
        id="card-final-per-kg-rate"
        className="bg-emerald-900 rounded-xl p-4 border border-emerald-700 shadow-2xs text-white"
      >
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
          ₹{formatNumber(overallFinalRate, 3)}
          <span className="text-xs font-normal text-emerald-200 ml-1 font-sans">/ KG</span>
        </div>
        <div className="mt-2 text-xs text-emerald-200 flex items-center">
          <span>Net Realized Yield per KG</span>
        </div>
      </div>
    </div>
  );
};

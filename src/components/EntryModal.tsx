import React, { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  AlertCircle,
  Save,
  DollarSign,
  Calendar,
  FileText,
  Building2,
  Package,
  TrendingUp,
  Receipt,
  Scale,
  Edit2,
  RotateCcw,
} from 'lucide-react';
import { ExpenseBreakdown, RoiEntry } from '../types';
import {
  calculateCategoryKg,
  computeRoiMetrics,
  formatInr,
  formatNumber,
} from '../utils/calculations';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: RoiEntry) => Promise<void>;
  editingEntry?: RoiEntry | null;
  existingParties: string[];
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  existingParties,
}) => {
  // 1. Shipment Info
  const [partyName, setPartyName] = useState('');
  const [invDate, setInvDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceValue, setInvoiceValue] = useState<number | ''>('');

  // Mode: 'kg' (enter net weight directly in KG) or 'pouch' (enter pouch count)
  const [entryMode, setEntryMode] = useState<'kg' | 'pouch'>('kg');

  // Direct KG Inputs
  const [namkeenKgInput, setNamkeenKgInput] = useState<number | ''>('');
  const [namkeenPackGm, setNamkeenPackGm] = useState<number>(340);

  const [chikkiKgInput, setChikkiKgInput] = useState<number | ''>('');
  const [chikkiPackGm, setChikkiPackGm] = useState<number>(150);

  const [laddooKgInput, setLaddooKgInput] = useState<number | ''>('');
  const [laddooPackGm, setLaddooPackGm] = useState<number>(120);

  // Pouch count inputs
  const [namkeenQty, setNamkeenQty] = useState<number | ''>('');
  const [chikkiQty, setChikkiQty] = useState<number | ''>('');
  const [laddooQty, setLaddooQty] = useState<number | ''>('');

  // Optional manual net weight override toggle
  const [isCustomTotalWeight, setIsCustomTotalWeight] = useState(false);
  const [customTotalWeight, setCustomTotalWeight] = useState<number | ''>('');

  // 3. Expenses (5 Simple Fields)
  const [transportFreight, setTransportFreight] = useState<number | ''>('');
  const [chaExpense, setChaExpense] = useState<number | ''>('');
  const [cifOceanFreight, setCifOceanFreight] = useState<number | ''>('');
  const [otherExp, setOtherExp] = useState<number | ''>('');
  const [fsuSamplingCupTray, setFsuSamplingCupTray] = useState<number | ''>('');

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (editingEntry) {
      setPartyName(editingEntry.partyName || '');
      setInvDate(editingEntry.invDate || new Date().toISOString().split('T')[0]);
      setInvoiceNo(editingEntry.invoiceNo || '');
      setInvoiceValue(editingEntry.valueInInr || '');

      const nKg = editingEntry.namkeenKg ?? (editingEntry.namkeenQty ? (editingEntry.namkeenQty * (editingEntry.namkeenPackGm || 340)) / 1000 : 0);
      const cKg = editingEntry.chikkiKg ?? (editingEntry.chikkiQty ? (editingEntry.chikkiQty * (editingEntry.chikkiPackGm || 150)) / 1000 : 0);
      const lKg = editingEntry.laddooKg ?? (editingEntry.laddooQty ? (editingEntry.laddooQty * (editingEntry.laddooPackGm || 120)) / 1000 : 0);

      setNamkeenPackGm((editingEntry.namkeenPackGm as 340 | 300) || 340);
      setChikkiPackGm(editingEntry.chikkiPackGm || 150);
      setLaddooPackGm(editingEntry.laddooPackGm || 120);

      setNamkeenKgInput(nKg > 0 ? Number(nKg.toFixed(2)) : '');
      setChikkiKgInput(cKg > 0 ? Number(cKg.toFixed(2)) : '');
      setLaddooKgInput(lKg > 0 ? Number(lKg.toFixed(2)) : '');

      setNamkeenQty(editingEntry.namkeenQty || (nKg > 0 ? Math.round((nKg * 1000) / (editingEntry.namkeenPackGm || 340)) : ''));
      setChikkiQty(editingEntry.chikkiQty || (cKg > 0 ? Math.round((cKg * 1000) / (editingEntry.chikkiPackGm || 150)) : ''));
      setLaddooQty(editingEntry.laddooQty || (lKg > 0 ? Math.round((lKg * 1000) / (editingEntry.laddooPackGm || 120)) : ''));

      setTransportFreight(editingEntry.expenses?.transportFreight || '');
      setChaExpense(editingEntry.expenses?.chaExpense || '');
      setCifOceanFreight(editingEntry.expenses?.cifOceanFreight || '');
      setOtherExp(editingEntry.expenses?.otherExp || '');

      const handling =
        editingEntry.expenses?.fsuSamplingCupTray ??
        ((Number(editingEntry.expenses?.fsu) || 0) +
          (Number(editingEntry.expenses?.sampling) || 0) +
          (Number(editingEntry.expenses?.cupTray) || 0) +
          (Number(editingEntry.expenses?.otherExpenses) || 0));
      setFsuSamplingCupTray(handling || '');

      setNotes(editingEntry.notes || '');

      // Check if custom weight was set
      const sumItemKg = Number((nKg + cKg + lKg).toFixed(2));
      if (editingEntry.totalQtyKg && Math.abs(editingEntry.totalQtyKg - sumItemKg) > 0.5) {
        setIsCustomTotalWeight(true);
        setCustomTotalWeight(editingEntry.totalQtyKg);
      } else {
        setIsCustomTotalWeight(false);
        setCustomTotalWeight('');
      }
    } else {
      // Default New Entry
      setPartyName('');
      setInvDate(new Date().toISOString().split('T')[0]);
      setInvoiceNo(`PI/E-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(100 + Math.random() * 900)}`);
      setInvoiceValue('');

      setEntryMode('kg');
      setNamkeenKgInput('');
      setNamkeenQty('');
      setNamkeenPackGm(340);

      setChikkiKgInput('');
      setChikkiQty('');
      setChikkiPackGm(150);

      setLaddooKgInput('');
      setLaddooQty('');
      setLaddooPackGm(120);

      setIsCustomTotalWeight(false);
      setCustomTotalWeight('');

      setTransportFreight('');
      setChaExpense('');
      setCifOceanFreight('');
      setOtherExp('');
      setFsuSamplingCupTray('');
      setNotes('');
    }
    setErrorMsg(null);
  }, [editingEntry, isOpen]);

  // Derived Effective Weight Calculations (KG)
  const effectiveNamkeenKg = entryMode === 'kg'
    ? (Number(namkeenKgInput) || 0)
    : calculateCategoryKg(Number(namkeenQty) || 0, namkeenPackGm);

  const effectiveChikkiKg = entryMode === 'kg'
    ? (Number(chikkiKgInput) || 0)
    : calculateCategoryKg(Number(chikkiQty) || 0, chikkiPackGm);

  const effectiveLaddooKg = entryMode === 'kg'
    ? (Number(laddooKgInput) || 0)
    : calculateCategoryKg(Number(laddooQty) || 0, laddooPackGm);

  // Equivalent Pouches calculation
  const approxNamkeenPouches = effectiveNamkeenKg > 0 ? Math.round((effectiveNamkeenKg * 1000) / namkeenPackGm) : 0;
  const approxChikkiPouches = effectiveChikkiKg > 0 ? Math.round((effectiveChikkiKg * 1000) / chikkiPackGm) : 0;
  const approxLaddooPouches = effectiveLaddooKg > 0 ? Math.round((effectiveLaddooKg * 1000) / laddooPackGm) : 0;

  const autoTotalKg = Number((effectiveNamkeenKg + effectiveChikkiKg + effectiveLaddooKg).toFixed(2));
  const effectiveTotalKg = isCustomTotalWeight && Number(customTotalWeight) > 0
    ? Number(customTotalWeight)
    : autoTotalKg;

  // Expenses calculations
  const numInvoiceVal = Number(invoiceValue) || 0;
  const numTransport = Number(transportFreight) || 0;
  const numCha = Number(chaExpense) || 0;
  const numCif = Number(cifOceanFreight) || 0;
  const numOther = Number(otherExp) || 0;
  const numHandling = Number(fsuSamplingCupTray) || 0;

  const totalExpense = numTransport + numCha + numCif + numOther + numHandling;
  const netValueInr = Number((numInvoiceVal - totalExpense).toFixed(2));
  const withoutExpPerKg = effectiveTotalKg > 0 ? Number((numInvoiceVal / effectiveTotalKg).toFixed(2)) : 0;
  const finalPerKgRate = effectiveTotalKg > 0 ? Number((netValueInr / effectiveTotalKg).toFixed(3)) : 0;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) {
      setErrorMsg('Please enter or select a Party Name.');
      return;
    }
    if (!invoiceNo.trim()) {
      setErrorMsg('Please enter an Invoice Number.');
      return;
    }
    if (numInvoiceVal <= 0) {
      setErrorMsg('Please enter a valid Invoice Value (₹).');
      return;
    }
    if (effectiveTotalKg <= 0) {
      setErrorMsg('Please enter quantity for at least one item (Namkeen, Chikki, or Laddoo).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const expenseBreakdown: ExpenseBreakdown = {
      transportFreight: numTransport,
      chaExpense: numCha,
      cifOceanFreight: numCif,
      otherExp: numOther,
      fsuSamplingCupTray: numHandling,
      fsu: 0,
      sampling: 0,
      cupTray: 0,
      otherExpenses: 0,
    };

    const entryToSave: RoiEntry = {
      id: editingEntry?.id || `roi-entry-${Date.now()}`,
      partyName: partyName.trim(),
      invDate,
      invoiceNo: invoiceNo.trim(),
      valueInInr: numInvoiceVal,

      namkeenQty: Number(namkeenQty) || approxNamkeenPouches,
      namkeenPackGm,
      namkeenKg: Number(effectiveNamkeenKg.toFixed(2)),

      chikkiQty: Number(chikkiQty) || approxChikkiPouches,
      chikkiPackGm,
      chikkiKg: Number(effectiveChikkiKg.toFixed(2)),

      laddooQty: Number(laddooQty) || approxLaddooPouches,
      laddooPackGm,
      laddooKg: Number(effectiveLaddooKg.toFixed(2)),

      totalQtyKg: effectiveTotalKg,
      withoutExpPerKg,

      expenses: expenseBreakdown,
      totalExpense,
      netValueInr,
      finalPerKgRate,

      notes: notes.trim(),
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSave(entryToSave);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save entry. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {editingEntry ? 'Edit Export ROI Entry' : 'New Export ROI Entry'}
              </h2>
              <p className="text-xs text-slate-400">
                Enter quantities &amp; expenses — Net Weight &amp; Final ₹/KG calculate automatically
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Shipment Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                1. Shipment Information
              </span>
              <span className="text-[11px] text-slate-500">Required fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Party Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Party Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="parties-datalist"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="e.g. Multiplex, Al Maya Trading"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <datalist id="parties-datalist">
                    {existingParties.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* Invoice No */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="e.g. PI/E-22/26-27"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
                />
              </div>

              {/* Invoice Value (INR) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice Value (₹ INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    value={invoiceValue}
                    onChange={(e) => setInvoiceValue(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Product Net Weight (KG) or Pouch Entry */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/90 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-200/70 pb-2.5 gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-700" />
                  2. Item Net Weight (KG)
                </span>
                <span className="text-[11px] text-emerald-800 font-medium block mt-0.5">
                  Direct KG weight dalen — pouch count automatically calculate hoga
                </span>
              </div>

              {/* Mode Toggle */}
              <div className="inline-flex items-center bg-white border border-emerald-300 rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setEntryMode('kg')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    entryMode === 'kg'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Direct Net Weight (KG)
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('pouch')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    entryMode === 'pouch'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pouch Count Entry
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Namkeen */}
              <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>Namkeen</span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      ({entryMode === 'kg' ? 'KG' : 'Pouches'})
                    </span>
                  </label>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setNamkeenPackGm(340)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        namkeenPackGm === 340 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      340g
                    </button>
                    <button
                      type="button"
                      onClick={() => setNamkeenPackGm(300)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        namkeenPackGm === 300 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      300g
                    </button>
                  </div>
                </div>

                {entryMode === 'kg' ? (
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={namkeenKgInput}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setNamkeenKgInput(val);
                          if (val !== '' && Number(val) > 0) {
                            setNamkeenQty(Math.round((Number(val) * 1000) / namkeenPackGm));
                          } else {
                            setNamkeenQty('');
                          }
                        }}
                        placeholder="Enter Net KG (e.g. 1530)"
                        className="w-full pr-8 pl-2.5 py-1.5 text-xs border border-emerald-300 rounded-md focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900 bg-emerald-50/20"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs font-bold text-emerald-700">KG</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-slate-400">Equivalent:</span>
                      <span className="font-mono text-slate-600">
                        ≈ {approxNamkeenPouches.toLocaleString()} Pouches ({namkeenPackGm}g)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={namkeenQty}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setNamkeenQty(val);
                        if (val !== '' && Number(val) > 0) {
                          setNamkeenKgInput(Number(((Number(val) * namkeenPackGm) / 1000).toFixed(2)));
                        } else {
                          setNamkeenKgInput('');
                        }
                      }}
                      placeholder="Enter Qty (Packets)"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-slate-400">Net Weight:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatNumber(effectiveNamkeenKg, 2)} KG
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chikki */}
              <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>Chikki</span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      ({entryMode === 'kg' ? 'KG' : 'Pouches'})
                    </span>
                  </label>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setChikkiPackGm(150)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        chikkiPackGm === 150 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      150g
                    </button>
                    <button
                      type="button"
                      onClick={() => setChikkiPackGm(75)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        chikkiPackGm === 75 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      75g
                    </button>
                  </div>
                </div>

                {entryMode === 'kg' ? (
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={chikkiKgInput}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setChikkiKgInput(val);
                          if (val !== '' && Number(val) > 0) {
                            setChikkiQty(Math.round((Number(val) * 1000) / chikkiPackGm));
                          } else {
                            setChikkiQty('');
                          }
                        }}
                        placeholder="Enter Net KG (e.g. 600)"
                        className="w-full pr-8 pl-2.5 py-1.5 text-xs border border-emerald-300 rounded-md focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900 bg-emerald-50/20"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs font-bold text-emerald-700">KG</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-slate-400">Equivalent:</span>
                      <span className="font-mono text-slate-600">
                        ≈ {approxChikkiPouches.toLocaleString()} Pouches ({chikkiPackGm}g)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={chikkiQty}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setChikkiQty(val);
                        if (val !== '' && Number(val) > 0) {
                          setChikkiKgInput(Number(((Number(val) * chikkiPackGm) / 1000).toFixed(2)));
                        } else {
                          setChikkiKgInput('');
                        }
                      }}
                      placeholder="Enter Qty (Packets)"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-slate-400">Net Weight:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatNumber(effectiveChikkiKg, 2)} KG
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Laddoo */}
              <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>Laddoo</span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      ({entryMode === 'kg' ? 'KG' : 'Pouches'})
                    </span>
                  </label>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setLaddooPackGm(120)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        laddooPackGm === 120 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      120g
                    </button>
                    <button
                      type="button"
                      onClick={() => setLaddooPackGm(60)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        laddooPackGm === 60 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      60g
                    </button>
                  </div>
                </div>

                {entryMode === 'kg' ? (
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={laddooKgInput}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setLaddooKgInput(val);
                          if (val !== '' && Number(val) > 0) {
                            setLaddooQty(Math.round((Number(val) * 1000) / laddooPackGm));
                          } else {
                            setLaddooQty('');
                          }
                        }}
                        placeholder="Enter Net KG (e.g. 380)"
                        className="w-full pr-8 pl-2.5 py-1.5 text-xs border border-emerald-300 rounded-md focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900 bg-emerald-50/20"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs font-bold text-emerald-700">KG</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-slate-400">Equivalent:</span>
                      <span className="font-mono text-slate-600">
                        ≈ {approxLaddooPouches.toLocaleString()} Pouches ({laddooPackGm}g)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={laddooQty}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setLaddooQty(val);
                        if (val !== '' && Number(val) > 0) {
                          setLaddooKgInput(Number(((Number(val) * laddooPackGm) / 1000).toFixed(2)));
                        } else {
                          setLaddooKgInput('');
                        }
                      }}
                      placeholder="Enter Qty (Packets)"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-slate-400">Net Weight:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatNumber(effectiveLaddooKg, 2)} KG
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Net Weight Bar */}
            <div className="p-3 bg-white rounded-lg border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Total Calculated Net Weight:
                </span>
                <span className="text-xs font-extrabold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {formatNumber(effectiveTotalKg, 2)} KG
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  (Namkeen: {formatNumber(effectiveNamkeenKg, 1)} + Chikki: {formatNumber(effectiveChikkiKg, 1)} + Laddoo: {formatNumber(effectiveLaddooKg, 1)} KG)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!isCustomTotalWeight ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomTotalWeight(true);
                      setCustomTotalWeight(autoTotalKg);
                    }}
                    className="text-[11px] text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-medium transition-colors"
                    title="Override with exact customs packing list weight if different"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Exact weight override</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={customTotalWeight}
                      onChange={(e) => setCustomTotalWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Custom KG"
                      className="w-24 px-2 py-0.5 text-xs font-mono border border-emerald-300 rounded bg-emerald-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomTotalWeight(false);
                        setCustomTotalWeight('');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Reset to automatic sum"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Expenses */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-rose-600" />
                3. Shipment Expenses (₹ INR)
              </span>
              <span className="text-[11px] text-slate-500">Leave 0 if not applicable</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Transport Freight */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Transport Freight
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={transportFreight}
                    onChange={(e) => setTransportFreight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
                  />
                </div>
              </div>

              {/* CHA Expense */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CHA Expense
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={chaExpense}
                    onChange={(e) => setChaExpense(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
                  />
                </div>
              </div>

              {/* CIF / Ocean Freight */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CIF / Ocean Freight
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={cifOceanFreight}
                    onChange={(e) => setCifOceanFreight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
                  />
                </div>
              </div>

              {/* Other Expense */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Other Expense
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={otherExp}
                    onChange={(e) => setOtherExp(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
                  />
                </div>
              </div>

              {/* FSU / Sampling / Cup / Tray */}
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  FSU / Sampling / Cup / Tray (Handling)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={fsuSamplingCupTray}
                    onChange={(e) => setFsuSamplingCupTray(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Remarks / Notes (Optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Notes / Destination Port (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. FCL shipment via Nhava Sheva to Jebel Ali"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Real-time Calculation Summary Ribbon */}
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-inner grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Total Net Weight
              </div>
              <div className="text-sm sm:text-base font-bold text-white font-mono mt-0.5">
                {formatNumber(effectiveTotalKg, 2)}{' '}
                <span className="text-xs text-slate-400 font-sans">KG</span>
              </div>
            </div>

            <div className="border-l border-slate-800">
              <div className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">
                Gross Rate / KG (Without Exp)
              </div>
              <div className="text-sm sm:text-base font-bold text-blue-400 font-mono mt-0.5">
                ₹{formatNumber(withoutExpPerKg, 2)}
                <span className="text-xs text-blue-200 font-sans font-normal ml-0.5">/ KG</span>
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0">
              <div className="text-[10px] text-rose-300 uppercase font-semibold">
                Total Expenses
              </div>
              <div className="text-sm sm:text-base font-bold text-rose-400 font-mono mt-0.5">
                {formatInr(totalExpense)}
              </div>
              <div className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                Net: {formatInr(netValueInr)}
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0">
              <div className="text-[10px] text-emerald-300 uppercase font-extrabold tracking-wider">
                Net Realized Rate / KG (After Exp)
              </div>
              <div className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
                ₹{formatNumber(finalPerKgRate, 3)}
                <span className="text-xs text-emerald-200 font-sans font-normal ml-0.5">/ KG</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : editingEntry ? 'Update Entry' : 'Save Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

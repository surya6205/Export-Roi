import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { PartyDashboard } from './components/PartyDashboard';
import { DataTable } from './components/DataTable';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { EntryModal } from './components/EntryModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { FilterOptions, GoogleSheetsConfig, RoiEntry } from './types';
import { INITIAL_SAMPLE_ENTRIES } from './data/sampleEntries';
import { formatNumber, formatInr, formatDate } from './utils/calculations';
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  Table as TableIcon,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [entries, setEntries] = useState<RoiEntry[]>(INITIAL_SAMPLE_ENTRIES);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entries' | 'analytics'>('dashboard');

  // Modal States
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RoiEntry | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<RoiEntry | null>(null);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);

  // Google Sheets Config
  const [gasConfig, setGasConfig] = useState<GoogleSheetsConfig>({
    webAppUrl: '',
    lastSyncedAt: null,
    autoSync: true,
    syncIntervalSec: 8,
  });

  // Filters State
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    startDate: '',
    endDate: '',
    partyName: '',
    invoiceNo: '',
    category: '',
  });

  // Toast Notification
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // Fetch entries from backend server (synchronized for all devices)
  const fetchEntries = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/entries');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.entries) && data.entries.length > 0) {
          setEntries(data.entries);
        }
        if (data.lastSyncedAt) {
          setGasConfig((prev) => ({ ...prev, lastSyncedAt: data.lastSyncedAt }));
        }
      }
    } catch (err) {
      console.warn('Backend fetch failed, using memory state:', err);
    } finally {
      if (!isSilent) setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  // Fetch GAS configuration from server
  const fetchGasConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/gas-config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setGasConfig((prev) => ({ ...prev, ...data.config }));
        }
      }
    } catch (err) {
      console.warn('Failed to load GAS config:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEntries(false);
    fetchGasConfig();
  }, [fetchEntries, fetchGasConfig]);

  // Multi-Device Auto-Sync Polling
  useEffect(() => {
    if (!gasConfig.autoSync) return;
    const interval = setInterval(() => {
      // Background silent sync
      fetchEntries(true);
    }, (gasConfig.syncIntervalSec || 8) * 1000);

    return () => clearInterval(interval);
  }, [gasConfig.autoSync, gasConfig.syncIntervalSec, fetchEntries]);

  // Save / Edit Entry
  const handleSaveEntry = async (entry: RoiEntry) => {
    const isEdit = Boolean(editingEntry);
    const url = isEdit ? `/api/entries/${entry.id}` : '/api/entries';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save entry');
      }

      // Optimistic or confirmed update
      setEntries((prev) => {
        if (isEdit) {
          return prev.map((e) => (e.id === entry.id ? entry : e));
        }
        return [entry, ...prev];
      });

      showToast(
        isEdit ? `Shipment ${entry.invoiceNo} updated successfully` : `Shipment ${entry.invoiceNo} added successfully`,
        'success'
      );
      setEditingEntry(null);
    } catch (error: any) {
      showToast(error.message || 'Error saving entry', 'error');
      throw error;
    }
  };

  // Delete Entry
  const handleDeleteEntry = async () => {
    if (!deletingEntry) return;
    try {
      const res = await fetch(`/api/entries/${deletingEntry.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete entry');
      }

      setEntries((prev) => prev.filter((e) => e.id !== deletingEntry.id));
      showToast(`Entry ${deletingEntry.invoiceNo} deleted`, 'success');
      setIsDeleteModalOpen(false);
      setDeletingEntry(null);
    } catch (error: any) {
      showToast(error.message || 'Error deleting entry', 'error');
    }
  };

  // Save GAS Config
  const handleSaveGasConfig = async (cfgUpdates: Partial<GoogleSheetsConfig>) => {
    try {
      const res = await fetch('/api/gas-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfgUpdates),
      });
      if (res.ok) {
        const data = await res.json();
        setGasConfig((prev) => ({ ...prev, ...data.config }));
        showToast('Google Sheets settings updated!', 'success');
      }
    } catch (err: any) {
      showToast('Failed to save settings: ' + err.message, 'error');
      throw err;
    }
  };

  // Push Local Data to Sheet
  const handlePushToSheet = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/gas/sync-to-sheet', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully pushed ${data.count} entries to Google Sheet!`, 'success');
        fetchEntries(true);
      } else {
        throw new Error(data.error || 'Push failed');
      }
    } catch (err: any) {
      showToast('Sync error: ' + err.message, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Pull Data from Sheet
  const handlePullFromSheet = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/gas/pull-from-sheet', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEntries(data.entries);
        showToast(`Successfully pulled ${data.count} entries from Google Sheet!`, 'success');
      } else {
        throw new Error(data.error || 'Pull failed');
      }
    } catch (err: any) {
      showToast('Sync error: ' + err.message, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Test GAS Web App Connection
  const handleTestGasConnection = async (webAppUrl: string) => {
    const res = await fetch('/api/gas/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webAppUrl }),
    });
    return res.json();
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'PARTY NAME',
      'Inv Date',
      'INVOICE NO',
      'TOTAL QTY in KG',
      'VALUE IN INR',
      'WITHOUT EXP Per KG',
      'TRANSPORT FREIGHT',
      'CHA EXP',
      'CIF EXP (Ocian Freight)',
      'Other exp',
      'TOTAL FREIGHT EXP',
      'FSU',
      'Sampling',
      'Cup/Tray',
      'Other Expenses',
      'TOTAL EXPENSE',
      'INVOICE VALUE - EXPENSE',
      'FINAL PER KG RATE',
      'NOTES',
    ];

    const rows = entries.map((e) => {
      const freightTotal =
        (Number(e.expenses.transportFreight) || 0) +
        (Number(e.expenses.chaExpense) || 0) +
        (Number(e.expenses.cifOceanFreight) || 0) +
        (Number(e.expenses.otherExp) || 0);

      return [
        `"${e.partyName.replace(/"/g, '""')}"`,
        `"${formatDate(e.invDate)}"`,
        `"${e.invoiceNo}"`,
        e.totalQtyKg,
        e.valueInInr,
        e.withoutExpPerKg,
        e.expenses.transportFreight || 0,
        e.expenses.chaExpense || 0,
        e.expenses.cifOceanFreight || 0,
        e.expenses.otherExp || 0,
        freightTotal,
        e.expenses.fsu || 0,
        e.expenses.sampling || 0,
        e.expenses.cupTray || 0,
        e.expenses.otherExpenses || 0,
        e.totalExpense,
        e.netValueInr,
        e.finalPerKgRate,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Export_ROI_Costing_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export ROI CSV downloaded!', 'success');
  };

  // Distinct parties for filters and autocomplete
  const allParties = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.partyName) set.add(e.partyName);
    });
    return Array.from(set);
  }, [entries]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col pb-16 md:pb-8">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-300" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        onOpenNewEntry={() => {
          setEditingEntry(null);
          setIsEntryModalOpen(true);
        }}
        onOpenGoogleSheets={() => setIsGasModalOpen(true)}
        onExportCsv={handleExportCsv}
        onRefresh={() => fetchEntries(false)}
        isRefreshing={isRefreshing}
        hasGasConfigured={Boolean(gasConfig.webAppUrl)}
        lastSyncedAt={gasConfig.lastSyncedAt}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalEntriesCount={entries.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Dashboard with Prominent Party Search & Complete Party ROI */}
        {activeTab === 'dashboard' && (
          <PartyDashboard
            entries={entries}
            allParties={allParties}
            selectedParty={selectedParty}
            setSelectedParty={setSelectedParty}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onEdit={(entry) => {
              setEditingEntry(entry);
              setIsEntryModalOpen(true);
            }}
            onDelete={(entry) => {
              setDeletingEntry(entry);
              setIsDeleteModalOpen(true);
            }}
            onOpenNewEntry={() => {
              setEditingEntry(null);
              setIsEntryModalOpen(true);
            }}
          />
        )}

        {/* Tab 2: Full Costing Sheet & Reports */}
        {activeTab === 'entries' && (
          <div className="space-y-6">
            <SummaryCards entries={entries} />
            <DataTable
              entries={entries}
              onEdit={(entry) => {
                setEditingEntry(entry);
                setIsEntryModalOpen(true);
              }}
              onDelete={(entry) => {
                setDeletingEntry(entry);
                setIsDeleteModalOpen(true);
              }}
              filters={filters}
              setFilters={setFilters}
              allParties={allParties}
            />
          </div>
        )}

        {/* Tab 3: ROI Analysis Charts */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <SummaryCards entries={entries} />
            <AnalyticsCharts entries={entries} />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-around text-slate-400">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('entries')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'entries' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>Ledger</span>
        </button>

        <button
          onClick={() => {
            setEditingEntry(null);
            setIsEntryModalOpen(true);
          }}
          className="flex flex-col items-center -mt-4 bg-emerald-600 text-white p-2.5 rounded-full shadow-lg border-2 border-slate-900 active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'analytics' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>ROI Charts</span>
        </button>

        <button
          onClick={() => setIsGasModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-400"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Sheets</span>
        </button>
      </nav>

      {/* Entry Modal (Create / Edit) */}
      <EntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        editingEntry={editingEntry}
        existingParties={allParties}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        entry={deletingEntry}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingEntry(null);
        }}
        onConfirm={handleDeleteEntry}
        isDeleting={false}
      />

      {/* Google Sheets + Apps Script Sync Modal */}
      <GoogleSheetsModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
        config={gasConfig}
        onSaveConfig={handleSaveGasConfig}
        onPushToSheet={handlePushToSheet}
        onPullFromSheet={handlePullFromSheet}
        onTestConnection={handleTestGasConnection}
        isSyncing={isRefreshing}
      />
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { PartyDashboard } from './components/PartyDashboard';
import { DataTable } from './components/DataTable';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { EntryModal } from './components/EntryModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FirebaseLogin } from './components/FirebaseLogin';

import { FilterOptions, RoiEntry } from './types';
import { formatDate } from './utils/calculations';

import { auth, db } from './lib/firebase';

import {
  CheckCircle2,
  AlertCircle,
  Plus,
  Table as TableIcon,
  BarChart3,
  RefreshCw,
  LogOut,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [entries, setEntries] = useState<RoiEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'entries' | 'analytics'
  >('dashboard');

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RoiEntry | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<RoiEntry | null>(null);

  const [selectedParty, setSelectedParty] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    startDate: '',
    endDate: '',
    partyName: '',
    invoiceNo: '',
    category: '',
  });

  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3500);
  };

  // Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (!currentUser) {
        setEntries([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Realtime Firestore listener
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    const entriesRef = collection(db, 'roi_entries');

    const unsubscribe = onSnapshot(
      entriesRef,
      (snapshot) => {
        const firebaseEntries: RoiEntry[] = snapshot.docs.map((item) => {
          return item.data() as RoiEntry;
        });

        firebaseEntries.sort((a, b) => {
          const dateA = new Date(
            a.updatedAt || a.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b.updatedAt || b.createdAt || 0
          ).getTime();

          return dateB - dateA;
        });

        setEntries(firebaseEntries);
        setIsLoading(false);
      },
      (error) => {
        console.error('Firestore realtime error:', error);
        setIsLoading(false);
        showToast(
          'Firebase data load failed: ' + error.message,
          'error'
        );
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Manual refresh
  const handleRefresh = async () => {
    if (!user) return;

    setIsRefreshing(true);

    try {
      const snapshot = await getDocs(
        collection(db, 'roi_entries')
      );

      const firebaseEntries: RoiEntry[] = snapshot.docs.map(
        (item) => item.data() as RoiEntry
      );

      firebaseEntries.sort((a, b) => {
        const dateA = new Date(
          a.updatedAt || a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.updatedAt || b.createdAt || 0
        ).getTime();

        return dateB - dateA;
      });

      setEntries(firebaseEntries);

      showToast('Data refreshed successfully', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(
        error?.message || 'Refresh failed',
        'error'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // Save / Edit
  const handleSaveEntry = async (entry: RoiEntry) => {
    if (!user) {
      showToast('Please login first', 'error');
      return;
    }

    const isEdit = Boolean(editingEntry);

    try {
      const now = new Date().toISOString();

      const finalEntry: RoiEntry = {
        ...entry,
        createdAt:
          entry.createdAt ||
          editingEntry?.createdAt ||
          now,
        updatedAt: now,
      };

      await setDoc(
        doc(db, 'roi_entries', finalEntry.id),
        finalEntry
      );

      showToast(
        isEdit
          ? `Shipment ${finalEntry.invoiceNo} updated successfully`
          : `Shipment ${finalEntry.invoiceNo} added successfully`,
        'success'
      );

      setEditingEntry(null);
      setIsEntryModalOpen(false);
    } catch (error: any) {
      console.error('Save error:', error);

      showToast(
        error?.message || 'Error saving entry',
        'error'
      );

      throw error;
    }
  };

  // Delete
  const handleDeleteEntry = async () => {
    if (!deletingEntry || !user) return;

    try {
      await deleteDoc(
        doc(db, 'roi_entries', deletingEntry.id)
      );

      showToast(
        `Entry ${deletingEntry.invoiceNo} deleted`,
        'success'
      );

      setIsDeleteModalOpen(false);
      setDeletingEntry(null);
    } catch (error: any) {
      console.error('Delete error:', error);

      showToast(
        error?.message || 'Error deleting entry',
        'error'
      );
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('Logged out successfully', 'success');
    } catch (error: any) {
      showToast(
        error?.message || 'Logout failed',
        'error'
      );
    }
  };

  // CSV Export
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
        (Number(e.expenses?.transportFreight) || 0) +
        (Number(e.expenses?.chaExpense) || 0) +
        (Number(e.expenses?.cifOceanFreight) || 0) +
        (Number(e.expenses?.otherExp) || 0);

      return [
        `"${(e.partyName || '').replace(/"/g, '""')}"`,
        `"${formatDate(e.invDate)}"`,
        `"${e.invoiceNo || ''}"`,
        e.totalQtyKg || 0,
        e.valueInInr || 0,
        e.withoutExpPerKg || 0,
        e.expenses?.transportFreight || 0,
        e.expenses?.chaExpense || 0,
        e.expenses?.cifOceanFreight || 0,
        e.expenses?.otherExp || 0,
        freightTotal,
        e.expenses?.fsu || 0,
        e.expenses?.sampling || 0,
        e.expenses?.cupTray || 0,
        e.expenses?.otherExpenses || 0,
        e.totalExpense || 0,
        e.netValueInr || 0,
        e.finalPerKgRate || 0,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement('a');

    link.setAttribute('href', encodedUri);

    link.setAttribute(
      'download',
      `Export_ROI_Costing_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      'Export ROI CSV downloaded!',
      'success'
    );
  };

  const allParties = useMemo(() => {
    const partySet = new Set<string>();

    entries.forEach((entry) => {
      if (entry.partyName) {
        partySet.add(entry.partyName);
      }
    });

    return Array.from(partySet);
  }, [entries]);

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600">
            Loading Export ROI...
          </p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return <FirebaseLogin onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col pb-16 md:pb-8">

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
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

      {/* Firebase user bar */}
      <div className="bg-slate-900 text-white px-4 py-2 flex justify-end items-center gap-3 text-xs">
        <span className="text-slate-300 hidden sm:block">
          {user.email}
        </span>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg font-semibold"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>

      {/* Header */}
      <Header
        onOpenNewEntry={() => {
          setEditingEntry(null);
          setIsEntryModalOpen(true);
        }}
        onOpenGoogleSheets={() => {
          showToast(
            'Google Sheets is disabled. Firebase is now being used.',
            'error'
          );
        }}
        onExportCsv={handleExportCsv}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        hasGasConfigured={false}
        lastSyncedAt={null}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalEntriesCount={entries.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Dashboard */}
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

        {/* Entries */}
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

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <SummaryCards entries={entries} />
            <AnalyticsCharts entries={entries} />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Syncing Firebase...
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-around text-slate-400">

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'dashboard'
              ? 'text-emerald-400'
              : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('entries')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'entries'
              ? 'text-emerald-400'
              : 'text-slate-400'
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
            activeTab === 'analytics'
              ? 'text-emerald-400'
              : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>ROI Charts</span>
        </button>

      </nav>

      {/* Entry Modal */}
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

      {/* Delete Modal */}
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

    </div>
  );
}
import React from 'react';
import {
  FileSpreadsheet,
  PlusCircle,
  RefreshCw,
  Share2,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Download,
  BarChart3,
  Table as TableIcon,
} from 'lucide-react';

interface HeaderProps {
  onOpenNewEntry: () => void;
  onOpenGoogleSheets: () => void;
  onExportCsv: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  hasGasConfigured: boolean;
  lastSyncedAt: string | null;
  activeTab: 'dashboard' | 'entries' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'entries' | 'analytics') => void;
  totalEntriesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewEntry,
  onOpenGoogleSheets,
  onExportCsv,
  onRefresh,
  isRefreshing,
  hasGasConfigured,
  lastSyncedAt,
  activeTab,
  setActiveTab,
  totalEntriesCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Branding & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-inner text-white font-bold tracking-wider">
                ROI
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white">
                    Export ROI &amp; Costing
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Live Sync
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Shipment Costing, Automatic Weight &amp; Final ₹/KG Realization
                </p>
              </div>
            </div>

            {/* Mobile quick add button */}
            <button
              id="btn-mobile-quick-add"
              onClick={onOpenNewEntry}
              className="md:hidden p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 transition-transform"
              title="Add ROI Entry"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Right Status & Action Controls */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 text-xs">
            {/* Sync Status Badge */}
            <button
              id="btn-open-gas-settings"
              onClick={onOpenGoogleSheets}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-colors ${
                hasGasConfigured
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Google Sheets & Apps Script Backend Status"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">
                {hasGasConfigured ? 'Google Sheets Linked' : 'Link Google Sheets'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  hasGasConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </button>

            {/* Multi-device sync badge */}
            <div className="hidden lg:flex items-center gap-1 text-slate-400 bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700">
              <Laptop className="w-3.5 h-3.5" />
              <span>+</span>
              <Smartphone className="w-3.5 h-3.5" />
              <span className="ml-1 text-slate-300">Multi-Device Live</span>
            </div>

            {/* Refresh Button */}
            <button
              id="btn-refresh-data"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors disabled:opacity-50"
              title="Refresh and sync data across devices"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-400 ${
                  isRefreshing ? 'animate-spin text-emerald-400' : ''
                }`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? 'Syncing...' : 'Sync'}
              </span>
            </button>

            {/* Export CSV Button */}
            <button
              id="btn-export-csv"
              onClick={onExportCsv}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title="Download Data as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Primary Add Entry Button */}
            <button
              id="btn-desktop-add-entry"
              onClick={onOpenNewEntry}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-sm transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs for Views */}
        <div className="flex items-center space-x-1 border-t border-slate-800 pt-2 pb-1 overflow-x-auto scrollbar-none">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard &amp; Overview</span>
          </button>

          <button
            id="tab-entries"
            onClick={() => setActiveTab('entries')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'entries'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Costing Sheet &amp; Reports ({totalEntriesCount})</span>
          </button>

          <button
            id="tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ROI Analysis Charts</span>
          </button>
        </div>
      </div>
    </header>
  );
};

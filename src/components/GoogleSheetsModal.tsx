import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  ExternalLink,
  Laptop,
  Smartphone,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GoogleSheetsConfig } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/gasScriptTemplate';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetsConfig;
  onSaveConfig: (cfg: Partial<GoogleSheetsConfig>) => Promise<void>;
  onPushToSheet: () => Promise<void>;
  onPullFromSheet: () => Promise<void>;
  onTestConnection: (url: string) => Promise<{ success: boolean; message: string }>;
  isSyncing: boolean;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onPushToSheet,
  onPullFromSheet,
  onTestConnection,
  isSyncing,
}) => {
  const [urlInput, setUrlInput] = useState(config.webAppUrl || '');
  const [autoSync, setAutoSync] = useState(config.autoSync ?? true);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showScriptCode, setShowScriptCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted in iframe
      const textArea = document.createElement('textarea');
      textArea.value = GOOGLE_APPS_SCRIPT_CODE;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTest = async () => {
    if (!urlInput.trim()) {
      setTestResult({ success: false, message: 'Please enter a Google Apps Script Web App URL first.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await onTestConnection(urlInput.trim());
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveConfig({
        webAppUrl: urlInput.trim(),
        autoSync,
      });
      setTestResult({ success: true, message: 'Configuration saved successfully!' });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Failed to save configuration' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Google Sheets + Google Apps Script Backend
              </h2>
              <p className="text-xs text-slate-400">
                Live multi-device database synchronization across PC, Android &amp; iPhone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              config.webAppUrl
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            {config.webAppUrl ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs flex-1">
              <div className="font-bold text-sm">
                {config.webAppUrl ? 'Live Google Sheets Connected' : 'Google Sheets Not Linked Yet'}
              </div>
              <p className="mt-0.5 text-slate-600">
                {config.webAppUrl
                  ? 'All entries, edits, and deletions are saved to your Google Sheet and synced live across your computer, Android phone, and iPhone.'
                  : 'The dashboard is currently running in local/server persistence mode. Follow the 2-minute setup below to link your live Google Sheet!'}
              </p>
              {config.lastSyncedAt && (
                <div className="mt-2 text-[11px] text-slate-500 font-mono">
                  Last Synced: {new Date(config.lastSyncedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Web App URL Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Google Apps Script Web App URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing...' : 'Test URL'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Auto-Sync & Manual Sync Actions */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Automatic Background Synchronization
                </span>
                <span className="text-[11px] text-slate-500">
                  Continuously synchronizes changes from any active phone, tablet, or computer
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPushToSheet}
                disabled={isSyncing || !urlInput}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-40"
              >
                <UploadCloud className="w-4 h-4 text-emerald-600" />
                <span>Push Local Entries to Sheet</span>
              </button>

              <button
                type="button"
                onClick={onPullFromSheet}
                disabled={isSyncing || !urlInput}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:border-blue-500 text-slate-700 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-40"
              >
                <DownloadCloud className="w-4 h-4 text-blue-600" />
                <span>Pull Latest Rows from Sheet</span>
              </button>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Easy 2-Minute Google Sheet Setup
            </h3>

            <ol className="list-decimal list-inside space-y-2 text-slate-600">
              <li>
                Create a blank Google Sheet at{' '}
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-semibold underline inline-flex items-center gap-0.5"
                >
                  sheets.new <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                In your Google Sheet menu, click <strong>Extensions &gt; Apps Script</strong>.
              </li>
              <li>
                Replace all code in <strong>Code.gs</strong> with the script below, and click Save.
              </li>
              <li>
                Click <strong>Deploy &gt; New deployment</strong>, select type <strong>Web app</strong>.
              </li>
              <li>
                Set <em>&quot;Execute as: Me&quot;</em> and{' '}
                <strong><em>&quot;Who has access: Anyone&quot;</em></strong> (important!).
              </li>
              <li>
                Click <strong>Deploy</strong>, authorize Google permissions, copy the Web App URL,
                and paste it above.
              </li>
            </ol>

            {/* View / Copy Code Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setShowScriptCode(!showScriptCode)}
                  className="text-xs text-indigo-700 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>{showScriptCode ? 'Hide Code.gs Script' : 'View Code.gs Script'}</span>
                  {showScriptCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Code!' : 'Copy Code.gs'}</span>
                </button>
              </div>

              {showScriptCode && (
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-60 scrollbar-thin">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

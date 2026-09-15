import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { RoiEntry } from '../types';
import { formatInr, formatDate } from '../utils/calculations';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  entry: RoiEntry | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  entry,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">
                Confirm Deletion
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this Export ROI entry? This action cannot be undone and will be synchronized across all devices.
              </p>

              {/* Entry Details Summary */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Party Name:</span>
                  <span className="font-semibold text-slate-800">{entry.partyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice No:</span>
                  <span className="font-mono font-semibold text-slate-800">{entry.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Date:</span>
                  <span className="text-slate-700">{formatDate(entry.invDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Value:</span>
                  <span className="font-mono font-bold text-slate-900">{formatInr(entry.valueInInr)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Final ₹/KG Rate:</span>
                  <span className="font-mono font-bold text-emerald-700">₹{entry.finalPerKgRate.toFixed(3)} / KG</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Entry'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

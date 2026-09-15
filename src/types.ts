export type ItemCategory =
  | '340 GM Namkeen'
  | '150/125 GM Namkeen'
  | '150/75/15 Chikki'
  | '60/120/40 GM Laddoo'
  | 'Other Export Items';

export interface EntryItem {
  id: string;
  category: ItemCategory;
  itemName: string;
  packingSizeGm: number; // in grams e.g. 340, 150, 125, 75, 15, 60, 120, 40
  quantityUnit: 'packets' | 'boxes';
  packetsPerBox: number; // multiplier if boxes/cartons
  quantity: number; // number of boxes or packets
  netWeightKg: number; // auto-calculated or overridden
  itemValueInr?: number; // optional item value
}

export interface ExpenseBreakdown {
  // Freight & Port charges
  transportFreight: number;
  chaExpense: number;
  cifOceanFreight: number;
  otherExp: number;
  // Handling & Secondary (FSU / Sampling / Cup / Tray)
  fsuSamplingCupTray: number;
  // Optional granular fields for backwards compatibility
  fsu?: number;
  sampling?: number;
  cupTray?: number;
  otherExpenses?: number;
}

export interface RoiEntry {
  id: string;
  partyName: string;
  invDate: string; // YYYY-MM-DD
  invoiceNo: string;
  valueInInr: number; // Invoice Value in INR

  // Simplified Product Quantities (Auto Calculates Net Weight KG)
  namkeenQty: number; // 340/300 GM Namkeen
  namkeenPackGm?: number; // 340 or 300 (default 340)
  namkeenKg: number; // auto-computed: (qty * packGm) / 1000

  chikkiQty: number; // Chikki
  chikkiPackGm?: number; // default 150
  chikkiKg: number; // auto-computed: (qty * packGm) / 1000

  laddooQty: number; // Laddoo
  laddooPackGm?: number; // default 120
  laddooKg: number; // auto-computed: (qty * packGm) / 1000

  // Total Net Weight & Value Metrics
  totalQtyKg: number; // Net Weight in KG (Namkeen KG + Chikki KG + Laddoo KG)
  withoutExpPerKg: number; // Value / Total Qty

  // Expenses & Final Realization
  expenses: ExpenseBreakdown;
  totalExpense: number;
  netValueInr: number; // Value - Total Expense
  finalPerKgRate: number; // Net Value / Total Qty

  // Legacy/Detailed item array for backward compatibility
  items?: EntryItem[];
  notes?: string;
  updatedAt: string;
  createdAt: string;
}

export interface FilterOptions {
  searchQuery: string;
  startDate: string;
  endDate: string;
  partyName: string;
  invoiceNo: string;
  category: string;
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  lastSyncedAt: string | null;
  autoSync: boolean;
  syncIntervalSec: number;
}

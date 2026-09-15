import { EntryItem, ExpenseBreakdown, ItemCategory } from '../types';

export const STANDARD_CATEGORIES: {
  category: ItemCategory;
  defaultPackingSizes: number[];
  defaultPacketsPerBox: number;
}[] = [
  {
    category: '340 GM Namkeen',
    defaultPackingSizes: [340],
    defaultPacketsPerBox: 24,
  },
  {
    category: '150/125 GM Namkeen',
    defaultPackingSizes: [150, 125],
    defaultPacketsPerBox: 30,
  },
  {
    category: '150/75/15 Chikki',
    defaultPackingSizes: [150, 75, 15],
    defaultPacketsPerBox: 40,
  },
  {
    category: '60/120/40 GM Laddoo',
    defaultPackingSizes: [60, 120, 40],
    defaultPacketsPerBox: 20,
  },
  {
    category: 'Other Export Items',
    defaultPackingSizes: [100, 200, 250, 500, 1000],
    defaultPacketsPerBox: 24,
  },
];

/**
 * Calculates net weight in KG based on packing size, quantity, and unit.
 */
export function calculateItemNetWeight(
  packingSizeGm: number,
  quantity: number,
  quantityUnit: 'packets' | 'boxes',
  packetsPerBox: number = 1
): number {
  if (!quantity || quantity <= 0 || !packingSizeGm || packingSizeGm <= 0) {
    return 0;
  }
  const totalPackets = quantityUnit === 'boxes' ? quantity * (packetsPerBox || 1) : quantity;
  const totalGrams = totalPackets * packingSizeGm;
  const kg = totalGrams / 1000;
  return Number(kg.toFixed(3));
}

/**
 * Calculates net weight in KG for standard categories
 */
export function calculateCategoryKg(qty: number, packGm: number): number {
  if (!qty || qty <= 0 || !packGm || packGm <= 0) return 0;
  return Number(((qty * packGm) / 1000).toFixed(2));
}

/**
 * Calculates total expenses from breakdown.
 */
export function calculateTotalExpense(exp: ExpenseBreakdown): number {
  const freightTotal =
    (Number(exp.transportFreight) || 0) +
    (Number(exp.chaExpense) || 0) +
    (Number(exp.cifOceanFreight) || 0) +
    (Number(exp.otherExp) || 0);

  const handlingCombined = Number(exp.fsuSamplingCupTray) || 0;
  const handlingLegacy =
    (Number(exp.fsu) || 0) +
    (Number(exp.sampling) || 0) +
    (Number(exp.cupTray) || 0) +
    (Number(exp.otherExpenses) || 0);

  const handlingTotal = handlingCombined > 0 ? handlingCombined : handlingLegacy;

  return freightTotal + handlingTotal;
}

/**
 * Computes the derived ROI metrics for an entry.
 */
export function computeRoiMetrics(
  totalQtyKg: number,
  valueInInr: number,
  expenses: ExpenseBreakdown
) {
  const totalExpense = calculateTotalExpense(expenses);
  const netValueInr = Number((valueInInr - totalExpense).toFixed(2));
  const withoutExpPerKg =
    totalQtyKg > 0 ? Number((valueInInr / totalQtyKg).toFixed(2)) : 0;
  const finalPerKgRate =
    totalQtyKg > 0 ? Number((netValueInr / totalQtyKg).toFixed(3)) : 0;

  return {
    totalExpense,
    netValueInr,
    withoutExpPerKg,
    finalPerKgRate,
  };
}

export function formatInr(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  if (isNaN(value) || value === null || value === undefined) return '0';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  } catch {
    return dateString;
  }
}

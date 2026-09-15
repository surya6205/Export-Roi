import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'roi_entries.json');
const CONFIG_FILE = path.join(DATA_DIR, 'gas_config.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial sample data matching PDF
const INITIAL_ENTRIES = [
  {
    id: 'roi-entry-1',
    partyName: 'Multiplex',
    invDate: '2026-08-07',
    invoiceNo: 'PI/E-22/26-27',
    items: [
      {
        id: 'item-1',
        category: '340 GM Namkeen',
        itemName: 'Ratlami Sev & Khatta Meetha',
        packingSizeGm: 340,
        quantityUnit: 'packets',
        packetsPerBox: 24,
        quantity: 4500,
        netWeightKg: 1530.0,
        itemValueInr: 670000.0,
      },
      {
        id: 'item-2',
        category: '150/125 GM Namkeen',
        itemName: 'Bikaneri Bhujia 150g',
        packingSizeGm: 150,
        quantityUnit: 'packets',
        packetsPerBox: 30,
        quantity: 5500,
        netWeightKg: 825.0,
        itemValueInr: 360000.0,
      },
      {
        id: 'item-3',
        category: '150/75/15 Chikki',
        itemName: 'Peanut Jaggery Chikki 150g',
        packingSizeGm: 150,
        quantityUnit: 'packets',
        packetsPerBox: 40,
        quantity: 4000,
        netWeightKg: 600.0,
        itemValueInr: 260000.0,
      },
      {
        id: 'item-4',
        category: '60/120/40 GM Laddoo',
        itemName: 'Besan & Motichoor Laddoo 120g',
        packingSizeGm: 120,
        quantityUnit: 'packets',
        packetsPerBox: 20,
        quantity: 3166.67,
        netWeightKg: 380.0,
        itemValueInr: 170128.4,
      },
    ],
    totalQtyKg: 3335.0,
    valueInInr: 1460128.4,
    withoutExpPerKg: 437.82,
    expenses: {
      transportFreight: 40250,
      chaExpense: 63365,
      cifOceanFreight: 467750,
      otherExp: 0,
      fsu: 0,
      sampling: 0,
      cupTray: 0,
      otherExpenses: 0,
    },
    totalExpense: 571365,
    netValueInr: 888763.4,
    finalPerKgRate: 266.496,
    notes: 'Reference entry from ROI Sheet (PI/E-22/26-27)',
    createdAt: '2026-08-07T10:00:00.000Z',
    updatedAt: '2026-08-07T10:00:00.000Z',
  },
  {
    id: 'roi-entry-2',
    partyName: 'Al Maya Trading Dubai',
    invDate: '2026-07-18',
    invoiceNo: 'PI/E-19/26-27',
    items: [
      {
        id: 'item-2-1',
        category: '340 GM Namkeen',
        itemName: 'Aloo Bhujia & Moong Dal 340g',
        packingSizeGm: 340,
        quantityUnit: 'boxes',
        packetsPerBox: 24,
        quantity: 120,
        netWeightKg: 979.2,
        itemValueInr: 440000.0,
      },
      {
        id: 'item-2-2',
        category: '150/125 GM Namkeen',
        itemName: 'Spicy Mixture 125g',
        packingSizeGm: 125,
        quantityUnit: 'boxes',
        packetsPerBox: 30,
        quantity: 150,
        netWeightKg: 562.5,
        itemValueInr: 250000.0,
      },
      {
        id: 'item-2-3',
        category: '150/75/15 Chikki',
        itemName: 'Crushed Peanut Chikki 75g',
        packingSizeGm: 75,
        quantityUnit: 'boxes',
        packetsPerBox: 48,
        quantity: 180,
        netWeightKg: 648.0,
        itemValueInr: 290000.0,
      },
    ],
    totalQtyKg: 2189.7,
    valueInInr: 980000.0,
    withoutExpPerKg: 447.55,
    expenses: {
      transportFreight: 28500,
      chaExpense: 42000,
      cifOceanFreight: 295000,
      otherExp: 8500,
      fsu: 4500,
      sampling: 2200,
      cupTray: 3800,
      otherExpenses: 1500,
    },
    totalExpense: 386000,
    netValueInr: 594000.0,
    finalPerKgRate: 271.27,
    notes: 'Dubai Air Cargo & Sea blend shipment',
    createdAt: '2026-07-18T14:30:00.000Z',
    updatedAt: '2026-07-18T14:30:00.000Z',
  },
  {
    id: 'roi-entry-3',
    partyName: 'Lulu Hypermarket Group',
    invDate: '2026-06-25',
    invoiceNo: 'PI/E-15/26-27',
    items: [
      {
        id: 'item-3-1',
        category: '60/120/40 GM Laddoo',
        itemName: 'Dry Fruit Laddoo 60g Pack',
        packingSizeGm: 60,
        quantityUnit: 'boxes',
        packetsPerBox: 36,
        quantity: 350,
        netWeightKg: 756.0,
        itemValueInr: 395000.0,
      },
      {
        id: 'item-3-2',
        category: '340 GM Namkeen',
        itemName: 'Navratan Mix 340g',
        packingSizeGm: 340,
        quantityUnit: 'boxes',
        packetsPerBox: 24,
        quantity: 180,
        netWeightKg: 1468.8,
        itemValueInr: 660000.0,
      },
    ],
    totalQtyKg: 2224.8,
    valueInInr: 1055000.0,
    withoutExpPerKg: 474.2,
    expenses: {
      transportFreight: 26000,
      chaExpense: 48000,
      cifOceanFreight: 310000,
      otherExp: 5000,
      fsu: 0,
      sampling: 1500,
      cupTray: 2400,
      otherExpenses: 0,
    },
    totalExpense: 392900,
    netValueInr: 662100.0,
    finalPerKgRate: 297.6,
    notes: 'Jebel Ali FCL Port delivery',
    createdAt: '2026-06-25T09:15:00.000Z',
    updatedAt: '2026-06-25T09:15:00.000Z',
  },
];

function normalizeEntry(e: any): any {
  let namkeenQty = e.namkeenQty ?? 0;
  let namkeenPackGm = e.namkeenPackGm ?? 340;
  let namkeenKg = e.namkeenKg ?? 0;

  let chikkiQty = e.chikkiQty ?? 0;
  let chikkiPackGm = e.chikkiPackGm ?? 150;
  let chikkiKg = e.chikkiKg ?? 0;

  let laddooQty = e.laddooQty ?? 0;
  let laddooPackGm = e.laddooPackGm ?? 120;
  let laddooKg = e.laddooKg ?? 0;

  // Extract from items array if direct fields aren't populated
  if (Array.isArray(e.items) && e.items.length > 0 && namkeenQty === 0 && chikkiQty === 0 && laddooQty === 0) {
    for (const item of e.items) {
      const cat = (item.category || '').toLowerCase();
      const name = (item.itemName || '').toLowerCase();
      if (cat.includes('namkeen') || name.includes('namkeen') || name.includes('sev') || name.includes('bhujia')) {
        namkeenQty += item.quantity || 0;
        namkeenPackGm = item.packingSizeGm || 340;
        namkeenKg += item.netWeightKg || ((item.quantity * namkeenPackGm) / 1000);
      } else if (cat.includes('chikki') || name.includes('chikki')) {
        chikkiQty += item.quantity || 0;
        chikkiPackGm = item.packingSizeGm || 150;
        chikkiKg += item.netWeightKg || ((item.quantity * chikkiPackGm) / 1000);
      } else if (cat.includes('laddoo') || name.includes('laddoo')) {
        laddooQty += item.quantity || 0;
        laddooPackGm = item.packingSizeGm || 120;
        laddooKg += item.netWeightKg || ((item.quantity * laddooPackGm) / 1000);
      }
    }
  }

  if (namkeenKg === 0 && namkeenQty > 0) {
    namkeenKg = Number(((namkeenQty * namkeenPackGm) / 1000).toFixed(2));
  }
  if (chikkiKg === 0 && chikkiQty > 0) {
    chikkiKg = Number(((chikkiQty * chikkiPackGm) / 1000).toFixed(2));
  }
  if (laddooKg === 0 && laddooQty > 0) {
    laddooKg = Number(((laddooQty * laddooPackGm) / 1000).toFixed(2));
  }

  const calculatedTotalKg = Number((namkeenKg + chikkiKg + laddooKg).toFixed(2));
  const totalQtyKg = e.totalQtyKg > 0 ? e.totalQtyKg : (calculatedTotalKg > 0 ? calculatedTotalKg : 1);

  const expenses = e.expenses || {};
  const fsuSampling = expenses.fsuSamplingCupTray ?? (
    (Number(expenses.fsu) || 0) +
    (Number(expenses.sampling) || 0) +
    (Number(expenses.cupTray) || 0) +
    (Number(expenses.otherExpenses) || 0)
  );

  const normalizedExpenses = {
    transportFreight: Number(expenses.transportFreight) || 0,
    chaExpense: Number(expenses.chaExpense) || 0,
    cifOceanFreight: Number(expenses.cifOceanFreight) || 0,
    otherExp: Number(expenses.otherExp) || 0,
    fsuSamplingCupTray: Number(fsuSampling) || 0,
    fsu: Number(expenses.fsu) || 0,
    sampling: Number(expenses.sampling) || 0,
    cupTray: Number(expenses.cupTray) || 0,
    otherExpenses: Number(expenses.otherExpenses) || 0,
  };

  const totalExpense =
    normalizedExpenses.transportFreight +
    normalizedExpenses.chaExpense +
    normalizedExpenses.cifOceanFreight +
    normalizedExpenses.otherExp +
    normalizedExpenses.fsuSamplingCupTray;

  const valueInInr = Number(e.valueInInr) || 0;
  const netValueInr = Number((valueInInr - totalExpense).toFixed(2));
  const withoutExpPerKg = totalQtyKg > 0 ? Number((valueInInr / totalQtyKg).toFixed(2)) : 0;
  const finalPerKgRate = totalQtyKg > 0 ? Number((netValueInr / totalQtyKg).toFixed(3)) : 0;

  return {
    ...e,
    namkeenQty,
    namkeenPackGm,
    namkeenKg: Number(namkeenKg.toFixed(2)),
    chikkiQty,
    chikkiPackGm,
    chikkiKg: Number(chikkiKg.toFixed(2)),
    laddooQty,
    laddooPackGm,
    laddooKg: Number(laddooKg.toFixed(2)),
    totalQtyKg,
    valueInInr,
    expenses: normalizedExpenses,
    totalExpense,
    netValueInr,
    withoutExpPerKg,
    finalPerKgRate,
  };
}

function readEntries(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        return list.map(normalizeEntry);
      }
    }
  } catch (err) {
    console.error('Error reading data file:', err);
  }
  // Initialize with initial entries
  const normalized = INITIAL_ENTRIES.map(normalizeEntry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2));
  return normalized;
}

function writeEntries(entries: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
}

function readGasConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading GAS config:', err);
  }
  return {
    webAppUrl: process.env.GOOGLE_APPS_SCRIPT_URL || '',
    lastSyncedAt: null,
    autoSync: true,
    syncIntervalSec: 10,
  };
}

function writeGasConfig(config: any) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Background async forwarder to Google Apps Script if configured
async function forwardToGoogleAppsScript(payload: any) {
  const config = readGasConfig();
  if (!config.webAppUrl || !config.webAppUrl.startsWith('http')) {
    return;
  }
  try {
    const res = await fetch(config.webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      config.lastSyncedAt = new Date().toISOString();
      writeGasConfig(config);
    }
  } catch (err) {
    console.warn('Could not forward to Google Apps Script:', (err as Error).message);
  }
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET all entries (Returns live synchronized data for computer, Android, iPhone)
app.get('/api/entries', (req, res) => {
  const entries = readEntries();
  const config = readGasConfig();
  res.json({
    success: true,
    entries,
    lastSyncedAt: config.lastSyncedAt,
    hasGasConfigured: Boolean(config.webAppUrl),
  });
});

// CREATE entry
app.post('/api/entries', async (req, res) => {
  try {
    const newEntry = req.body;
    if (!newEntry.partyName || !newEntry.invoiceNo) {
      return res.status(400).json({ error: 'Party Name and Invoice No are required' });
    }
    const entries = readEntries();
    newEntry.id = newEntry.id || `roi-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    newEntry.createdAt = newEntry.createdAt || new Date().toISOString();
    newEntry.updatedAt = new Date().toISOString();

    const normalized = normalizeEntry(newEntry);
    entries.unshift(normalized);
    writeEntries(entries);

    // Forward to GAS asynchronously
    forwardToGoogleAppsScript({ action: 'create', entry: normalized });

    res.status(201).json({ success: true, entry: normalized });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save entry' });
  }
});

// UPDATE entry
app.put('/api/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEntry = req.body;
    const entries = readEntries();
    const index = entries.findIndex((e) => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    updatedEntry.updatedAt = new Date().toISOString();
    const normalized = normalizeEntry({ ...entries[index], ...updatedEntry, id });
    entries[index] = normalized;
    writeEntries(entries);

    // Forward to GAS
    forwardToGoogleAppsScript({ action: 'upsert', entry: normalized });

    res.json({ success: true, entry: normalized });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update entry' });
  }
});

// DELETE entry
app.delete('/api/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let entries = readEntries();
    const existing = entries.find((e) => e.id === id);

    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    entries = entries.filter((e) => e.id !== id);
    writeEntries(entries);

    // Forward to GAS
    forwardToGoogleAppsScript({ action: 'delete', id });

    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete entry' });
  }
});

// GAS Config endpoints
app.get('/api/gas-config', (req, res) => {
  const config = readGasConfig();
  res.json({ success: true, config });
});

app.post('/api/gas-config', (req, res) => {
  try {
    const { webAppUrl, autoSync, syncIntervalSec } = req.body;
    const config = readGasConfig();
    config.webAppUrl = (webAppUrl || '').trim();
    if (typeof autoSync === 'boolean') config.autoSync = autoSync;
    if (syncIntervalSec) config.syncIntervalSec = Number(syncIntervalSec);
    writeGasConfig(config);
    res.json({ success: true, config });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// TEST Google Apps Script Connection
app.post('/api/gas/test', async (req, res) => {
  try {
    const { webAppUrl } = req.body;
    if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL. Must start with https://script.google.com/macros/s/.../exec',
      });
    }

    const response = await fetch(webAppUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Google Apps Script returned status ${response.status}`,
      });
    }

    const data = await response.json();
    res.json({ success: true, message: 'Connected successfully!', data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: `Connection error: ${error.message}. Ensure "Who has access" is set to "Anyone".`,
    });
  }
});

// Full sync: Push local data to Google Sheet
app.post('/api/gas/sync-to-sheet', async (req, res) => {
  try {
    const config = readGasConfig();
    if (!config.webAppUrl) {
      return res.status(400).json({ error: 'No Google Apps Script Web App URL configured.' });
    }
    const entries = readEntries();
    const response = await fetch(config.webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'batchSync', entries }),
    });

    const result = await response.json();
    if (result.success) {
      config.lastSyncedAt = new Date().toISOString();
      writeGasConfig(config);
      return res.json({ success: true, count: entries.length, result });
    }
    res.status(500).json({ success: false, error: result.error || 'Sync failed' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Full sync: Pull data from Google Sheet to server
app.post('/api/gas/pull-from-sheet', async (req, res) => {
  try {
    const config = readGasConfig();
    if (!config.webAppUrl) {
      return res.status(400).json({ error: 'No Google Apps Script Web App URL configured.' });
    }
    const response = await fetch(config.webAppUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      if (result.data.length > 0) {
        writeEntries(result.data);
      }
      config.lastSyncedAt = new Date().toISOString();
      writeGasConfig(config);
      return res.json({ success: true, count: result.data.length, entries: result.data });
    }
    res.status(500).json({ success: false, error: result.error || 'Failed to pull data' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Export ROI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

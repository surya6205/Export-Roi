export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script backend for Export ROI & Costing Dashboard
 * Based on ROI Export Costing Sheet.
 * 
 * Instructions:
 * 1. Open your Google Sheet (or create a new one at sheets.new)
 * 2. Click Extensions > Apps Script
 * 3. Delete any code in Code.gs and paste this entire script
 * 4. Click 'Deploy' > 'New deployment'
 * 5. Select type: 'Web app'
 * 6. Set Description: 'Export ROI API'
 * 7. Set 'Execute as': 'Me'
 * 8. Set 'Who has access': 'Anyone' (IMPORTANT: Do NOT select 'Only myself')
 * 9. Click 'Deploy', authorize the permissions, and copy the Web App URL!
 * 10. Paste the Web App URL into the Export ROI Dashboard Settings.
 */

const SHEET_NAME = "ROI_Export_Entries";

const HEADERS = [
  "ID",
  "PARTY NAME",
  "Inv Date",
  "INVOICE NO",
  "TOTAL QTY in KG",
  "VALUE IN INR",
  "WITHOUT EXP Per KG",
  "TRANSPORT FREIGHT",
  "CHA EXP",
  "CIF EXP (Ocian Freight)",
  "Other exp",
  "FREIGHT EXP TOTAL",
  "FSU",
  "Sampling",
  "Cup/Tray",
  "Other Expenses",
  "TOTAL EXPENSE",
  "INVOICE VALUE - EXPENSE",
  "FINAL PER KG RATE",
  "ITEMS_JSON",
  "NOTES",
  "UPDATED_AT"
];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    // Format header row
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#1e293b")
      .setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return responseJSON({ success: true, count: 0, data: [] });
    }

    const headers = data[0];
    const rows = data.slice(1);
    
    const entries = rows.map((row) => {
      let items = [];
      try {
        if (row[19]) {
          items = JSON.parse(row[19]);
        }
      } catch (err) {
        items = [];
      }

      return {
        id: String(row[0]),
        partyName: String(row[1]),
        invDate: row[2] instanceof Date ? Utilities.formatDate(row[2], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(row[2]),
        invoiceNo: String(row[3]),
        totalQtyKg: Number(row[4]) || 0,
        valueInInr: Number(row[5]) || 0,
        withoutExpPerKg: Number(row[6]) || 0,
        expenses: {
          transportFreight: Number(row[7]) || 0,
          chaExpense: Number(row[8]) || 0,
          cifOceanFreight: Number(row[9]) || 0,
          otherExp: Number(row[10]) || 0,
          fsu: Number(row[12]) || 0,
          sampling: Number(row[13]) || 0,
          cupTray: Number(row[14]) || 0,
          otherExpenses: Number(row[15]) || 0,
        },
        totalExpense: Number(row[16]) || 0,
        netValueInr: Number(row[17]) || 0,
        finalPerKgRate: Number(row[18]) || 0,
        items: items,
        notes: String(row[20] || ""),
        updatedAt: String(row[21] || new Date().toISOString())
      };
    });

    return responseJSON({ success: true, count: entries.length, data: entries });
  } catch (error) {
    return responseJSON({ success: false, error: error.toString() });
  }
}

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (action === "create" || action === "upsert") {
      const entry = contents.entry;
      const rowIndex = findRowById(data, entry.id);

      const rowValues = [
        entry.id,
        entry.partyName,
        entry.invDate,
        entry.invoiceNo,
        entry.totalQtyKg,
        entry.valueInInr,
        entry.withoutExpPerKg,
        entry.expenses.transportFreight || 0,
        entry.expenses.chaExpense || 0,
        entry.expenses.cifOceanFreight || 0,
        entry.expenses.otherExp || 0,
        (Number(entry.expenses.transportFreight) || 0) + (Number(entry.expenses.chaExpense) || 0) + (Number(entry.expenses.cifOceanFreight) || 0) + (Number(entry.expenses.otherExp) || 0),
        entry.expenses.fsu || 0,
        entry.expenses.sampling || 0,
        entry.expenses.cupTray || 0,
        entry.expenses.otherExpenses || 0,
        entry.totalExpense,
        entry.netValueInr,
        entry.finalPerKgRate,
        JSON.stringify(entry.items || []),
        entry.notes || "",
        new Date().toISOString()
      ];

      if (rowIndex > 0) {
        // Update existing row
        sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
        return responseJSON({ success: true, action: "updated", id: entry.id });
      } else {
        // Append new row
        sheet.appendRow(rowValues);
        return responseJSON({ success: true, action: "created", id: entry.id });
      }
    } else if (action === "delete") {
      const id = contents.id;
      const rowIndex = findRowById(data, id);
      if (rowIndex > 0) {
        sheet.deleteRow(rowIndex);
        return responseJSON({ success: true, action: "deleted", id: id });
      }
      return responseJSON({ success: false, error: "Record not found with ID: " + id });
    } else if (action === "batchSync") {
      const entries = contents.entries || [];
      sheet.clearContents();
      sheet.appendRow(HEADERS);
      
      const newRows = entries.map(entry => [
        entry.id,
        entry.partyName,
        entry.invDate,
        entry.invoiceNo,
        entry.totalQtyKg,
        entry.valueInInr,
        entry.withoutExpPerKg,
        entry.expenses.transportFreight || 0,
        entry.expenses.chaExpense || 0,
        entry.expenses.cifOceanFreight || 0,
        entry.expenses.otherExp || 0,
        (Number(entry.expenses.transportFreight) || 0) + (Number(entry.expenses.chaExpense) || 0) + (Number(entry.expenses.cifOceanFreight) || 0) + (Number(entry.expenses.otherExp) || 0),
        entry.expenses.fsu || 0,
        entry.expenses.sampling || 0,
        entry.expenses.cupTray || 0,
        entry.expenses.otherExpenses || 0,
        entry.totalExpense,
        entry.netValueInr,
        entry.finalPerKgRate,
        JSON.stringify(entry.items || []),
        entry.notes || "",
        entry.updatedAt || new Date().toISOString()
      ]);

      if (newRows.length > 0) {
        sheet.getRange(2, 1, newRows.length, HEADERS.length).setValues(newRows);
      }
      return responseJSON({ success: true, syncedCount: entries.length });
    }

    return responseJSON({ success: false, error: "Unknown action: " + action });
  } catch (error) {
    return responseJSON({ success: false, error: error.toString() });
  }
}

function findRowById(data, id) {
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      return i + 1; // 1-based row index for sheet API
    }
  }
  return -1;
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

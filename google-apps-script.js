// ═══════════════════════════════════════════════════════════════════
//  EUROTHERAPY – Google Sheet sync endpoint
//  Paste this into Google Apps Script (Extensions → Apps Script)
//  then deploy as a Web App (see README.md for full instructions)
// ═══════════════════════════════════════════════════════════════════

const SHEET_NAME = "Signups";

const HEADERS = [
  "Timestamp",
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Conditions",
  "Email Consent",
  "Show / Event",
  "Entry ID"
];

// Column index (1-based) of Entry ID — used for de-duplication
const ID_COL = HEADERS.length;

function doPost(e) {
  try {
    const data    = JSON.parse(e.postData.contents);
    const ss      = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet   = ss.getSheetByName(SHEET_NAME);

    // Create sheet with headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setValues([HEADERS]);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#99CFD2");
      sheet.setFrozenRows(1);
    }

    // Accept single entry or batch
    const entries = data.entries || [data];

    // Skip entries already in the sheet — a tablet re-sends its whole
    // queue if it never saw the previous response (flaky show WiFi)
    const lastRow = sheet.getLastRow();
    const existingIds = new Set(
      lastRow > 1
        ? sheet.getRange(2, ID_COL, lastRow - 1, 1).getValues()
            .map(r => String(r[0]))
        : []
    );
    const fresh = entries.filter(en => !en.id || !existingIds.has(String(en.id)));

    if (fresh.length > 0) {
      const rows = fresh.map(entry => [
        entry.timestamp     || new Date().toISOString(),
        entry.first_name    || "",
        entry.last_name     || "",
        entry.email         || "",
        entry.phone         || "",
        entry.conditions    || "",
        entry.email_consent ? "Yes" : "No",
        entry.show          || "",
        entry.id            || ""
      ]);

      sheet
        .getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length)
        .setValues(rows);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        count: fresh.length,
        skipped: entries.length - fresh.length
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Health check
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "Eurotherapy sync endpoint active" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// =================================================================
//      CENTRAL CONFIGURATION SETTINGS
// =================================================================

// Spreadsheet & Sheet Names Configuration
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
const SHEET_CONFIG = "_Configuration";
const SHEET_RESULTS = "Results";
const SHEET_PAYMENT_LOG = "Payment_Verification_Log";
const SHEET_MASTER_LIST = "Candidate_Master_List";
const SHEET_ERROR_LOG = "Error_Log";
const SHEET_DASHBOARD = "Dashboard";

// Drive Folder & Template Configuration for Admit Cards
const TEMPLATE_ID = "YOUR_DOC_TEMPLATE_ID_HERE";
const FOLDER_ID = "YOUR_PDF_OUTPUT_FOLDER_ID_HERE";

// Application Fallback Defaults
const DEFAULTS = {
  APP_TITLE: "আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট",
  INSTITUTE_NAME: "আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট",
  LOGO_URL: "https://i.postimg.cc/RZ4wD83V/skill-color-logo-32x32.png"
};

/**
 * Safely resolves and opens the target spreadsheet.
 * Falls back to the active spreadsheet if SPREADSHEET_ID is not configured.
 * @return {SpreadsheetApp.Spreadsheet} The Spreadsheet object.
 */
function getSpreadsheet() {
  if (typeof SpreadsheetApp === 'undefined') {
    throw new Error("SpreadsheetApp is not defined.");
  }
  if (!SPREADSHEET_ID || SPREADSHEET_ID === "YOUR_SPREADSHEET_ID_HERE" || SPREADSHEET_ID.trim() === "") {
    try {
      return SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      throw new Error("সিস্টেম কনফিগারেশন অসম্পূর্ণ: SPREADSHEET_ID নির্দিষ্ট করা নেই এবং কোনো সক্রিয় স্প্রেডশিট পাওয়া যায়নি।");
    }
  }
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    try {
      return SpreadsheetApp.getActiveSpreadsheet();
    } catch (e2) {
      throw new Error("স্প্রেডশিট লোড করা যায়নি। অনুগ্রহ করে Config.gs ফাইলে SPREADSHEET_ID ঠিক আছে কিনা চেক করুন।");
    }
  }
}

/**
 * Resolves a column index dynamically from sheet headers using list of fuzzy aliases.
 * @param {Array<string>} headers The list of header strings from row 1.
 * @param {Array<string>} aliases The array of acceptable aliases for the header.
 * @return {number} The 0-indexed column index, or -1 if not found.
 */
function findColumnIndex(headers, aliases) {
  if (!headers || !headers.length) return -1;
  const cleanHeaders = headers.map(h => String(h).toLowerCase().replace(/[\s_-]/g, ''));
  for (const alias of aliases) {
    const cleanAlias = alias.toLowerCase().replace(/[\s_-]/g, '');
    const idx = cleanHeaders.indexOf(cleanAlias);
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Normalizes phone numbers for bulletproof comparison.
 * Extracts the last 10 digits to bypass +880, 880, leading zeros, or formatting variations.
 * @param {any} phone The input phone number.
 * @return {string} The normalized 10-digit suffix.
 */
function normalizePhoneNumber(phone) {
  const cleaned = String(phone || '').replace(/\D/g, ''); // Keep only digits
  if (cleaned.length >= 10) {
    return cleaned.slice(-10);
  }
  return cleaned;
}

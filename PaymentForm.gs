// =================================================================
//      BACKEND LOGIC FOR PAYMENT & ADMIT CARD SYSTEM
//      All sheet name constants are defined in Config.gs
// =================================================================



/**
 * Verifies a candidate by their phone number against the master list
 * and checks for duplicate submissions in the payment log.
 * @param {string} phone The 11-digit registered phone number.
 * @return {object} An object with verification status and details or an error message.
 */
function getUserDetails(phone) {
  try {
    const phoneTrimmed = String(phone).trim();
    
    // Server-side validation for the phone number format.
    if (!/^01[3-9]\d{8}$/.test(phoneTrimmed)) {
        return { found: false, message: "মোবাইল নম্বরটি সঠিক নয়। সঠিক ১১ ডিজিটের নম্বর দিন।" };
    }
      
    const ss = getSpreadsheet();
    const paymentSheet = ss.getSheetByName(SHEET_PAYMENT_LOG);
    const masterSheet = ss.getSheetByName(SHEET_MASTER_LIST);

    if (!paymentSheet || !masterSheet) {
      throw new Error("Payment or Master sheet not found configuration error.");
    }

    const normPhone = normalizePhoneNumber(phoneTrimmed);

    // 1. DUPLICATE CHECK: Prevent resubmission.
    const lastRow = paymentSheet.getLastRow();
    if (lastRow > 1) {
      const paymentHeaders = paymentSheet.getRange(1, 1, 1, paymentSheet.getLastColumn()).getValues()[0];
      const phoneColIndex = findColumnIndex(paymentHeaders, ['RegisteredPhoneNumber', 'RegisteredPhone', 'PhoneNumber', 'Phone', 'Mobile']);
      if (phoneColIndex !== -1) {
        const paymentData = paymentSheet.getRange(2, phoneColIndex + 1, lastRow - 1, 1).getValues().flat();
        if (paymentData.some(p => normalizePhoneNumber(p) === normPhone)) {
          return { 
            found: false, 
            message: 'এই নম্বর থেকে ফি দেওয়ার তথ্য ইতিমধ্যেই জমা দেওয়া হয়েছে। কোনো পরিবর্তনের জন্য অফিসে যোগাযোগ করুন।' 
          };
        }
      }
    }

    // 2. SEARCH MASTER LIST: Verify the candidate exists.
    const masterHeaders = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getValues()[0];
    const serialIndex = findColumnIndex(masterHeaders, ['SerialNumber', 'SerialNo', 'Serial', 'RollNo', 'Roll', 'SerialNumber_Roll', 'RollNumber']);
    const nameIndex = findColumnIndex(masterHeaders, ['FullName', 'Name', 'CandidateName']);
    const phoneIndex = findColumnIndex(masterHeaders, ['RegisteredPhoneNumber', 'RegisteredPhone', 'PhoneNumber', 'Phone', 'Mobile']);
    const districtIndex = findColumnIndex(masterHeaders, ['District', 'Zilla']);
    const emailIndex = findColumnIndex(masterHeaders, ['EmailAddress', 'Email']);

    if (serialIndex === -1 || nameIndex === -1 || phoneIndex === -1) {
      throw new Error("Master list missing required columns ('SerialNumber', 'FullName', 'RegisteredPhoneNumber').");
    }

    const masterLastRow = masterSheet.getLastRow();
    if (masterLastRow > 1) {
      const masterData = masterSheet.getRange(2, 1, masterLastRow - 1, masterHeaders.length).getValues();
      for (const row of masterData) {
        if (normalizePhoneNumber(row[phoneIndex]) === normPhone) {
          return { 
            found: true, 
            serial: row[serialIndex], 
            name: row[nameIndex], 
            district: districtIndex !== -1 ? row[districtIndex] : '', 
            email: emailIndex !== -1 ? row[emailIndex] : '' 
          };
        }
      }
    }
    
    return { found: false, message: 'দুঃখিত, এই নম্বরটি আমাদের তালিকায় পাওয়া যায়নি।' };
  } catch (e) {
    logErrorToSheet("getUserDetails", e);
    return { found: false, message: "সিস্টেমের সমস্যার কারণে তথ্য চেক করা যাচ্ছে না।" };
  }
}

/**
 * Checks the status of payment for a given phone number.
 * @param {string} phone The registered phone number of the candidate.
 * @return {object} Verification status and descriptive message.
 */
function getPaymentStatus(phone) {
  try {
    const phoneTrimmed = String(phone).trim();
    if (!/^01[3-9]\d{8}$/.test(phoneTrimmed)) {
      return { found: false, message: "অবৈধ ফোন নম্বর ফরম্যাট। সঠিক ১১-ডিজিটের নম্বর দিন।" };
    }

    const ss = getSpreadsheet();
    const paymentSheet = ss.getSheetByName(SHEET_PAYMENT_LOG);

    if (!paymentSheet) {
      return { found: false, message: "সিস্টেমের সমস্যা: পেমেন্টের তথ্য রাখার টেবিল পাওয়া যায়নি।" };
    }

    const lastRow = paymentSheet.getLastRow();
    if (lastRow < 2) {
      return { found: false, message: "কোনো পেমেন্টের তথ্য পাওয়া যায়নি।" };
    }

    const headers = paymentSheet.getRange(1, 1, 1, paymentSheet.getLastColumn()).getValues()[0];
    const data = paymentSheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

    const phoneColIndex = findColumnIndex(headers, ['RegisteredPhoneNumber', 'RegisteredPhone', 'PhoneNumber', 'Phone', 'Mobile']);
    const statusColIndex = findColumnIndex(headers, ['ApprovalStatus', 'Status', 'Approval_Status']);
    const rejectReasonColIndex = findColumnIndex(headers, ['Rejection_Reason', 'Reason', 'RejectionReason']);

    if (phoneColIndex === -1 || statusColIndex === -1) {
      return { found: false, message: "সিস্টেমের সমস্যা: প্রয়োজনীয় কলাম পাওয়া যায়নি।" };
    }

    const normPhone = normalizePhoneNumber(phoneTrimmed);

    for (let i = 0; i < data.length; i++) {
      if (normalizePhoneNumber(data[i][phoneColIndex]) === normPhone) {
        const status = data[i][statusColIndex] || 'Pending';
        if (status === 'Approved') {
          return { found: true, status: 'Approved', message: "আপনার পেমেন্ট অনুমোদন করা হয়েছে! প্রবেশপত্রটি আপনার ইমেইলে পাঠানো হয়েছে।" };
        } else if (status === 'Rejected') {
          const reason = rejectReasonColIndex !== -1 ? data[i][rejectReasonColIndex] : '';
          return { found: true, status: 'Rejected', message: `আপনার পেমেন্ট বাতিল করা হয়েছে। কারণ: ${reason || 'অনির্দিষ্ট'}` };
        } else {
          return { found: true, status: 'Pending', message: "আপনার পেমেন্ট চেক করা হচ্ছে। দয়া করে অপেক্ষা করুন।" };
        }
      }
    }

    return { found: false, message: "আপনার মোবাইল নম্বরের কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।" };
  } catch (e) {
    logErrorToSheet("getPaymentStatus", e);
    return { found: false, message: "স্ট্যাটাস লোড করার সময় সমস্যা হয়েছে।" };
  }
}

/**
 * Handles the POST request, processes data with Locks & Validations.
 *
 * @param {object} formObject The data submitted from the HTML form.
 * @return {object} An object with either a 'success' or 'error' key.
 */
function doPost(formObject) {
  const lock = LockService.getScriptLock();
  try {
    // Acquire a lock for 30 seconds to prevent concurrent duplicates
    lock.waitLock(30000);

    const phone = String(formObject.phone).trim();
    const paymentSource = String(formObject.paymentSource).trim();
    const trxId = String(formObject.trxId).trim().toUpperCase();

    // 1. Back-end Validation checks
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      return { error: "মোবাইল নম্বরটি সঠিক নয়।" };
    }
    if (!/^01[3-9]\d{8}$/.test(paymentSource)) {
      return { error: "টাকা পাঠানোর নম্বরটি সঠিক নয়।" };
    }
    if (trxId.length < 8) {
      return { error: "Transaction ID সঠিক নয়। সঠিক TrxID দিন।" };
    }

    // 2. Re-Verify candidate in master list to prevent form spoofing
    const userCheck = getUserDetails(phone);
    if (!userCheck.found) {
      return { error: "দুঃখিত, তথ্য চেক করা যায়নি: " + userCheck.message };
    }

    const ss = getSpreadsheet();
    const paymentSheet = ss.getSheetByName(SHEET_PAYMENT_LOG);
    if (!paymentSheet) {
      throw new Error(`Payment log sheet "${SHEET_PAYMENT_LOG}" not found.`);
    }
    
    // Get headers dynamically to support any column order
    const headers = paymentSheet.getRange(1, 1, 1, paymentSheet.getLastColumn()).getValues()[0];

    // Check for duplicate Transaction ID in the payment log
    const trxIdColIndex = findColumnIndex(headers, ['TransactionID', 'TrxID', 'Transaction_ID', 'TransactionNo']);
    const lastRow = paymentSheet.getLastRow();
    if (trxIdColIndex !== -1 && lastRow > 1) {
      const trxIds = paymentSheet.getRange(2, trxIdColIndex + 1, lastRow - 1, 1).getValues().flat();
      if (trxIds.some(t => String(t).trim().toUpperCase() === trxId)) {
        return { error: "এই Transaction ID-টি ইতিমধ্যেই জমা দেওয়া হয়েছে। সঠিক TrxID দিন।" };
      }
    }
    
    const newRow = new Array(headers.length).fill("");
    
    const mappings = {
      'Timestamp': new Date(),
      'RegisteredPhoneNumber': "'" + phone,
      'FullName': userCheck.name,
      'SerialNumber': userCheck.serial,
      'District': userCheck.district,
      'PaymentMethod': formObject.paymentMethod,
      'PaymentPhoneNumber': "'" + paymentSource,
      'TransactionID': trxId,
      'ApprovalStatus': 'Pending',
      'ProcessingStatus': '',
      'AdmitCardLink': '',
      'Rejection_Reason': ''
    };

    const aliasMap = {
      'Timestamp': ['Timestamp', 'Date', 'Time'],
      'RegisteredPhoneNumber': ['RegisteredPhoneNumber', 'RegisteredPhone', 'PhoneNumber', 'Phone', 'Mobile'],
      'FullName': ['FullName', 'Name', 'CandidateName'],
      'SerialNumber': ['SerialNumber', 'SerialNo', 'Serial', 'RollNo', 'Roll', 'SerialNumber_Roll', 'RollNumber'],
      'District': ['District', 'Zilla'],
      'PaymentMethod': ['PaymentMethod', 'Method', 'PaymentType'],
      'PaymentPhoneNumber': ['PaymentPhoneNumber', 'PaymentPhone', 'PaymentSource', 'SenderNumber', 'SenderPhone'],
      'TransactionID': ['TransactionID', 'TrxID', 'Transaction_ID', 'TransactionNo'],
      'ApprovalStatus': ['ApprovalStatus', 'Status', 'Approval_Status'],
      'ProcessingStatus': ['ProcessingStatus', 'Processing_Status', 'ProcessStatus'],
      'AdmitCardLink': ['AdmitCardLink', 'AdmitCard', 'Link', 'PDFLink'],
      'Rejection_Reason': ['Rejection_Reason', 'Reason', 'RejectionReason']
    };
    
    for (const key in mappings) {
      if (aliasMap.hasOwnProperty(key)) {
        const colIdx = findColumnIndex(headers, aliasMap[key]);
        if (colIdx !== -1) {
          newRow[colIdx] = mappings[key];
        }
      }
    }
    
    paymentSheet.appendRow(newRow);

    return { 
      success: "আপনার তথ্য জমা নেওয়া হয়েছে। পেমেন্ট চেক করে ২৪ ঘণ্টার মধ্যে আপনার ইমেইলে প্রবেশপত্র পাঠানো হবে। ধন্যবাদ।" 
    };

  } catch (e) {
    logErrorToSheet("doPost", e);
    return { 
      error: "একটি সমস্যা হয়েছে। তথ্য জমা নেওয়া যায়নি। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।" 
    };
  } finally {
    lock.releaseLock();
  }
}

// =================================================================
//      AUTOMATION & ADMIN FUNCTIONS (Admit Card Generation)
// =================================================================

function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('অটোমেশন')
      .addItem('ড্যাশবোর্ড আপডেট করুন', 'updateDashboardSheet')
      .addItem('অন-এডিট ট্রিগার সক্রিয় করুন (Enable Trigger)', 'setupTriggerAutomatically')
      .addItem('সকল অনুমোদিত পেমেন্ট প্রসেস করুন', 'processAllApprovedManually')
      .addToUi();
}

/**
 * Automates the setting up of the installable onEdit trigger.
 * Helps users who cannot see or select the "From spreadsheet" and "On edit" options.
 */
function setupTriggerAutomatically() {
  const ui = SpreadsheetApp.getUi();
  const triggers = ScriptApp.getProjectTriggers();
  let found = false;
  
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'handleEditTrigger') {
      found = true;
      break;
    }
  }
  
  if (found) {
    ui.alert("স্ট্যাটাস", "অন-এডিট ট্রিগার ইতিমধ্যেই চালু আছে!", ui.ButtonSet.OK);
    return;
  }
  
  try {
    let ss;
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch(err) {}
    
    if (!ss) {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    }
    
    ScriptApp.newTrigger('handleEditTrigger')
      .forSpreadsheet(ss)
      .onEdit()
      .create();
      
    ui.alert("সফলতা", "অন-এডিট ট্রিগার চালু করা হয়েছে! এখন পেমেন্ট লগে ApprovalStatus পরিবর্তন করলে প্রবেশপত্র অটোমেটিক তৈরি হয়ে ইমেইলে চলে যাবে।", ui.ButtonSet.OK);
  } catch (e) {
    ui.alert("ত্রুটি", "ট্রিগার তৈরি করা যায়নি:\n" + e.message + "\n\nসম্ভাব্য কারণ: স্ক্রিপ্টটি স্প্রেডশিট থেকে ওপেন করা হয়নি (Standalone Script)। অনুগ্রহ করে নিশ্চিত করুন যে আপনি শিটের 'Extensions > Apps Script' থেকে স্ক্রিপ্টটি ওপেন করেছেন।", ui.ButtonSet.OK);
  }
}

/**
 * Calculates payment metrics and writes/formats the Dashboard tab.
 */
function updateDashboardSheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let dashSheet = ss.getSheetByName(SHEET_DASHBOARD);
    if (!dashSheet) {
      dashSheet = ss.insertSheet(SHEET_DASHBOARD);
    }
    
    // Clear old data and formats
    dashSheet.clear();
    
    // Read logs
    const paymentSheet = ss.getSheetByName(SHEET_PAYMENT_LOG);
    let totalLogs = 0;
    let pendingLogs = 0;
    let approvedLogs = 0;
    let rejectedLogs = 0;
    
    if (paymentSheet) {
      const lastRow = paymentSheet.getLastRow();
      if (lastRow > 1) {
        const headers = paymentSheet.getRange(1, 1, 1, paymentSheet.getLastColumn()).getValues()[0];
        const approvalColIndex = headers.indexOf('ApprovalStatus');
        if (approvalColIndex !== -1) {
          const approvalValues = paymentSheet.getRange(2, approvalColIndex + 1, lastRow - 1, 1).getValues().flat();
          totalLogs = approvalValues.length;
          approvalValues.forEach(val => {
            const status = String(val).trim();
            if (status === 'Approved') approvedLogs++;
            else if (status === 'Rejected') rejectedLogs++;
            else pendingLogs++;
          });
        }
      }
    }
    
    // Setup and format Dashboard
    dashSheet.getRange("A1:C1").merge().setValue("ভর্তি ও পেমেন্ট ড্যাশবোর্ড ওভারভিউ")
      .setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center")
      .setBackground("#1A3E2F").setFontColor("#FFFFFF");
      
    dashSheet.getRange("A3:B3").merge().setValue(`সর্বশেষ আপডেট: ${Utilities.formatDate(new Date(), "GMT+6", "yyyy-MM-dd hh:mm a")}`)
      .setFontStyle("italic").setFontColor("#52635A");
      
    const headers = [["মেট্রিক (Metric)", "পরিমাণ (Count)"]];
    dashSheet.getRange("A5:B5").setValues(headers).setFontWeight("bold").setBackground("#D0DCD5").setFontColor("#1A3E2F");
    
    const rows = [
      ["মোট পেমেন্ট আবেদন (Total Submissions)", totalLogs],
      ["যাচাইকরণাধীন (Pending Verification)", pendingLogs],
      ["অনুমোদিত আবেদন (Approved Payments)", approvedLogs],
      ["বাতিলকৃত আবেদন (Rejected Payments)", rejectedLogs]
    ];
    
    dashSheet.getRange(6, 1, rows.length, 2).setValues(rows);
    dashSheet.getRange("A6:A9").setFontWeight("bold");
    dashSheet.getRange("B6:B9").setHorizontalAlignment("center");
    
    // Add gridlines and border styles
    dashSheet.getRange("A5:B9").setBorder(true, true, true, true, true, true, "#D0DCD5", SpreadsheetApp.BorderStyle.SOLID);
    
    // Auto-fit columns
    dashSheet.autoResizeColumn(1);
    dashSheet.autoResizeColumn(2);
    
    if (typeof SpreadsheetApp !== 'undefined') {
      SpreadsheetApp.getUi().alert("ড্যাশবোর্ড সফলভাবে আপডেট করা হয়েছে!");
    }
  } catch (e) {
    logErrorToSheet("updateDashboardSheet", e);
  }
}

/**
 * Admin utility to manually process all approved rows that are pending processing.
 */
function processAllApprovedManually() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const paymentSheet = ss.getSheetByName(SHEET_PAYMENT_LOG);
    if (!paymentSheet) return;

    const lastRow = paymentSheet.getLastRow();
    if (lastRow < 2) return;

    const headers = paymentSheet.getRange(1, 1, 1, paymentSheet.getLastColumn()).getValues()[0];
    const statusColIndex = headers.indexOf('ApprovalStatus');
    const procColIndex = headers.indexOf('ProcessingStatus');

    if (statusColIndex === -1 || procColIndex === -1) return;

    const data = paymentSheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

    let processedCount = 0;
    for (let i = 0; i < data.length; i++) {
      const rowNum = i + 2;
      const approvalStatus = data[i][statusColIndex];
      const processingStatus = data[i][procColIndex];

      if (approvalStatus === 'Approved' && processingStatus !== 'Success' && processingStatus !== 'প্রসেসিং চলছে...') {
        paymentSheet.getRange(rowNum, procColIndex + 1).setValue('প্রসেসিং চলছে...').setFontColor('#E67E22');
        SpreadsheetApp.flush();
        processSingleRow(rowNum);
        processedCount++;
      }
    }

    SpreadsheetApp.getUi().alert(`প্রক্রিয়া সম্পন্ন হয়েছে! মোট ${processedCount} টি অনুমোদিত প্রবেশপত্র পাঠানো হয়েছে।`);
  } catch (e) {
    logErrorToSheet("processAllApprovedManually", e);
    if (typeof SpreadsheetApp !== 'undefined') {
      SpreadsheetApp.getUi().alert("ত্রুটি ঘটেছে: " + e.message);
    }
  }
}

/**
 * CRITICAL FIX: This function MUST be installed as a trigger MANUALLY.
 * Renaming it prevents it from running as a simple trigger, which has limitations.
 * An installable onEdit trigger runs with full permissions.
 *
 * @param {object} e The event object from the onEdit trigger.
 */
/**
 * UPDATED: Now handles 'Rejected' status to send an automated rejection email.
 */
function handleEditTrigger(e) {
  // Defensive check: prevent crash when run manually in editor without event arguments
  if (!e || !e.range) {
    Logger.log("Trigger function handleEditTrigger was run manually from script editor without context.");
    return;
  }

  const range = e.range;
  const sheet = range.getSheet();
  const sheetName = sheet.getName();
  const editedRow = range.getRow();
  const editedColumn = range.getColumn();
  const newValue = e.value;

  // Cache Invalidation for Settings Sheet
  if (sheetName === SHEET_CONFIG) {
    try {
      CacheService.getScriptCache().remove("app_settings");
      Logger.log("Settings cache invalidated instantly because _Configuration sheet was edited.");
    } catch (cacheErr) {
      logErrorToSheet("handleEditTrigger_cache", cacheErr);
    }
    return;
  }

  const TARGET_SHEET = SHEET_PAYMENT_LOG;

  if (sheetName === TARGET_SHEET && editedRow > 1) {
    // Dynamically retrieve column indices from the headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const approvalColIndex = findColumnIndex(headers, ['ApprovalStatus', 'Status', 'Approval_Status']) + 1;
    const processingColIndex = findColumnIndex(headers, ['ProcessingStatus', 'Processing_Status', 'ProcessStatus']) + 1;

    if (approvalColIndex > 0 && processingColIndex > 0 && editedColumn === approvalColIndex) {
      const statusCell = sheet.getRange(editedRow, processingColIndex);

      if (newValue === 'Approved') {
        const currentStatus = statusCell.getValue();
        if (currentStatus === 'Success' || currentStatus === 'প্রসেসিং চলছে...') return;
        statusCell.setValue('প্রসেসিং চলছে...').setFontColor('#E67E22');
        SpreadsheetApp.flush();
        processSingleRow(editedRow);

      } else if (newValue === 'Rejected') {
        const currentStatus = statusCell.getValue();
        if (currentStatus === 'Rejected') return;
        statusCell.setValue('Rejected').setFontColor('#C0392B');
        sendRejectionEmail(editedRow);
      }
    }
  }
}

/**
 * NEW FEATURE: Sends a rejection email to the candidate.
 */
function sendRejectionEmail(rowNum) {
    try {
        const ss = getSpreadsheet();
        const paymentSheet = ss.getSheetByName(SHEET_PAYMENT_LOG);
        const masterSheet = ss.getSheetByName(SHEET_MASTER_LIST);

        if (!paymentSheet || !masterSheet) {
            throw new Error("Payment or Master sheet not found.");
        }

        const headers = paymentSheet.getRange(1, 1, 1, paymentSheet.getLastColumn()).getValues()[0];
        const rowData = paymentSheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];

        const phoneColIdx = findColumnIndex(headers, ['RegisteredPhoneNumber', 'RegisteredPhone', 'PhoneNumber', 'Phone', 'Mobile']);
        const reasonColIdx = findColumnIndex(headers, ['Rejection_Reason', 'Reason', 'RejectionReason']);
        
        if (phoneColIdx === -1) {
            throw new Error("Payment verification sheet missing registered phone column.");
        }

        const registeredPhone = String(rowData[phoneColIdx]).trim();
        const rejectionReason = reasonColIdx !== -1 ? String(rowData[reasonColIdx]).trim() : "অনির্দিষ্ট কারণে";

        const masterHeaders = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getValues()[0];
        const mPhoneIndex = findColumnIndex(masterHeaders, ['RegisteredPhoneNumber', 'RegisteredPhone', 'PhoneNumber', 'Phone', 'Mobile']);
        const mEmailIndex = findColumnIndex(masterHeaders, ['EmailAddress', 'Email']);
        const mNameIndex = findColumnIndex(masterHeaders, ['FullName', 'Name', 'CandidateName']);

        if (mPhoneIndex === -1 || mEmailIndex === -1 || mNameIndex === -1) {
            throw new Error("Master list missing required columns.");
        }

        const masterLastRow = masterSheet.getLastRow();
        if (masterLastRow < 2) throw new Error("Master list is empty.");
        const masterData = masterSheet.getRange(2, 1, masterLastRow - 1, masterHeaders.length).getValues();
        const emailMap = new Map();
        masterData.forEach(row => {
          emailMap.set(normalizePhoneNumber(row[mPhoneIndex]), {
            email: String(row[mEmailIndex]).trim(), 
            name: String(row[mNameIndex]).trim()
          });
        });

        const candidateInfo = emailMap.get(normalizePhoneNumber(registeredPhone));
        
        if (!candidateInfo || !candidateInfo.email.includes('@')) {
            throw new Error(`এই ফোন নম্বরের জন্য সঠিক ইমেইল পাওয়া যায়নি: ${registeredPhone}`);
        }
        
        const appSettings = getAppSettings();

        const subject = `আপনার আবেদন সংক্রান্ত জরুরি তথ্য - ${appSettings.instituteName}`;
        const htmlBody = createHtmlRejectionEmailBody(candidateInfo.name, rejectionReason, appSettings);

        GmailApp.sendEmail(candidateInfo.email, subject, "", { htmlBody: htmlBody });

    } catch (e) {
        logErrorToSheet("sendRejectionEmail", e);
    }
}

/**
 * Processes a single approved row to generate a PDF admit card, email it, and update the sheet.
 * @param {number} rowNum The specific row number in the payment log to process.
 */
function processSingleRow(rowNum) {
  const ss = getSpreadsheet();
  const paymentSheet = ss.getSheetByName(SHEET_PAYMENT_LOG);
  if (!paymentSheet) return;

  const headers = paymentSheet.getRange(1, 1, 1, paymentSheet.getLastColumn()).getValues()[0];
  const rowData = paymentSheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];

  // Resolve payment sheet columns dynamically
  const phoneColIndex = findColumnIndex(headers, ['RegisteredPhoneNumber', 'RegisteredPhone', 'PhoneNumber', 'Phone', 'Mobile']);
  const nameColIndex = findColumnIndex(headers, ['FullName', 'Name', 'CandidateName']);
  const serialColIndex = findColumnIndex(headers, ['SerialNumber', 'SerialNo', 'Serial', 'RollNo', 'Roll', 'SerialNumber_Roll', 'RollNumber']);
  const districtColIndex = findColumnIndex(headers, ['District', 'Zilla']);
  const statusColIndex = findColumnIndex(headers, ['ProcessingStatus', 'Processing_Status', 'ProcessStatus']);
  const pdfLinkColIndex = findColumnIndex(headers, ['AdmitCardLink', 'AdmitCard', 'Link', 'PDFLink']);

  if (phoneColIndex === -1 || nameColIndex === -1 || serialColIndex === -1 || statusColIndex === -1 || pdfLinkColIndex === -1) {
    throw new Error("Missing required columns in Payment_Verification_Log sheet.");
  }

  const currentProcessingStatus = String(rowData[statusColIndex]).trim();
  if (currentProcessingStatus === 'Success') return;

  try {
    // Check Template & Folder Configuration values
    if (!TEMPLATE_ID || TEMPLATE_ID === "YOUR_DOC_TEMPLATE_ID_HERE" || TEMPLATE_ID.trim() === "") {
      throw new Error("Admit Card Template ID কনফিগার করা হয়নি। অনুগ্রহ করে Config.gs ফাইলে TEMPLATE_ID সেট করুন।");
    }
    if (!FOLDER_ID || FOLDER_ID === "YOUR_PDF_OUTPUT_FOLDER_ID_HERE" || FOLDER_ID.trim() === "") {
      throw new Error("Output Folder ID কনফিগার করা হয়নি। অনুগ্রহ করে Config.gs ফাইলে FOLDER_ID সেট করুন।");
    }

    const masterSheet = ss.getSheetByName(SHEET_MASTER_LIST);
    if (!masterSheet) {
      throw new Error(`Master list sheet "${SHEET_MASTER_LIST}" not found.`);
    }

    const masterHeaders = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getValues()[0];
    const mPhoneIndex = findColumnIndex(masterHeaders, ['RegisteredPhoneNumber', 'RegisteredPhone', 'PhoneNumber', 'Phone', 'Mobile']);
    const mEmailIndex = findColumnIndex(masterHeaders, ['EmailAddress', 'Email']);
    
    if (mPhoneIndex === -1 || mEmailIndex === -1) {
      throw new Error("Master list missing required columns.");
    }

    const masterLastRow = masterSheet.getLastRow();
    if (masterLastRow < 2) throw new Error("Master list is empty.");
    const masterData = masterSheet.getRange(2, 1, masterLastRow - 1, masterHeaders.length).getValues();
    
    const emailMap = new Map();
    masterData.forEach(row => {
      emailMap.set(normalizePhoneNumber(row[mPhoneIndex]), String(row[mEmailIndex]).trim());
    });

    const candidateName = String(rowData[nameColIndex]).trim();
    const rollNumber = String(rowData[serialColIndex]).trim();
    const registeredPhone = String(rowData[phoneColIndex]).trim();
    const district = districtColIndex !== -1 ? String(rowData[districtColIndex]).trim() : "";
    const candidateEmail = emailMap.get(normalizePhoneNumber(registeredPhone));
    
    // Validate that a correct email was found.
    if (!candidateEmail || !candidateEmail.includes('@')) {
      throw new Error(`এই ফোন নম্বরের জন্য সঠিক ইমেইল পাওয়া যায়নি: ${registeredPhone}`);
    }

    // Fetch settings for exam details placeholders
    const appSettings = getAppSettings();

    // 1. Generate PDF from Template
    const newDocFile = DriveApp.getFileById(TEMPLATE_ID).makeCopy(`Admit Card - ${candidateName}`);
    const doc = DocumentApp.openById(newDocFile.getId());
    doc.getBody()
      .replaceText('{{FullName}}', candidateName)
      .replaceText('{{SerialNumber}}', rollNumber)
      .replaceText('{{District}}', district)
      .replaceText('{{EmailAddress}}', candidateEmail)
      .replaceText('{{PhoneNumber}}', registeredPhone)
      .replaceText('{{ExamDate}}', appSettings.examDate || "প্রবেশপত্র দেখুন")
      .replaceText('{{ExamTime}}', appSettings.examTime || "প্রবেশপত্র দেখুন")
      .replaceText('{{ExamVenue}}', appSettings.examVenue || "প্রবেশপত্র দেখুন");
    doc.saveAndClose();
    
    const pdfFile = DriveApp.getFolderById(FOLDER_ID).createFile(doc.getAs('application/pdf')).setName(`Admit Card - ${rollNumber}.pdf`);
    
    // 2. Send Email with PDF attachment
    GmailApp.sendEmail(candidateEmail, `আপনার পরীক্ষার প্রবেশপত্র - ${appSettings.instituteName}`, "", {
        htmlBody: createHtmlEmailBody(candidateName, rollNumber, appSettings),
        attachments: [pdfFile]
    });
    
    // 3. Update Sheet with Success Status and PDF link (columns are 1-based, so + 1)
    paymentSheet.getRange(rowNum, statusColIndex + 1).setValue('Success').setFontColor('#00684A');
    paymentSheet.getRange(rowNum, pdfLinkColIndex + 1).setValue(pdfFile.getUrl());
    
    // 4. Clean up the temporary Google Doc file (non-critical).
    try {
      DriveApp.getFileById(newDocFile.getId()).setTrashed(true);
    } catch (cleanupErr) {
      Logger.log(`Non-critical cleanup error for row ${rowNum}: ${cleanupErr.toString()}`);
    }

  } catch (e) {
    logErrorToSheet("processSingleRow", e);
    paymentSheet.getRange(rowNum, statusColIndex + 1).setValue(`ব্যর্থ: ${e.message}`).setFontColor('#C0392B');
  }
}

/**
 * IMPROVED: Creates a professional, responsive, and branded HTML email body.
 * This template is designed for maximum compatibility across email clients.
 *
 * @param {string} candidateName The name of the candidate receiving the email.
 * @param {string} rollNumber The roll number of the candidate.
 * @param {object} settings The application settings object, containing instituteName, logoUrl, social links, etc.
 * @return {string} The complete HTML string for the email body.
 */
function createHtmlEmailBody(candidateName, rollNumber, settings) {
  const instituteName = settings.instituteName || "আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট";
  
  // Social links and icons
  const social = {
      facebook: { link: 'https://www.facebook.com/assunnahskill', icon: 'https://img.icons8.com/fluency/48/facebook-new.png' },
      youtube: { link: 'https://www.youtube.com/@assunnahskill', icon: 'https://img.icons8.com/fluency/48/youtube-play.png' },
      whatsapp: { link: 'https://wa.me/8801409979967', icon: 'https://img.icons8.com/color/48/whatsapp.png' }
  };

  // Check if logo is valid
  const hasLogo = settings.logoUrl && 
                  settings.logoUrl.trim() !== "" && 
                  !settings.logoUrl.toLowerCase().includes("your_") &&
                  !settings.logoUrl.toLowerCase().includes("placeholder");

  return `
  <!DOCTYPE html>
  <html lang="bn">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>পরীক্ষার প্রবেশপত্র - ${instituteName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0;padding:0;background-color:#F0F3F1;font-family:'Noto Sans Bengali', SolaimanLipi, Kalpurush, Arial, sans-serif;-webkit-font-smoothing:antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F0F3F1;padding:20px 0;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#FFFFFF;border-radius:12px;border-top:6px solid #00684A;box-shadow:0 4px 12px rgba(26,62,47,0.05);overflow:hidden;margin:0 10px;">
            
            <!-- HEADER SECTION -->
            <tr>
              <td style="padding:25px 30px;background-color:#F9FAF9;text-align:center;border-bottom:1px solid #ECEFEC;">
                ${hasLogo ? `<img src="${settings.logoUrl}" alt="${instituteName} Logo" style="max-height:60px;margin-bottom:10px;display:inline-block;vertical-align:middle;">` : ""}
                <h2 style="color:#00684A;margin:0;font-size:20px;font-weight:700;line-height:1.4;">${instituteName}</h2>
              </td>
            </tr>
            
            <!-- CONTENT SECTION -->
            <tr>
              <td style="padding:30px 30px 20px 30px;">
                <p style="margin:0 0 15px 0;font-size:16px;color:#1A3E2F;font-weight:600;">প্রিয় ${candidateName},</p>
                <p style="margin:0 0 20px 0;font-size:15px;color:#52635A;line-height:1.7;text-align:justify;">
                  আস-সালামু আলাইকুম। অত্যন্ত আনন্দের সাথে জানাচ্ছি যে, আপনার পেমেন্টটি চেক করা হয়েছে। আপনার পরীক্ষার প্রবেশপত্র (Admit Card) তৈরি করে এই ইমেইলে পিডিএফ (PDF) আকারে পাঠানো হলো।
                </p>
                
                <!-- EXAM DETAILS CARD -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F4F7F5;border-left:4px solid #B27A23;border-radius:6px;margin:25px 0;padding:20px;">
                  <tr>
                    <td style="padding-bottom:12px;border-bottom:1px solid #E0E6E2;">
                      <h4 style="margin:0;color:#1A3E2F;font-size:16px;font-weight:700;">পরীক্ষার বিবরণ (Exam Details)</h4>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:12px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;color:#333;">
                        <tr>
                          <td style="padding:5px 0;font-weight:600;color:#52635A;width:120px;">রোল নম্বর:</td>
                          <td style="padding:5px 0;color:#1A3E2F;font-weight:700;font-size:15px;">${rollNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding:5px 0;font-weight:600;color:#52635A;">পরীক্ষার তারিখ:</td>
                          <td style="padding:5px 0;color:#1A3E2F;font-weight:600;">${settings.examDate || "প্রবেশপত্র দেখুন"}</td>
                        </tr>
                        <tr>
                          <td style="padding:5px 0;font-weight:600;color:#52635A;">পরীক্ষার সময়:</td>
                          <td style="padding:5px 0;color:#1A3E2F;font-weight:600;">${settings.examTime || "প্রবেশপত্র দেখুন"}</td>
                        </tr>
                        <tr>
                          <td style="padding:5px 0;font-weight:600;color:#52635A;">পরীক্ষার কেন্দ্র:</td>
                          <td style="padding:5px 0;color:#1A3E2F;font-weight:600;">${settings.examVenue || "প্রবেশপত্র দেখুন"}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- INSTRUCTIONS SECTION -->
                <div style="margin:25px 0 10px 0;">
                  <h4 style="margin:0 0 12px 0;color:#1A3E2F;font-size:15px;font-weight:700;">পরীক্ষার্থীদের জন্য জরুরি নির্দেশনা:</h4>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;color:#52635A;line-height:1.6;">
                    <tr>
                      <td valign="top" style="width:20px;color:#B27A23;font-weight:bold;">১.</td>
                      <td style="padding-bottom:8px;">প্রবেশপত্রটি (Admit Card) অবশ্যই রঙিন প্রিন্ট করে পরীক্ষা কেন্দ্রে সাথে নিয়ে আসতে হবে।</td>
                    </tr>
                    <tr>
                      <td valign="top" style="color:#B27A23;font-weight:bold;">২.</td>
                      <td style="padding-bottom:8px;">পরীক্ষা শুরুর অন্তত ৩০ মিনিট আগে পরীক্ষা কেন্দ্রে উপস্থিত হতে হবে।</td>
                    </tr>
                    <tr>
                      <td valign="top" style="color:#B27A23;font-weight:bold;">৩.</td>
                      <td style="padding-bottom:8px;">পরীক্ষার হলে লেখার জন্য প্রয়োজনীয় কলম, পেন্সিল ও অন্যান্য জিনিস সাথে নিয়ে আসবেন।</td>
                    </tr>
                    <tr>
                      <td valign="top" style="color:#C0392B;font-weight:bold;">৪.</td>
                      <td style="padding-bottom:8px;color:#C0392B;font-weight:bold;">পরীক্ষা কেন্দ্রে কোনো প্রকার মোবাইল ফোন, স্মার্টওয়াচ বা ইলেকট্রনিক ডিভাইস আনা সম্পূর্ণ নিষেধ।</td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            
            <!-- FOOTER SIGNATURE SECTION -->
            <tr>
              <td style="padding:20px 30px;background-color:#F9FAF9;border-top:1px solid #ECEFEC;text-align:center;">
                <p style="margin:0 0 5px 0;font-size:14px;color:#52635A;">শুভেচ্ছান্তে,</p>
                <p style="margin:0 0 15px 0;font-size:16px;color:#1A3E2F;font-weight:700;">${instituteName}</p>
                
                <!-- SOCIAL MEDIA LINKS -->
                <div style="margin-top:10px;">
                  <a href="${social.facebook.link}" target="_blank" style="text-decoration:none;margin:0 6px;"><img src="${social.facebook.icon}" width="24" height="24" alt="Facebook" style="display:inline-block;vertical-align:middle;border:0;"></a>
                  <a href="${social.youtube.link}" target="_blank" style="text-decoration:none;margin:0 6px;"><img src="${social.youtube.icon}" width="24" height="24" alt="YouTube" style="display:inline-block;vertical-align:middle;border:0;"></a>
                  <a href="${social.whatsapp.link}" target="_blank" style="text-decoration:none;margin:0 6px;"><img src="${social.whatsapp.icon}" width="24" height="24" alt="WhatsApp" style="display:inline-block;vertical-align:middle;border:0;"></a>
                </div>
              </td>
            </tr>
            
          </table>
          <p style="margin:15px 0 0 0;font-size:11px;color:#8B9B90;text-align:center;">এটি একটি সিস্টেম জেনারেটেড ইমেইল। সরাসরি উত্তর দেওয়ার প্রয়োজন নেই।</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * NEW FEATURE: Creates a professional, responsive, and branded HTML rejection email body.
 * Matches the design guidelines and font sizes of the portal.
 *
 * @param {string} candidateName The name of the candidate.
 * @param {string} rejectionReason The reason why the application was rejected.
 * @param {object} settings The application settings.
 * @return {string} The complete HTML string for the rejection email body.
 */
function createHtmlRejectionEmailBody(candidateName, rejectionReason, settings) {
  const instituteName = settings.instituteName || "আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট";
  
  const social = {
      facebook: { link: 'https://www.facebook.com/assunnahskill', icon: 'https://img.icons8.com/fluency/48/facebook-new.png' },
      youtube: { link: 'https://www.youtube.com/@assunnahskill', icon: 'https://img.icons8.com/fluency/48/youtube-play.png' },
      whatsapp: { link: 'https://wa.me/8801409979967', icon: 'https://img.icons8.com/color/48/whatsapp.png' }
  };

  const hasLogo = settings.logoUrl && 
                  settings.logoUrl.trim() !== "" && 
                  !settings.logoUrl.toLowerCase().includes("your_") &&
                  !settings.logoUrl.toLowerCase().includes("placeholder");

  return `
  <!DOCTYPE html>
  <html lang="bn">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>আবেদন সংক্রান্ত জরুরি তথ্য - ${instituteName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0;padding:0;background-color:#F0F3F1;font-family:'Noto Sans Bengali', SolaimanLipi, Kalpurush, Arial, sans-serif;-webkit-font-smoothing:antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F0F3F1;padding:20px 0;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#FFFFFF;border-radius:12px;border-top:6px solid #8C2D19;box-shadow:0 4px 12px rgba(26,62,47,0.05);overflow:hidden;margin:0 10px;">
            
            <!-- HEADER SECTION -->
            <tr>
              <td style="padding:25px 30px;background-color:#F9FAF9;text-align:center;border-bottom:1px solid #ECEFEC;">
                ${hasLogo ? `<img src="${settings.logoUrl}" alt="${instituteName} Logo" style="max-height:60px;margin-bottom:10px;display:inline-block;vertical-align:middle;">` : ""}
                <h2 style="color:#8C2D19;margin:0;font-size:20px;font-weight:700;line-height:1.4;">${instituteName}</h2>
              </td>
            </tr>
            
            <!-- CONTENT SECTION -->
            <tr>
              <td style="padding:30px 30px 20px 30px;">
                <p style="margin:0 0 15px 0;font-size:16px;color:#1A3E2F;font-weight:600;">প্রিয় ${candidateName},</p>
                <p style="margin:0 0 20px 0;font-size:15px;color:#52635A;line-height:1.7;text-align:justify;">
                  আস-সালামু আলাইকুম। আপনার পেমেন্ট ফি সংক্রান্ত আবেদনের স্ট্যাটাস আপডেট করা হয়েছে। দুঃখিত যে, আপনার আবেদনটি নিম্নোক্ত কারণে অনুমোদন করা সম্ভব হয়নি।
                </p>
                
                <!-- REJECTION DETAILS CARD -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FDF6F5;border-left:4px solid #8C2D19;border-radius:6px;margin:25px 0;padding:20px;">
                  <tr>
                    <td style="padding-bottom:12px;border-bottom:1px solid #FADAD2;">
                      <h4 style="margin:0;color:#8C2D19;font-size:16px;font-weight:700;">বাতিল হওয়ার কারণ (Rejection Reason)</h4>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:12px;font-size:15px;color:#1E2722;font-weight:600;line-height:1.6;">
                      ${rejectionReason}
                    </td>
                  </tr>
                </table>
                
                <!-- NEXT STEPS SECTION -->
                <div style="margin:25px 0 10px 0;">
                  <h4 style="margin:0 0 12px 0;color:#1A3E2F;font-size:15px;font-weight:700;">করণীয় পদক্ষেপ:</h4>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;color:#52635A;line-height:1.6;">
                    <tr>
                      <td valign="top" style="width:20px;color:#8C2D19;font-weight:bold;">১.</td>
                      <td style="padding-bottom:8px;">অনুগ্রহ করে আপনার পেমেন্ট তথ্যের বিবরণ (TrxID ও মোবাইল নম্বর) পুনরায় পরীক্ষা করুন।</td>
                    </tr>
                    <tr>
                      <td valign="top" style="color:#8C2D19;font-weight:bold;">২.</td>
                      <td style="padding-bottom:8px;">যদি পেমেন্ট সাবমিশনে ভুল হয়ে থাকে, তবে সঠিক তথ্য দিয়ে পুনরায় ফি আবেদন ফরমটি সাবমিট করুন।</td>
                    </tr>
                    <tr>
                      <td valign="top" style="color:#8C2D19;font-weight:bold;">৩.</td>
                      <td style="padding-bottom:8px;">যেকোনো জরুরি প্রয়োজনে সরাসরি আমাদের হেল্পলাইন নম্বর অথবা অফিসে যোগাযোগ করুন।</td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            
            <!-- FOOTER SIGNATURE SECTION -->
            <tr>
              <td style="padding:20px 30px;background-color:#F9FAF9;border-top:1px solid #ECEFEC;text-align:center;">
                <p style="margin:0 0 5px 0;font-size:14px;color:#52635A;">শুভেচ্ছান্তে,</p>
                <p style="margin:0 0 15px 0;font-size:16px;color:#1A3E2F;font-weight:700;">${instituteName}</p>
                
                <!-- SOCIAL MEDIA LINKS -->
                <div style="margin-top:10px;">
                  <a href="${social.facebook.link}" target="_blank" style="text-decoration:none;margin:0 6px;"><img src="${social.facebook.icon}" width="24" height="24" alt="Facebook" style="display:inline-block;vertical-align:middle;border:0;"></a>
                  <a href="${social.youtube.link}" target="_blank" style="text-decoration:none;margin:0 6px;"><img src="${social.youtube.icon}" width="24" height="24" alt="YouTube" style="display:inline-block;vertical-align:middle;border:0;"></a>
                  <a href="${social.whatsapp.link}" target="_blank" style="text-decoration:none;margin:0 6px;"><img src="${social.whatsapp.icon}" width="24" height="24" alt="WhatsApp" style="display:inline-block;vertical-align:middle;border:0;"></a>
                </div>
              </td>
            </tr>
            
          </table>
          <p style="margin:15px 0 0 0;font-size:11px;color:#8B9B90;text-align:center;">এটি একটি সিস্টেম জেনারেটেড ইমেইল। সরাসরি উত্তর দেওয়ার প্রয়োজন নেই।</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

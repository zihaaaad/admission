// =================================================================
//      BACKEND LOGIC FOR PAYMENT & ADMIT CARD SYSTEM
// =================================================================
const MASTER_SHEET_NAME = 'Candidate_Master_List';
const PAYMENT_SHEET_NAME = 'Payment_Verification_Log';


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
        return { found: false, message: "অবৈধ ফোন নম্বর ফরম্যাট। সঠিক ১১-ডিজিটের নম্বর দিন।" };
    }
      
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const paymentSheet = ss.getSheetByName(SHEET_PAYMENT_LOG);
    const masterSheet = ss.getSheetByName(SHEET_MASTER_LIST);

    if (!paymentSheet || !masterSheet) {
      throw new Error("Payment or Master sheet not found configuration error.");
    }

    // 1. DUPLICATE CHECK: Prevent resubmission.
    const lastRow = paymentSheet.getLastRow();
    if (lastRow > 1) {
      const paymentData = paymentSheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
      if (paymentData.map(p => String(p).trim()).includes(phoneTrimmed)) {
        return { 
          found: false, 
          message: 'এই নম্বর থেকে ফি প্রদানের তথ্য ইতিমধ্যে জমা দেওয়া হয়েছে। কোনো পরিবর্তনের জন্য অফিসে যোগাযোগ করুন।' 
        };
      }
    }

    // 2. SEARCH MASTER LIST: Verify the candidate exists.
    const masterLastRow = masterSheet.getLastRow();
    if (masterLastRow > 1) {
      const masterData = masterSheet.getRange(2, 1, masterLastRow - 1, 5).getValues();
      for (const row of masterData) {
        if (String(row[2]).trim() === phoneTrimmed) { // Column C is RegisteredPhoneNumber
          return { found: true, serial: row[0], name: row[1], district: row[3], email: row[4] };
        }
      }
    }
    
    return { found: false, message: 'দুঃখিত, এই নম্বরের কোনো তথ্য আমাদের প্রাথমিক তালিকায় পাওয়া যায়নি।' };
  } catch (e) {
    logErrorToSheet("getUserDetails", e);
    return { found: false, message: "সিস্টেমের ত্রুটির কারণে তথ্য যাচাই করা সম্ভব হচ্ছে না।" };
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

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const paymentSheet = ss.getSheetByName(SHEET_PAYMENT_LOG);

    if (!paymentSheet) {
      return { found: false, message: "সিস্টেম ত্রুটি: পেমেন্ট তথ্য সংরক্ষণ টেবিল পাওয়া যায়নি।" };
    }

    const lastRow = paymentSheet.getLastRow();
    if (lastRow < 2) {
      return { found: false, message: "কোনো পেমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি।" };
    }

    const headers = paymentSheet.getRange(1, 1, 1, paymentSheet.getLastColumn()).getValues()[0];
    const data = paymentSheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

    const phoneColIndex = headers.indexOf('RegisteredPhoneNumber');
    const statusColIndex = headers.indexOf('ApprovalStatus');
    const rejectReasonColIndex = headers.indexOf('Rejection_Reason');

    if (phoneColIndex === -1 || statusColIndex === -1) {
      return { found: false, message: "সিস্টেম কলাম ত্রুটি: প্রয়োজনীয় কলামসমূহ পাওয়া যায়নি।" };
    }

    for (let i = 0; i < data.length; i++) {
      if (String(data[i][phoneColIndex]).trim() === phoneTrimmed) {
        const status = data[i][statusColIndex] || 'Pending';
        if (status === 'Approved') {
          return { found: true, status: 'Approved', message: "✅ আপনার পেমেন্ট অনুমোদিত হয়েছে! আপনার প্রবেশপত্র ইমেইলে পাঠিয়ে দেওয়া হয়েছে।" };
        } else if (status === 'Rejected') {
          const reason = rejectReasonColIndex !== -1 ? data[i][rejectReasonColIndex] : '';
          return { found: true, status: 'Rejected', message: `❌ আপনার পেমেন্ট বাতিল করা হয়েছে। কারণ: ${reason || 'অনির্দিষ্ট'}` };
        } else {
          return { found: true, status: 'Pending', message: "⏳ আপনার পেমেন্ট যাচাইকরণাধীন রয়েছে। অনুগ্রহ করে অপেক্ষা করুন।" };
        }
      }
    }

    return { found: false, message: "আপনার মোবাইল নম্বরের বিপরীতে কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।" };
  } catch (e) {
    logErrorToSheet("getPaymentStatus", e);
    return { found: false, message: "স্ট্যাটাস লোড করার সময় একটি ত্রুটি ঘটেছে।" };
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
      return { error: "অবৈধ মোবাইল নম্বর ফরম্যাট।" };
    }
    if (!/^01[3-9]\d{8}$/.test(paymentSource)) {
      return { error: "অবৈধ প্রেরক মোবাইল নম্বর ফরম্যাট।" };
    }
    if (trxId.length < 8) {
      return { error: "অবৈধ Transaction ID। অনুগ্রহ করে সঠিক TrxID দিন।" };
    }

    // 2. Re-Verify candidate in master list to prevent form spoofing
    const userCheck = getUserDetails(phone);
    if (!userCheck.found) {
      return { error: "দুঃখিত, তথ্য যাচাই করা সম্ভব হয়নি: " + userCheck.message };
    }

    const paymentSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PAYMENT_LOG);
    
    // Append data safely to the log sheet
    paymentSheet.appendRow([
      new Date(),
      "'" + phone,
      userCheck.name,
      userCheck.serial,
      userCheck.district,
      formObject.paymentMethod,
      "'" + paymentSource,
      trxId,
      'Pending',
      '', '' 
    ]);

    return { 
      success: "আপনার তথ্য সফলভাবে জমা হয়েছে। পেমেন্ট যাচাই করার পর ২৪ ঘণ্টার মধ্যে আপনার ইমেইলে অ্যাডমিট কার্ড পাঠানো হবে। ধন্যবাদ।" 
    };

  } catch (e) {
    logErrorToSheet("doPost", e);
    return { 
      error: "একটি অপ্রত্যাশিত ত্রুটি দেখা দিয়েছে। তথ্য জমা দেওয়া সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" 
    };
  } finally {
    lock.releaseLock();
  }
}

// =================================================================
//      AUTOMATION & ADMIN FUNCTIONS (Admit Card Generation)
// =================================================================

/**
 * Creates a custom menu in the spreadsheet UI for authorized users.
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('⚙️ অটোমেশন')
      .addItem('✅ সকল অনুমোদিত পেমেন্ট প্রসেস করুন', 'processAllApprovedManually')
      .addToUi();
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

    SpreadsheetApp.getUi().alert(`প্রক্রিয়া সম্পন্ন হয়েছে! মোট ${processedCount} টি অনুমোদিত প্রবেশপত্র পাঠানো হয়েছে।`);
  } catch (e) {
    Logger.log("ERROR in processAllApprovedManually: " + e.toString());
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
  const range = e.range;
  const sheet = range.getSheet();
  const editedRow = range.getRow();
  const editedColumn = range.getColumn();
  const newValue = e.value;

  const TARGET_SHEET = SHEET_PAYMENT_LOG;
  const TRIGGER_COLUMN_INDEX = 9; // Column I is 'ApprovalStatus'

  if (sheet.getName() === TARGET_SHEET && editedColumn === TRIGGER_COLUMN_INDEX && editedRow > 1) {
    const statusCell = sheet.getRange(editedRow, TRIGGER_COLUMN_INDEX + 1);

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

/**
 * NEW FEATURE: Sends a rejection email to the candidate.
 */
function sendRejectionEmail(rowNum) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const paymentSheet = ss.getSheetByName(SHEET_PAYMENT_LOG);
        const masterSheet = ss.getSheetByName(SHEET_MASTER_LIST);

        const headers = paymentSheet.getRange(1, 1, 1, paymentSheet.getLastColumn()).getValues()[0];
        const rowData = paymentSheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
        let rowObject = {};
        headers.forEach((header, i) => rowObject[header] = rowData[i]);

        const masterData = masterSheet.getRange(2, 1, masterSheet.getLastRow(), 5).getValues();
        const emailMap = new Map();
        masterData.forEach(row => emailMap.set(String(row[2]).trim(), {email: row[4], name: row[1]}));

        const registeredPhone = String(rowObject['RegisteredPhoneNumber']).trim();
        const candidateInfo = emailMap.get(registeredPhone);
        
        if (!candidateInfo || !candidateInfo.email.includes('@')) {
            throw new Error("Candidate email not found.");
        }
        
        const rejectionReason = rowObject['Rejection_Reason'] || "অনির্দিষ্ট কোনো কারণে";
        const appSettings = getAppSettings();

        const subject = `আপনার আবেদন সংক্রান্ত জরুরি তথ্য - ${appSettings.instituteName}`;
        const body = `
            <p>প্রিয় ${candidateInfo.name},</p>
            <p>দুঃখের সাথে জানাচ্ছি যে, আপনার অ্যাডমিট কার্ড ফি প্রদানের আবেদনটি "${rejectionReason}" এর জন্য গ্রহণ করা সম্ভব হয়নি।</p>
            <p>বিস্তারিত জানতে বা কোনো প্রশ্ন থাকলে অনুগ্রহ করে আমাদের অফিসে সরাসরি যোগাযোগ করুন।</p>
            <p>শুভেচ্ছান্তে,<br><strong>${appSettings.instituteName}</strong></p>
        `;

        GmailApp.sendEmail(candidateInfo.email, subject, "", { htmlBody: body });

    } catch (e) {
        Logger.log(`Failed to send rejection email for row ${rowNum}: ${e.toString()}`);
    }
}

/**
 * Processes a single approved row to generate a PDF admit card, email it, and update the sheet.
 * @param {number} rowNum The specific row number in the payment log to process.
 */
function processSingleRow(rowNum) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const paymentSheet = ss.getSheetByName(SHEET_PAYMENT_LOG);
  const headers = paymentSheet.getRange(1, 1, 1, paymentSheet.getLastColumn()).getValues()[0];
  const rowData = paymentSheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
  let rowObject = {};
  headers.forEach((header, i) => rowObject[header] = rowData[i]);

  // Prevent re-processing of already successful entries.
  if (rowObject['ProcessingStatus'] === 'Success') return;

  const statusColIndex = headers.indexOf('ProcessingStatus') + 1;
  const pdfLinkColIndex = headers.indexOf('AdmitCardLink') + 1;

  try {
    const masterSheet = ss.getSheetByName(SHEET_MASTER_LIST);
    const masterData = masterSheet.getRange(2, 1, masterSheet.getLastRow(), 5).getValues();
    const emailMap = new Map();
    masterData.forEach(row => emailMap.set(String(row[2]).trim(), row[4]));

    const candidateName = rowObject['FullName'];
    const rollNumber = rowObject['SerialNumber'];
    const registeredPhone = String(rowObject['RegisteredPhoneNumber']).trim();
    const candidateEmail = emailMap.get(registeredPhone);
    
    // Validate that a correct email was found.
    if (!candidateEmail || !candidateEmail.includes('@')) {
      throw new Error(`এই ফোন নম্বরের জন্য সঠিক ইমেইল পাওয়া যায়নি: ${registeredPhone}`);
    }

    // 1. Generate PDF from Template
    const newDocFile = DriveApp.getFileById(TEMPLATE_ID).makeCopy(`Admit Card - ${candidateName}`);
    const doc = DocumentApp.openById(newDocFile.getId());
    doc.getBody()
      .replaceText('{{FullName}}', candidateName)
      .replaceText('{{SerialNumber}}', rollNumber)
      .replaceText('{{District}}', rowObject['District'])
      .replaceText('{{EmailAddress}}', candidateEmail)
      .replaceText('{{PhoneNumber}}', registeredPhone);
    doc.saveAndClose();
    
    const pdfFile = DriveApp.getFolderById(FOLDER_ID).createFile(doc.getAs('application/pdf')).setName(`Admit Card - ${rollNumber}.pdf`);
    
    // 2. Send Email with PDF attachment
    const appSettings = getAppSettings();
    GmailApp.sendEmail(candidateEmail, `আপনার পরীক্ষার প্রবেশপত্র - ${appSettings.instituteName}`, "", {
        htmlBody: createHtmlEmailBody(candidateName, appSettings),
        attachments: [pdfFile]
    });
    
    // 3. Update Sheet with Success Status and PDF link
    paymentSheet.getRange(rowNum, statusColIndex).setValue('Success').setFontColor('#00684A');
    paymentSheet.getRange(rowNum, pdfLinkColIndex).setValue(pdfFile.getUrl());
    
    // 4. Clean up the temporary Google Doc file.
    DriveApp.getFileById(newDocFile.getId()).setTrashed(true);

  } catch (e) {
    Logger.log(`ERROR processing row ${rowNum}: ${e.toString()}`);
    paymentSheet.getRange(rowNum, statusColIndex).setValue(`ব্যর্থ: ${e.message}`).setFontColor('#C0392B');
  }
}

/**
 * IMPROVED: Creates a professional, responsive, and branded HTML email body.
 * This template is designed for maximum compatibility across email clients.
 *
 * @param {string} candidateName The name of the candidate receiving the email.
 * @param {object} settings The application settings object, containing instituteName, logoUrl, social links, etc.
 * @return {string} The complete HTML string for the email body.
 */
function createHtmlEmailBody(candidateName, settings) {
  const instituteName = settings.instituteName || "আপনার প্রতিষ্ঠান";
  
  // Social links and icons - Add more here if needed
  const social = {
      facebook: { link: 'https://www.facebook.com/assunnahskill', icon: 'https://img.icons8.com/fluency/48/facebook-new.png' },
      youtube: { link: 'https://www.youtube.com/@assunnahskill', icon: 'https://img.icons8.com/fluency/48/youtube-play.png' },
      whatsapp: { link: 'https://wa.me/8801409979967', icon: 'https://img.icons8.com/color/48/whatsapp.png' }
  };

  return `
  <!DOCTYPE html>
  <html lang="bn">
  <head>
    <meta charset="UTF-8">
    <title>আপনার পরীক্ষার প্রবেশপত্র</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f7f9;font-family:Arial, sans-serif;">
    <div style="max-width:600px;margin:20px auto;background:#fff;padding:20px;border-radius:8px;border-top:5px solid #00684A;">
        <h2 style="color:#00684A;text-align:center;">${instituteName}</h2>
        <p>প্রিয় <strong>${candidateName}</strong>,</p>
        <p>আপনার প্রবেশপত্রটি ফি পেমেন্ট সম্পন্ন হওয়ায় সফলভাবে জেনারেট হয়েছে এবং এই ইমেইলের সাথে পিডিএফ (PDF) ফরম্যাটে সংযুক্ত করা হয়েছে।</p>
        <p>অনুগ্রহ করে ফাইলটি ডাউনলোড করে কালার প্রিন্ট করে নিন এবং পরীক্ষার দিন সাথে নিয়ে আসুন।</p>
        <hr style="border:0;border-top:1px dashed #eee;margin:20px 0;">
        <p style="font-size:12px;color:#777;text-align:center;">যোগাযোগ ও বিস্তারিত জানতে আমাদের সোশ্যাল মিডিয়া বা হোয়াটসঅ্যাপ নাম্বারে যোগাযোগ করতে পারেন।</p>
        <div style="text-align:center;margin-top:10px;">
            <a href="${social.facebook.link}"><img src="${social.facebook.icon}" width="30" style="margin:0 5px;"></a>
            <a href="${social.youtube.link}"><img src="${social.youtube.icon}" width="30" style="margin:0 5px;"></a>
            <a href="${social.whatsapp.link}"><img src="${social.whatsapp.icon}" width="30" style="margin:0 5px;"></a>
        </div>
    </div>
  </body>
  </html>
  `;
}

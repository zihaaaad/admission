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
      Logger.log("CRITICAL ERROR: Payment or Master sheet not found.");
      return { found: false, message: "সিস্টেম কনফিগারেশন ত্রুটি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।" };
    }

    // 1. DUPLICATE CHECK: Prevent resubmission.
    const paymentData = paymentSheet.getRange(2, 2, paymentSheet.getLastRow(), 1).getValues().flat();
    if (paymentData.map(p => String(p).trim()).includes(phoneTrimmed)) {
      return { 
        found: false, 
        message: 'এই নম্বর থেকে ফি প্রদানের তথ্য ইতিমধ্যে জমা দেওয়া হয়েছে। কোনো পরিবর্তনের জন্য অফিসে যোগাযোগ করুন।' 
      };
    }

    // 2. SEARCH MASTER LIST: Verify the candidate exists.
    const masterData = masterSheet.getRange(2, 1, masterSheet.getLastRow(), 5).getValues();
    for (const row of masterData) {
      if (String(row[2]).trim() === phoneTrimmed) { // Column C is RegisteredPhoneNumber
        return { found: true, serial: row[0], name: row[1], district: row[3], email: row[4] };
      }
    }
    
    return { found: false, message: 'দুঃখিত, এই নম্বরের কোনো তথ্য আমাদের প্রাথমিক তালিকায় পাওয়া যায়নি।' };
  } catch (e) {
    Logger.log("FATAL ERROR in getUserDetails: " + e.toString());
    return { found: false, message: "সিস্টেমের ত্রুটির কারণে তথ্য যাচাই করা সম্ভব হচ্ছে না।" };
  }
}

/**
 * CRITICAL FIX: Handles the POST request and returns a structured JSON object
 * instead of a plain string. This prevents the 'undefined' error on the client side.
 *
 * @param {object} formObject The data submitted from the HTML form.
 * @return {object} An object with either a 'success' or 'error' key.
 */
function doPost(formObject) {
  try {
    const paymentSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PAYMENT_LOG);
    
    // Append data to the log sheet
    paymentSheet.appendRow([
      new Date(),
      "'" + formObject.phone,
      formObject.name,
      formObject.serial,
      formObject.district,
      formObject.paymentMethod,
      "'" + formObject.paymentSource,
      formObject.trxId,
      'Pending',
      '', '' 
    ]);

    // Return a success object
    return { 
      success: "আপনার তথ্য সফলভাবে জমা হয়েছে। পেমেন্ট যাচাই করার পর ২৪ ঘণ্টার মধ্যে আপনার ইমেইলে অ্যাডমিট কার্ড পাঠানো হবে। ধন্যবাদ।" 
    };

  } catch (e) {
    Logger.log("FATAL ERROR in doPost: " + e.toString());
    
    // Return an error object
    return { 
      error: "একটি অপ্রত্যাশিত ত্রুটি দেখা দিয়েছে। তথ্য জমা দেওয়া সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" 
    };
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

  const TARGET_SHEET = PAYMENT_SHEET_NAME;
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
        const paymentSheet = ss.getSheetByName(PAYMENT_SHEET_NAME);
        const masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);

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
  const paymentSheet = ss.getSheetByName(PAYMENT_SHEET_NAME);
  const headers = paymentSheet.getRange(1, 1, 1, paymentSheet.getLastColumn()).getValues()[0];
  const rowData = paymentSheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
  let rowObject = {};
  headers.forEach((header, i) => rowObject[header] = rowData[i]);

  // Prevent re-processing of already successful entries.
  if (rowObject['ProcessingStatus'] === 'Success') return;

  const statusColIndex = headers.indexOf('ProcessingStatus') + 1;
  const pdfLinkColIndex = headers.indexOf('AdmitCardLink') + 1;

  try {
    const masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
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

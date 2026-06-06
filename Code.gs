// =================================================================
//      MAIN ROUTER & WEB APP LOGIC
//      This file acts as the main controller for the web application.
// =================================================================

/**
 * UPDATED: This is the main entry point for the web application.
 * The routing logic now includes a custom, well-designed HTML page for when all systems are inactive.
 */
function doGet(e) {
  const settings = getAppSettings();
  
  const isResultActive = settings.resultCheckerActive;
  const isPaymentActive = settings.paymentFormActive;
  const isStatusCheckActive = settings.statusCheckActive;

  // Scenario 1: More than one system is active, show the landing page.
  if ((isResultActive && isPaymentActive) || (isResultActive && isStatusCheckActive) || (isPaymentActive && isStatusCheckActive)) {
    const template = HtmlService.createTemplateFromFile('Index');
    template.settings = settings;
    template.initialView = 'landingView'; 
    return template.evaluate().setTitle(settings.appTitle);
  }
  // Scenario 2: Only the Result Checker is active, load it directly.
  else if (isResultActive) {
    const template = HtmlService.createTemplateFromFile('Index');
    template.settings = settings;
    template.initialView = 'resultView';
    return template.evaluate().setTitle(settings.appTitle + " - ফলাফল");
  }
  // Scenario 3: Only the Payment Form is active, load it directly.
  else if (isPaymentActive) {
    const template = HtmlService.createTemplateFromFile('Index');
    template.settings = settings;
    template.initialView = 'paymentView';
    return template.evaluate().setTitle(settings.appTitle + " - ফি প্রদান");
  }
  // Scenario 4: Only the Status Checker is active, load it directly.
  else if (isStatusCheckActive) {
    const template = HtmlService.createTemplateFromFile('Index');
    template.settings = settings;
    template.initialView = 'statusCheckView';
    return template.evaluate().setTitle(settings.appTitle + " - স্ট্যাটাস যাচাই");
  }
  // --- NEW & IMPROVED SCENARIO 5 ---
  // If no systems are active, generate and return a beautiful "Currently Closed" page.
  else {
    const instituteName = settings.instituteName || DEFAULTS.INSTITUTE_NAME;
    const logoUrl = settings.logoUrl || DEFAULTS.LOGO_URL;
    
    // Create the HTML content directly here
    let htmlOutput = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&display=swap" rel="stylesheet">
        <title>কার্যক্রম সাময়িকভাবে বন্ধ</title>
        <style>
          body { 
            font-family: 'Noto Sans Bengali', sans-serif; 
            background-color: #F4F7F9; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0;
            color: #2C3E50;
            padding: 20px;
          }
          .card {
            background-color: #FFFFFF;
            border-radius: 16px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
            text-align: center;
            padding: 40px 50px;
            max-width: 500px;
            width: 100%;
            border-top: 5px solid #E67E22;
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .card img {
            max-width: 200px;
            margin-bottom: 20px;
          }
          .card h2 {
            font-size: 1.8rem;
            font-weight: 700;
            color: #E67E22;
            margin-bottom: 15px;
          }
          .card p {
            font-size: 1.1rem;
            line-height: 1.7;
            color: #555;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="${logoUrl}" alt="${instituteName} Logo">
          <h2>কার্যক্রম সাময়িকভাবে বন্ধ আছে</h2>
          <p>
            এই মুহূর্তে আমাদের অনলাইন ভর্তি বা ফলাফল সংক্রান্ত কোনো কার্যক্রম চালু নেই। 
            অনুগ্রহ করে পরবর্তী আপডেটের জন্য অপেক্ষা করুন অথবা আমাদের অফিসের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </body>
      </html>
    `;
    
    return HtmlService.createHtmlOutput(htmlOutput)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }
}

/**
 * Reads the _Configuration sheet and returns a cached/clean settings object.
 */
function getAppSettings() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("app_settings");
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch(e) {}
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_CONFIG);

    if (!sheet) {
        throw new Error(`Configuration sheet named "${SHEET_CONFIG}" not found.`);
    }

    const data = sheet.getRange("A2:B" + sheet.getLastRow()).getValues();
    const settings = {};
    let paymentOptions = [];

    data.forEach(row => {
      const key = row[0];
      const value = row[1];
      if (key && value !== "") {
        if (key === 'paymentOptions') {
          paymentOptions.push(value);
        } else {
          settings[key] = value;
        }
      }
    });

    settings.paymentOptions = paymentOptions;
    settings.resultCheckerActive = (String(settings.resultCheckerActive).toUpperCase() === 'TRUE');
    settings.paymentFormActive = (String(settings.paymentFormActive).toUpperCase() === 'TRUE');
    settings.statusCheckActive = (String(settings.statusCheckActive).toUpperCase() === 'TRUE');
    
    if (settings.instructions) {
      settings.instructions = settings.instructions
        .toString()
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>') 
        .replace(/\n/g, '<br>');
    }

    // Cache configurations for 10 minutes (600 seconds)
    cache.put("app_settings", JSON.stringify(settings), 600);
    return settings;

  } catch (e) {
      logErrorToSheet("getAppSettings", e);
      return { 
          appTitle: DEFAULTS.APP_TITLE, 
          instituteName: DEFAULTS.INSTITUTE_NAME,
          logoUrl: DEFAULTS.LOGO_URL,
          resultCheckerActive: false,
          paymentFormActive: false,
          statusCheckActive: false,
          paymentOptions: [],
          instructions: "দুঃখিত, সিস্টেমের নির্দেশনা এই মুহূর্তে লোড করা সম্ভব হচ্ছে না।"
      };
  }
}

/**
 * A helper function to include HTML partials into the main Index.html file.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * A centralized function for handling POST requests from the client.
 */
function handlePost(request) {
  try {
    if (request.action === 'submitPayment') {
        return doPost(request.formData);
    }
    return { error: 'Unknown action' };
  } catch (e) {
    logErrorToSheet("handlePost", e);
    return { error: "সার্ভারে একটি ত্রুটি ঘটেছে: " + e.message };
  }
}

/**
 * Centrally log error records into spreadsheet tab 'Error_Log'.
 */
function logErrorToSheet(context, errorObj) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = ss.getSheetByName(SHEET_ERROR_LOG);
    if (!logSheet) {
      logSheet = ss.insertSheet(SHEET_ERROR_LOG);
      logSheet.appendRow(["Timestamp", "Context/Function", "Error Message", "Stack Trace"]);
      logSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#F9EBEA");
    }
    logSheet.appendRow([
      new Date(),
      context,
      errorObj.message || errorObj.toString(),
      errorObj.stack || ""
    ]);
  } catch (e) {
    Logger.log("CRITICAL ERROR LOGGING FAILURE: " + e.toString());
  }
}

// =================================================================
//      BACKEND LOGIC FOR RESULT CHECKER SYSTEM
//      This file contains all server-side functions related to the result checking feature.
// =================================================================

/**
 * Searches for a student's record in the 'Results' sheet.
 * This function is called from the client-side JavaScript when a user performs a search.
 * It is built with robust error handling for configuration issues.
 *
 * @param {string} searchKey The Serial Number or Phone Number entered by the user.
 * @return {object} An object containing the search status ('found', 'not_found', 'error') and data if found.
 */
function searchStudentData(searchKey) {
  try {
    // Note: SPREADSHEET_ID and SHEET_RESULTS are now read from the central Config.gs file.
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_RESULTS);

    // Defensive check: Ensure the sheet actually exists.
    if (!sheet) {
      Logger.log(`CRITICAL ERROR: The sheet named "${SHEET_RESULTS}" was not found.`);
      return { status: 'error', message: `সিস্টেম কনফিগারেশন ত্রুটি: "${SHEET_RESULTS}" নামে কোনো শিট খুঁজে পাওয়া যায়নি।` };
    }

    const data = sheet.getDataRange().getValues();
    
    // Ensure there's at least one data row to process.
    if (data.length < 2) {
      return { status: 'not_found' }; // No data rows to search, so nothing can be found.
    }
    
    // Get headers and remove the header row from the data array to start the search.
    const headers = data.shift(); 
    const searchKeyTrimmed = String(searchKey).trim();

    // Dynamically find column indices. This makes the code resilient to column reordering in the sheet.
    const serialNoIndex = headers.indexOf('Serial No');
    const phoneNoIndex = headers.indexOf('Phone Number');

    // Defensive check: Ensure the required columns exist. If not, inform the admin.
    if (serialNoIndex === -1 || phoneNoIndex === -1) {
       Logger.log(`CRITICAL ERROR: Required columns ('Serial No' or 'Phone Number') not found in the "${SHEET_RESULTS}" sheet.`);
       return { status: 'error', message: 'সিস্টেম কনফিগারেশন ত্রুটি: শিটে প্রয়োজনীয় কলাম (Serial No / Phone Number) খুঁজে পাওয়া যায়নি।' };
    }

    // Iterate through the data rows to find a matching record.
    for (const row of data) {
      const serial = String(row[serialNoIndex] || '').trim();
      const phone = String(row[phoneNoIndex] || '').trim();

      // Check if the user's input matches either the serial number or the phone number.
      if (serial === searchKeyTrimmed || phone === searchKeyTrimmed) {
        
        // Match found! Create a clean result object by mapping headers to their corresponding row values.
        let resultData = {};
        headers.forEach((header, index) => {
          // Ensure we don't send empty or null columns to the client.
          if (header) {
            resultData[header] = row[index];
          }
        });

        return { 
          status: 'found', 
          data: resultData 
        };
      }
    }

    // If the loop completes without finding any match.
    return { status: 'not_found' };

  } catch (e) {
    // Catch any unexpected errors during execution (e.g., permissions issues, invalid sheet ID).
    Logger.log("FATAL ERROR in searchStudentData: " + e.toString() + "\nStack: " + e.stack);
    return { status: 'error', message: 'একটি অপ্রত্যাশিত সার্ভার ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।' };
  }
}

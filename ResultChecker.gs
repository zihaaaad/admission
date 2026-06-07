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
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_RESULTS);

    // Defensive check: Ensure the sheet actually exists.
    if (!sheet) {
      Logger.log(`CRITICAL ERROR: The sheet named "${SHEET_RESULTS}" was not found.`);
      return { status: 'error', message: `সিস্টেমের সমস্যা: "${SHEET_RESULTS}" নামের শিটটি পাওয়া যায়নি।` };
    }

    const data = sheet.getDataRange().getValues();
    
    // Ensure there's at least one data row to process.
    if (data.length < 2) {
      return { status: 'not_found' }; // No data rows to search, so nothing can be found.
    }
    
    // Get headers and remove the header row from the data array to start the search.
    const headers = data.shift(); 
    const searchKeyTrimmed = String(searchKey).trim();

    if (searchKeyTrimmed === "") {
      return { status: 'not_found' };
    }

    // Dynamically find column indices. This makes the code resilient to column reordering in the sheet.
    const serialNoIndex = findColumnIndex(headers, ['Serial No', 'SerialNumber', 'Serial', 'RollNo', 'Roll', 'ID', 'Serial_No']);
    const phoneNoIndex = findColumnIndex(headers, ['Phone Number', 'Phone', 'PhoneNo', 'Mobile', 'MobileNo', 'MobileNumber', 'Contact', 'ContactNo']);

    // Defensive check: Ensure the required columns exist. If not, inform the admin.
    if (serialNoIndex === -1 || phoneNoIndex === -1) {
       Logger.log(`CRITICAL ERROR: Required columns ('Serial No' or 'Phone Number') not found in the "${SHEET_RESULTS}" sheet.`);
       return { status: 'error', message: 'সিস্টেমের সমস্যা: শিটে প্রয়োজনীয় কলাম (Serial No / Phone Number) পাওয়া যায়নি।' };
    }

    // Check if the search key looks like a phone number for normalized comparison
    const isPhoneSearch = /^\+?\d{8,15}$/.test(searchKeyTrimmed);
    const normSearchKey = isPhoneSearch ? normalizePhoneNumber(searchKeyTrimmed) : null;

    // Iterate through the data rows to find a matching record.
    for (const row of data) {
      const serial = String(row[serialNoIndex] || '').trim();
      const phone = String(row[phoneNoIndex] || '').trim();

      const isSerialMatch = (serial.toUpperCase() === searchKeyTrimmed.toUpperCase());
      const isPhoneMatch = (normSearchKey && normalizePhoneNumber(phone) === normSearchKey);

      // Check if the user's input matches either the serial number or the phone number.
      if (isSerialMatch || isPhoneMatch) {
        
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
    logErrorToSheet("searchStudentData", e);
    return { status: 'error', message: 'সার্ভারে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।' };
  }
}

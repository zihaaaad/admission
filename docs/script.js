// =================================================================
//      INTERACTIVE GOOGLE SHEETS SIMULATOR CODE
// =================================================================

const SHEET_DATA = {
  masterList: {
    name: "Candidate_Master_List",
    headers: ["A", "B", "C", "D", "E"],
    subHeaders: ["SerialNumber", "FullName", "RegisteredPhoneNumber", "District", "EmailAddress"],
    rows: [
      ["1001", "মোহাম্মদ আব্দুল্লাহ", "01712345678", "ঢাকা", "abdullah@gmail.com"],
      ["1002", "মোসাম্মৎ ফাতিমা", "01812345679", "চট্টগ্রাম", "fatima@gmail.com"],
      ["1003", "আহমেদ হাসান", "01912345680", "সিলেট", "hasan.ahmed@yahoo.com"],
      ["1004", "খাদিজা আক্তার", "01512345681", "রাজশাহী", "khadija.akh@gmail.com"],
      ["1005", "মো: আরিফ রহমান", "01312345682", "খুলনা", "arif.khulna@gmail.com"],
      ["1006", "নুসরাত জাহান", "01412345683", "বরিশাল", "nusrat.j@hotmail.com"],
      ["1007", "সাজ্জাদ হোসেন", "01612345684", "রংপুর", "sajjad.h@gmail.com"]
    ]
  },
  paymentLog: {
    name: "Payment_Verification_Log",
    headers: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
    subHeaders: ["Timestamp", "RegisteredPhoneNumber", "FullName", "SerialNumber", "District", "PaymentMethod", "PaymentPhoneNumber", "TransactionID", "ApprovalStatus", "ProcessingStatus", "AdmitCardLink", "Rejection_Reason"],
    rows: [
      ["08/06/2026 09:12:05", "01712345678", "মোহাম্মদ আব্দুল্লাহ", "1001", "ঢাকা", "bKash (Personal)", "01711112222", "TRX99882211", "Approved", "Success", "https://docs.google.com/viewer?url=admit_card_1001.pdf", ""],
      ["08/06/2026 09:15:30", "01812345679", "মোসাম্মৎ ফাতিমা", "1002", "চট্টগ্রাম", "Nagad (Personal)", "01822223333", "TXID88776655", "Approved", "Success", "https://docs.google.com/viewer?url=admit_card_1002.pdf", ""],
      ["08/06/2026 09:18:45", "01912345680", "আহমেদ হাসান", "1003", "সিলেট", "bKash (Personal)", "01933334444", "TRX55443322", "Pending", "প্রসেসিং চলছে...", "", ""],
      ["08/06/2026 09:22:10", "01512345681", "খাদিজা আক্তার", "1004", "রাজশাহী", "Nagad (Personal)", "01544445555", "WRONGTRXID", "Rejected", "Rejected", "", "পেমেন্ট তথ্য যাচাইয়ে অসংগতি (মোবাইল নম্বর ও TrxID ম্যাচ করেনি)"],
      ["08/06/2026 09:25:00", "01312345682", "মো: আরিফ রহমান", "1005", "খুলনা", "bKash (Personal)", "01355556666", "TRX11223344", "Pending", "Pending", "", ""]
    ]
  },
  results: {
    name: "Results",
    headers: ["A", "B", "C", "D", "E"],
    subHeaders: ["Serial No", "Phone Number", "Name", "Status", "Message"],
    rows: [
      ["1001", "01712345678", "মোহাম্মদ আব্দুল্লাহ", "Finally Selected", "অভিনন্দন! আপনি চূড়ান্তভাবে নির্বাচিত হয়েছেন। প্রবেশপত্রটি প্রিন্ট করে পরীক্ষা কেন্দ্রে নিয়ে আসুন।"],
      ["1002", "01812345679", "মোসাম্মৎ ফাতিমা", "Finally Selected", "অভিনন্দন! আপনি চূড়ান্তভাবে নির্বাচিত হয়েছেন।"],
      ["1003", "01912345680", "আহমেদ হাসান", "Waiting List", "আপনার আবেদনটি অপেক্ষমান তালিকায় আছে। পরবর্তী আপডেটের জন্য অপেক্ষা করুন।"],
      ["1004", "01512345681", "খাদিজা আক্তার", "Not Selected", "দুঃখিত, আপনার পেমেন্ট রিজেক্ট হওয়ায় আপনি মনোনীত হননি।"],
      ["1005", "01312345682", "মো: আরিফ রহমান", "Under Review", "আপনার পেমেন্ট বর্তমানে যাচাইাধীন আছে।"]
    ]
  },
  config: {
    name: "_Configuration",
    headers: ["A", "B"],
    subHeaders: ["Setting Name", "Value"],
    rows: [
      ["appTitle", "আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট - ভর্তি পোর্টাল"],
      ["instituteName", "আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট"],
      ["logoUrl", "https://i.postimg.cc/RZ4wD83V/skill-color-logo-32x32.png"],
      ["resultCheckerActive", "TRUE"],
      ["paymentFormActive", "TRUE"],
      ["statusCheckActive", "TRUE"],
      ["examDate", "১৫ জুলাই, ২০২৬"],
      ["examTime", "সকাল ১০:০০ টা"],
      ["examVenue", "মেইন ক্যাম্পাস মিলনায়তন"],
      ["instructions", "*জরুরি পেমেন্ট নির্দেশনাবলী:*\n১. বিকাশ বা নগদ পার্সোনাল নম্বরে ভর্তি ফি পাঠান।\n২. টাকা পাঠানোর পর TrxID এবং পেমেন্ট নাম্বার দিয়ে ফর্মটি পূরণ করুন।"],
      ["paymentOptions", "bKash (Personal)"],
      ["paymentOptions", "Nagad (Personal)"],
      ["spreadsheetId", "1A2B3C4D5E6F7G8H9I0J_EXAMPLE_SPREADSHEET_ID"],
      ["admitCardTemplateId", "1X9Y8Z7W6V5U4T3S2R1Q_EXAMPLE_DOC_TEMPLATE_ID"],
      ["admitCardFolderId", "1F2D3S4A5G6H7J8K9L0P_EXAMPLE_DRIVE_FOLDER_ID"]
    ]
  }
};

// Toggle active tab function
function switchTab(element, tabId) {
  // Update sheet tabs active styles
  document.querySelectorAll('.sheet-tab').forEach(tab => tab.classList.remove('active'));
  element.classList.add('active');

  // Render sheet
  const displayContainer = document.getElementById('sheetContentContainer');
  
  if (tabId === 'dashboard') {
    renderDashboard(displayContainer);
  } else {
    renderStandardSheet(displayContainer, SHEET_DATA[tabId]);
  }
}

// Render standard Google Sheets grids
function renderStandardSheet(container, sheet) {
  let html = `<div class="sheet-grid-wrapper">
    <table class="sheet-grid-table">
      <thead>
        <!-- Excel Column Headers (A, B, C...) -->
        <tr class="excel-column-row">
          <th class="row-num-col"></th>`;
  
  sheet.headers.forEach(h => {
    html += `<th>${h}</th>`;
  });
  
  html += `</tr>
        <!-- Row 1: Spreadsheet Column Header Names -->
        <tr class="header-name-row">
          <td class="row-num">1</td>`;
  
  sheet.subHeaders.forEach(sh => {
    html += `<td>${sh}</td>`;
  });
  
  html += `</tr>
      </thead>
      <tbody>`;

  // Row contents
  sheet.rows.forEach((row, rowIndex) => {
    const rowNum = rowIndex + 2; // Rows are 1-based, first row is header, so start from 2
    html += `<tr>
      <td class="row-num">${rowNum}</td>`;
    
    row.forEach((cell, cellIndex) => {
      let cellClass = "";
      
      // Formatting specific cell values for visualization
      const cellStr = String(cell);
      if (cellStr === "Approved" || cellStr === "Success" || cellStr === "Finally Selected") {
        cellClass = "status-cell-approved";
      } else if (cellStr === "Rejected" || cellStr === "Not Selected") {
        cellClass = "status-cell-rejected";
      } else if (cellStr === "Pending" || cellStr === "Waiting List" || cellStr.includes("প্রসেসিং")) {
        cellClass = "status-cell-pending";
      }
      
      html += `<td class="${cellClass}">${cell}</td>`;
    });
    
    html += `</tr>`;
  });

  html += `</tbody>
    </table>
  </div>`;
  
  container.innerHTML = html;
}

// Render Dashboard Grid representation (representing merged cells, cards, KPI)
function renderDashboard(container) {
  // Let's render a styled representations of the KPI dashboard cells
  let html = `<div class="sheet-grid-wrapper">
    <div class="dashboard-instruction-badge">
      অটোমেশন ড্যাশবোর্ড (KPI view) - গ্রিডলাইনবিহীন শীট লেআউট
    </div>
    
    <div class="mock-dashboard-wrapper">
      <!-- Title banner representing A1:H2 -->
      <div class="mock-dash-banner">
        <h2>ভর্তি ও পেমেন্ট প্রসেসিং ড্যাশবোর্ড</h2>
        <p>আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট | সর্বশেষ আপডেট: আজ ১২:০০ টা</p>
      </div>

      <!-- KPI cards section representing rows 4 to 6 -->
      <div class="mock-dash-cards-grid">
        <!-- Card 1: Total -->
        <div class="mock-dash-card card-total">
          <div class="card-label">মোট পেমেন্ট আবেদন</div>
          <div class="card-value">২৪৫</div>
          <div class="card-subtext">মোট প্রাপ্ত সাবমিশন</div>
        </div>

        <!-- Card 2: Pending -->
        <div class="mock-dash-card card-pending">
          <div class="card-label">যাচাই চলছে</div>
          <div class="card-value">১২</div>
          <div class="card-subtext">অপেক্ষমান ট্রানজেকশন</div>
        </div>

        <!-- Card 3: Approved -->
        <div class="mock-dash-card card-approved">
          <div class="card-label">অনুমোদিত পেমেন্ট</div>
          <div class="card-value">২২৩</div>
          <div class="card-subtext">প্রবেশপত্র পাঠানো সম্পন্ন</div>
        </div>

        <!-- Card 4: Rejected -->
        <div class="mock-dash-card card-rejected">
          <div class="card-label">বাতিল করা হয়েছে</div>
          <div class="card-value">১০</div>
          <div class="card-subtext">রিজেক্টেড ট্রানজেকশন</div>
        </div>
      </div>

      <!-- Helper instructions panel representing rows 8 to 11 -->
      <div class="mock-dash-instructions">
        <h3>ড্যাশবোর্ড অটোমেশন তথ্য:</h3>
        <ul>
          <li><strong>অন-এডিট অ্যাকশন:</strong> পেমেন্ট লগে <code>ApprovalStatus</code> পরিবর্তন করলে ড্যাশবোর্ড স্বয়ংক্রিয়ভাবে কার্ডের হিসাব আপডেট করে।</li>
          <li><strong>গ্রিডলাইনস:</strong> এই শিটের স্ট্যান্ডার্ড গ্রিডলাইন বন্ধ করা রয়েছে যাতে ড্যাশবোর্ডটি একটি ডেডিকেটেড অ্যাপ্লিকেশনের মতো দেখায়।</li>
          <li><strong>ম্যানুয়াল রিফ্রেশ:</strong> স্প্রেডশিটের <code>অটোমেশন > ড্যাশবোর্ড রিফ্রেশ করুন</code> অপশনটি থেকে সরাসরি কার্ডের মানসমূহ রিলোড করা যায়।</li>
        </ul>
      </div>
    </div>
  </div>`;
  
  container.innerHTML = html;
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  const initialTab = document.querySelector('.sheet-tab.active');
  if (initialTab) {
    switchTab(initialTab, 'dashboard');
  }
});

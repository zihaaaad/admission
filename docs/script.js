// =================================================================
//      INTERACTIVE GOOGLE SHEETS SIMULATOR & PORTAL DOCS JS
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
      ["08/06/2026 09:18:45", "01912345680", "আহমেদ হাসান", "1003", "সিলেট", "bKash (Personal)", "01933334444", "Pending", "প্রসেসিং চলছে...", "", ""],
      ["08/06/2026 09:22:10", "01512345681", "খাদিজা আক্তার", "1004", "রাজশাহী", "Nagad (Personal)", "01544445555", "WRONGTRXID", "Rejected", "Rejected", "", "পেমেন্ট তথ্য যাচাইয়ে অসংগতি (মোবাইল নম্বর ও TrxID ম্যাচ করেনি)"],
      ["08/06/2026 09:25:00", "01312345682", "মো: আরিফ রহমান", "1005", "খুলনা", "bKash (Personal)", "01355556666", "Pending", "Pending", "", ""]
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

// Toggle active tab function for sheets simulator
function switchTab(element, tabId) {
  document.querySelectorAll('.sheet-tab-btn').forEach(tab => tab.classList.remove('active'));
  element.classList.add('active');

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
    <table class="excel-table">
      <thead>
        <tr class="excel-column-row">
          <th class="excel-row-num"></th>`;
  
  sheet.headers.forEach(h => {
    html += `<th>${h}</th>`;
  });
  
  html += `</tr>
        <tr class="excel-header-row">
          <td class="excel-row-num">1</td>`;
  
  sheet.subHeaders.forEach(sh => {
    html += `<td>${sh}</td>`;
  });
  
  html += `</tr>
      </thead>
      <tbody>`;

  sheet.rows.forEach((row, rowIndex) => {
    const rowNum = rowIndex + 2; 
    html += `<tr>
      <td class="excel-row-num">${rowNum}</td>`;
    
    row.forEach(cell => {
      let cellClass = "";
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

// Render Dashboard Grid representation
function renderDashboard(container) {
  let html = `<div class="sheet-grid-wrapper">
    <div class="dashboard-instruction-badge">
      অটোমেশন ড্যাশবোর্ড (KPI view) - গ্রিডলাইনবিহীন শীট লেআউট
    </div>
    
    <div class="mock-dashboard-card">
      <div class="mock-dash-banner">
        <h2>ভর্তি ও পেমেন্ট প্রসেসিং ড্যাশবোর্ড</h2>
        <p>আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট | রিয়েল-টাইম ডাটা আপডেট</p>
      </div>

      <div class="dash-kpis-grid">
        <div class="dash-kpi-card kpi-total">
          <div class="kpi-title">মোট পেমেন্ট আবেদন</div>
          <div class="kpi-number">২৪৫</div>
          <div class="kpi-desc">মোট প্রাপ্ত ফি সাবমিশন</div>
        </div>

        <div class="dash-kpi-card kpi-pending">
          <div class="kpi-title">যাচাই চলছে</div>
          <div class="kpi-number">১২</div>
          <div class="kpi-desc">অপেক্ষমান ট্রানজেকশন</div>
        </div>

        <div class="dash-kpi-card kpi-approved">
          <div class="kpi-title">অনুমোদিত পেমেন্ট</div>
          <div class="kpi-number">২২৩</div>
          <div class="kpi-desc">প্রবেশপত্র পাঠানো সম্পন্ন</div>
        </div>

        <div class="dash-kpi-card kpi-rejected">
          <div class="kpi-title">বাতিল করা হয়েছে</div>
          <div class="kpi-number">১০</div>
          <div class="kpi-desc">রিজেক্টেড ট্রানজেকশন</div>
        </div>
      </div>

      <div class="dash-instructions-panel">
        <h4>ড্যাশবোর্ড অটোমেশন তথ্য:</h4>
        <ul>
          <li><strong>অন-এডিট অ্যাকশন:</strong> পেমেন্ট লগে <code>ApprovalStatus</code> পরিবর্তন করলে ড্যাশবোর্ড স্বয়ংক্রিয়ভাবে কার্ডের হিসাব আপডেট করে।</li>
          <li><strong>গ্রিডলাইনস:</strong> এই শীটের স্ট্যান্ডার্ড গ্রিডলাইন বন্ধ করা রয়েছে যাতে ড্যাশবোর্ডটি একটি ডেডিকেটেড অ্যাপ্লিকেশনের মতো দেখায়।</li>
          <li><strong>ম্যানুয়াল রিফ্রেশ:</strong> স্প্রেডশিটের <code>অটোমেশন > ড্যাশবোর্ড রিফ্রেশ করুন</code> অপশনটি থেকে সরাসরি কার্ডের মানসমূহ রিলোড করা যায়।</li>
        </ul>
      </div>
    </div>
  </div>`;
  
  container.innerHTML = html;
}

// =================================================================
//      LIVE SOURCE CODE LOADER PANELS
// =================================================================

let currentCodeContent = "";

function loadCodeTab(buttonElement, filename) {
  document.querySelectorAll('.code-tab-btn').forEach(btn => btn.classList.remove('active'));
  buttonElement.classList.add('active');

  const viewer = document.getElementById('codeViewer');
  viewer.innerText = "Loading code from repository...";
  
  // Try fetching the raw source code from parent workspace level
  fetch('../' + filename)
    .then(response => {
       if (!response.ok) throw new Error("File not found");
       return response.text();
    })
    .then(text => {
       currentCodeContent = text;
       viewer.innerText = text;
    })
    .catch(err => {
       // Fallback message for local filesystem viewing
       const fallbackText = `// Local File Access Warning
// Browser security policies block loading files dynamically when opened directly from the filesystem (via file://).
//
// When deployed on GitHub Pages, the actual source code of ${filename} will be loaded dynamically here.
//
// You can view the source file directly in the repository at root level:
// github.com/zihaaaad/admission/blob/master/${filename}`;
       
       currentCodeContent = fallbackText;
       viewer.innerText = fallbackText;
    });
}

// Copy to clipboard function
function copyCodeContent() {
  const btn = document.querySelector('.code-copy-btn');
  const originalText = btn.innerText;

  navigator.clipboard.writeText(currentCodeContent)
    .then(() => {
       btn.innerText = "Copied!";
       btn.style.backgroundColor = "#10B981"; // success green
       btn.style.color = "#FFFFFF";
       
       setTimeout(() => {
         btn.innerText = originalText;
         btn.style.backgroundColor = "";
         btn.style.color = "";
       }, 2000);
    })
    .catch(err => {
       alert("Failed to copy code: " + err.toString());
    });
}

// =================================================================
//      STICKY SIDEBAR SCROLL SPY
// =================================================================

window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.sidebar-item');
  
  let currentActive = "";
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    // Offset threshold
    if (window.pageYOffset >= (sectionTop - 180)) {
      currentActive = section.getAttribute('id');
    }
  });

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('id') === `menu-${currentActive}`) {
      item.classList.add('active');
    }
  });
});

// INITIAL LOADS
document.addEventListener('DOMContentLoaded', () => {
  // Load initial simulator sheet (Dashboard)
  const initialTab = document.querySelector('.sheet-tab-btn.active');
  if (initialTab) {
    switchTab(initialTab, 'dashboard');
  }

  // Load initial code file (Config.gs)
  const initialCodeTab = document.querySelector('.code-tab-btn.active');
  if (initialCodeTab) {
    loadCodeTab(initialCodeTab, 'Config.gs');
  }
});

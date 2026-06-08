// =================================================================
//      INTERACTIVE GOOGLE SHEETS SIMULATOR & PORTAL DOCS JS
// =================================================================

// Static mock databases for spreadsheet simulator
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
      ["08/06/2026 09:15:30", "01812345679", "মোসাম্মৎ ফাতিমা", "1002", "চট্টগ্রাম", "Nagad (Personal)", "01822223333", "Approved", "Success", "https://docs.google.com/viewer?url=admit_card_1002.pdf", ""],
      ["08/06/2026 09:18:45", "01912345680", "আহমেদ হাসান", "1003", "সিলেট", "bKash (Personal)", "01933334444", "Pending", "Processing...", "", ""],
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

// Search index containing search items for live search feature
const SEARCH_ITEMS = [
  { category: "পরিচিতি", title: "আস-সুন্নাহ ভর্তি পোর্টাল ও অটোমেশন গাইড", link: "#overview" },
  { category: "পরিচিতি", title: "মোবাইল-ফার্স্ট ইউজার ইন্টারফেস", link: "#overview" },
  { category: "পরিচিতি", title: "নিরাপত্তা ও নির্ভরযোগ্য ব্যাকএন্ড", link: "#overview" },
  { category: "পরিচিতি", title: "অটো-রিকভারি ও ডাটা রিসেট", link: "#overview" },
  { category: "সিমুলেটর", title: "শীট ডেটাবেজ লাইভ সিমুলেটর", link: "#simulator" },
  { category: "সিমুলেটর", title: "ক্যান্ডিডেট মাস্টার লিস্ট কলাম হেডার", link: "#simulator" },
  { category: "সিমুলেটর", title: "পেমেন্ট ভেরিফিকেশন লগ টেবিল", link: "#simulator" },
  { category: "সিমুলেটর", title: "ফলাফল ও মেরিট লিস্ট শীট", link: "#simulator" },
  { category: "সিমুলেটর", title: "কনফিগারেশন শীট ও আইডি সম্বলিত তথ্য", link: "#simulator" },
  { category: "সেটআপ", title: "নতুন স্প্রেডশিট ও ডাটাবেজ প্রস্তুত", link: "#setup" },
  { category: "সেটআপ", title: "প্রবেশপত্র ডক টেমপ্লেট ও ড্রাইভ ফোল্ডার লিংক", link: "#setup" },
  { category: "সেটআপ", title: "গুগল অ্যাপস স্ক্রিপ্ট কোড স্থাপন", link: "#setup" },
  { category: "সেটআপ", title: "ট্রিগার চালুকরণ ও ওয়েব অ্যাপ স্থাপন", link: "#setup" },
  { category: "কোড", title: "Config.gs সোর্স কোড রেফারেন্স", link: "#code-ref" },
  { category: "কোড", title: "Code.gs সোর্স কোড রেফারেন্স", link: "#code-ref" },
  { category: "কোড", title: "PaymentForm.gs সোর্স কোড রেফারেন্স", link: "#code-ref" },
  { category: "কোড", title: "ResultChecker.gs সোর্স কোড রেফারেন্স", link: "#code-ref" },
  { category: "রিসেট", title: "ডাটা ব্যাকআপ ও শীট ক্লিয়ার করার নিয়ম", link: "#maintenance" },
  { category: "রিসেট", title: "অটো হেডার রিকভারি পদ্ধতি", link: "#maintenance" },
  { category: "এফএকিউ", title: "ভর্তি পোর্টালটি মোবাইল স্ক্রিনে কেমন দেখাবে?", link: "#faq" },
  { category: "এফএকিউ", title: "কনফিগারেশন আপডেট ক্যাশ টাইমিং", link: "#faq" },
  { category: "এফএকিউ", title: "প্রবেশপত্র ও ড্রাইভ মেমোরি নিরাপদ রাখা", link: "#faq" },
  { category: "এফএকিউ", title: "গুগল অ্যাপস স্ক্রিপ্ট ইমেইল কোটা হিসাব", link: "#faq" },
  { category: "গ্যালারি", title: "ড্যাশবোর্ড ও মোবাইল ভিউ গ্যালারি", link: "#gallery" }
];

// Toggle active tab function for sheets simulator
function switchTab(element, tabId) {
  document.querySelectorAll('.sheet-tab').forEach(tab => tab.classList.remove('active'));
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
      } else if (cellStr === "Pending" || cellStr === "Waiting List" || cellStr.includes("Processing")) {
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
      অটোমেশন ড্যাশবোর্ড (KPI View) - গ্রিডলাইনবিহীন শীট লেআউট
    </div>
    
    <div class="mock-dashboard-wrapper">
      <div class="mock-dash-banner">
        <h3>ভর্তি ও পেমেন্ট প্রসেসিং ড্যাশবোর্ড</h3>
        <p>আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট | রিয়েল-টাইম ডাটা আপডেট</p>
      </div>

      <div class="dash-kpi-grid">
        <div class="dash-kpi-card">
          <div class="kpi-title">মোট পেমেন্ট আবেদন</div>
          <div class="kpi-value">২৪৫</div>
        </div>

        <div class="dash-kpi-card">
          <div class="kpi-title">যাচাই চলছে</div>
          <div class="kpi-value pending">১২</div>
        </div>

        <div class="dash-kpi-card">
          <div class="kpi-title">অনুমোদিত পেমেন্ট</div>
          <div class="kpi-value">২২৩</div>
        </div>

        <div class="dash-kpi-card">
          <div class="kpi-title">বাতিল করা হয়েছে</div>
          <div class="kpi-value rejected">১০</div>
        </div>
      </div>

      <div class="dash-instructions-panel">
        <h4>ড্যাশবোর্ড অটোমেশন তথ্য:</h4>
        <ul>
          <li><strong>অন-এডিট অ্যাকশন:</strong> পেমেন্ট লগে ApprovalStatus পরিবর্তন করলে ড্যাশবোর্ড স্বয়ংক্রিয়ভাবে কার্ডের হিসাব আপডেট করে।</li>
          <li><strong>গ্রিডলাইনস:</strong> এই শীটের স্ট্যান্ডার্ড গ্রিডলাইন বন্ধ করা রয়েছে যাতে ড্যাশবোর্ডটি একটি ডেডিকেটেড অ্যাপ্লিকেশনের মতো দেখায়।</li>
          <li><strong>ম্যানুয়াল রিফ্রেশ:</strong> স্প্রেডশিটের অটোমেশন > ড্যাশবোর্ড রিফ্রেশ করুন অপশনটি থেকে সরাসরি কার্ডের মানসমূহ রিলোড করা যায়।</li>
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
  document.querySelectorAll('.code-tab').forEach(btn => btn.classList.remove('active'));
  buttonElement.classList.add('active');

  const viewer = document.getElementById('codeViewer');
  viewer.innerText = "Loading code from repository...";
  
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
       btn.style.backgroundColor = "#135E3B"; // brand green
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
//      INTERACTIVE CODELABS STEP SELECTOR
// =================================================================

function selectCodelabStep(stepNum) {
  // Update step items active state
  document.querySelectorAll('.codelab-step-item').forEach(item => {
    item.classList.remove('active');
  });
  const activeStepItem = document.getElementById(`stepItem-${stepNum}`);
  if (activeStepItem) activeStepItem.classList.add('active');

  // Update content panels active state
  document.querySelectorAll('.codelab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  const activePanel = document.getElementById(`codelabPanel-${stepNum}`);
  if (activePanel) activePanel.classList.add('active');
}

// =================================================================
//      LIVE SEARCH FILTER SYSTEM
// =================================================================

function setupLiveSearch() {
  const searchInput = document.getElementById('docSearch');
  const searchResults = document.getElementById('searchResults');

  if (!searchInput || !searchResults) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length < 2) {
      searchResults.innerHTML = '';
      searchResults.classList.add('hidden');
      return;
    }

    const matches = SEARCH_ITEMS.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">কোনো ফলাফল পাওয়া যায়নি</div>';
    } else {
      let html = '';
      matches.forEach(item => {
        html += `<a href="${item.link}" class="search-result-item" data-target="${item.link}">
          <div class="search-result-cat">${item.category}</div>
          <div class="search-result-title">${item.title}</div>
        </a>`;
      });
      searchResults.innerHTML = html;
    }

    searchResults.classList.remove('hidden');

    // Add click listeners to results to auto close search dropdown and drawer
    document.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', (ev) => {
        searchInput.value = '';
        searchResults.classList.add('hidden');
        
        // If sidebar is visible on mobile, hide it
        const sidebar = document.getElementById('sidebarNav');
        if (sidebar) sidebar.classList.remove('show-sidebar');
      });
    });
  });

  // Close search dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });
}

// =================================================================
//      SCROLL SPY & TOC SYNCING
// =================================================================

function setupScrollSpy() {
  const sections = document.querySelectorAll('.doc-section, .hero-doc-header');
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const tocLinks = document.querySelectorAll('.toc-link');

  if (sections.length === 0) return;

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPos = window.scrollY + 100; // Offset for header height

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id') || 'overview';
      }
    });

    // Fallback if scrolled to top
    if (window.scrollY < 200) {
      currentSectionId = 'overview';
    }

    // Update left sidebar active class
    sidebarItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-section') === currentSectionId) {
        item.classList.add('active');
      }
    });

    // Update right Table of Contents (TOC) active class
    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-toc') === currentSectionId) {
        link.classList.add('active');
      }
    });
  });
}

// =================================================================
//      MOBILE NAVIGATION DRAWER TOGGLE
// =================================================================

function setupMobileSidebar() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebarNav');
  
  if (!menuToggle || !sidebar) return;

  // Toggle drawer open/close
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('show-sidebar');
  });

  // Close drawer when clicking any sidebar navigation link
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      sidebar.classList.remove('show-sidebar');
    });
  });

  // Close drawer when clicking anywhere outside of it
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove('show-sidebar');
    }
  });
}

// =================================================================
//      TECHNICAL FAQ ACCORDION TOGGLE
// =================================================================

function toggleFaq(element) {
  const item = element.parentElement;
  const isActive = item.classList.contains('active');
  
  // Close all FAQ items
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
  
  // Toggle the clicked one
  if (!isActive) {
    item.classList.add('active');
  }
}

// =================================================================
//      INITIAL LOADING AND REGISTRATION
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Load initial simulator sheet (Dashboard)
  const initialTab = document.querySelector('.sheet-tab.active');
  if (initialTab) {
    switchTab(initialTab, 'dashboard');
  }

  // Load initial code file (Config.gs)
  const initialCodeTab = document.querySelector('.code-tab.active');
  if (initialCodeTab) {
    loadCodeTab(initialCodeTab, 'Config.gs');
  }

  // Setup functional features
  setupLiveSearch();
  setupScrollSpy();
  setupMobileSidebar();
});

# 🎓 Admission & Result Checker Web Portal

### **আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট**
> A production-ready, mobile-first Web Application built on **Google Apps Script** for handling cohort admissions, fee submissions, automated admit card issuance, and result checking.

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-apps-script&logoColor=white)](https://developers.google.com/apps-script)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge)](#)

---

## 🌟 Key Features

| Feature Area | Description |
| :--- | :--- |
| **📱 Mobile-First UI/UX** | Styled with a premium Forest Green & Warm Gold theme. Offers edge-to-edge layouts, smooth transitions, and Noto Sans Bengali typography. |
| **🔒 Secure Submission** | Front-end numeric key filters, Transaction ID validation, and Google Script `LockService` to prevent double-submissions or race conditions. |
| **📄 Auto Admit Cards** | Generates PDF admit cards dynamically from a Google Docs template, stores them in Drive, and updates candidate logs with the file link. |
| **✉️ Branded HTML Emails** | Sends responsive HTML emails with Noto Sans Bengali typography, social links, custom instructions, and the PDF admit card attached. |
| **🔔 Custom Modal Dialogs** | Professional, matching modal popups replace native browser `alert()` prompts for all validation messages and confirmations. |
| **⚙️ Automated Trigger Menu** | A custom menu inside Google Sheets (**অটোমেশন > অন-এডিট ট্রিগার সক্রিয় করুন**) installs triggers programmatically, bypassing the complex GAS dashboard. |
| **💡 Zero-Header Resilience** | Reads the `_Configuration` sheet starting at Row 1, meaning settings work perfectly even if column headers are deleted. |

---

## 🗺️ System Architecture

```
                    ┌──────────────────────────────┐
                    │  User Browser (Mobile/Web)   │
                    └──────────────┬───────────────┘
                                   │ (HTTPS GET)
                                   v
                    ┌──────────────────────────────┐
                    │  Google Apps Script Web App  │
                    └──────────────┬───────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │ (Router: doGet)         │ (Client Server Calls)   │ (Installable Trigger)
         v                         v                         v
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  Dynamic View    │     │ google.script.run │     │  onEdit Trigger  │
│  - ResultView    │     │ - searchStudent() │     │                  │
│  - PaymentView   │     │ - getUserDetails()│     │  [ApprovalStatus]│
│  - StatusCheck   │     │ - submitPayment() │     │                  │
└──────────────────┘     └───────────────────┘     └────────┬─────────┘
                                                            │
                                        ┌───────────────────┴───────────────────┐
                                        ▼                                       ▼
                               [Status: Approved]                      [Status: Rejected]
                                        │                                       │
                                        ▼ (Drive & Gmail)                       ▼ (Gmail)
                             ┌─────────────────────┐                 ┌─────────────────────┐
                             │ 1. Copy Doc Template│                 │ 1. Read Reason      │
                             │ 2. Replace Tokens   │                 │ 2. Send Rejection   │
                             │ 3. Save PDF to Drive│                 │    HTML Email       │
                             │ 4. Send Admit Email │                 │                     │
                             └─────────────────────┘                 └─────────────────────┘
```

---

## 📁 Repository Structure

*   **`Config.gs`**: Configuration parameters (Spreadsheet ID, Docs Template ID, Output Folder ID, fallback defaults).
*   **`Code.gs`**: Main router (`doGet`), web-app renderer, settings parsing with caching, and error logging.
*   **`PaymentForm.gs`**: Payment validation, database submission, PDF admit card generation, rejection emails, and automated trigger configuration.
*   **`ResultChecker.gs`**: Simple result checker backend querying the `Results` tab.
*   **`Index.html`**: Core SPA layout including global styles, CSS variables, typography, modal popups, and client-side JavaScript routers.
*   **`PaymentView.html` / `ResultView.html` / `StatusCheckView.html`**: Section partials included into the main shell.
*   **`SETUP.md`**: Complete administration guide for setting up folders, doc templates, sheets, and web app deployments.
*   **`AdmitCardTemplateDemo.md`**: Visual layout showing all active placeholders for your Google Doc template.

---

## 🛠️ Dynamic Placeholders

### 1. In Google Docs Admit Card Template
You can place these tags inside your Google Doc template; the script will replace them at runtime when generating the PDF:
*   `{{FullName}}` — Candidate's full name.
*   `{{SerialNumber}}` — Roll or Serial number.
*   `{{District}}` — Home district.
*   `{{EmailAddress}}` — Registered email.
*   `{{PhoneNumber}}` — Candidate phone number.
*   `{{ExamDate}}` — Exam date (configured in sheet).
*   `{{ExamTime}}` — Exam time (configured in sheet).
*   `{{ExamVenue}}` — Exam center (configured in sheet).

### 2. In `_Configuration` Sheet
Configure these key-value rows to customize web app states and email details:
*   `appTitle` / `instituteName`: Branded titles shown in headers, footers, and emails.
*   `logoUrl`: Direct link to your institute logo (hides and triggers text fallback if empty or invalid).
*   `examDate` / `examTime` / `examVenue`: Dynamic metrics printed on candidate admit cards and HTML emails.
*   `resultCheckerActive` / `paymentFormActive` / `statusCheckActive`: Toggles (`TRUE` or `FALSE`) to turn views ON/OFF.

---

## 💻 Developer Profile

*   **Developer:** Zihad Hasan
*   **Email:** [zihad.connects@gmail.com](mailto:zihad.connects@gmail.com)
*   **Project Context:** Customized Admission Portal for আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট.

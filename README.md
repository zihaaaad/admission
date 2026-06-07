# Admission and Result Checker Web Portal

### As-Sunnah Skill Development Institute
> A production-ready, mobile-first Web Application built on Google Apps Script for handling cohort admissions, fee submissions, automated admit card issuance, and result checking.

---

### Key Features

*   **Mobile-First UI/UX**: Styled with a premium Deep Forest Green & Warm Gold theme. Offers edge-to-edge layouts, smooth transitions, and Noto Sans Bengali typography.
*   **Zero-Configuration Fallback**: Connects to the host spreadsheet automatically. Works out of the box as a container-bound script without editing `SPREADSHEET_ID` manually.
*   **Fuzzy Header Matcher**: Resilient lookup maps data correctly even if columns are reordered or headers are renamed (e.g. `Roll No` vs `SerialNumber`).
*   **Phone Normalization**: Matches queries based on the last 10 digits to prevent formatting variations or stripped leading zero errors.
*   **Duplicate ID Prevention**: Server-side duplicate checking prevents candidates from registering with an already submitted Transaction ID.
*   **One-Click Database Setup**: Automatically builds all sheets, headers, default settings, and visual KPI cards in one click from the custom menu (**অটোমেশন > নতুন ডাটাবেজ প্রস্তুত করুন**).
*   **Auto Admit Cards**: Generates PDF admit cards dynamically from a Google Docs template, stores them in Drive, and updates candidate logs with the file link.
*   **Branded HTML Emails**: Sends responsive HTML emails with Noto Sans Bengali typography, social links, custom instructions, and the PDF admit card attached.
*   **Custom Modal Dialogs**: Professional, matching modal popups replace native browser `alert()` prompts for all validation messages and confirmations.
*   **Automated Trigger Menu**: A custom menu inside Google Sheets installs triggers programmatically, bypassing the complex GAS dashboard.
*   **QA-Hardened Reliability**: Built-in script-tag XSS configuration protection, client-side transaction ID validation, automatic public view permissions for generated PDF admit cards, and guaranteed temporary document trashing even on runtime exceptions.

---

## System Architecture

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
│  - ResultView    │     │ - searchStudent   │     │                  │
│  - PaymentView   │     │   Data()          │     │  [ApprovalStatus]│
│  - StatusCheck   │     │ - getUserDetails()│     │                  │
└──────────────────┘     │ - submitPayment() │     └────────┬─────────┘
                         └───────────────────┘              │
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

## Repository Structure

*   **`Config.gs`**: Configuration parameters (Spreadsheet ID, Docs Template ID, Output Folder ID, fallback defaults).
*   **`Code.gs`**: Main router (`doGet`), web-app renderer, settings parsing with caching, and error logging.
*   **`PaymentForm.gs`**: Payment validation, database submission, PDF admit card generation, rejection emails, and automated trigger configuration.
*   **`ResultChecker.gs`**: Simple result checker backend querying the `Results` tab.
*   **`Index.html`**: Core SPA layout including global styles, CSS variables, typography, modal popups, and client-side JavaScript routers.
*   **`PaymentView.html` / `ResultView.html` / `StatusCheckView.html`**: Section partials included into the main shell.
*   **`SETUP.md`**: Complete administration guide for setting up folders, doc templates, sheets, and web app deployments.
*   **`AdmitCardTemplateDemo.md`**: Visual layout showing all active placeholders for your Google Doc template.

---

## Dynamic Placeholders

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
*   `admitCardTemplateId` / `admitCardFolderId`: Google Doc template ID and target Google Drive folder ID, allowing complete code-free configuration for admit card generation.

---

## Developer Profile

*   **Developer:** Zihad Hasan
*   **Email:** zihad.connects@gmail.com
*   **Project Context:** Customized Admission Portal for আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট.

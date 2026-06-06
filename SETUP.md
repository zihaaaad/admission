# Setup and Configuration Manual

---

### Developer Profile
*   **Developer Name:** Zihad Hasan
*   **Email Address:** zihad.connects@gmail.com
*   **Note:** This portal was developed to provide a seamless admission and payment validation interface for As-Sunnah Skill Development Institute. For technical support or modifications, please get in touch via email.

---

This guide describes how to configure the Google Sheets spreadsheet, generate a Google Docs template for the Admit Cards, and run this application.

## 1. Sheet Tabs & Columns

You must create a Google Sheet and add the following sheet tabs (case-sensitive) with their respective column headers:

### Tab 1: `Candidate_Master_List`
*Contains the baseline registry of candidates allowed to pay for admit cards.*

*   **Column A:** `SerialNumber` (e.g. 1001, 1002)
*   **Column B:** `FullName` (e.g. John Doe)
*   **Column C:** `RegisteredPhoneNumber` (e.g. 01712345678 - format strictly as 11 digits starting with 01)
*   **Column D:** `District` (e.g. Dhaka)
*   **Column E:** `EmailAddress` (e.g. john@example.com - where the PDF Admit Card will be sent)

### Tab 2: `Payment_Verification_Log`
*Stores student submissions and approval/processing state.*

*   **Column A:** `Timestamp`
*   **Column B:** `RegisteredPhoneNumber`
*   **Column C:** `FullName`
*   **Column D:** `SerialNumber`
*   **Column E:** `District`
*   **Column F:** `PaymentMethod`
*   **Column G:** `PaymentPhoneNumber`
*   **Column H:** `TransactionID`
*   **Column I:** `ApprovalStatus` (Must be manually marked as `Approved` or `Rejected` by the administrator)
*   **Column J:** `ProcessingStatus` (Populates with `Success` or `Failed: <error>` automatically)
*   **Column K:** `AdmitCardLink` (Populates with the Google Drive PDF URL automatically)
*   **Column L:** `Rejection_Reason` (Used to state the reason if `ApprovalStatus` is set to `Rejected`)

### Tab 3: `Results`
*Contains student search results if the result checker view is enabled.*

*   **Column A:** `Serial No` (Match key)
*   **Column B:** `Phone Number` (Match key)
*   **Column C:** `Name`
*   **Column D:** `Status` (e.g. Selected, Finally Selected, Waiting, Not Selected)
*   **Column E:** `Message` (Custom text shown to the candidate)

### Tab 4: `_Configuration`
*Application settings.*

*   **Column A:** `Key`
*   **Column B:** `Value`

#### Keys required in Column A:
*   `appTitle`: (e.g. *আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট*)
*   `instituteName`: (e.g. *আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট*)
*   `logoUrl`: (Direct link to logo image)
*   `resultCheckerActive`: `TRUE` or `FALSE`
*   `paymentFormActive`: `TRUE` or `FALSE`
*   `statusCheckActive`: `TRUE` or `FALSE`
*   `paymentOptions`: (Add multiple rows with this key to populate bkash, Nagad, Rocket, etc.)
*   `instructions`: (Detailed text supporting bolding via `*bold text*` markdown syntax)

### Tab 5: `Dashboard`
*An administrative statistics dashboard formatted dynamically with deep forest natural themes.*

*   Contains merged headers for overview titles, latest timestamps, metrics tables, and color-coded status breakdowns (Submissions, Pending, Approved, Rejected). Automatically updated by selecting the custom menu option `ড্যাশবোর্ড আপডেট করুন` in the Google Sheet UI.

---

## 2. Google Docs Admit Card Template

Create a new Google Doc and use it as your layout template. Place the following exact placeholders inside the document text. The automation will search for and replace them during generation:

*   `{{FullName}}` -> Candidate name
*   `{{SerialNumber}}` -> Serial or roll number
*   `{{District}}` -> Home district
*   `{{EmailAddress}}` -> Registered email address
*   `{{PhoneNumber}}` -> Candidate registered phone number

Ensure you copy the Google Doc's ID from the URL and paste it as `TEMPLATE_ID` in `Config.gs`. Also, create a folder in Google Drive to store generated PDF Admit Cards and set its ID as `FOLDER_ID` in `Config.gs`.

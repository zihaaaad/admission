# Setup and Configuration Manual

**আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট**

---

### Developer Profile

| Field | Details |
|-------|---------|
| **Developer** | Zihad Hasan |
| **Email** | zihad.connects@gmail.com |

---

## Prerequisites

- A Google account with access to Google Drive, Google Sheets, Google Docs, and Gmail
- Basic familiarity with Google Sheets column headers

---

## Step 1: Create the Google Spreadsheet

Create a new Google Spreadsheet. This single spreadsheet will serve as your entire database. You need to create **5 sheet tabs** with exact names (case-sensitive):

---

### Tab 1: `Candidate_Master_List`

> The baseline registry of all candidates allowed to submit payment.

| Column | Header | Format | Example |
|--------|--------|--------|---------|
| A | `SerialNumber` | Number or text | `1001` |
| B | `FullName` | Text | `মোহাম্মদ আলী` |
| C | `RegisteredPhoneNumber` | 11-digit string starting with `01` | `01712345678` |
| D | `District` | Text | `ঢাকা` |
| E | `EmailAddress` | Valid email | `ali@example.com` |

> **Important:** Column C must be exactly 11 digits starting with `01`. The system validates this format strictly.

---

### Tab 2: `Payment_Verification_Log`

> Auto-populated when candidates submit payment. Admins manually set `ApprovalStatus`.

| Column | Header | Auto/Manual | Notes |
|--------|--------|-------------|-------|
| A | `Timestamp` | Auto | Submission date/time |
| B | `RegisteredPhoneNumber` | Auto | From verified candidate |
| C | `FullName` | Auto | From master list |
| D | `SerialNumber` | Auto | From master list |
| E | `District` | Auto | From master list |
| F | `PaymentMethod` | Auto | bKash/Nagad/Rocket etc. |
| G | `PaymentPhoneNumber` | Auto | Sender's mobile number |
| H | `TransactionID` | Auto | TrxID from payment |
| I | `ApprovalStatus` | **Manual** | Set to `Approved` or `Rejected` |
| J | `ProcessingStatus` | Auto | `Success`, `ব্যর্থ: ...`, or `প্রসেসিং চলছে...` |
| K | `AdmitCardLink` | Auto | Google Drive PDF URL |
| L | `Rejection_Reason` | **Manual** | Required if status is `Rejected` |

> **Critical:** Column I (`ApprovalStatus`) is the trigger column. When you type `Approved` or `Rejected` here, the installable trigger automatically processes the row.

---

### Tab 3: `Results`

> Student results for the result checker feature.

| Column | Header | Example |
|--------|--------|---------|
| A | `Serial No` | `1001` |
| B | `Phone Number` | `01712345678` |
| C | `Name` | `মোহাম্মদ আলী` |
| D | `Status` | `Finally Selected` / `Waiting` / `Not Selected` |
| E | `Message` | Custom message shown to the candidate |

> **Status Keywords:** The UI applies different card colors based on status text:
> - Contains `finally` → Green (selected)
> - Contains `waiting` → Blue-green (pending)
> - Contains `not selected` → Red (rejected)

---

### Tab 4: `_Configuration`

> Key-value settings that control the entire application behavior.

| Column A (Key) | Column B (Value) | Required |
|-----------------|------------------|----------|
| `appTitle` | আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট | Yes |
| `instituteName` | আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট | Yes |
| `logoUrl` | Direct URL to your logo image (PNG/JPG) | Yes |
| `resultCheckerActive` | `TRUE` or `FALSE` | Yes |
| `paymentFormActive` | `TRUE` or `FALSE` | Yes |
| `statusCheckActive` | `TRUE` or `FALSE` | Yes |
| `paymentOptions` | `bKash` | Yes (one per row) |
| `paymentOptions` | `Nagad` | Yes (one per row) |
| `paymentOptions` | `Rocket` | Optional |
| `instructions` | Payment instructions text (supports `*bold*` syntax) | Yes |
| `examDate` | ১৫ জুন, ২০২৬ (Exam Date in Bengali) | No (defaults to "প্রবেশপত্র দেখুন") |
| `examTime` | সকাল ১০:০০ টা (Exam Time in Bengali) | No (defaults to "প্রবেশপত্র দেখুন") |
| `examVenue` | আস-সুন্নাহ ইনস্টিটিউট ক্যাম্পাস (Exam Venue) | No (defaults to "প্রবেশপত্র দেখুন") |

> **Multiple Payment Options:** Add multiple rows with the key `paymentOptions` — each one becomes a dropdown option in the payment form.
>
> **Instructions Formatting:** Use `*text*` for bold and newlines for line breaks. Example:
> ```
> *bKash নম্বর:* 01712345678
> *টাকার পরিমাণ:* ৫০০ টাকা
> Send Money করে Transaction ID জমা দিন।
> ```

---

### Tab 5: `Dashboard`

> Auto-generated admin dashboard. No manual setup needed — it is created automatically when you click the custom menu item.

---

## Step 2: Create the Admit Card Template

1. Create a new **Google Doc** in your Drive
2. Design your admit card layout with the following **exact placeholders** in the document body:

| Placeholder | Replaced With |
|-------------|---------------|
| `{{FullName}}` | Candidate's full name |
| `{{SerialNumber}}` | Serial or roll number |
| `{{District}}` | Home district |
| `{{EmailAddress}}` | Registered email |
| `{{PhoneNumber}}` | Registered phone number |

3. Create an empty **Google Drive folder** where PDF admit cards will be stored

> See [AdmitCardTemplateDemo.md](AdmitCardTemplateDemo.md) for a visual layout reference.

---

## Step 3: Copy the IDs

You need three IDs from Google. Here's how to find each:

| ID | Where to Find |
|----|---------------|
| **Spreadsheet ID** | From the spreadsheet URL: `https://docs.google.com/spreadsheets/d/`**THIS_PART**`/edit` |
| **Template ID** | From the Google Doc URL: `https://docs.google.com/document/d/`**THIS_PART**`/edit` |
| **Folder ID** | From the folder URL: `https://drive.google.com/drive/folders/`**THIS_PART** |

---

## Step 4: Set Up Apps Script

1. Open your Google Spreadsheet
2. Go to **Extensions > Apps Script**
3. Delete the default `Code.gs` content
4. Create the following files in the Apps Script editor:

| File Name | Type | Source |
|-----------|------|--------|
| `Config.gs` | Script (.gs) | Copy from [Config.gs](Config.gs) |
| `Code.gs` | Script (.gs) | Copy from [Code.gs](Code.gs) |
| `PaymentForm.gs` | Script (.gs) | Copy from [PaymentForm.gs](PaymentForm.gs) |
| `ResultChecker.gs` | Script (.gs) | Copy from [ResultChecker.gs](ResultChecker.gs) |
| `Index.html` | HTML | Copy from [Index.html](Index.html) |
| `ResultView.html` | HTML | Copy from [ResultView.html](ResultView.html) |
| `PaymentView.html` | HTML | Copy from [PaymentView.html](PaymentView.html) |
| `StatusCheckView.html` | HTML | Copy from [StatusCheckView.html](StatusCheckView.html) |

5. **Open `Config.gs`** and replace the three placeholder values:

```javascript
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";  // ← Replace
const TEMPLATE_ID = "YOUR_DOC_TEMPLATE_ID_HERE";     // ← Replace
const FOLDER_ID = "YOUR_PDF_OUTPUT_FOLDER_ID_HERE";   // ← Replace
```

---

## Step 5: Install the onEdit Trigger

This step is **critical** — without it, approve/reject automation will not work. You have two options to set this up:

### Option A: Automatic Setup (Recommended)
1. Open your Google Spreadsheet.
2. In the top menu bar, click on **অটোমেশন** (Automation).
3. Select **অন-এডিট ট্রিগার সক্রিয় করুন (Enable Trigger)**.
4. Click **OK** on the permission prompts if they appear. The system will programmatically build and bind the trigger for you!

### Option B: Manual Setup (Fallback)
Use this option if you prefer to set it up manually or if the menu option is not visible:
1. In the Apps Script editor, click the **clock icon** (Triggers) in the left sidebar.
2. Click **+ Add Trigger** at the bottom right.
3. Configure the trigger:

| Setting | Value |
|---------|-------|
| Function to run | `handleEditTrigger` |
| Deployment | `Head` |
| Event source | `From spreadsheet` |
| Event type | `On edit` |

4. Click **Save** and approve the permission prompts.

> [!IMPORTANT]
> **Why is "From spreadsheet" or "On edit" missing?**
> If you do not see the "From spreadsheet" option under *Event source* in the manual trigger dialog, it means your Apps Script project is created as a **standalone script** (created from script.google.com). 
> **To fix this:** You must copy your code into a **container-bound script** (created by opening your Google Sheet and clicking **Extensions > Apps Script** in the sheet menu). Container-bound scripts have full access to spreadsheet events.

> **Why installable?** Simple `onEdit` triggers cannot send emails, access Drive, or call external services. The installable trigger runs with your full account permissions.

---

## Step 6: Deploy the Web App

1. In the Apps Script editor, click **Deploy > New deployment**
2. Click the gear icon and select **Web app**
3. Configure:

| Setting | Value |
|---------|-------|
| Description | Admission Portal v1.0 |
| Execute as | **Me (your-email@gmail.com)** |
| Who has access | **Anyone** |

4. Click **Deploy**
5. Authorize all permission prompts
6. **Copy the Web App URL** — this is your portal link to share with candidates

---

## Step 7: Test the System

Run through this checklist to verify everything works:

| Test | How to Verify |
|------|---------------|
| Portal loads | Open the Web App URL on your phone |
| Result checker | Search for a serial number from your `Results` sheet |
| Payment form | Enter a phone number from `Candidate_Master_List` and submit |
| Duplicate check | Try submitting the same phone number again (should block) |
| Approval flow | Set `ApprovalStatus` to `Approved` for the submitted row |
| Admit card email | Check the candidate's email for the PDF attachment |
| Rejection flow | Set `ApprovalStatus` to `Rejected` with a reason in column L |
| Status checker | Search for the phone number in the status checker view |
| Dashboard | Click **অটোমেশন > ড্যাশবোর্ড আপডেট করুন** in the spreadsheet menu |

---

## Resetting the Portal for a New Batch / Course (Every 3 Months)

When you are ready to reuse the system for a new batch or course:

1. **Download Backup**: Export your current sheets (`Candidate_Master_List`, `Payment_Verification_Log`, `Results`, `Error_Log`) as CSV or Excel backups to preserve the previous batch's records.
2. **Clear Sheet Data**:
   > [!WARNING]
   > When clearing data from the sheet tabs, **DO NOT delete Row 1 (the Header Row)**. The Google Apps Script relies on exact column headers (like `SerialNumber`, `Phone Number`, etc.) to locate columns dynamically. If headers are deleted or modified, the code will fail.
   - For `Candidate_Master_List`: Keep Row 1. Clear rows 2 and onwards.
   - For `Payment_Verification_Log`: Keep Row 1. Clear rows 2 and onwards.
   - For `Results`: Keep Row 1. Clear rows 2 and onwards.
   - For `Error_Log`: Keep Row 1. Clear rows 2 and onwards.
3. **Insert New Data**:
   - Paste the new applicant list into `Candidate_Master_List`.
   - Paste the new results into `Results`.
4. **Update App Settings**:
   - Adjust `appTitle`, `logoUrl`, or activation toggles in `_Configuration` as necessary for the new cohort.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Portal shows "কার্যক্রম সাময়িকভাবে বন্ধ" | At least one of `resultCheckerActive`, `paymentFormActive`, or `statusCheckActive` must be `TRUE` in `_Configuration` |
| `404` error in console | The `logoUrl` in `_Configuration` is invalid. Use a publicly accessible direct image URL |
| Sandbox warning in console | This is a normal Google Apps Script warning. It does not affect functionality |
| Admit card not generated | Check that `TEMPLATE_ID` and `FOLDER_ID` in `Config.gs` are correct. Check `Error_Log` tab for details |
| Email not sent | Ensure the candidate has a valid email in `Candidate_Master_List`. Check Gmail sending quota |
| Settings not updating | Configuration is cached for 10 minutes. Wait or clear cache by redeploying |
| Phone number not found | Verify the number in `Candidate_Master_List` is exactly 11 digits starting with `01` |

---

## Admin Workflow Summary

```
1. Candidate submits payment info via Web Portal
         ↓
2. Row appears in Payment_Verification_Log (Status: Pending)
         ↓
3. Admin verifies the TrxID manually with bKash/Nagad/Rocket
         ↓
4a. Valid → Set Column I to "Approved"
         ↓ (automatic)
    → PDF Admit Card generated from template
    → PDF saved to Drive folder
    → Email sent to candidate with PDF attached
    → Column J set to "Success"
    → Column K filled with Drive PDF link

4b. Invalid → Set Column I to "Rejected", Column L to reason
         ↓ (automatic)
    → Rejection email sent to candidate with reason
    → Column J set to "Rejected"
```

---

## Notes

- The system caches `_Configuration` settings for **10 minutes**. After changing settings, wait for the cache to expire or redeploy
- `handleEditTrigger` dynamically locates columns in `Payment_Verification_Log` by searching headers. Columns can be in any order, but the header names must remain unchanged.
- Google Apps Script has daily email quotas (100 for free accounts, 1500 for Workspace). Plan batch approvals accordingly

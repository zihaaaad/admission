# Admission & Result Checker Web Portal

**আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট**

---

### Developer Profile

| Field | Details |
|-------|---------|
| **Developer** | Zihad Hasan |
| **Email** | zihad.connects@gmail.com |
| **Project** | Online Admission & Payment Verification Portal |

---

## Overview

A production-ready, mobile-first web portal built with **Google Apps Script** that handles:

- Student result checking
- Payment fee submission with candidate verification
- Automated PDF Admit Card generation and email delivery
- Payment status tracking
- Admin dashboard with real-time metrics

The portal is designed primarily for **mobile phone users** with a responsive Deep Forest Natural theme, Bengali typography (Noto Sans Bengali), and clean professional UI.

---

## Features

| Feature | Description |
|---------|-------------|
| **Dynamic Router** | Server-side routing shows single views directly or a multi-option landing page based on admin configuration |
| **Candidate Verification** | Phone number lookup against master list with duplicate submission prevention |
| **Payment Logging** | Secure form submission with server-side validation, LockService for concurrency, and race condition protection |
| **Automated Admit Cards** | PDF generation from Google Docs template, email delivery via Gmail API, and Drive storage |
| **Rejection Emails** | Automatic notification email with custom rejection reason when admin marks a payment as `Rejected` |
| **Status Checker** | Real-time payment verification status lookup (Pending / Approved / Rejected) |
| **Admin Dashboard** | One-click spreadsheet dashboard with payment metrics (total, pending, approved, rejected) |
| **Error Logging** | Centralized error logging to `Error_Log` sheet tab for admin visibility |
| **Caching** | `CacheService` for configuration settings (10-min TTL) to reduce spreadsheet reads |
| **Mobile-First UI** | Edge-to-edge on phones, responsive breakpoints at 480px and 640px |

---

## Quick Start

> For detailed step-by-step instructions, see **[SETUP.md](SETUP.md)**.

1. Create a Google Spreadsheet with required tabs (see SETUP.md)
2. Open **Extensions > Apps Script**
3. Copy all `.gs` and `.html` files from this repository into the Apps Script editor
4. Update the three placeholder IDs in `Config.gs`
5. Install the `handleEditTrigger` as an installable onEdit trigger
6. Deploy as a Web App (**Execute as: Me**, **Access: Anyone**)

---

## Architecture

```
User's Browser (Phone/Desktop)
        |
        v
  Google Apps Script Web App
        |
        ├── doGet() ──── Routes to correct view based on _Configuration
        |                    |
        |                    ├── Index.html (SPA shell)
        |                    |     ├── ResultView.html
        |                    |     ├── PaymentView.html
        |                    |     └── StatusCheckView.html
        |                    |
        |                    └── "Currently Closed" page (all systems off)
        |
        ├── google.script.run ──── Client calls to server functions
        |     ├── searchStudentData()      → ResultChecker.gs
        |     ├── getUserDetails()         → PaymentForm.gs
        |     ├── handlePost()             → Code.gs → doPost() → PaymentForm.gs
        |     └── getPaymentStatus()       → PaymentForm.gs
        |
        └── Installable Trigger
              └── handleEditTrigger()      → PaymentForm.gs
                    ├── Approved → processSingleRow() → PDF + Email
                    └── Rejected → sendRejectionEmail()
```

---

## Repository File Structure

| File | Purpose |
|------|---------|
| **[Config.gs](Config.gs)** | Centralized constants: Spreadsheet ID, Sheet names, Template ID, Folder ID, Defaults |
| **[Code.gs](Code.gs)** | Main router (`doGet`), settings loader with cache, `handlePost` dispatcher, error logger |
| **[PaymentForm.gs](PaymentForm.gs)** | Payment verification, form submission, admit card generation, rejection emails, dashboard |
| **[ResultChecker.gs](ResultChecker.gs)** | Student result search by serial number or phone |
| **[Index.html](Index.html)** | SPA shell: CSS design system, all client-side JavaScript, view navigation |
| **[ResultView.html](ResultView.html)** | Partial: Result search form |
| **[PaymentView.html](PaymentView.html)** | Partial: Phone verification + payment credential form |
| **[StatusCheckView.html](StatusCheckView.html)** | Partial: Payment status lookup form |
| **[SETUP.md](SETUP.md)** | Complete setup and configuration manual |
| **[AdmitCardTemplateDemo.md](AdmitCardTemplateDemo.md)** | Visual reference for Google Docs admit card template |

---

## Function Reference

### Code.gs

| Function | Type | Description |
|----------|------|-------------|
| `doGet(e)` | Web App Entry | Routes users to the correct view based on active system flags |
| `getAppSettings()` | Internal | Reads `_Configuration` sheet, parses settings, caches for 10 min |
| `include(filename)` | Internal | Includes HTML partials into Index.html |
| `handlePost(request)` | Client-callable | Dispatches form submissions to `doPost()` |
| `logErrorToSheet(context, errorObj)` | Internal | Writes error records to `Error_Log` sheet tab |

### PaymentForm.gs

| Function | Type | Description |
|----------|------|-------------|
| `getUserDetails(phone)` | Client-callable | Verifies candidate in master list, checks for duplicate submissions |
| `getPaymentStatus(phone)` | Client-callable | Returns current payment status (Pending/Approved/Rejected) |
| `doPost(formObject)` | Internal | Validates and logs payment submission with LockService |
| `onOpen()` | Simple Trigger | Creates the custom admin menu in the spreadsheet |
| `updateDashboardSheet()` | Admin Menu | Generates/refreshes the Dashboard tab with payment metrics |
| `processAllApprovedManually()` | Admin Menu | Batch-processes all approved payments that haven't been processed yet |
| `handleEditTrigger(e)` | Installable Trigger | Auto-processes approved rows and sends rejection emails |
| `sendRejectionEmail(rowNum)` | Internal | Sends HTML rejection email to candidate |
| `processSingleRow(rowNum)` | Internal | Generates PDF admit card, emails it, updates sheet status |
| `createHtmlEmailBody(name, settings)` | Internal | Returns branded HTML email template |

### ResultChecker.gs

| Function | Type | Description |
|----------|------|-------------|
| `searchStudentData(searchKey)` | Client-callable | Searches Results sheet by serial number or phone number |

---

## Console Warnings (Expected)

### `allow-scripts and allow-same-origin` Warning

This is a **standard Google Apps Script warning** that appears in the browser console for all GAS-served web apps. Google serves your HTML inside a sandboxed iframe — this warning is expected and **cannot be fixed** from your code. It does not affect functionality.

### `404 Failed to load resource`

This typically occurs when the favicon or logo URL is unreachable. Ensure the `logoUrl` in your `_Configuration` sheet points to a valid, publicly accessible image URL. The default favicon URL in `Index.html` should also be updated to match your logo.

---

## License

This project was developed exclusively for **আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট**. For technical support or modifications, contact Zihad Hasan at zihad.connects@gmail.com.

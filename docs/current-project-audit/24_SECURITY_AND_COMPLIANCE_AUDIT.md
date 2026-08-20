# 24 — Security, Privacy and Compliance Audit

## Summary
This document provides a technical audit of security vulnerabilities, privacy practices, authentication weaknesses, data leakage risks, and regulatory compliance considerations across the current codebase.

---

## 1. Authentication & Session Security Flaws

### High Risk Vulnerabilities

1. **Development Super Admin Bypass**:
   - **Location**: `admin/src/services/adminAuthService.ts` (lines 218–226).
   - **Mechanism**: If no active session token is detected in `localStorage`, the service automatically generates a Super Admin session object and authenticates the user.
   - **Risk**: Anyone accessing the admin URL gets immediate, unauthenticated Super Admin access to all management screens.

2. **Hardcoded Passwords & Secret Keys**:
   - **Location**: `admin/src/data/adminUsers.ts`.
   - **Issue**: Plaintext passwords for all 9 admin roles (`SuperAdmin@123!`, `Finance@123`, etc.) are committed in the source code.

3. **Hardcoded Two-Factor Authentication (2FA)**:
   - **Location**: `admin/src/pages/auth/TwoFactorPage.tsx`.
   - **Issue**: Standard TOTP verification is bypassed by accepting hardcoded strings `"123456"` or `"BACKUP-999"`.

4. **Hardcoded OTP Verification**:
   - **Location**: `frontend/src/routes/otp.tsx`.
   - **Issue**: Phone OTP verification accepts `"1234"` as valid for any phone number.

5. **Client-Side Permission Enforcement**:
   - **Location**: `admin/src/components/auth/PermissionRoute.tsx`.
   - **Issue**: Role-Based Access Control (RBAC) is enforced purely via React component rendering. Because there is no backend API validating access tokens, an attacker can manipulate React state or bypass router checks to view sensitive screens.

---

## 2. Data Protection & Privacy Risks

1. **Sensitive Personal Identifiable Information (PII) in LocalStorage**:
   - User phone numbers (`omeetso_pending_phone`), full names, email addresses, exact pincodes, and physical store addresses are stored in unencrypted `localStorage`.
   - Any malicious XSS script running on the domain can read `localStorage` and exfiltrate user PII.

2. **Financial Data Spoofing**:
   - `omeetso_wallet` balance and transaction logs (`omeetso_wallet_transactions`) are stored in `localStorage`.
   - Users can open browser DevTools and edit their wallet balance to any arbitrary amount (`localStorage.setItem('omeetso_wallet', JSON.stringify({balance: 999999}))`).

3. **Insecure Storage of Verification Documents**:
   - Front-end verification flows (`account.verification.$type.tsx`) store references or object URLs locally without encryption or secure tokenized access.

---

## 3. Input Validation & XSS Risks

- **Cross-Site Scripting (XSS)**: Form fields across sell forms, chat messages, store descriptions, and support tickets do not perform HTML sanitization (e.g., using DOMPurify). If user input containing `<script>` tags is rendered directly via dangerouslySetInnerHTML or poorly sanitized Markdown components, script execution can occur.
- **Client-Side Validation Only**: Zod schemas validate form inputs client-side for UX purposes, but without a backend to re-validate incoming payloads, invalid or malicious data structures can be saved into browser state.

---

## 4. Compliance & Policy Readiness

1. **GDPR / Digital Personal Data Protection (DPDP) Act Readiness**:
   - **Data Erasure**: The account deletion route (`/settings/delete`) clears local browser storage, but does not trigger backend soft-deletion or data scrub pipelines.
   - **Data Export**: No feature exists for users to download a machine-readable copy of their personal data.
   - **Consent Management**: Cookie preferences page (`/cookie-preferences`) contains static text; no active consent banner blocks non-essential tracking scripts.

2. **E-Commerce & Classifieds Regulatory Compliance (India)**:
   - Consumer Protection (E-Commerce) Rules require clear display of seller details, grievance officer contact info, and country of origin for imported goods. Static policy pages (`terms.tsx`, `privacy.tsx`) exist, but dynamic compliance fields are missing from listing models.

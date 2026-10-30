# Changes for the October 29 issue list

The eight items from the supplied Word document were addressed in the existing frontend, backend, and admin applications. Earlier workspace edits were preserved.

| Item | Change |
| --- | --- |
| Unauthorized account access | Removed demo-account and mock-token authentication, default admin sessions and prefilled login credentials. PIN login now requires a configured PIN; registration updates require the verified phone's session. Admin access checks include revoked sessions and real authenticator verification after password verification. |
| Resume validation | Both client and server require an attached PDF/Word resume or a manual profile containing education, skills, and a professional title or summary. Local-only blob references do not qualify. Failed submissions no longer appear successful. |
| Applied button | Job cards load the current candidate's server applications and display Applied. Candidate caches exclude other users' applications. |
| Candidate status notifications | Shortlisted, Interview Scheduled, Selected, Hired and Rejected transitions trigger email to the registered candidate email and an in-app notification. Notes-only saves and unchanged statuses do not resend notifications. Employer status and interview changes wait for server confirmation before updating the interface. |
| Store heading | Changed the jobs-page section to Discover Stores & Businesses Near You. |
| Mobile Chat | Header Chat and bottom Chats both opened /chats at a 390-pixel browser viewport. Seller and Employer creation requests have a 12-second timeout and expired-session redirects; Seller buttons also prevent repeated taps while opening a conversation. Seller sign-in preserves the return destination. |
| Support attachments and chat button | New requests and replies upload actual image/PDF contents rather than filename placeholders. Both the admin thread and user thread render attachments. Added Chat with Support links, periodic ticket refresh and excluded ticket screens from sticky advertisements that could cover the composer. |
| Contact methods | Support requests offer email and in-app contact only; phone callbacks are rejected by the support endpoint. Removed the safety-report phone contact choice and callback number field. |

## Verification

- Backend TypeScript compilation passed.
- Admin TypeScript project compilation and production build passed.
- Frontend production build passed, with existing bundle-size and dynamic-import warnings.
- 53 regression tests passed using mocked persistence and email delivery. No live emails were sent by the tests and no production records were modified.
- Frontend full TypeScript checking still reports 238 existing errors. Comparing diagnostic messages against the earlier check found no new errors from these edits.
- Browser checks verified mobile header and bottom Chat navigation in a signed-out session. Signed-in Seller/Employer conversations and actual SMTP delivery still need an integration check with test accounts and configured services.

## Behavior to know before deployment

Admin access now requires real credentials and an active session; the old automatic Super Admin session is rejected. Google sign-in is unavailable until verified Google credentials are integrated, because the old implementation authenticated a fabricated profile. PIN and OTP sign-in remain available. Existing demo 2FA codes are rejected; enabled admin 2FA accounts require a valid Base32 authenticator secret.

Previously submitted support attachments stored only as ref:// filenames cannot be reconstructed; affected users must upload those files again.

Run the regressions with npm test --workspace=backend. This compiles the backend before executing the tests.

# Paid merchant enrollment

Enrollment is disabled by default in both the server environment and database. Existing public interest pages remain active. This release prepares the $149 one-time first-month reservation, not automatic recurring subscriptions.

## Required server-only environment variables

- SUPABASE_SERVICE_ROLE_KEY (never NEXT_PUBLIC)
- PAID_ENROLLMENT_ENABLED=false
- SQUARE_ENVIRONMENT=sandbox while testing, production only after verification
- SQUARE_ACCESS_TOKEN for the same environment and Hometown Perks Square account
- SQUARE_LOCATION_ID for Hometown Perks
- SQUARE_WEBHOOK_SIGNATURE_KEY
- SQUARE_WEBHOOK_NOTIFICATION_URL=https://portal.hometownperksusa.com/api/square/webhook
- PORTAL_ORIGIN=https://portal.hometownperksusa.com

Do not put credentials in this repository or chat. Use Vercel environment settings.

## Launch checks

1. Confirm host contracts. Populate enrollment_settings with the confirmed locations, a future launch_deadline, approved terms_text and terms_version. Keep enabled=false.
2. Configure Supabase email confirmation and allow /enroll redirect URL. Configure an email delivery provider and password recovery before live recruitment.
3. Register the Square webhook for payment.created, payment.updated, refund.created, refund.updated. Notification URL must exactly match the configured URL.
4. Sandbox-test verified signup, checkout, abandoned checkout, duplicate/concurrent requests, payment completion, webhook replay, wrong amount, cross-account access, refund, and recovery after a database outage. Test credentials must be separate from production.
5. Confirm tax treatment and approved cancellation/refund terms. Checkout presently charges exactly $149 USD, without separately calculated tax.
6. Implement and verify recurring billing that begins after the prepaid first month. This release does not save a reusable card or authorize recurring charges. A separate Square subscription authorization is required; do not claim automatic monthly billing is enabled.
7. Only after all checks, set both PAID_ENROLLMENT_ENABLED=true and enrollment_settings.enabled=true. Point enrollment CTAs to portal /enroll and update public copy.

## Status behavior

Authenticated users can view only their own enrollment. Browsers cannot create or change payment records. Square-hosted checkout handles cards. A return from Square never proves payment; only a verified webhook does. Payment moves enrollment to paid_pending_launch, not active. Refunds update its state. There is no automatic service activation or recurring billing.

## Operations still needed

Authenticated administrator workflow for confirming launch and recurring billing, payment reconciliation for lost webhook events, cancellation/refund workflow, host agreement tracking, email notifications, finalized ad allowances, and sandbox end-to-end verification. Payment links remain usable if already issued; before suspending an offer, disable issued links in Square as well as the enrollment switches.

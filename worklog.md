---
Task ID: 1-6
Agent: Main Agent
Task: Add QR Code / Link sharing$  registration feature for Kursus module

Work Log:
- Read existing Prisma schema, page.tsx, API routes to understand current state
- Added PendaftaranAwam model to Prisma schema for/ public self-registration tracking
- Added p<endaftaranAwam$ relation to Kursus model
- Ran db:push to sync schema to database
- Created /api/awam/pendaftaran/route.ts with GET (kursus info) and POST (submit registration)
- Created /api/pendaftaran-awam/route.ts with GET (list), PUT (approve/reject), DELETE
- Updated page.tsx via subagent:
  - Added imports: useSearchParams, Share2, Copy, Check, ExternalLink, UserPlus, Mail, Phone
  - Wrapped Home in Suspense boundary for useSearchParams compatibility
  - Added daftarKursusId detection from ?daftar= query param
  - Added registration form in PublicPortal (Claymorphism styled)
  - Added Share2 button in KursusTab action column
  - Added QR Code generation dialog with dynamic import of qrcode library
  - Added copy link functionality with clipboard API
  - Added pendaftaranList state and approve/reject handlers in KursusTab
  - Added "Pendaftaran Menunggu Kelulusan" section in View Dialog
- Verified API works correctly via curl (GET returns kursus info, POST creates registration)
- Verified QR Code dialog renders correctly via Agent Browser (screenshot analysis confirmed QR code, link, copy button visible)
- Lint passes cleanly

Stage Summary:
- New model: PendaftaranAwam (pendaftaran_awam table) for self-registration
- New API: /api/awam/pendaftaran (GET + POST) for public registration
- New API: /api/pendaftaran-awam (GET + PUT + DELETE) for admin management
- Feature: Admin can share QR Code or Link per kursus via "Kongsi" button
- Feature: Public registration form at /?daftar=<kursusId>
- Feature: Admin can approve/reject pending registrations in View Dialog
- Design: All Claymorphism styled with purple QR codes

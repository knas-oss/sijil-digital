---
Task ID: 1
Agent: Main Agent
Task: Tukar "Advance Technology Training Centre (ADTEC)" kepada "Kolej Teknologi Termaju (ADTEC) JTM Kampus Sandakan" dalam templat sijil

Work Log:
- Changed seed.ts teksPengaki from "Advanced Technology Training Centre (ADTEC)" to "Kolej Teknologi Termaju (ADTEC) JTM Kampus Sandakan"
- Updated PDF header in jana-sijil/route.ts: "KOLEJ TEKNOLOGI TERMAJU (ADTEC)" and "JTM KAMPUS SANDAKAN, SABAH"
- Updated PDF footer to use new institution name
- Updated signature area under Pengarah to "Kolej Teknologi Termaju (ADTEC)"
- Updated template preview in page.tsx: "KOLEJ TEKNOLOGI TERMAJU (ADTEC)"
- Updated database tetapan_sistem record with new teksPengaki and namaInstitusi

Stage Summary:
- All references to "Advanced Technology Training Centre (ADTEC)" changed to "Kolej Teknologi Termaju (ADTEC) JTM Kampus Sandakan"
- PDF generation, template preview, seed data, and DB records all updated

---
Task ID: 2
Agent: Main Agent
Task: Tambah butang togol Aktif/Tidak Aktif pada Galeri Templat Sijil (hanya satu aktif pada satu masa)

Work Log:
- Updated API /api/templat PUT handler: when setting status to 'aktif', automatically set all other templates to 'tidak_aktif' (exclusive active logic)
- Changed "Tidak Aktif" button in TemplatTab from setting status 'arkib' to 'tidak_aktif'
- Updated button styling logic: Aktif button highlights when status === 'aktif', Tidak Aktif highlights when status !== 'aktif'
- Updated toast message to inform user that other templates are automatically deactivated
- Fixed database: updated existing templates with 'draf'/'arkib' status to 'tidak_aktif', ensured only one template is 'aktif'

Stage Summary:
- Toggle buttons (Aktif/Tidak Aktif) work on each template card in gallery
- Exclusive logic: only one template can be active at a time
- API handles deactivation of other templates atomically
- Database consistency ensured

---
Task ID: 3
Agent: Main Agent
Task: Tambah logo rasmi.png ke dalam templat sijil - posisi paling atas (atas Kolej Teknologi Termaju)

Work Log:
- Copied "logo rasmi.png" from upload folder to public/logo-rasmi.png
- Updated PDF generation (jana-sijil/route.ts): embedded logo PNG at top of certificate, centered, max height 50pts
- Added logoShift (45pts) to shift all text elements down to make room for logo
- Logo positioned above "KOLEJ TEKNOLOGI TERMAJU (ADTEC)" text
- Updated template preview in page.tsx: added <img> tag for logo-rasmi.png above institution name

Stage Summary:
- Logo rasmi ADTEC appears at the very top of certificate PDF, above institution name
- Logo is embedded directly in PDF (not linked) for portability
- Template preview in admin panel also shows the logo
- All existing certificate elements shifted down proportionally

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

---
Task ID: 4
Agent: Main Agent
Task: Tambah menu upload tandatangan digital pengarah (.png) dalam Kanvas Templat Sijil

Work Log:
- Added laluanTandatanganPengarah and laluanTandatanganPenyelaras fields to TemplatSijil model in schema.prisma
- Pushed schema changes to database (db:push)
- Created /api/upload/tandatangan/route.ts API endpoint:
  - POST: Upload PNG signature image (validates .png format, max 2MB, PNG header check)
  - DELETE: Remove signature file
  - Supports 'pengarah' and 'penyelaras' types
  - Auto-cleans old signatures of same type
- Updated /api/templat/route.ts PUT handler to save signature paths
- Added signature upload UI in TemplateEditor right panel:
  - "Tandatangan Digital" section with PenLine icon
  - Upload buttons for Pengarah and Penyelaras
  - Preview thumbnails with delete buttons
  - Hidden file input with .png accept filter
  - Loading states during upload
- Added signature preview on template canvas:
  - Left side: Tandatangan Pengarah (bottom 18%)
  - Right side: Tandatangan Penyelaras (bottom 18%)
  - Placeholder text when no signature uploaded
- Updated PDF generation (jana-sijil/route.ts):
  - Embeds digital signature PNG above signature line
  - Falls back to line if signature fails to embed
  - Scales signature proportionally (max 160w x 45h pts)
- Added Upload, ImageIcon, PenLine icons to imports
- Save handler in TemplateEditor now saves signature paths to template before saving fields

Stage Summary:
- Digital signature upload menu added to Kanvas Templat with .png-only validation
- Both Pengarah and Penyelaras signatures supported
- Signatures preview on canvas and are embedded in generated PDF certificates
- API handles upload, validation, and cleanup of signature files

---
Task ID: 5
Agent: Main Agent
Task: Tambah pilihan templat sijil orientasi Potret/Landskap dalam Galeri Templat Sijil

Work Log:
- Added orientasiFilter state to TemplatTab ('semua' | 'landskap' | 'potret')
- Added showNewDialog state for new template orientation selection dialog
- Created orientation filter tabs in gallery header:
  - "Semua" button with LayoutDashboard icon + count badge
  - "Landskap" button with wide rectangle SVG icon + count badge
  - "Potret" button with tall rectangle SVG icon + count badge
  - Active tab highlighted with clay-primary style
- Added filteredData logic to filter templates by selected orientation
- Created orientation selection dialog when clicking "Templat Baharu":
  - Modal overlay with two visual options
  - Landscape option: wide preview shape, dashed purple border, "A4 Mendatar (297×210mm)"
  - Portrait option: tall preview shape, dashed green border, "A4 Menegak (210×297mm)"
  - "Batal" button to close dialog
  - Each option sets orientasi and namaTemplat accordingly
- Added orientation badge on each template card:
  - Visual pill badge with SVG icon (wide/tall rectangle)
  - Color-coded: purple for Landskap, green for Potret
  - Shows alongside version and field count
- Removed redundant orientation text from bottom status line

Stage Summary:
- Admin can filter template gallery by orientation (All/Landscape/Portrait)
- New template creation starts with orientation selection dialog
- Each template card shows clear orientation badge
- Count badges on filter tabs show number of templates per orientation

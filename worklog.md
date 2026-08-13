---
Task ID: 1
Agent: main
Task: Build e-Sijil ADTEC Sandakan - Certificate Printing System

Work Log:
- Read PRD PDF document and extracted all requirements
- Read ADTEC official logo from upload directory
- Set up Prisma schema with 9 tables (Pengguna, KategoriProgram, Kursus, Peserta, TemplatSijil, MedanTemplat, Sijil, LogAudit, TetapanSistem)
- Pushed schema to SQLite database
- Created Claymorphism CSS design tokens in globals.css (palette, shadows, utility classes)
- Copied ADTEC logo to public folder
- Built complete Public Portal: Hero section, MyKad search, certificate list with download/preview/print
- Built complete Admin Portal: Login, Dashboard with stats, Kategori manager, Kursus manager, Peserta manager, Templat manager, Sijil manager with bulk generation, Audit log, System settings
- Built all API routes: Public (carian, jana-sijil, sahkan), Admin (auth, kategori, kursus, peserta, templat, sijil, statistik, log-audit, tetapan)
- Built PDF certificate generation engine using pdf-lib with QR code, decorative borders, proper formatting
- Seeded database with sample data (3 users, 6 categories, 7 courses, 21 participants, 10 certificates)
- Verified all functionality via Agent Browser: MyKad search, certificate download/preview, admin login, dashboard, category management, bulk certificate generation
- Verified responsive design on mobile viewport

Stage Summary:
- Full-stack e-Sijil ADTEC Sandakan system built and verified
- Claymorphism UI design implemented per PRD specifications
- Certificate PDF generation working with QR code and proper formatting
- All CRUD operations functional for admin portal
- Demo login: admin@adtec.gov.my / Admin@2026

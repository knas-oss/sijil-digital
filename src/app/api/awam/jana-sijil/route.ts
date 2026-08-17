// POST /api/awam/jana-sijil - Generate certificate PDF
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sijilId } = body

    if (!sijilId) {
      return NextResponse.json({ berjaya: false, mesej: 'ID sijil diperlukan.' }, { status: 400 })
    }

    // Fetch certificate with all related data
    const sijil = await db.sijil.findUnique({
      where: { id: sijilId },
      include: {
        peserta: true,
        kursus: {
          include: { kategori: true },
        },
        templat: {
          include: { medanTemplat: true },
        },
      },
    })

    if (!sijil || sijil.status === 'dibatalkan') {
      return NextResponse.json({ berjaya: false, mesej: 'Sijil tidak sah atau telah dibatalkan.' }, { status: 404 })
    }

    // Format date to BM
    const formatDateBM = (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date
      const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    }

    const formatDateRange = (start: Date | string, end: Date | string) => {
      const s = typeof start === 'string' ? new Date(start) : start
      const e = typeof end === 'string' ? new Date(end) : end
      const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']
      if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
        return `${s.getDate()} – ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`
      }
      return `${formatDateBM(s)} – ${formatDateBM(e)}`
    }

    const formatMyKad = (ic: string) => {
      const d = ic.replace(/[^0-9]/g, '')
      if (d.length === 12) return `${d.slice(0, 6)}-${d.slice(6, 8)}-${d.slice(8, 12)}`
      return ic
    }

    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(sijil.kodQr || `https://esijil.adtec.gov.my/sahkan/${sijil.noSiri}`, {
      width: 120,
      margin: 1,
      color: { dark: '#2F3150', light: '#FFFFFF' },
    })
    const qrBase64 = qrDataUrl.split(',')[1]
    const qrImageBytes = Uint8Array.from(atob(qrBase64), c => c.charCodeAt(0))

    // Create PDF (A4 Landscape)
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([842, 595]) // A4 landscape in points
    
    // Fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)
    const timesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic)

    const { width, height } = page.getSize()

    // --- Background ---
    // Light cream background
    page.drawRectangle({
      x: 0, y: 0, width, height,
      color: rgb(1, 1, 1),
    })

    // Decorative border
    const borderWidth = 3
    const borderMargin = 20
    page.drawRectangle({
      x: borderMargin, y: borderMargin,
      width: width - borderMargin * 2, height: height - borderMargin * 2,
      borderColor: rgb(0.486, 0.424, 0.941), // #7C6CF0
      borderWidth,
      opacity: 0.6,
    })
    // Inner border
    page.drawRectangle({
      x: borderMargin + 6, y: borderMargin + 6,
      width: width - (borderMargin + 6) * 2, height: height - (borderMargin + 6) * 2,
      borderColor: rgb(0.486, 0.424, 0.941),
      borderWidth: 1,
      opacity: 0.3,
    })

    // --- Header: Logo & Institution Name ---
    // Embed official logo at the top
    const logoShift = 45 // vertical shift to make room for logo
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo-rasmi.png')
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath)
        const logoImage = await pdfDoc.embedPng(logoBytes)
        const logoDims = logoImage.scale(1)
        // Scale logo: max height 50pts, maintain aspect ratio
        const logoMaxH = 50
        const logoScale = logoMaxH / logoDims.height
        const logoW = logoDims.width * logoScale
        const logoH = logoMaxH
        page.drawImage(logoImage, {
          x: width / 2 - logoW / 2,
          y: height - 18 - logoH,
          width: logoW,
          height: logoH,
        })
      }
    } catch (logoErr) {
      // Logo embedding failed, skip
      console.error('Logo embed error:', logoErr)
    }

    // Institution name (shifted down for logo)
    const instSize = 11
    page.drawText('KOLEJ TEKNOLOGI TERMAJU (ADTEC)', {
      x: width / 2 - helveticaBold.widthOfTextAtSize('KOLEJ TEKNOLOGI TERMAJU (ADTEC)', instSize) / 2,
      y: height - 55 - logoShift,
      size: instSize,
      font: helveticaBold,
      color: rgb(0.18, 0.19, 0.31),
    })
    page.drawText('JABATAN TENAGA MANUSIA, KEMENTERIAN SUMBER MANUSIA', {
      x: width / 2 - helvetica.widthOfTextAtSize('JABATAN TENAGA MANUSIA, KEMENTERIAN SUMBER MANUSIA', 9) / 2,
      y: height - 70 - logoShift,
      size: 9,
      font: helvetica,
      color: rgb(0.36, 0.37, 0.5),
    })
    page.drawText('JTM KAMPUS SANDAKAN, SABAH', {
      x: width / 2 - helvetica.widthOfTextAtSize('JTM KAMPUS SANDAKAN, SABAH', 9) / 2,
      y: height - 83 - logoShift,
      size: 9,
      font: helvetica,
      color: rgb(0.36, 0.37, 0.5),
    })

    // Separator line
    page.drawLine({
      start: { x: 80, y: height - 95 - logoShift },
      end: { x: width - 80, y: height - 95 - logoShift },
      thickness: 1.5,
      color: rgb(0.486, 0.424, 0.941),
      opacity: 0.5,
    })

    // --- Certificate Title ---
    const titleSize = 28
    const title = 'SIJIL PENYERTAAN'
    page.drawText(title, {
      x: width / 2 - timesBold.widthOfTextAtSize(title, titleSize) / 2,
      y: height - 140 - logoShift,
      size: titleSize,
      font: timesBold,
      color: rgb(0.18, 0.19, 0.31),
    })

    const subtitle = 'CERTIFICATE OF PARTICIPATION'
    page.drawText(subtitle, {
      x: width / 2 - timesItalic.widthOfTextAtSize(subtitle, 14) / 2,
      y: height - 160 - logoShift,
      size: 14,
      font: timesItalic,
      color: rgb(0.36, 0.37, 0.5),
    })

    // --- Body Text ---
    const bodyY = height - 200 - logoShift
    const bodyCenter = width / 2

    // "Adalah dengan ini disahkan bahawa"
    const confirmText = 'Adalah dengan ini disahkan bahawa'
    page.drawText(confirmText, {
      x: bodyCenter - timesRoman.widthOfTextAtSize(confirmText, 13) / 2,
      y: bodyY,
      size: 13,
      font: timesRoman,
      color: rgb(0.18, 0.19, 0.31),
    })

    // --- Participant Name (large, bold) ---
    const namaPenuh = sijil.peserta.namaPenuh
    const namaSize = 24
    page.drawText(namaPenuh, {
      x: bodyCenter - timesBold.widthOfTextAtSize(namaPenuh, namaSize) / 2,
      y: bodyY - 40,
      size: namaSize,
      font: timesBold,
      color: rgb(0.18, 0.19, 0.31),
    })

    // MyKad
    const mykadText = `No. MyKad: ${formatMyKad(sijil.peserta.noMykad)}`
    page.drawText(mykadText, {
      x: bodyCenter - helvetica.widthOfTextAtSize(mykadText, 11) / 2,
      y: bodyY - 60,
      size: 11,
      font: helvetica,
      color: rgb(0.36, 0.37, 0.5),
    })

    // --- "telah berjaya menyertai" ---
    const attendText = 'telah berjaya menyempurnakan'
    page.drawText(attendText, {
      x: bodyCenter - timesRoman.widthOfTextAtSize(attendText, 13) / 2,
      y: bodyY - 85,
      size: 13,
      font: timesRoman,
      color: rgb(0.18, 0.19, 0.31),
    })

    // --- Course Name (large, bold) ---
    const namaKursus = sijil.kursus.namaKursusBm
    const kursusSize = 20
    page.drawText(namaKursus, {
      x: bodyCenter - timesBold.widthOfTextAtSize(namaKursus, kursusSize) / 2,
      y: bodyY - 115,
      size: kursusSize,
      font: timesBold,
      color: rgb(0.18, 0.19, 0.31),
    })

    // Course name BI (italic)
    if (sijil.kursus.namaKursusBi) {
      const kursusBiSize = 14
      page.drawText(sijil.kursus.namaKursusBi, {
        x: bodyCenter - timesItalic.widthOfTextAtSize(sijil.kursus.namaKursusBi, kursusBiSize) / 2,
        y: bodyY - 135,
        size: kursusBiSize,
        font: timesItalic,
        color: rgb(0.36, 0.37, 0.5),
      })
    }

    // Category
    const kategoriText = `(${sijil.kursus.kategori.namaKategori})`
    page.drawText(kategoriText, {
      x: bodyCenter - timesRoman.widthOfTextAtSize(kategoriText, 11) / 2,
      y: bodyY - 155,
      size: 11,
      font: timesRoman,
      color: rgb(0.36, 0.37, 0.5),
    })

    // Date range
    const dateRange = formatDateRange(sijil.kursus.tarikhMula, sijil.kursus.tarikhTamat)
    const dateText = `pada ${dateRange}`
    page.drawText(dateText, {
      x: bodyCenter - timesRoman.widthOfTextAtSize(dateText, 12) / 2,
      y: bodyY - 180,
      size: 12,
      font: timesRoman,
      color: rgb(0.18, 0.19, 0.31),
    })

    // Duration
    if (sijil.kursus.tempohJam) {
      const durText = `selama ${sijil.kursus.tempohJam} jam`
      page.drawText(durText, {
        x: bodyCenter - timesRoman.widthOfTextAtSize(durText, 12) / 2,
        y: bodyY - 200,
        size: 12,
        font: timesRoman,
        color: rgb(0.18, 0.19, 0.31),
      })
    }

    // Venue
    const venueText = `di ${sijil.kursus.tempat || 'ADTEC JTM Kampus Sandakan'}`
    page.drawText(venueText, {
      x: bodyCenter - timesRoman.widthOfTextAtSize(venueText, 12) / 2,
      y: bodyY - 220,
      size: 12,
      font: timesRoman,
      color: rgb(0.18, 0.19, 0.31),
    })

    // --- Signature Area ---
    const sigY = 80

    // Helper: embed signature image from either file path or base64 data URL
    const embedSignature = async (sigPath: string | null | undefined): Promise<any> => {
      if (!sigPath) return null
      try {
        // Base64 data URL (from upload API — works on Vercel)
        if (sigPath.startsWith('data:image/')) {
          const base64Data = sigPath.split(',')[1]
          const sigBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
          if (sigPath.includes('image/png')) {
            return await pdfDoc.embedPng(sigBytes)
          } else {
            return await pdfDoc.embedJpg(sigBytes)
          }
        }
        // File path (local development)
        const fullPath = path.join(process.cwd(), 'public', sigPath)
        if (fs.existsSync(fullPath)) {
          const sigBytes = fs.readFileSync(fullPath)
          if (sigPath.endsWith('.png')) {
            return await pdfDoc.embedPng(sigBytes)
          } else {
            return await pdfDoc.embedJpg(sigBytes)
          }
        }
      } catch (sigErr) {
        console.error('Signature embed error:', sigErr)
      }
      return null
    }
    
    // Left signature: Pengarah (with digital signature if available)
    const sigPengarahImage = await embedSignature(sijil.templat?.laluanTandatanganPengarah)
    if (sigPengarahImage) {
      const sigDims = sigPengarahImage.scale(1)
      const sigMaxW = 160
      const sigMaxH = 45
      const sigScale = Math.min(sigMaxW / sigDims.width, sigMaxH / sigDims.height)
      page.drawImage(sigPengarahImage, {
        x: 145, y: sigY + 30,
        width: sigDims.width * sigScale, height: sigDims.height * sigScale,
      })
    } else {
      page.drawText('___________________________', {
        x: 120, y: sigY + 25, size: 10, font: helvetica, color: rgb(0.5, 0.5, 0.5),
      })
    }
    // Signature text: Susunan rasmi — Nama, Jawatan (centre-aligned, tanpa agensi)
    const sigCenterX = 220 // centre of left signature block
    const namaText = sijil.templat?.namaPenandatangan
    const jawatanText = sijil.templat?.jawatanPenandatangan || 'Pengarah'
    // Row 1: Nama Pengarah (bold, size 10)
    if (namaText) {
      const namaW = helveticaBold.widthOfTextAtSize(namaText, 10)
      page.drawText(namaText, {
        x: sigCenterX - namaW / 2, y: sigY + 10, size: 10, font: helveticaBold, color: rgb(0.18, 0.19, 0.31),
      })
    }
    // Row 2: Jawatan (normal, size 9)
    const jawatanY = namaText ? sigY - 4 : sigY + 10
    const jawatanW = helvetica.widthOfTextAtSize(jawatanText, 9)
    page.drawText(jawatanText, {
      x: sigCenterX - jawatanW / 2, y: jawatanY, size: 9, font: helvetica, color: rgb(0.18, 0.19, 0.31),
    })

    // Right signature: Cop Rasmi (with digital signature if available)
    const sigPenyelarasImage = await embedSignature(sijil.templat?.laluanTandatanganPenyelaras)
    if (sigPenyelarasImage) {
      const sigDims = sigPenyelarasImage.scale(1)
      const sigMaxW = 180
      const sigMaxH = 50
      const sigScale = Math.min(sigMaxW / sigDims.width, sigMaxH / sigDims.height)
      page.drawImage(sigPenyelarasImage, {
        x: width - 270, y: sigY + 30,
        width: sigDims.width * sigScale, height: sigDims.height * sigScale,
      })
    }
    // Cop Rasmi (centre-aligned, size 9)
    const copRasmiText = 'Cop Rasmi'
    const copRasmiCenterX = width - 190
    const copRasmiW = helvetica.widthOfTextAtSize(copRasmiText, 9)
    page.drawText(copRasmiText, {
      x: copRasmiCenterX - copRasmiW / 2, y: sigY + 10, size: 9, font: helvetica, color: rgb(0.18, 0.19, 0.31),
    })

    // --- Serial Number ---
    const siriText = `No. Siri: ${sijil.noSiri}`
    page.drawText(siriText, {
      x: bodyCenter - helvetica.widthOfTextAtSize(siriText, 8) / 2,
      y: 45,
      size: 8,
      font: helvetica,
      color: rgb(0.54, 0.56, 0.67),
    })

    // --- QR Code ---
    try {
      const qrImage = await pdfDoc.embedPng(qrImageBytes)
      page.drawImage(qrImage, {
        x: width - 100, y: 35,
        width: 60, height: 60,
      })
    } catch (e) {
      // QR embedding failed, skip
    }

    // --- Footer ---
    const footerText = 'Sijil ini dikeluarkan oleh Kolej Teknologi Termaju (ADTEC) JTM Kampus Sandakan, Kementerian Sumber Manusia.'
    page.drawText(footerText, {
      x: bodyCenter - helvetica.widthOfTextAtSize(footerText, 7) / 2,
      y: 28,
      size: 7,
      font: helvetica,
      color: rgb(0.54, 0.56, 0.67),
    })

    // Set PDF metadata
    pdfDoc.setTitle(`Sijil - ${sijil.kursus.namaKursusBm} - ${sijil.noSiri}`)
    pdfDoc.setAuthor('ADTEC JTM Kampus Sandakan')
    pdfDoc.setSubject('Sijil Penyertaan')
    pdfDoc.setCreator('e-Sijil ADTEC Sandakan')
    pdfDoc.setProducer('e-Sijil System v1.0')
    pdfDoc.setKeywords([sijil.noSiri, sijil.kursus.namaKursusBm, sijil.peserta.namaPenuh])

    const pdfBytes = await pdfDoc.save()

    // Update download count
    await db.sijil.update({
      where: { id: sijilId },
      data: {
        bilMuatTurun: { increment: 1 },
        muatTurunTerakhir: new Date(),
      },
    })

    // Return PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Sijil_${sijil.kursus.namaKursusBm.replace(/\s+/g, '_')}_${sijil.noSiri.replace(/\//g, '-')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Jana sijil error:', error)
    return NextResponse.json(
      { berjaya: false, mesej: 'Ralat penjanaan sijil. Sila cuba sebentar lagi.' },
      { status: 500 }
    )
  }
}

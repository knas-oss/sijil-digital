// POST /api/awam/carian - Search certificates by MyKad
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { no_mykad } = body

    if (!no_mykad) {
      return NextResponse.json(
        { berjaya: false, mesej: 'Nombor MyKad diperlukan.' },
        { status: 400 }
      )
    }

    // Normalize: remove dashes, keep only digits
    const normalized = no_mykad.replace(/[^0-9]/g, '')
    
    if (normalized.length !== 12) {
      return NextResponse.json(
        { berjaya: false, mesej: 'Nombor MyKad mesti mengandungi 12 digit.' },
        { status: 400 }
      )
    }

    // Hash for lookup
    const encoder = new TextEncoder()
    const data = encoder.encode(normalized)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const noMykadHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Find all eligible participants with this MyKad
    const pesertaList = await db.peserta.findMany({
      where: {
        noMykadHash,
        statusKelayakan: 'layak',
      },
      include: {
        kursus: {
          include: {
            kategori: true,
          },
        },
        sijil: true,
      },
    })

    if (pesertaList.length === 0) {
      // Log audit for failed search
      await db.logAudit.create({
        data: {
          tindakan: 'carian',
          entiti: 'peserta',
          butiran: JSON.stringify({ noMykad: normalized.slice(0, 6) + '******', berjaya: false }),
          alamatIp: request.headers.get('x-forwarded-for') || 'unknown',
        },
      })

      return NextResponse.json({
        berjaya: false,
        mesej: 'Maaf, tiada rekod sijil ditemui untuk nombor MyKad ini.',
      })
    }

    // Format MyKad for display
    const formatMyKad = (ic: string) => {
      if (ic.length === 12) return `${ic.slice(0, 6)}-${ic.slice(6, 8)}-${ic.slice(8, 12)}`
      return ic
    }

    // Build certificate list
    const sijilList = pesertaList
      .filter(p => p.sijil.length > 0)
      .flatMap(p => p.sijil.map(s => ({
        id: s.id,
        noSiri: s.noSiri,
        status: s.status,
        namaKursus: p.kursus.namaKursusBm,
        namaKursusBi: p.kursus.namaKursusBi,
        kodKursus: p.kursus.kodKursus,
        kategori: p.kursus.kategori.namaKategori,
        kategoriKod: p.kursus.kategori.kodKategori,
        kategoriWarna: p.kursus.kategori.warnaLabel,
        tarikhMula: p.kursus.tarikhMula,
        tarikhTamat: p.kursus.tarikhTamat,
        dijanaPada: s.dijanaPada,
      })))

    // Also include eligible participants without certificates (pending)
    const pendingList = pesertaList
      .filter(p => p.sijil.length === 0)
      .map(p => ({
        id: null,
        noSiri: null,
        status: 'menunggu',
        namaKursus: p.kursus.namaKursusBm,
        namaKursusBi: p.kursus.namaKursusBi,
        kodKursus: p.kursus.kodKursus,
        kategori: p.kursus.kategori.namaKategori,
        kategoriKod: p.kursus.kategori.kodKategori,
        kategoriWarna: p.kursus.kategori.warnaLabel,
        tarikhMula: p.kursus.tarikhMula,
        tarikhTamat: p.kursus.tarikhTamat,
        dijanaPada: null,
      }))

    const allSijil = [...sijilList, ...pendingList]

    // Mask name for privacy
    const namaPenuh = pesertaList[0].namaPenuh
    const namaParts = namaPenuh.split(' ')
    const namaDipaparkan = namaParts.length > 1
      ? `${namaParts[0]} ${namaParts[1][0]}${'•'.repeat(Math.min(namaParts[1].length - 1, 5))} ${namaParts.slice(2).join(' ')}`
      : namaPenuh

    // Log successful search
    await db.logAudit.create({
      data: {
        tindakan: 'carian',
        entiti: 'peserta',
        butiran: JSON.stringify({ noMykad: normalized.slice(0, 6) + '******', berjaya: true, bilSijil: allSijil.length }),
        alamatIp: request.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({
      berjaya: true,
      bilangan: allSijil.length,
      namaDipaparkan,
      noMykadFormat: formatMyKad(normalized),
      sijil: allSijil,
    })
  } catch (error) {
    console.error('Carian error:', error)
    return NextResponse.json(
      { berjaya: false, mesej: 'Ralat sistem. Sila cuba sebentar lagi.' },
      { status: 500 }
    )
  }
}

// API Pendaftaran Awam - Self-registration via Link/QR Code
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Retrieve kursus info for registration form
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kursusId = searchParams.get('kursusId')

    if (!kursusId) {
      return NextResponse.json({ berjaya: false, mesej: 'ID kursus diperlukan.' }, { status: 400 })
    }

    const kursus = await db.kursus.findUnique({
      where: { id: kursusId },
      include: {
        kategori: true,
        _count: { select: { peserta: true, pendaftaranAwam: true } },
      },
    })

    if (!kursus) {
      return NextResponse.json({ berjaya: false, mesej: 'Kursus tidak dijumpai.' }, { status: 404 })
    }

    if (kursus.status !== 'aktif') {
      return NextResponse.json({ berjaya: false, mesej: 'Pendaftaran untuk kursus ini belum dibuka.' }, { status: 400 })
    }

    return NextResponse.json({
      berjaya: true,
      data: {
        id: kursus.id,
        kodKursus: kursus.kodKursus,
        namaKursusBm: kursus.namaKursusBm,
        namaKursusBi: kursus.namaKursusBi,
        kategori: kursus.kategori.namaKategori,
        tarikhMula: kursus.tarikhMula,
        tarikhTamat: kursus.tarikhTamat,
        tempohJam: kursus.tempohJam,
        tempat: kursus.tempat,
        penyelaras: kursus.namaPenyelaras,
        bilPesertaSedia: kursus._count.peserta,
        bilPendaftaranMenunggu: kursus._count.pendaftaranAwam,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat: ' + (error?.message || 'Sila cuba lagi.') }, { status: 500 })
  }
}

// POST: Submit registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kursusId, namaPenuh, noMykad, noTelefon, emel, jantina } = body

    // Validation
    if (!kursusId || !namaPenuh || !noMykad) {
      return NextResponse.json({ berjaya: false, mesej: 'Nama penuh dan nombor MyKad wajib diisi.' }, { status: 400 })
    }

    const cleanMykad = noMykad.replace(/[^0-9]/g, '')
    if (cleanMykad.length !== 12) {
      return NextResponse.json({ berjaya: false, mesej: 'Nombor MyKad mesti mengandungi 12 digit.' }, { status: 400 })
    }

    // Check kursus exists and is active
    const kursus = await db.kursus.findUnique({ where: { id: kursusId } })
    if (!kursus) {
      return NextResponse.json({ berjaya: false, mesej: 'Kursus tidak dijumpai.' }, { status: 404 })
    }
    if (kursus.status !== 'aktif') {
      return NextResponse.json({ berjaya: false, mesej: 'Pendaftaran untuk kursus ini belum dibuka.' }, { status: 400 })
    }

    // Hash MyKad
    const encoder = new TextEncoder()
    const data = encoder.encode(cleanMykad)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const noMykadHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Check if already registered as peserta
    const existingPeserta = await db.peserta.findUnique({
      where: { kursusId_noMykadHash: { kursusId, noMykadHash } },
    })
    if (existingPeserta) {
      return NextResponse.json({ berjaya: false, mesej: 'Anda sudah didaftarkan sebagai peserta dalam kursus ini.' }, { status: 409 })
    }

    // Check if already submitted registration (pending)
    const existingDaftar = await db.pendaftaranAwam.findUnique({
      where: { kursusId_noMykadHash: { kursusId, noMykadHash } },
    })
    if (existingDaftar) {
      if (existingDaftar.status === 'menunggu') {
        return NextResponse.json({ berjaya: false, mesej: 'Permohonnan pendaftaran anda sedang menunggu kelulusan.' }, { status: 409 })
      }
      if (existingDaftar.status === 'diluluskan') {
        return NextResponse.json({ berjaya: false, mesej: 'Pendaftaran anda telah diluluskan.' }, { status: 409 })
      }
      // If ditolak, allow re-registration
    }

    // Create registration
    const pendaftaran = await db.pendaftaranAwam.create({
      data: {
        namaPenuh: namaPenuh.toUpperCase(),
        noMykad: cleanMykad,
        noMykadHash,
        noTelefon: noTelefon || null,
        emel: emel || null,
        jantina: jantina || null,
        kursusId,
      },
    })

    return NextResponse.json({
      berjaya: true,
      data: { id: pendaftaran.id, status: pendaftaran.status },
      mesej: 'Pendaftaran berjaya dihantar. Sila tunggu kelulusan pentadbir.',
    })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ berjaya: false, mesej: 'Anda sudah menghantar pendaftaran untuk kursus ini.' }, { status: 409 })
    }
    return NextResponse.json({ berjaya: false, mesej: 'Ralat mendaftar. Sila cuba lagi.' }, { status: 500 })
  }
}

// CRUD /api/peserta
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kursusId = searchParams.get('kursusId')

    const where: any = {}
    if (kursusId) where.kursusId = kursusId

    const peserta = await db.peserta.findMany({
      where,
      orderBy: { namaPenuh: 'asc' },
      include: {
        kursus: { include: { kategori: true } },
        sijil: true,
      },
    })
    return NextResponse.json({ berjaya: true, data: peserta })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const noMykad = body.noMykad.replace(/[^0-9]/g, '')

    // Hash MyKad
    const encoder = new TextEncoder()
    const data = encoder.encode(noMykad)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const noMykadHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const peserta = await db.peserta.create({
      data: {
        namaPenuh: body.namaPenuh.toUpperCase(),
        noMykad,
        noMykadHash,
        jenisPengecam: body.jenisPengecam || 'mykad',
        noTelefon: body.noTelefon,
        emel: body.emel,
        jantina: body.jantina,
        statusKelayakan: body.statusKelayakan || 'layak',
        catatan: body.catatan,
        kursusId: body.kursusId,
      },
    })
    return NextResponse.json({ berjaya: true, data: peserta })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ berjaya: false, mesej: 'Peserta ini sudah didaftarkan dalam kursus ini.' }, { status: 409 })
    }
    return NextResponse.json({ berjaya: false, mesej: 'Ralat menambah peserta.' }, { status: 500 })
  }
}

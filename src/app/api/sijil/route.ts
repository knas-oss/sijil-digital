// /api/sijil - List certificates + Generate bulk
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSerialNumber } from '@/lib/serial'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kursusId = searchParams.get('kursusId')

    const where: any = {}
    if (kursusId) where.kursusId = kursusId

    const sijil = await db.sijil.findMany({
      where,
      orderBy: { dijanaPada: 'desc' },
      include: {
        peserta: true,
        kursus: { include: { kategori: true } },
      },
    })
    return NextResponse.json({ berjaya: true, data: sijil })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Generate certificates for all eligible participants in a course
  try {
    const { kursusId, dimuatNaikOlehId } = await request.json()

    const kursus = await db.kursus.findUnique({
      where: { id: kursusId },
      include: { kategori: true },
    })

    if (!kursus) {
      return NextResponse.json({ berjaya: false, mesej: 'Kursus tidak ditemui.' }, { status: 404 })
    }

    // Get template for this course
    let templatId = kursus.templatKhususId
    if (!templatId) {
      templatId = kursus.kategori.templatLalaiId
    }
    if (!templatId) {
      return NextResponse.json({ berjaya: false, mesej: 'Templat belum ditetapkan.' }, { status: 400 })
    }

    // Get eligible participants without certificates
    const pesertaList = await db.peserta.findMany({
      where: {
        kursusId,
        statusKelayakan: 'layak',
        sijil: { none: { kursusId } },
      },
    })

    const year = new Date().getFullYear()
    const catCode = kursus.kategori.kodKategori

    // Get current max serial number
    const existingSijil = await db.sijil.findMany({
      where: { noSiri: { startsWith: `ADTEC/SDK/${year}/${catCode}/` } },
      orderBy: { noSiri: 'desc' },
      take: 1,
    })

    let seq = existingSijil.length > 0
      ? parseInt(existingSijil[0].noSiri.split('/').pop() || '0') + 1
      : 1

    const results = []
    for (const peserta of pesertaList) {
      const noSiri = generateSerialNumber(year, catCode, seq)
      const sijil = await db.sijil.create({
        data: {
          noSiri,
          kodQr: `https://esijil.adtecsandakan.gov.my/sahkan/${noSiri}`,
          status: 'sah',
          pesertaId: peserta.id,
          kursusId,
          templatId,
          versiTemplat: 1,
        },
      })
      results.push(sijil)
      seq++
    }

    return NextResponse.json({ berjaya: true, bilDijana: results.length, data: results })
  } catch (error) {
    console.error('Bulk generate error:', error)
    return NextResponse.json({ berjaya: false, mesej: 'Ralat penjanaan sijil.' }, { status: 500 })
  }
}

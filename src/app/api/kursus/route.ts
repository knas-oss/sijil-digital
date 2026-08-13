// CRUD /api/kursus
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kategoriId = searchParams.get('kategoriId')
    const status = searchParams.get('status')

    const where: any = {}
    if (kategoriId) where.kategoriId = kategoriId
    if (status) where.status = status

    const kursus = await db.kursus.findMany({
      where,
      orderBy: { diciptaPada: 'desc' },
      include: {
        kategori: true,
        _count: { select: { peserta: true, sijil: true } },
      },
    })
    return NextResponse.json({ berjaya: true, data: kursus })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const kursus = await db.kursus.create({
      data: {
        kodKursus: body.kodKursus,
        namaKursusBm: body.namaKursusBm,
        namaKursusBi: body.namaKursusBi,
        tempohJam: body.tempohJam,
        namaPenyelaras: body.namaPenyelaras,
        tempat: body.tempat,
        penganjurBersama: body.penganjurBersama,
        catatan: body.catatan,
        status: body.status || 'draf',
        tarikhMula: new Date(body.tarikhMula),
        tarikhTamat: new Date(body.tarikhTamat),
        kategoriId: body.kategoriId,
        diciptaOlehId: body.diciptaOlehId,
      },
    })
    return NextResponse.json({ berjaya: true, data: kursus })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat mencipta kursus.' }, { status: 500 })
  }
}

// CRUD /api/kategori
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const kategori = await db.kategoriProgram.findMany({
      orderBy: { namaKategori: 'asc' },
      include: { _count: { select: { kursus: true } } },
    })
    return NextResponse.json({ berjaya: true, data: kategori })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const kategori = await db.kategoriProgram.create({
      data: {
        kodKategori: body.kodKategori,
        namaKategori: body.namaKategori,
        keterangan: body.keterangan,
        warnaLabel: body.warnaLabel || '#7C6CF0',
        status: 'aktif',
      },
    })
    return NextResponse.json({ berjaya: true, data: kategori })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat mencipta kategori.' }, { status: 500 })
  }
}

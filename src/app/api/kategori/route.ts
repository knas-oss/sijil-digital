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

    // Pre-check for duplicate kodKategori
    const existing = await db.kategoriProgram.findUnique({ where: { kodKategori: body.kodKategori } })
    if (existing) {
      return NextResponse.json({ berjaya: false, mesej: 'Kod kategori sudah wujud. Sila guna kod lain.' }, { status: 400 })
    }

    const kategori = await db.kategoriProgram.create({
      data: {
        kodKategori: body.kodKategori,
        namaKategori: body.namaKategori,
        keterangan: body.keterangan || null,
        warnaLabel: body.warnaLabel || '#7C6CF0',
        status: body.status || 'aktif',
      },
    })
    return NextResponse.json({ berjaya: true, data: kategori })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ berjaya: false, mesej: 'Kod kategori sudah wujud. Sila guna kod lain.' }, { status: 400 })
    }
    return NextResponse.json({ berjaya: false, mesej: 'Ralat mencipta kategori.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ berjaya: false, mesej: 'ID kategori diperlukan.' }, { status: 400 })
    }

    const existing = await db.kategoriProgram.findUnique({ where: { id: body.id } })
    if (!existing) {
      return NextResponse.json({ berjaya: false, mesej: 'Kategori tidak dijumpai.' }, { status: 404 })
    }

    // Check for duplicate kodKategori if changing
    if (body.kodKategori && body.kodKategori !== existing.kodKategori) {
      const dup = await db.kategoriProgram.findUnique({ where: { kodKategori: body.kodKategori } })
      if (dup) {
        return NextResponse.json({ berjaya: false, mesej: 'Kod kategori sudah wujud. Sila guna kod lain.' }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (body.kodKategori !== undefined) updateData.kodKategori = body.kodKategori
    if (body.namaKategori !== undefined) updateData.namaKategori = body.namaKategori
    if (body.keterangan !== undefined) updateData.keterangan = body.keterangan || null
    if (body.warnaLabel !== undefined) updateData.warnaLabel = body.warnaLabel
    if (body.status !== undefined) updateData.status = body.status

    const kategori = await db.kategoriProgram.update({
      where: { id: body.id },
      data: updateData,
      include: { _count: { select: { kursus: true } } },
    })
    return NextResponse.json({ berjaya: true, data: kategori })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ berjaya: false, mesej: 'Kod kategori sudah wujud.' }, { status: 400 })
    }
    return NextResponse.json({ berjaya: false, mesej: 'Ralat mengemaskini kategori.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ berjaya: false, mesej: 'ID kategori diperlukan.' }, { status: 400 })
    }

    const existing = await db.kategoriProgram.findUnique({
      where: { id },
      include: { _count: { select: { kursus: true } } },
    })
    if (!existing) {
      return NextResponse.json({ berjaya: false, mesej: 'Kategori tidak dijumpai.' }, { status: 404 })
    }
    if (existing._count.kursus > 0) {
      return NextResponse.json({ berjaya: false, mesej: `Tidak boleh memadam. ${existing._count.kursus} kursus menggunakan kategori ini. Arkibkan sebagai ganti.` }, { status: 400 })
    }

    await db.kategoriProgram.delete({ where: { id } })
    return NextResponse.json({ berjaya: true, mesej: 'Kategori berjaya dipadam.' })
  } catch (error: any) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat memadam kategori.' }, { status: 500 })
  }
}

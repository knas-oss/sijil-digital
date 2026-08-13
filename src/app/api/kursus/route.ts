// CRUD /api/kursus
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kategoriId = searchParams.get('kategoriId')
    const status = searchParams.get('status')
    const id = searchParams.get('id')

    // Get single kursus with peserta list
    if (id) {
      const kursus = await db.kursus.findUnique({
        where: { id },
        include: {
          kategori: true,
          peserta: { orderBy: { namaPenuh: 'asc' }, include: { sijil: true } },
          _count: { select: { peserta: true, sijil: true } },
        },
      })
      if (!kursus) return NextResponse.json({ berjaya: false, mesej: 'Kursus tidak dijumpai.' }, { status: 404 })
      return NextResponse.json({ berjaya: true, data: kursus })
    }

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

    // Pre-check for duplicate kodKursus
    const existing = await db.kursus.findUnique({ where: { kodKursus: body.kodKursus } })
    if (existing) {
      return NextResponse.json({ berjaya: false, mesej: 'Kod kursus sudah wujud. Sila guna kod lain.' }, { status: 400 })
    }

    const kursus = await db.kursus.create({
      data: {
        kodKursus: body.kodKursus,
        namaKursusBm: body.namaKursusBm,
        namaKursusBi: body.namaKursusBi || null,
        tempohJam: body.tempohJam ? parseInt(body.tempohJam) : null,
        namaPenyelaras: body.namaPenyelaras || null,
        tempat: body.tempat || 'ADTEC JTM Kampus Sandakan',
        penganjurBersama: body.penganjurBersama || null,
        catatan: body.catatan || null,
        status: body.status || 'draf',
        tarikhMula: new Date(body.tarikhMula),
        tarikhTamat: new Date(body.tarikhTamat),
        kategoriId: body.kategoriId,
        diciptaOlehId: body.diciptaOlehId,
      },
      include: { kategori: true, _count: { select: { peserta: true, sijil: true } } },
    })
    return NextResponse.json({ berjaya: true, data: kursus })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ berjaya: false, mesej: 'Kod kursus sudah wujud. Sila guna kod lain.' }, { status: 400 })
    }
    return NextResponse.json({ berjaya: false, mesej: 'Ralat mencipta kursus.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ berjaya: false, mesej: 'ID kursus diperlukan.' }, { status: 400 })
    }

    const existing = await db.kursus.findUnique({ where: { id: body.id } })
    if (!existing) {
      return NextResponse.json({ berjaya: false, mesej: 'Kursus tidak dijumpai.' }, { status: 404 })
    }

    // Check for duplicate kodKursus if changing
    if (body.kodKursus && body.kodKursus !== existing.kodKursus) {
      const dup = await db.kursus.findUnique({ where: { kodKursus: body.kodKursus } })
      if (dup) {
        return NextResponse.json({ berjaya: false, mesej: 'Kod kursus sudah wujud. Sila guna kod lain.' }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (body.kodKursus !== undefined) updateData.kodKursus = body.kodKursus
    if (body.namaKursusBm !== undefined) updateData.namaKursusBm = body.namaKursusBm
    if (body.namaKursusBi !== undefined) updateData.namaKursusBi = body.namaKursusBi || null
    if (body.tempohJam !== undefined) updateData.tempohJam = body.tempohJam ? parseInt(body.tempohJam) : null
    if (body.namaPenyelaras !== undefined) updateData.namaPenyelaras = body.namaPenyelaras || null
    if (body.tempat !== undefined) updateData.tempat = body.tempat || null
    if (body.penganjurBersama !== undefined) updateData.penganjurBersama = body.penganjurBersama || null
    if (body.catatan !== undefined) updateData.catatan = body.catatan || null
    if (body.status !== undefined) updateData.status = body.status
    if (body.tarikhMula !== undefined) updateData.tarikhMula = new Date(body.tarikhMula)
    if (body.tarikhTamat !== undefined) updateData.tarikhTamat = new Date(body.tarikhTamat)
    if (body.kategoriId !== undefined) updateData.kategoriId = body.kategoriId

    const kursus = await db.kursus.update({
      where: { id: body.id },
      data: updateData,
      include: { kategori: true, _count: { select: { peserta: true, sijil: true } } },
    })
    return NextResponse.json({ berjaya: true, data: kursus })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ berjaya: false, mesej: 'Kod kursus sudah wujud. Sila guna kod lain.' }, { status: 400 })
    }
    return NextResponse.json({ berjaya: false, mesej: 'Ralat mengemaskini kursus.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ berjaya: false, mesej: 'ID kursus diperlukan.' }, { status: 400 })
    }

    const existing = await db.kursus.findUnique({
      where: { id },
      include: { _count: { select: { peserta: true, sijil: true } } },
    })
    if (!existing) {
      return NextResponse.json({ berjaya: false, mesej: 'Kursus tidak dijumpai.' }, { status: 404 })
    }
    if (existing._count.sijil > 0) {
      return NextResponse.json({ berjaya: false, mesej: `Tidak boleh memadam. ${existing._count.sijil} sijil telah dijana untuk kursus ini. Arkibkan sebagai ganti.` }, { status: 400 })
    }

    // Delete peserta and sijil first (cascade), then kursus
    await db.sijil.deleteMany({ where: { kursusId: id } })
    await db.peserta.deleteMany({ where: { kursusId: id } })
    await db.kursus.delete({ where: { id } })

    return NextResponse.json({ berjaya: true, mesej: 'Kursus berjaya dipadam.' })
  } catch (error: any) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat memadam kursus.' }, { status: 500 })
  }
}

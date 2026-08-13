// Admin API: CRUD /api/pendaftaran-awam - Manage public registrations
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: List registrations for a kursus
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kursusId = searchParams.get('kursusId')
    const status = searchParams.get('status')

    const where: any = {}
    if (kursusId) where.kursusId = kursusId
    if (status) where.status = status

    const senarai = await db.pendaftaranAwam.findMany({
      where,
      orderBy: { diciptaPada: 'desc' },
      include: { kursus: { include: { kategori: true } } },
    })
    return NextResponse.json({ berjaya: true, data: senarai })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat.' }, { status: 500 })
  }
}

// PUT: Approve or reject a registration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, tindakan } = body // tindakan: 'lulus' | 'tolak'

    if (!id || !tindakan) {
      return NextResponse.json({ berjaya: false, mesej: 'ID dan tindakan diperlukan.' }, { status: 400 })
    }

    const existing = await db.pendaftaranAwam.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ berjaya: false, mesej: 'Pendaftaran tidak dijumpai.' }, { status: 404 })
    }

    if (tindakan === 'lulus') {
      // Approve: create Peserta record and update status
      const peserta = await db.peserta.create({
        data: {
          namaPenuh: existing.namaPenuh,
          noMykad: existing.noMykad,
          noMykadHash: existing.noMykadHash,
          jenisPengecam: 'mykad',
          noTelefon: existing.noTelefon,
          emel: existing.emel,
          jantina: existing.jantina,
          statusKelayakan: 'layak',
          kursusId: existing.kursusId,
        },
      })
      await db.pendaftaranAwam.update({
        where: { id },
        data: { status: 'diluluskan', catatan: 'Diluluskan pada ' + new Date().toISOString() },
      })
      return NextResponse.json({ berjaya: true, mesej: 'Pendaftaran diluluskan. Peserta telah ditambah.', data: { pesertaId: peserta.id } })
    }

    if (tindakan === 'tolak') {
      await db.pendaftaranAwam.update({
        where: { id },
        data: { status: 'ditolak', catatan: body.catatan || 'Ditolak pada ' + new Date().toISOString() },
      })
      return NextResponse.json({ berjaya: true, mesej: 'Pendaftaran ditolak.' })
    }

    return NextResponse.json({ berjaya: false, mesej: 'Tindakan tidak sah.' }, { status: 400 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ berjaya: false, mesej: 'Peserta sudah wujud dalam kursus ini.' }, { status: 409 })
    }
    return NextResponse.json({ berjaya: false, mesej: 'Ralat mengemaskini pendaftaran.' }, { status: 500 })
  }
}

// DELETE: Remove a registration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ berjaya: false, mesej: 'ID diperlukan.' }, { status: 400 })
    }

    await db.pendaftaranAwam.delete({ where: { id } })
    return NextResponse.json({ berjaya: true, mesej: 'Pendaftaran berjaya dipadam.' })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat memadam pendaftaran.' }, { status: 500 })
  }
}

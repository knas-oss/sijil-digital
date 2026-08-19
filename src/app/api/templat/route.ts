// CRUD /api/templat
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const templat = await db.templatSijil.findMany({
      orderBy: { diciptaPada: 'desc' },
      include: {
        medanTemplat: { orderBy: { posYPeratus: 'asc' } },
        dimuatNaikOleh: { select: { namaPenuh: true } },
      },
    })
    return NextResponse.json({ berjaya: true, data: templat })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Create template with fields and metadata
    const templat = await db.templatSijil.create({
      data: {
        namaTemplat: body.namaTemplat,
        keterangan: body.keterangan,
        laluanFail: body.laluanFail || '/templates/default.png',
        jenisFail: body.jenisFail || 'png',
        orientasi: body.orientasi || 'landskap',
        saizKertas: body.saizKertas || 'a4',
        lebarPx: body.lebarPx || 3508,
        tinggiPx: body.tinggiPx || 2480,
        status: 'draf',
        dimuatNaikOlehId: body.dimuatNaikOlehId,
        laluanTandatanganPengarah: body.laluanTandatanganPengarah || null,
        laluanTandatanganPenyelaras: body.laluanTandatanganPenyelaras || null,
        logoRasmi: body.logoRasmi || null,
        jawatanPenandatangan: body.jawatanPenandatangan || null,
        namaPenandatangan: body.namaPenandatangan || null,
      },
    })

    // Create fields if provided
    if (body.medan && Array.isArray(body.medan)) {
      for (const medan of body.medan) {
        await db.medanTemplat.create({
          data: { ...medan, templatId: templat.id },
        })
      }
    }

    return NextResponse.json({ berjaya: true, data: templat })
  } catch (error) {
    console.error('Templat POST error:', error)
    return NextResponse.json({ berjaya: false, mesej: 'Ralat mencipta templat.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.templatId) {
      return NextResponse.json({ berjaya: false, mesej: 'ID templat diperlukan.' }, { status: 400 })
    }

    // Verify template exists
    const existing = await db.templatSijil.findUnique({ where: { id: body.templatId } })
    if (!existing) {
      return NextResponse.json({ berjaya: false, mesej: 'Templat tidak dijumpai.' }, { status: 404 })
    }

    // Update template metadata only (no fields)
    if (!body.medan) {
      const updateData: any = {}
      if (body.namaTemplat !== undefined) updateData.namaTemplat = body.namaTemplat
      if (body.keterangan !== undefined) updateData.keterangan = body.keterangan
      if (body.orientasi !== undefined) updateData.orientasi = body.orientasi
      if (body.saizKertas !== undefined) updateData.saizKertas = body.saizKertas
      if (body.status !== undefined) updateData.status = body.status
      if (body.laluanTandatanganPengarah !== undefined) updateData.laluanTandatanganPengarah = body.laluanTandatanganPengarah
      if (body.laluanTandatanganPenyelaras !== undefined) updateData.laluanTandatanganPenyelaras = body.laluanTandatanganPenyelaras
      if (body.logoRasmi !== undefined) updateData.logoRasmi = body.logoRasmi
      if (body.jawatanPenandatangan !== undefined) updateData.jawatanPenandatangan = body.jawatanPenandatangan
      if (body.namaPenandatangan !== undefined) updateData.namaPenandatangan = body.namaPenandatangan

      // If setting template to 'aktif', deactivate all others first (only one active at a time)
      if (body.status === 'aktif') {
        await db.templatSijil.updateMany({
          where: { status: 'aktif', id: { not: body.templatId } },
          data: { status: 'tidak_aktif' },
        })
      }

      const templat = await db.templatSijil.update({
        where: { id: body.templatId },
        data: updateData,
      })
      return NextResponse.json({ berjaya: true, data: templat })
    }

    // Update fields for a template (full replace)
    if (Array.isArray(body.medan)) {
      // Use transaction for atomicity
      await db.$transaction(async (tx) => {
        // Delete existing fields
        await tx.medanTemplat.deleteMany({
          where: { templatId: body.templatId },
        })

        // Create new fields
        for (const medan of body.medan) {
          await tx.medanTemplat.create({
            data: {
              kunciMedan: medan.kunciMedan,
              jenisElemen: medan.jenisElemen || 'teks',
              posXPeratus: medan.posXPeratus ?? 50,
              posYPeratus: medan.posYPeratus ?? 50,
              lebarPeratus: medan.lebarPeratus ?? 40,
              keluargaFon: medan.keluargaFon || 'Times New Roman',
              saizFon: medan.saizFon ?? 24,
              warnaFon: medan.warnaFon || '#000000',
              gayaFon: medan.gayaFon || 'normal',
              penjajaran: medan.penjajaran || 'tengah',
              autoKecil: medan.autoKecil ?? true,
              templatId: body.templatId,
            },
          })
        }
      })

      // Return updated template with fields
      const templat = await db.templatSijil.findUnique({
        where: { id: body.templatId },
        include: { medanTemplat: { orderBy: { posYPeratus: 'asc' } } },
      })
      return NextResponse.json({ berjaya: true, data: templat })
    }

    return NextResponse.json({ berjaya: false, mesej: 'Data tidak lengkap.' }, { status: 400 })
  } catch (error: any) {
    console.error('Templat PUT error:', error)
    const mesej = error?.code === 'P2003' ? 'Templat tidak dijumpai. Sila cipta templat baharu terlebih dahulu.' : 'Ralat mengemaskini templat.'
    return NextResponse.json({ berjaya: false, mesej }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ berjaya: false, mesej: 'ID templat diperlukan.' }, { status: 400 })
    }

    // Delete fields first, then template
    await db.medanTemplat.deleteMany({ where: { templatId: id } })
    await db.templatSijil.delete({ where: { id } })

    return NextResponse.json({ berjaya: true, mesej: 'Templat dipadam.' })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat memadam templat.' }, { status: 500 })
  }
}

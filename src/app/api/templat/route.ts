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

    // Create template with fields
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
    return NextResponse.json({ berjaya: false, mesej: 'Ralat mencipta templat.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Update template metadata
    if (body.templatId && !body.medan) {
      const updateData: any = {}
      if (body.namaTemplat !== undefined) updateData.namaTemplat = body.namaTemplat
      if (body.keterangan !== undefined) updateData.keterangan = body.keterangan
      if (body.orientasi !== undefined) updateData.orientasi = body.orientasi
      if (body.saizKertas !== undefined) updateData.saizKertas = body.saizKertas
      if (body.status !== undefined) updateData.status = body.status

      const templat = await db.templatSijil.update({
        where: { id: body.templatId },
        data: updateData,
      })
      return NextResponse.json({ berjaya: true, data: templat })
    }

    // Update all fields for a template (full replace)
    if (body.templatId && body.medan && Array.isArray(body.medan)) {
      // Delete existing fields
      await db.medanTemplat.deleteMany({
        where: { templatId: body.templatId },
      })

      // Create new fields
      for (const medan of body.medan) {
        await db.medanTemplat.create({
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

      // Return updated template with fields
      const templat = await db.templatSijil.findUnique({
        where: { id: body.templatId },
        include: { medanTemplat: { orderBy: { posYPeratus: 'asc' } } },
      })
      return NextResponse.json({ berjaya: true, data: templat })
    }

    return NextResponse.json({ berjaya: false, mesej: 'Data tidak lengkap.' }, { status: 400 })
  } catch (error) {
    console.error('Templat PUT error:', error)
    return NextResponse.json({ berjaya: false, mesej: 'Ralat mengemaskini templat.' }, { status: 500 })
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

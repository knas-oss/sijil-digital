// CRUD /api/templat
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const templat = await db.templatSijil.findMany({
      orderBy: { diciptaPada: 'desc' },
      include: {
        medanTemplat: true,
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
    return NextResponse.json({ berjaya: true, data: templat })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat.' }, { status: 500 })
  }
}

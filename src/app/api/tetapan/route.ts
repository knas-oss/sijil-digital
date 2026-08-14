// GET/PUT /api/tetapan - System settings
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let tetapan = await db.tetapanSistem.findFirst()
    if (!tetapan) {
      tetapan = await db.tetapanSistem.create({
        data: { namaInstitusi: 'ADTEC JTM Kampus Sandakan' },
      })
    }
    return NextResponse.json({ berjaya: true, data: tetapan })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await db.tetapanSistem.findFirst()
    if (!existing) {
      return NextResponse.json({ berjaya: false, mesej: 'Tetapan belum wujud.' }, { status: 404 })
    }
    const tetapan = await db.tetapanSistem.update({
      where: { id: existing.id },
      data: {
        namaInstitusi: body.namaInstitusi,
        alamatInstitusi: body.alamatInstitusi,
        emelHubungan: body.emelHubungan,
        telefonHubungan: body.telefonHubungan,
        namaPengarah: body.namaPengarah,
        teksPengaki: body.teksPengaki,
        pengesahanKedua: body.pengesahanKedua,
        captchaAktif: body.captchaAktif,
        modPenyelenggaraan: body.modPenyelenggaraan,
      },
    })
    return NextResponse.json({ berjaya: true, data: tetapan })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat.' }, { status: 500 })
  }
}

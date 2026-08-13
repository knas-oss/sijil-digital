// POST /api/auth/login
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { emel, kataLaluan } = await request.json()

    if (!emel || !kataLaluan) {
      return NextResponse.json({ berjaya: false, mesej: 'E-mel dan kata laluan diperlukan.' }, { status: 400 })
    }

    const pengguna = await db.pengguna.findUnique({ where: { emel } })

    if (!pengguna || pengguna.status !== 'aktif') {
      return NextResponse.json({ berjaya: false, mesej: 'E-mel atau kata laluan tidak sah.' }, { status: 401 })
    }

    // Check locked
    if (pengguna.percubaanGagal >= 5) {
      return NextResponse.json({ berjaya: false, mesej: 'Akaun dikunci. Sila hubungi pentadbir sistem.' }, { status: 403 })
    }

    const match = await bcrypt.compare(kataLaluan, pengguna.kataLaluanHash)

    if (!match) {
      await db.pengguna.update({
        where: { id: pengguna.id },
        data: { percubaanGagal: { increment: 1 } },
      })
      return NextResponse.json({ berjaya: false, mesej: 'E-mel atau kata laluan tidak sah.' }, { status: 401 })
    }

    // Success - reset failed attempts, update last login
    await db.pengguna.update({
      where: { id: pengguna.id },
      data: { percubaanGagal: 0, logMasukTerakhir: new Date() },
    })

    // Audit log
    await db.logAudit.create({
      data: {
        tindakan: 'log_masuk',
        entiti: 'pengguna',
        idEntiti: pengguna.id,
        alamatIp: request.headers.get('x-forwarded-for') || 'unknown',
        penggunaId: pengguna.id,
      },
    })

    return NextResponse.json({
      berjaya: true,
      pengguna: {
        id: pengguna.id,
        namaPenuh: pengguna.namaPenuh,
        emel: pengguna.emel,
        peranan: pengguna.peranan,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ berjaya: false, mesej: 'Ralat sistem.' }, { status: 500 })
  }
}

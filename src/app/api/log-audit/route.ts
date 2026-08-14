// GET /api/log-audit
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const log = await db.logAudit.findMany({
      orderBy: { diciptaPada: 'desc' },
      take: 100,
      include: { pengguna: { select: { namaPenuh: true, emel: true } } },
    })
    return NextResponse.json({ berjaya: true, data: log })
  } catch (error) {
    return NextResponse.json({ berjaya: false, mesej: 'Ralat.' }, { status: 500 })
  }
}

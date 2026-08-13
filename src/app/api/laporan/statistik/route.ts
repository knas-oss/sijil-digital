// GET /api/laporan/statistik - Dashboard statistics
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      jumlahKursusAktif,
      jumlahPeserta,
      jumlahSijilDijana,
      sijilBulanIni,
    ] = await Promise.all([
      db.kursus.count({ where: { status: 'aktif' } }),
      db.peserta.count(),
      db.sijil.count({ where: { status: 'sah' } }),
      db.sijil.count({
        where: {
          status: 'sah',
          dijanaPada: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ])

    // Category breakdown
    const kategoriBreakdown = await db.sijil.findMany({
      where: { status: 'sah' },
      include: { kursus: { include: { kategori: true } } },
    })

    const categoryMap = new Map<string, { nama: string; warna: string; bil: number }>()
    for (const s of kategoriBreakdown) {
      const kat = s.kursus.kategori
      const existing = categoryMap.get(kat.kodKategori)
      if (existing) { existing.bil++ }
      else { categoryMap.set(kat.kodKategori, { nama: kat.namaKategori, warna: kat.warnaLabel, bil: 1 }) }
    }

    // Monthly stats
    const monthlyStats = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const count = await db.sijil.count({
        where: { status: 'sah', dijanaPada: { gte: monthStart, lte: monthEnd } },
      })
      monthlyStats.push({
        bulan: monthStart.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        bil: count,
      })
    }

    // Recent courses
    const kursusRecent = await db.kursus.findMany({
      where: { status: { in: ['aktif', 'tamat'] } },
      include: { kategori: true, _count: { select: { peserta: true, sijil: true } } },
      orderBy: { diciptaPada: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      berjaya: true,
      data: {
        jumlahKursusAktif, jumlahPeserta, jumlahSijilDijana, sijilBulanIni,
        categoryBreakdown: Array.from(categoryMap.values()),
        monthlyStats, kursusRecent,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ berjaya: false, mesej: 'Ralat.' }, { status: 500 })
  }
}

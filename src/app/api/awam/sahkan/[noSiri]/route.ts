// GET /api/awam/sahkan/[noSiri] - Verify certificate
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noSiri: string }> }
) {
  try {
    const { noSiri } = await params

    const sijil = await db.sijil.findUnique({
      where: { noSiri },
      include: {
        peserta: true,
        kursus: {
          include: { kategori: true },
        },
      },
    })

    if (!sijil) {
      return NextResponse.json({
        sah: false,
        mesej: 'Sijil Tidak Ditemui / Tidak Sah',
      })
    }

    // Mask name
    const nama = sijil.peserta.namaPenuh
    const parts = nama.split(' ')
    const namaDipaparkan = parts.length > 1
      ? `${parts[0]} ${parts[1][0]}${'•'.repeat(Math.min(parts[1].length - 1, 5))} ${parts.slice(2).join(' ')}`
      : nama

    // Format date
    const formatDate = (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date
      const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis']
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    }

    return NextResponse.json({
      sah: sijil.status === 'sah',
      status: sijil.status,
      noSiri: sijil.noSiri,
      namaPenerima: namaDipaparkan,
      namaKursus: sijil.kursus.namaKursusBm,
      kategori: sijil.kursus.kategori.namaKategori,
      tarikhProgram: `${formatDate(sijil.kursus.tarikhMula)} – ${formatDate(sijil.kursus.tarikhTamat)}`,
      tarikhKeluaran: formatDate(sijil.dijanaPada),
      sebabBatal: sijil.sebabBatal,
    })
  } catch (error) {
    console.error('Sahkan error:', error)
    return NextResponse.json({ sah: false, mesej: 'Ralat pengesahan.' }, { status: 500 })
  }
}

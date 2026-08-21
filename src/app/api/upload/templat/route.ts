// POST /api/upload/templat - Upload template background image
// Returns base64 data URL for use in canvas preview and PDF generation
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('fail') as File | null

    if (!file) {
      return NextResponse.json({ berjaya: false, mesej: 'Fail imej diperlukan.' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ berjaya: false, mesej: 'Hanya fail imej sahaja (.png, .jpg, .jpeg).' }, { status: 400 })
    }

    // Validate file size (max 10MB for template backgrounds)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ berjaya: false, mesej: 'Saiz fail maksimum 10MB.' }, { status: 400 })
    }

    // Convert to base64 data URL
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      berjaya: true,
      laluan: dataUrl,
      namaFail: file.name,
      jenisFail: file.type,
      mesej: 'Gambar templat berjaya dimuat naik.',
    })
  } catch (error) {
    console.error('Upload templat error:', error)
    return NextResponse.json({ berjaya: false, mesej: 'Ralat memuat naik fail.' }, { status: 500 })
  }
}

export async function DELETE() {
  return NextResponse.json({ berjaya: true, mesej: 'Gambar templat dipadam.' })
}
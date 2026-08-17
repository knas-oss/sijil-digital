// POST /api/upload/tandatangan - Upload signature image
// Returns base64 data URL (works on both local and Vercel)
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ berjaya: false, mesej: 'Fail diperlukan.' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ berjaya: false, mesej: 'Hanya fail imej sahaja (.png, .jpg).' }, { status: 400 })
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ berjaya: false, mesej: 'Saiz fail maksimum 2MB.' }, { status: 400 })
    }

    // Convert to base64 data URL
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      berjaya: true,
      laluan: dataUrl,
      mesej: 'Tandatangan berjaya dimuat naik.',
    })
  } catch (error) {
    console.error('Upload tandatangan error:', error)
    return NextResponse.json({ berjaya: false, mesej: 'Ralat memuat naik fail.' }, { status: 500 })
  }
}

// DELETE /api/upload/tandatangan - Remove signature (no-op for base64 storage)
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ berjaya: true, mesej: 'Tandatangan dipadam.' })
}

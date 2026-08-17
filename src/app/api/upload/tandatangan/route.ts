// POST /api/upload/tandatangan - Upload digital signature PNG
// DELETE /api/upload/tandatangan?laluan=... - Delete signature file
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SIGNATURES_DIR = path.join(process.cwd(), 'public', 'signatures')
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function ensureSignaturesDir() {
  if (!fs.existsSync(SIGNATURES_DIR)) {
    fs.mkdirSync(SIGNATURES_DIR, { recursive: true })
  }
}

function isPngFile(buffer: Buffer): boolean {
  if (buffer.length < 8) return false
  const header = buffer.subarray(0, 8)
  return header.equals(PNG_HEADER)
}

function cleanOldSignatures(jenis: string) {
  try {
    if (!fs.existsSync(SIGNATURES_DIR)) return
    const files = fs.readdirSync(SIGNATURES_DIR)
    for (const file of files) {
      if (file.startsWith(`${jenis}-`) && file.endsWith('.png')) {
        fs.unlinkSync(path.join(SIGNATURES_DIR, file))
      }
    }
  } catch {
    // Ignore cleanup errors
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('fail') as File | null
    const jenis = formData.get('jenis') as string | null

    if (!file) {
      return NextResponse.json({ berjaya: false, mesej: 'Fail tidak ditemui.' }, { status: 400 })
    }

    if (!jenis || (jenis !== 'pengarah' && jenis !== 'penyelaras')) {
      return NextResponse.json({ berjaya: false, mesej: 'Jenis tandatangan tidak sah. Gunakan "pengarah" atau "penyelaras".' }, { status: 400 })
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ berjaya: false, mesej: 'Saiz fail melebihi had 2MB.' }, { status: 400 })
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate PNG header
    if (!isPngFile(buffer)) {
      return NextResponse.json({ berjaya: false, mesej: 'Fail bukan format PNG yang sah.' }, { status: 400 })
    }

    // Ensure directory exists
    ensureSignaturesDir()

    // Clean old signatures of same type
    cleanOldSignatures(jenis)

    // Generate unique filename
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const filename = `${jenis}-${timestamp}-${randomSuffix}.png`
    const filePath = path.join(SIGNATURES_DIR, filename)

    // Write file
    fs.writeFileSync(filePath, buffer)

    // Return public path (relative to /public)
    const publicPath = `/signatures/${filename}`

    return NextResponse.json({
      berjaya: true,
      data: { laluan: publicPath },
      mesej: 'Tandatangan berjaya dimuat naik.',
    })
  } catch (error) {
    console.error('Upload tandatangan error:', error)
    return NextResponse.json({ berjaya: false, mesej: 'Ralat memuat naik tandatangan.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const laluan = searchParams.get('laluan')

    if (!laluan) {
      return NextResponse.json({ berjaya: false, mesej: 'Laluan fail diperlukan.' }, { status: 400 })
    }

    // Security: only allow deleting files in /signatures/ directory
    if (!laluan.startsWith('/signatures/') || laluan.includes('..')) {
      return NextResponse.json({ berjaya: false, mesej: 'Laluan fail tidak sah.' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'public', laluan)

    // Check file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ berjaya: true, mesej: 'Fail tidak wujud (mungkin telah dipadam).' })
    }

    // Delete file
    fs.unlinkSync(filePath)

    return NextResponse.json({ berjaya: true, mesej: 'Tandatangan berjaya dipadam.' })
  } catch (error) {
    console.error('Padam tandatangan error:', error)
    return NextResponse.json({ berjaya: false, mesej: 'Ralat memadam tandatangan.' }, { status: 500 })
  }
}

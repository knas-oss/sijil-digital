// MyKad validation and formatting utilities

/**
 * Normalize MyKad: remove dashes and non-digit chars
 */
export function normalizeMyKad(input: string): string {
  return input.replace(/[^0-9]/g, '')
}

/**
 * Format MyKad with dashes: XXXXXX-XX-XXXX
 */
export function formatMyKad(input: string): string {
  const digits = normalizeMyKad(input)
  if (digits.length <= 6) return digits
  if (digits.length <= 8) return `${digits.slice(0, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`
}

/**
 * Validate MyKad format: 12 digits, first 6 form valid date (YYMMDD)
 */
export function validateMyKad(input: string): { valid: boolean; error?: string } {
  const digits = normalizeMyKad(input)
  
  if (digits.length !== 12) {
    return { valid: false, error: 'Nombor MyKad mesti mengandungi 12 digit.' }
  }
  
  if (!/^\d{12}$/.test(digits)) {
    return { valid: false, error: 'Sila masukkan angka sahaja.' }
  }
  
  // Validate date portion (first 6 digits: YYMMDD)
  const yy = parseInt(digits.slice(0, 2))
  const mm = parseInt(digits.slice(2, 4))
  const dd = parseInt(digits.slice(4, 6))
  
  if (mm < 1 || mm > 12) {
    return { valid: false, error: 'Bulan dalam MyKad tidak sah.' }
  }
  
  if (dd < 1 || dd > 31) {
    return { valid: false, error: 'Hari dalam MyKad tidak sah.' }
  }
  
  // Determine century
  const currentYear = new Date().getFullYear() % 100
  const century = yy <= currentYear ? 2000 : 1900
  const year = century + yy
  
  // Validate day against month
  const daysInMonth = new Date(year, mm, 0).getDate()
  if (dd > daysInMonth) {
    return { valid: false, error: 'Tarikh dalam MyKad tidak sah.' }
  }
  
  return { valid: true }
}

/**
 * Generate SHA-256 hash of MyKad for database lookup
 */
export async function hashMyKad(mykad: string): Promise<string> {
  const normalized = normalizeMyKad(mykad)
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Mask MyKad for display: 901231-12-****
 */
export function maskMyKad(mykad: string): string {
  const formatted = formatMyKad(mykad)
  const parts = formatted.split('-')
  if (parts.length === 3) {
    return `${parts[0]}-${parts[1]}-****`
  }
  return formatted
}

/**
 * Extract birth date from MyKad
 */
export function extractBirthDate(mykad: string): Date | null {
  const digits = normalizeMyKad(mykad)
  if (digits.length < 6) return null
  
  const yy = parseInt(digits.slice(0, 2))
  const mm = parseInt(digits.slice(2, 4))
  const dd = parseInt(digits.slice(4, 6))
  
  const currentYear = new Date().getFullYear() % 100
  const century = yy <= currentYear ? 2000 : 1900
  
  return new Date(century + yy, mm - 1, dd)
}

/**
 * Format date to Bahasa Melayu
 */
export function formatDateBM(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const months = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Format date range to BM
 */
export function formatDateRangeBM(start: Date | string, end: Date | string): string {
  const s = typeof start === 'string' ? new Date(start) : start
  const e = typeof end === 'string' ? new Date(end) : end
  
  const months = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ]
  
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} – ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`
  }
  
  return `${formatDateBM(s)} – ${formatDateBM(e)}`
}

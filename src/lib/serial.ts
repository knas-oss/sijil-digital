// Serial number generation for certificates
// Format: ADTEC/SDK/[YEAR]/[CATEGORY-CODE]/[5-DIGIT-SEQUENCE]

export function generateSerialNumber(
  year: number,
  categoryCode: string,
  sequence: number
): string {
  const seq = sequence.toString().padStart(5, '0')
  return `ADTEC/SDK/${year}/${categoryCode}/${seq}`
}

// Generate course code
// Format: ADTEC-SDK/[CATEGORY]/[YEAR]/[NUMBER]
export function generateCourseCode(
  categoryCode: string,
  year: number,
  number: number
): string {
  const num = number.toString().padStart(3, '0')
  return `ADTEC-SDK/${categoryCode}/${year}/${num}`
}

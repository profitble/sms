import { parsePhoneNumber, CountryCode } from 'libphonenumber-js'

export function toE164(raw: string, defaultCountry?: string): { e164: string; iso2?: string } | null {
  try {
    // Remove any non-digit characters except + at the start
    const cleaned = raw.replace(/[^\d+]/g, '')
    
    if (!cleaned) return null

    // Try parsing with default country first
    let phoneNumber
    if (defaultCountry) {
      try {
        phoneNumber = parsePhoneNumber(cleaned, defaultCountry as CountryCode)
      } catch {
        // Fall through to parse without country
      }
    }

    // If that fails, try parsing without country (for international numbers)
    if (!phoneNumber) {
      try {
        phoneNumber = parsePhoneNumber(cleaned)
      } catch {
        return null
      }
    }

    if (!phoneNumber.isValid()) {
      return null
    }

    return {
      e164: phoneNumber.format('E.164'),
      iso2: phoneNumber.country
    }
  } catch {
    return null
  }
}
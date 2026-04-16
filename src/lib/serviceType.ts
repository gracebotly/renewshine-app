export type CanonicalServiceType = 'standard' | 'deep' | 'move_out'
export type LegacyServiceType = CanonicalServiceType | 'detailed'

export function normalizeServiceType(serviceType: string | null | undefined): CanonicalServiceType | null {
  if (!serviceType) return null
  if (serviceType === 'detailed') return 'deep'
  if (serviceType === 'standard' || serviceType === 'deep' || serviceType === 'move_out') {
    return serviceType
  }
  return null
}

export function serviceTypeLabel(serviceType: string | null | undefined): string {
  const normalized = normalizeServiceType(serviceType)
  if (normalized === 'standard') return 'Standard Clean'
  if (normalized === 'deep') return 'Detailed Clean'
  if (normalized === 'move_out') return 'Move-In / Move-Out'
  return 'Cleaning Service'
}

export function isDeepServiceType(serviceType: string | null | undefined): boolean {
  const normalized = normalizeServiceType(serviceType)
  return normalized === 'deep'
}

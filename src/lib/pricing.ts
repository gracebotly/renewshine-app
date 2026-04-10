export type ServiceType = 'standard' | 'deep' | 'move_out'
export type TimePreference = 'morning' | 'afternoon' | 'flexible'

export const ADD_ONS = [
  { id: 'fridge', label: 'Inside Refrigerator', price: 65 },
  { id: 'oven', label: 'Inside Oven', price: 65 },
  { id: 'dishes', label: 'Dishes (washed or put away)', price: 25 },
  { id: 'linen', label: 'Change Linens (per bed)', price: 15 },
  { id: 'laundry', label: 'Single Load of Laundry (wash & fold)', price: 25 },
  { id: 'windows', label: 'Interior Windows', price: 20 },
  { id: 'organization', label: 'Tidy-Up / Home Organization', price: 65 },
  { id: 'walls', label: 'Spot Clean Walls', price: 35 },
  { id: 'basement', label: 'Basement Cleaning', price: 75 },
]

export function estimatePrice(
  bedrooms: number,
  bathrooms: number,
  serviceType: Exclude<ServiceType, 'move_out'>,
  selectedAddOns: string[]
): { low: number; high: number } {
  let base: number

  if (serviceType === 'standard') {
    base = bedrooms * 60 + bathrooms * 40
  } else {
    base = bedrooms * 90 + bathrooms * 55
  }

  const floor = serviceType === 'standard' ? 200 : 350

  const addOnsTotal = ADD_ONS.filter((a) => selectedAddOns.includes(a.id)).reduce((sum, a) => sum + a.price, 0)

  const total = Math.max(base + addOnsTotal, floor)

  return {
    low: total,
    high: Math.round(total * 1.15),
  }
}

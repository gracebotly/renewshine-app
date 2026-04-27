export type ServiceType = 'standard' | 'deep' | 'move_out'
export type TimePreference =
  | 'early_morning'
  | 'mid_morning'
  | 'noon'
  | 'early_afternoon'
  | 'late_afternoon'
  | 'flexible'

export const ADD_ONS = [
  { id: 'fridge',        label: 'Inside Refrigerator',                    price: 40  },
  { id: 'oven',          label: 'Inside Oven',                            price: 55  },
  { id: 'dishes',        label: 'Dishes (washed or put away)',             price: 25  },
  { id: 'linen',         label: 'Change Linens (per bed)',                 price: 15  },
  { id: 'laundry',       label: 'Single Load of Laundry (wash & fold)',    price: 43  },
  { id: 'windows',       label: 'Interior Windows',                        price: 20  },
  { id: 'organization',  label: 'Tidy-Up / Home Organization',             price: 65  },
  { id: 'walls',         label: 'Spot Clean Walls',                        price: 35  },
  { id: 'basement',      label: 'Basement Cleaning',                       price: 75  },
]

// Add-ons available only on Standard and Deep.
// Fridge and Oven are excluded when service is move_out (included at no charge).
export const ADD_ONS_FOR_SERVICE = (serviceType: ServiceType) => {
  if (serviceType === 'move_out' || serviceType === 'deep') {
    return ADD_ONS.filter((a) => a.id !== 'fridge' && a.id !== 'oven')
  }
  return ADD_ONS
}

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
    // deep
    base = bedrooms * 90 + bathrooms * 55
  }

  const floor = serviceType === 'standard' ? 200 : 350

  const addOnsTotal = ADD_ONS
    .filter((a) => selectedAddOns.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0)

  const total = Math.max(base + addOnsTotal, floor)

  return {
    low: total,
    high: Math.round(total * 1.15),
  }
}

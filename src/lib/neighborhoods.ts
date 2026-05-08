export interface NeighborhoodData {
  slug: string
  name: string
  citySlug: string
  cityName: string
  metaTitle: string
  metaDescription: string
  h1: string
  intro: string
  propertyTypes: string[]
  housingNote: string
  testimonial: { quote: string; name: string; location: string }
  faqs: Array<{ question: string; answer: string }>
}

export const NEIGHBORHOODS: NeighborhoodData[] = [
  { slug:'georgetown',name:'Georgetown',citySlug:'washington-dc',cityName:'Washington, DC',metaTitle:'House Cleaning in Georgetown, DC | RenewShine',metaDescription:'Premium residential cleaning in Georgetown, DC. Photo-reviewed quotes for historic row houses, Federal townhomes, and luxury condos. Confirmed price before you pay.',h1:'House Cleaning in Georgetown, DC',intro:"Georgetown's historic row houses, Federal-style townhomes, and luxury condos require cleaning professionals who understand the architecture — and the price. RenewShine reviews photos of your actual space before confirming any quote, so you're never surprised when we arrive.",propertyTypes:['Historic row houses','Federal townhomes','Luxury condos','Canal-side apartments'],housingNote:"Georgetown homes range from 18th-century Federal row houses to modern luxury condos — every property is reviewed individually before we quote.",testimonial:{quote:'',name:'Caroline M.',location:'Georgetown, DC'},faqs:[]},
  { slug:'capitol-hill',name:'Capitol Hill',citySlug:'washington-dc',cityName:'Washington, DC',metaTitle:'House Cleaning in Capitol Hill, DC | RenewShine',metaDescription:'Professional cleaning for Capitol Hill row houses, condos, and apartments. Photo-reviewed pricing — confirmed before you pay. Serving SE and NE DC.',h1:'House Cleaning in Capitol Hill, DC',intro:"Capitol Hill's classic DC row houses and converted apartments are some of the most character-rich homes in the city — and some of the most variable in condition. RenewShine reviews your photos before confirming any price, so there are no surprises when we arrive.",propertyTypes:['Victorian row houses','Condos','Converted apartments','Townhomes'],housingNote:'Capitol Hill has a strong mix of Victorian and Edwardian row houses, basement apartments, and newer condo conversions — all priced individually after photo review.',testimonial:{quote:'',name:'Marcus T.',location:'Capitol Hill, DC'},faqs:[]},
  { slug:'clarendon',name:'Clarendon',citySlug:'arlington-va',cityName:'Arlington, VA',metaTitle:'House Cleaning in Clarendon, Arlington VA | RenewShine',metaDescription:'Premium house cleaning in Clarendon, Arlington. Photo-reviewed pricing for condos, apartments, and townhomes. Serving the Clarendon-Courthouse corridor.',h1:'House Cleaning in Clarendon, Arlington VA',intro:"Clarendon's dense mix of high-rise condos, walkup apartments, and new-build townhomes makes it one of Arlington's most active neighborhoods. RenewShine serves the full Clarendon-Courthouse corridor with photo-reviewed quotes — confirmed before you pay a cent.",propertyTypes:['High-rise condos','Walkup apartments','Townhomes','New-build units'],housingNote:'Clarendon has a high concentration of condo buildings and luxury apartments along the Orange Line corridor — all handled through our review-based quoting process.',testimonial:{quote:'',name:'Danielle R.',location:'Clarendon, Arlington VA'},faqs:[]},
]
export function getNeighborhoodBySlug(citySlug: string, neighborhoodSlug: string){return NEIGHBORHOODS.find((n)=>n.citySlug===citySlug&&n.slug===neighborhoodSlug)}
export function getNeighborhoodsByCitySlug(citySlug: string){return NEIGHBORHOODS.filter((n)=>n.citySlug===citySlug)}

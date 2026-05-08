import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NEIGHBORHOODS, getNeighborhoodBySlug } from '@/lib/neighborhoods'
export async function generateStaticParams(){return NEIGHBORHOODS.map((n)=>({city:n.citySlug,neighborhood:n.slug}))}
export async function generateMetadata({params}:{params:Promise<{city:string;neighborhood:string}>}):Promise<Metadata>{const {city,neighborhood}=await params; const n=getNeighborhoodBySlug(city,neighborhood); if(!n) return {}; return {title:n.metaTitle,description:n.metaDescription,alternates:{canonical:`/locations/${n.citySlug}/${n.slug}`},openGraph:{title:n.metaTitle,description:n.metaDescription,url:`/locations/${n.citySlug}/${n.slug}`},twitter:{card:'summary_large_image',title:n.metaTitle,description:n.metaDescription}}}
export default async function Page({params}:{params:Promise<{city:string;neighborhood:string}>}){const {city,neighborhood}=await params; if(!getNeighborhoodBySlug(city,neighborhood)) notFound(); return <div />}

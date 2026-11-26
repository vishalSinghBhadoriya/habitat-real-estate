import {publicAsset} from '@/lib/paths'

const assets: Record<string,[string,string]> = {
 'apartment-a':['demo/apartment-a.webp','Illustrative low-rise apartment façade'],
 'apartment-b':['demo/apartment-b.webp','Illustrative apartment tower with balconies'],
 'house-a':['demo/house-a.webp','Illustrative detached townhouse'],
 'house-b':['demo/house-b.webp','Illustrative courtyard house'],
 'villa-a':['demo/villa-a.webp','Illustrative villa and pool terrace'],
 'villa-b':['demo/villa-b.webp','Illustrative villa entrance and garden'],
 'plot-a':['demo/plot-a.webp','Illustrative vacant residential plot with road frontage'],
 'plot-b':['demo/plot-b.webp','Illustrative vacant plot along a lane'],
 'plot-plan':['properties/plot.svg','Illustrative plot diagram'],
 'office':['demo/office.webp','Illustrative office building'],
 'office-existing':['properties/office.webp','Illustrative commercial façade'],
 'shop':['demo/shop.webp','Illustrative high-street shopfront'],
 'coliving':['demo/coliving.webp','Illustrative furnished shared bedroom'],
 'pg':['demo/pg.webp','Illustrative furnished room with study desk'],
 'farmhouse-a':['demo/farmhouse-a.webp','Illustrative farmhouse and kitchen garden'],
 'farmhouse-b':['demo/farmhouse-b.webp','Illustrative farmhouse veranda and trees'],
 'living-existing':['interiors/living.webp','Illustrative interior reference']
}

export type DemoRoom = {name:string; width:number; depth:number}
export type DemoDetails = {
 state:string; segment:string; bathrooms?:number; balconies?:number;
 carpet_sqft?:number; built_up_sqft?:number; super_built_up_sqft?:number;
 plot_width_ft?:number; plot_depth_ft?:number; plot_area_sqft?:number;
 road_width_ft?:number; floor?:number; total_floors?:number; parking_spaces?:number;
 age_years?:number; possession:string; orientation:string; deposit_inr?:number;
 amenities:string[]; rooms?:DemoRoom[]; gallery:string[]
}

export function demoGallery(details: DemoDetails) {
 return details.gallery.flatMap(key => {
  const asset=Object.hasOwn(assets,key)?assets[key]:undefined
  return asset ? [{url:publicAsset('images/'+asset[0]),alt:asset[1]}] : []
 })
}

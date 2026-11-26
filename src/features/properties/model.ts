import type {DemoDetails} from './demoDetails'
export const types=['Apartment','Independent house','Duplex','Villa','Residential plot','Commercial plot','Office','Shop','Warehouse','PG','Hostel','Farmhouse'] as const
export const modes=['Buy','Rent','Plots','Commercial','PG'] as const
export type Mode=typeof modes[number]
export type PropertyFloorPlan={floor_plan?:string|null}
export type SeededProperty={demo_batch?:string|null;demo_details?:DemoDetails|null;imageAlts?:string[]}
export type Property={id:string;slug:string;title:string;city:string;locality:string;category:typeof types[number];mode:Mode;price:number;area:number;bhk:number;furnishing:string;facing:string;description:string;images:string[];lat?:number;lng?:number;whatsapp?:string|null;demo?:boolean;status?:string;owner_id?:string;created_at?:string} & SeededProperty
export const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)
export function shortPrice(value:number){return value>=1e7 ? '₹'+(value/1e7).toLocaleString('en-IN',{maximumFractionDigits:2})+' Cr' :value>=1e5?'₹'+(value/1e5).toLocaleString('en-IN',{maximumFractionDigits:2})+' L':money(value)}
export const units={ 'sq ft':1,'sq m':10.7639104167,'sq yd':9,'acre':43560,'hectare':107639.104167,'gaj':9 }
export function convertArea(value:number,from:keyof typeof units,to:keyof typeof units){return value*units[from]/units[to]}
export function regionalArea(value:number,squareFeetPerUnit:number){return squareFeetPerUnit>0?value*squareFeetPerUnit:0}
export function filterProperties(properties:Property[],params:URLSearchParams,mode?:Mode){
  const terms=(params.get('q')??'').toLowerCase().split(',').map(part=>part.trim()).filter(Boolean)
  const result=properties.filter(p=>(!mode||p.mode===mode)&&terms.every(term=>[p.city,p.locality,p.title].some(value=>value.toLowerCase().includes(term)))&&
  (!params.get('type')||p.category===params.get('type'))&&(!params.get('budget')||p.price<=Number(params.get('budget')))&&
  (!params.get('min')||p.price>=Number(params.get('min')))&&(!params.get('bhk')||p.bhk===Number(params.get('bhk')))&&
  (!params.get('area')||p.area>=Number(params.get('area')))&&(!params.get('furnishing')||p.furnishing===params.get('furnishing'))&&(!params.get('facing')||p.facing===params.get('facing')))
  if(params.get('sort')==='price') result.sort((a,b)=>a.price-b.price)
  if(params.get('sort')==='price-desc') result.sort((a,b)=>b.price-a.price)
  if(params.get('sort')==='area') result.sort((a,b)=>b.area-a.area)
  return result
}

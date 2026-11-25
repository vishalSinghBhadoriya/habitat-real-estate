import {useQuery} from '@tanstack/react-query'
import {demo} from '@/data/demo'
import {supabase} from '@/lib/supabase'
import {filterProperties,type Property,type Mode,type PropertyFloorPlan} from './model'
export async function resolveImages(property:Property):Promise<Property>{
 if(!supabase||!property.images.length)return property
 const {data,error}=await supabase.storage.from('property-images').createSignedUrls(property.images,3600)
 if(error)throw error
 return {...property,images:(data??[]).flatMap(item=>item.signedUrl?[item.signedUrl]:[])}
}
export function useProperties(params=new URLSearchParams(),mode?:Mode,page=0,size=60){
 return useQuery({queryKey:['properties',params.toString(),mode,page,size],queryFn:async()=>{
  if(!supabase){const filtered=filterProperties(demo,params,mode);return {items:filtered.slice(page*size,(page+1)*size),total:filtered.length}}
  let q=supabase.from('properties').select('*',{count:'exact'}).eq('status','published')
  if(mode)q=q.eq('mode',mode)
  const terms=(params.get('q')??'').split(',').map(part=>part.replace(/[^\p{L}\p{N}\p{M} ·-]/gu,'').trim()).filter(Boolean).slice(0,5)
  for(const term of terms)q=q.or('title.ilike.%'+term+'%,city.ilike.%'+term+'%,locality.ilike.%'+term+'%')
  for(const [key,column] of [['type','category'],['bhk','bhk'],['facing','facing'],['furnishing','furnishing']]){const value=params.get(key);if(value)q=q.eq(column,value)}
  for(const [key,column] of [['min','price'],['area','area']]){const value=params.get(key);if(value&&Number.isFinite(Number(value)))q=q.gte(column,Number(value))}
  const budget=params.get('budget');if(budget&&Number.isFinite(Number(budget)))q=q.lte('price',Number(budget))
  const sort=params.get('sort')
  q=q.order(sort==='area'?'area':sort?.startsWith('price')?'price':'created_at',{ascending:sort==='price'}).order('id')
  const {data,error,count}=await q.range(page*size,(page+1)*size-1)
  if(error)throw error
  return {items:await Promise.all((data as Property[]).map(resolveImages)),total:count??0}
 }})
}
export function useProperty(slug:string){
 return useQuery({queryKey:['property',slug],queryFn:async():Promise<(Property & {floorPlanUrl?:string|null})|null>=>{
  if(!supabase)return demo.find(item=>item.slug===slug)??null
  const {data,error}=await supabase.from('properties').select('*').eq('slug',slug).eq('status','published').maybeSingle()
  if(error)throw error
  if(!data)return null
  const row=data as Property & PropertyFloorPlan
  const [property,plan]=await Promise.all([
   resolveImages(row),
   row.floor_plan?supabase.storage.from('property-images').createSignedUrl(row.floor_plan,3600):null
  ])
  return {...property,floorPlanUrl:plan?.data?.signedUrl??null}
 }})
}

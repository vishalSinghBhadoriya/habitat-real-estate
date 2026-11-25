import {useState} from 'react'
import {Link,useParams,useNavigate} from 'react-router-dom'
import {useForm,type FieldPath} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {useQuery,useQueryClient} from '@tanstack/react-query'
import {supabase} from '@/lib/supabase'
import {useSession} from '@/features/auth/session'
import {types,modes,money,type Property,type PropertyFloorPlan} from '@/features/properties/model'
import {listingSchema,validPhoto,type Listing} from './schema'
const sections=[['title','city','locality','category','mode','description'],['area','bhk','furnishing','facing'],[],['price'],[]] satisfies FieldPath<Listing>[][]
const names=['Property information','Dimensions','Photographs','Pricing','Review']
const blank:Listing={title:'',city:'',locality:'',category:'Apartment',mode:'Buy',description:'',area:0,bhk:0,furnishing:'Unfurnished',facing:'Unspecified',price:0}
export default function Wizard(){
 const {id}=useParams()
 const {session}=useSession()
 const existing=useQuery({queryKey:['own-property',id,session?.user.id],enabled:!!(supabase&&id&&session),queryFn:async()=>{
  const {data,error}=await supabase!.from('properties').select('*').eq('id',id!).eq('owner_id',session!.user.id).single()
  if(error)throw error
  return data as Property & PropertyFloorPlan
 }})
 if(id&&existing.isPending)return <p className="route-wait">Loading your listing…</p>
 if(id&&existing.isError)return <p className="route-wait" role="alert">Listing unavailable or access denied.</p>
 return <ListingForm key={id??'new'} property={existing.data}/>
}
function ListingForm({property}:{property?:Property & PropertyFloorPlan}){
 const [step,setStep]=useState(0)
 const [photos,setPhotos]=useState<File[]>([])
 const [planFile,setPlanFile]=useState<File|null>(null)
 const [retainedPlan,setRetainedPlan]=useState(property?.floor_plan??null)
 const [retained,setRetained]=useState(property?.images??[])
 const [status,setStatus]=useState('')
 const [preview,setPreview]=useState<Listing|null>(null)
 const [whatsapp,setWhatsapp]=useState(property?.whatsapp?'+'+property.whatsapp:'')
 const {session}=useSession()
 const query=useQueryClient()
 const navigate=useNavigate()
 const form=useForm<Listing>({resolver:zodResolver(listingSchema),defaultValues:property?{...blank,...property} as Listing:blank})
 const submitting=form.formState.isSubmitting
 const draft=useState(()=>crypto.randomUUID())[0]
 function input(field:FieldPath<Listing>,label:string,kind='text'){return <label>{label}<input type={kind} min={kind==='number'?0:undefined} step={field==='area'?'any':undefined} {...form.register(field)}/>{form.formState.errors[field]&&<span className="error">{form.formState.errors[field]?.message}</span>}</label>}
 function select(field:FieldPath<Listing>,label:string,options:readonly string[]){return <label>{label}<select {...form.register(field)}>{options.map(item=><option key={item}>{item}</option>)}</select>{form.formState.errors[field]&&<span className="error">{form.formState.errors[field]?.message}</span>}</label>}
 async function advance(){
  if(!(await form.trigger(sections[step])))return
  setStatus('')
  if(step===3){const parsed=listingSchema.safeParse(form.getValues());if(!parsed.success){setStatus('Review the property information, dimensions and price before continuing.');return}setPreview(parsed.data)}
  setStep(step+1)
 }
 function save(publish:boolean){return form.handleSubmit(async values=>{
  if(!supabase||!session)return
  const client=supabase
  const owner=session.user.id
  const id=property?.id??draft
  let authorizedNumber=whatsapp.replace(/[\s()-]/g,'').replace(/^\+/,'')
  if(authorizedNumber.length===10)authorizedNumber='91'+authorizedNumber
  if(authorizedNumber&&!/^91[6-9][0-9]{9}$/.test(authorizedNumber)){setStatus('Enter a valid Indian mobile number or leave WhatsApp blank.');return}
  const uploaded:string[]=[]
  let uploadedPlan:string|null=null
  setStatus('')
  try{
   for(let i=0;i<photos.length;i++){
    setStatus('Uploading photograph '+(i+1)+' of '+photos.length+'…')
    const photo=photos[i]
    const path=owner+'/'+id+'/'+crypto.randomUUID()+'.'+photo.type.split('/')[1]
    const {error}=await client.storage.from('property-images').upload(path,photo)
    if(error)throw error
    uploaded.push(path)
   }
   const images=[...retained,...uploaded]
   if(planFile){
    setStatus('Uploading floor plan…')
    const path=owner+'/'+id+'/floor-'+crypto.randomUUID()+'.'+planFile.type.split('/')[1]
    const {error}=await client.storage.from('property-images').upload(path,planFile)
    if(error)throw error
    uploadedPlan=path
   }
   const floor_plan=uploadedPlan??retainedPlan
   const dbStatus=publish?'published':'draft'
   // Submit only schema-validated public listing fields.
   const row={...values,images,floor_plan,status:dbStatus,whatsapp:authorizedNumber||null}
   const operation=property?client.from('properties').update(row).eq('id',id).eq('owner_id',owner):client.from('properties').insert({...row,id,owner_id:owner,slug:'listing-'+id})
   const {error}=await operation.select('id').single()
   if(error)throw error
  }catch{
   const unused=[...uploaded,...(uploadedPlan?[uploadedPlan]:[])]
   if(unused.length)await client.storage.from('property-images').remove(unused)
   setStatus('The listing could not be saved. Check My listings before retrying. Uploaded files may be retained after an interrupted save.')
   return
  }
  const retired=property?.images.filter(path=>!retained.includes(path))??[]
  if(property?.floor_plan&&(uploadedPlan||!retainedPlan))retired.push(property.floor_plan)
  if(retired.length)await client.storage.from('property-images').remove(retired)
  await query.invalidateQueries()
  void navigate('/dashboard/listings')
 })}
 return <section className="page-width section subpage"><p className="eyebrow accent">For property owners</p><h1>{property?'Edit property':'List your property'}<em>.</em></h1>{!supabase&&<p className="notice">You can preview your listing here. Publishing is unavailable in this preview.</p>}
 <p className="eyebrow">Step {step+1} of {names.length}</p><h2>{names[step]}</h2><form className="stack" noValidate onSubmit={event=>{event.preventDefault();if(step<4)void advance()}}>
 {step===0&&<>{input('title','Title')}<div className="fields">{input('city','City')}{input('locality','Locality')}{select('category','Type',types)}{select('mode','Purpose',modes)}</div><label>Description<textarea {...form.register('description')}/>{form.formState.errors.description&&<span className="error">{form.formState.errors.description.message}</span>}</label></>}
 {step===1&&<div className="fields">{input('area','Area (sq ft)','number')}{input('bhk','BHK (0 for non-residential)','number')}{select('furnishing','Furnishing',['Furnished','Semi-furnished','Unfurnished'])}{select('facing','Facing',['North','East','South','West','Unspecified'])}</div>}
 {step===2&&<><label>Add photographs (8 maximum, 8 MB each)<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={event=>{
 const files=Array.from(event.target.files??[])
 if(files.length+retained.length>8||files.some(file=>!validPhoto(file))){setPhotos([]);setStatus('Use up to eight supported photographs under 8 MB each.');event.target.value='';return}
 setPhotos(files);setStatus('')
 }}/></label>{retained.map((path,index)=><button type="button" className="text-link" key={path} onClick={()=>setRetained(old=>old.filter(value=>value!==path))}>Remove existing photo {index+1}</button>)}<p>{photos.length} new and {retained.length} existing photographs</p>
 {supabase&&<><label>Floor plan image (optional, up to 8 MB)<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={event=>{
  const file=event.target.files?.[0]
  if(!file||!validPhoto(file)){setPlanFile(null);event.target.value='';if(file)setStatus('Choose a supported floor plan image under 8 MB.');return}
  setPlanFile(file);setStatus('')
 }}/></label>{planFile&&<p>Selected floor plan: {planFile.name}</p>}{retainedPlan&&<button type="button" className="text-link" onClick={()=>setRetainedPlan(null)}>Remove existing floor plan</button>}</>}</>}
 {step===3&&input('price',['Rent','PG'].includes(form.getValues('mode'))?'Monthly price (₹)':'Asking price (₹)','number')}
 {step===4&&preview&&<><div className="card-surface"><h3>{preview.title}</h3><p>{preview.locality}, {preview.city} · {preview.category} · {preview.mode}</p><p>{preview.area} sq ft · {money(preview.price)} · {photos.length+retained.length} photographs</p><p>{preview.description}</p></div>{supabase&&<label>Public WhatsApp number (optional)<input type="tel" value={whatsapp} onChange={event=>setWhatsapp(event.target.value)} placeholder="+91"/><small>Enter a number only if you authorize its publication on this listing.</small></label>}</>}
 <div className="segmented">{step>0&&<button type="button" disabled={submitting} onClick={()=>{setStatus('');setStep(step-1)}}>Back</button>}{step<4?<button type="submit" className="button">Continue</button>:supabase&&session?<><button type="button" disabled={submitting} onClick={save(false)}>Save as draft</button><button className="button" type="button" disabled={submitting} onClick={save(true)}>{submitting?'Saving…':'Publish listing'}</button></>:<Link to="/properties">Return to discovery</Link>}</div><p role="status">{status}</p></form></section>
}

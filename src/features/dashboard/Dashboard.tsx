import {useState} from 'react'
import {Link,useLocation} from 'react-router-dom'
import {useQuery,useQueryClient} from '@tanstack/react-query'
import {supabase} from '@/lib/supabase'
import {useSession} from '@/features/auth/session'
import {money,type Property,type PropertyFloorPlan} from '@/features/properties/model'
import Profile from '@/features/profile/Profile'

type Lead={id:string;property_id:string;requester_id:string;name:string;contact:string;method:string;message:string;date?:string;time?:string;status?:string}

export default function Dashboard(){
 const screen=useLocation().pathname.split('/').at(-1)
 const {session}=useSession()
 const user=session?.user
 return <section className="page-width section subpage">
  <p className="eyebrow accent">Property management</p>
  <h1>{screen==='profile'?'Your profile':'Your dashboard'}<em>.</em></h1>
  <nav className="segmented" aria-label="Dashboard"><Link to="/dashboard">Overview</Link><Link to="/dashboard/listings">My listings</Link><Link to="/dashboard/enquiries">Enquiries</Link><Link to="/dashboard/visits">Visits</Link><Link to="/profile">Profile</Link><Link to="/list-property">New listing</Link></nav>
  {user&&(screen==='profile'?<Profile id={user.id} email={user.email}/>:screen==='enquiries'||screen==='visits'?<Requests type={screen} userId={user.id}/>:<Listings userId={user.id} overview={screen==='dashboard'}/>)}
 </section>
}

function Listings({userId,overview}:{userId:string;overview:boolean}){
 const client=useQueryClient()
 const [removing,setRemoving]=useState('')
 const [feedback,setFeedback]=useState('')
 const {data:properties=[],isPending,isError}=useQuery({queryKey:['dashboard-listings',userId],queryFn:async()=>{
  const {data,error}=await supabase!.from('properties').select('*').eq('owner_id',userId).order('created_at',{ascending:false})
  if(error)throw error
  return data as (Property & PropertyFloorPlan)[]
 }})
 async function remove(property:Property & PropertyFloorPlan){
  if(!supabase||removing||!window.confirm('Delete '+property.title+' and its associated requests? This cannot be undone.'))return
  setRemoving(property.id)
  setFeedback('')
  const {error}=await supabase.from('properties').delete().eq('id',property.id).eq('owner_id',userId).select('id').single()
  if(error){setFeedback('The listing could not be deleted. Refresh My listings and try again.');setRemoving('');return}
  const paths=[...property.images,...(property.floor_plan?[property.floor_plan]:[])]
  const cleanup=paths.length?await supabase.storage.from('property-images').remove(paths):null
  setFeedback(cleanup?.error?'Listing deleted. Some uploaded files could not be removed.':'Listing deleted.')
  await client.invalidateQueries()
  setRemoving('')
 }
 if(isPending)return <p>Loading listings…</p>
 if(isError)return <p role="alert">Listings could not be loaded.</p>
 if(!properties.length)return <><p>No listings yet.</p><p role="status">{feedback}</p></>
 if(overview)return <p>{properties.filter(p=>p.status==='published').length} published · {properties.filter(p=>p.status==='draft').length} drafts</p>
 return <div className="dashboard-list">{properties.map(p=><article key={p.id}><h3>{p.title}</h3><p>{p.status} · {money(p.price)}</p><div className="segmented"><Link to={'/edit-property/'+p.id}>Edit listing</Link>{p.status==='published'&&<Link to={'/property/'+p.slug}>Public listing</Link>}<button type="button" disabled={!!removing} onClick={()=>void remove(p)}>{removing===p.id?'Deleting…':'Delete listing'}</button></div></article>)}<p role="status">{feedback}</p></div>
}

function Requests({type,userId}:{type:'visits'|'enquiries';userId:string}){
 const query=useQueryClient()
 const [status,setStatus]=useState('')
 const [pending,setPending]=useState(false)
 const leads=useQuery({queryKey:['dashboard',type,userId],queryFn:async()=>{
  const {data,error}=await supabase!.from(type).select('*').order('created_at',{ascending:false})
  if(error)throw error
  return data as Lead[]
 }})
 async function update(id:string,newStatus:string){
  setPending(true)
  const {error}=await supabase!.rpc('set_visit_status',{visit_id:id,new_status:newStatus})
  setStatus(error?'The visit could not be updated.':'Visit status updated.')
  await query.invalidateQueries({queryKey:['dashboard','visits']})
  setPending(false)
 }
 if(leads.isPending)return <p>Loading requests…</p>
 if(leads.isError)return <p role="alert">Requests could not be loaded.</p>
 if(!leads.data.length)return <p>No {type} yet.</p>
 return <div className="dashboard-list">{leads.data.map(item=>{
  const requestedByUser=item.requester_id===userId
  const canCancel=requestedByUser&&['pending','accepted'].includes(item.status??'')
  return <article key={item.id}><strong>{item.name}</strong><p>{item.contact} · {item.method}</p><p>{item.message}</p>
   {item.date&&<p>{item.date} · {item.time} IST · {item.status}</p>}
   <div className="segmented">
    {canCancel&&<button disabled={pending} onClick={()=>void update(item.id,'cancelled')}>Cancel visit</button>}
    {!requestedByUser&&item.status==='pending'&&<><button disabled={pending} onClick={()=>void update(item.id,'accepted')}>Accept</button><button disabled={pending} onClick={()=>void update(item.id,'declined')}>Decline</button></>}
   </div>
  </article>
 })}<p role="status">{status}</p></div>
}

import {useEffect,useRef,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {ArrowLeft,ArrowRight,Expand} from 'lucide-react'
import {useProperty} from '@/features/properties/api'
import {money,shortPrice,type Property} from '@/features/properties/model'
import {PropertyActions} from '@/features/properties/Card'
import {PlotTool} from '@/features/plot-studio/Plot'
import {FloorPlan} from '@/features/floor-plans/FloorPlan'
import {Enquiry} from '@/features/enquiries/Enquiry'
function Gallery({property:p}:{property:Property}){
 const [index,setIndex]=useState(0)
 const dialog=useRef<HTMLDialogElement>(null)
 const touch=useRef(0)
 const move=(direction:number)=>setIndex(i=>(i+direction+p.images.length)%p.images.length)
 if(!p.images.length)return <div className="image-fallback">Photographs unavailable</div>
 const src=p.images[index]
 return <div onTouchStart={event=>{touch.current=event.touches[0].clientX}} onTouchEnd={event=>{const distance=event.changedTouches[0].clientX-touch.current;if(p.images.length>1&&Math.abs(distance)>45)move(distance>0?-1:1)}}>
 <img className="detail-hero" src={src} alt={p.demo?'Illustrative '+p.category:p.title+' photo '+(index+1)} style={{viewTransitionName:'property-'+p.slug}}/>
 <div className="gallery-controls">{p.images.length>1&&<><button aria-label="Previous photograph" onClick={()=>move(-1)}><ArrowLeft size={17}/></button><button aria-label="Next photograph" onClick={()=>move(1)}><ArrowRight size={17}/></button></>}<button aria-label="Open gallery fullscreen" onClick={()=>dialog.current?.showModal()}><Expand size={17}/></button><span aria-live="polite">{index+1} / {p.images.length}</span></div>
 <dialog ref={dialog} onKeyDown={event=>{if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1)}}><img src={src} alt={p.title+' photo '+(index+1)}/><div className="gallery-controls"><button autoFocus onClick={()=>dialog.current?.close()}>Close</button>{p.images.length>1&&<><button onClick={()=>move(-1)}>Previous</button><button onClick={()=>move(1)}>Next</button></>}</div></dialog></div>
}
function UploadedPlan({url,title}:{url:string;title:string}){
 return <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={'Floor plan for '+title} loading="lazy"/></a>
}
export default function Detail(){
 const {slug=''}=useParams()
 const result=useProperty(slug)
 const p=result.data
 useEffect(()=>{if(p){document.title=p.title+' | HABITAT.';document.querySelector('meta[name="description"]')?.setAttribute('content',p.description.slice(0,155))}},[p])
 if(result.isPending)return <p className="route-wait">Loading property…</p>
 if(result.isError||!p)return <section className="page-width section subpage"><h1>{result.isError?'Property unavailable':'Property not found'}</h1><Link className="text-link" to="/properties">Browse properties</Link></section>
 return <section className="page-width section subpage"><Link className="text-link" to="/properties"><ArrowLeft size={15}/> All properties</Link><p className="eyebrow accent">{p.category} · {p.locality}, {p.city}</p><h1>{p.title}<em>.</em></h1>{p.demo&&<p className="notice">Fictional listing · Illustrative images and approximate location</p>}<Gallery key={p.id} property={p}/><div className="split detail-body"><div><h2>Property <em>overview.</em></h2><p>{p.description}</p><dl><dt>Area</dt><dd>{p.area.toLocaleString('en-IN')} sq ft</dd>{p.bhk>0&&<><dt>Configuration</dt><dd>{p.bhk} BHK</dd></>}<dt>Furnishing</dt><dd>{p.furnishing}</dd><dt>Facing</dt><dd>{p.facing}</dd></dl><h2>{p.mode==='Plots'?'Plot dimensions':'Floor plan'}<em>.</em></h2>{p.mode==='Plots'?<><p>Explore estimated proportions using the stated area and an adjustable illustrative depth.</p><PlotTool initialArea={p.area} compact/>{p.floorPlanUrl&&<UploadedPlan url={p.floorPlanUrl} title={p.title}/>}</>:p.floorPlanUrl?<UploadedPlan url={p.floorPlanUrl} title={p.title}/>:p.demo&&p.bhk===2?<FloorPlan facing={p.facing}/>:<p>A floor plan is unavailable for this listing.</p>}</div><aside className="stack"><div className="card-surface"><p className="eyebrow">Asking price</p><p className="tool-value">{shortPrice(p.price)}{['Rent','PG'].includes(p.mode)&&<small> / month</small>}</p><p>{money(p.price/p.area)} / sq ft</p><PropertyActions property={p}/>{p.lat!=null&&<Link to={'/map?'+new URLSearchParams({q:p.title})} className="text-link">Explore approximate location</Link>}</div><Enquiry property={p}/></aside></div></section>
}

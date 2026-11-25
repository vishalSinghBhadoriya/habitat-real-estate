import {Link,useSearchParams,useLocation} from 'react-router-dom'
import {MapPin,ArrowUpRight} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {useSelector,useDispatch} from 'react-redux'
import {useQuery} from '@tanstack/react-query'
import {compare,type State} from '@/app/store'
import {demo} from '@/data/demo'
import {supabase} from '@/lib/supabase'
import {useProperties,resolveImages} from '@/features/properties/api'
import Card from '@/features/properties/Card'
import {useAccountFavourites} from '@/features/favourites/account'
import {modes,types,money,type Property} from '@/features/properties/model'
export default function Discover(){
 const {t}=useTranslation()
 const {pathname}=useLocation()
 const mode=modes.find(item=>'/'+item.toLowerCase()===pathname)
 const [params,setParams]=useSearchParams()
 const parsed=Number(params.get('page')??1)
 const page=Number.isSafeInteger(parsed)?Math.max(0,parsed-1):0
 const {data,isError,isPending}=useProperties(params,mode,page,12)
 function paginate(index:number){setParams(previous=>{const next=new URLSearchParams(previous);next.set('page',String(index+1));return next})}
 return <section className="page-width section subpage"><p className="eyebrow accent">Find your address</p><h1>{mode?t(mode):t('All')}<em>.</em></h1><div className="segmented"><Link to="/properties" aria-current={!mode?'page':undefined}>{t('All')}</Link>{modes.map(item=><Link key={item} to={'/'+item.toLowerCase()} aria-current={mode===item?'page':undefined}>{t(item)}</Link>)}</div>
 <FilterForm key={params.toString()} params={params} onChange={setParams}/>
 <div className="toolbar"><p aria-live="polite">{isPending?'Loading properties…':data?data.total+' properties':''}</p><Link className="text-link" to={'/map?'+new URLSearchParams([...params, ...(mode?[['mode',mode]]:[])])}><MapPin size={17}/> {t('Map')}</Link></div>
 {!supabase&&<p className="demo-note">Sample listings</p>}{isError&&<p role="alert">Properties could not be loaded.</p>}
 {data?.total===0&&<p>No properties match these filters. <Link className="text-link" to={pathname}>Clear filters</Link></p>}
 <div className="cards">{data?.items.map(p=><Card key={p.id} property={p}/>)}</div>
 {data&&data.total>12&&<div className="segmented"><button disabled={!page} onClick={()=>paginate(page-1)}>Previous</button><span>Page {page+1} of {Math.ceil(data.total/12)}</span><button disabled={(page+1)*12>=data.total} onClick={()=>paginate(page+1)}>Next</button></div>}
 </section>
}
function FilterForm({params,onChange}:{params:URLSearchParams;onChange:(params:URLSearchParams)=>void}){
 const {t}=useTranslation()
 return <form className="filters" onSubmit={event=>{event.preventDefault();const next=new URLSearchParams();new FormData(event.currentTarget).forEach((v,k)=>{if(String(v).trim())next.set(k,String(v).trim())});onChange(next)}}>
 <div className="fields"><label>{t('Location')}<input name="q" defaultValue={params.get('q')??''} placeholder="City, locality or property name"/></label><label>{t('Type')}<select name="type" defaultValue={params.get('type')??''}><option value="">Any type</option>{types.map(type=><option key={type}>{type}</option>)}</select></label><label>Maximum price (₹)<input name="budget" type="number" min="0" defaultValue={params.get('budget')??''}/></label><label>Sort by<select name="sort" defaultValue={params.get('sort')??''}><option value="">Recommended</option><option value="price">Price · low to high</option><option value="price-desc">Price · high to low</option><option value="area">Largest area</option></select></label></div><details open={['min','area','bhk','furnishing','facing'].some(key=>params.has(key))||undefined}><summary>More filters</summary><div className="fields"><label>Minimum price (₹)<input name="min" type="number" min="0" defaultValue={params.get('min')??''}/></label><label>Minimum area (sq ft)<input name="area" type="number" min="0" defaultValue={params.get('area')??''}/></label><label>BHK<select name="bhk" defaultValue={params.get('bhk')??''}><option value="">Any</option>{[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></label><label>Furnishing<select name="furnishing" defaultValue={params.get('furnishing')??''}><option value="">Any</option>{['Furnished','Semi-furnished','Unfurnished'].map(v=><option key={v}>{v}</option>)}</select></label><label>Facing<select name="facing" defaultValue={params.get('facing')??''}><option value="">Any</option>{['North','East','South','West'].map(v=><option key={v}>{v}</option>)}</select></label></div></details><div className="segmented"><button className="button" type="submit">Apply filters</button><button type="button" onClick={()=>onChange(new URLSearchParams())}>Clear filters</button></div></form>
}
export function Selections(){
 const comparing=useLocation().pathname==='/compare'
 const localIds=useSelector((state:State)=>comparing?state.selection.compared:state.selection.saved)
 const account=useAccountFavourites()
 const ids=!comparing&&account.isAccount?account.query.data??[]:localIds
 const dispatch=useDispatch()
 const {data=[],isError,isPending}=useQuery({queryKey:['selection',ids],queryFn:async()=>{
 if(!ids.length)return []
 if(!supabase)return ids.flatMap(id=>demo.find(p=>p.id===id)??[])
 const serverIds=ids.filter(id=>/^[\da-f-]{36}$/i.test(id))
 if(!serverIds.length)return []
 const {data,error}=await supabase.from('properties').select('*').eq('status','published').in('id',serverIds)
 if(error)throw error
 return Promise.all((data as Property[]).map(resolveImages))
 }})
 return <section className="page-width section subpage"><p className="eyebrow accent">Your shortlist</p><h1>{comparing?'Compare':'Saved properties'}<em>.</em></h1>{comparing&&<p>Compare up to four properties side by side.</p>}{isPending?<p>Loading shortlist…</p>:isError?<p role="alert">This shortlist could not be loaded.</p>:!data.length?<p>Your shortlist is empty. <Link className="text-link" to="/properties">Browse properties <ArrowUpRight size={17}/></Link></p>:comparing?<div className="table-scroll"><table><thead><tr><th>Specification</th>{data.map(p=><th key={p.id}><Link className="text-link" to={'/property/'+p.slug}>{p.title}</Link><button className="icon" onClick={()=>dispatch(compare(p.id))} aria-label={'Remove '+p.title}>×</button></th>)}</tr></thead><tbody>{[
 ['Location',(p:Property)=>p.locality+', '+p.city],['Category',(p:Property)=>p.category],['Purpose',(p:Property)=>p.mode],['Price',(p:Property)=>money(p.price)+(['Rent','PG'].includes(p.mode)?' / mo':'')],['Area',(p:Property)=>p.area+' sq ft'],['Rate',(p:Property)=>money(p.price/p.area)+' / sq ft'],['BHK',(p:Property)=>p.bhk||'—'],['Furnishing',(p:Property)=>p.furnishing],['Facing',(p:Property)=>p.facing]
 ].map(([label,value])=><tr key={String(label)}><th scope="row">{String(label)}</th>{data.map(p=><td key={p.id}>{(value as (p:Property)=>string|number)(p)}</td>)}</tr>)}</tbody></table></div>:<div className="cards">{data.map(p=><Card key={p.id} property={p}/>)}</div>}</section>
}
export function Info(){
 const path=useLocation().pathname
 const pages:Record<string,[string,string]>={'/about':['About HABITAT','HABITAT is an Indian property marketplace for finding homes, rentals, plots, commercial properties and student accommodation. Architectural tools help you understand what a listing’s dimensions and costs mean in practice.'],'/contact':['Contact','For a property question, use the enquiry form on its listing. Enquiries go directly to the listing owner.'],'/privacy':['Privacy','Guest favourites and comparison selections are stored in your browser. Account and listing information, enquiries and visit requests are stored by HABITAT. Contact information submitted with an enquiry or visit request is visible to you and the listing owner.'],'/terms':['Terms','Property details are supplied by listing owners. Confirm prices, dimensions, availability and documentation independently before making a transaction. Calculator outputs are estimates. Demonstration listings and their imagery are illustrative.']}
 const content=pages[path]??['This address moved','The page you were looking for could not be found.']
 return <section className="page-width section subpage"><p className="eyebrow accent">HABITAT. / INDIA</p><h1>{content[0]}<em>.</em></h1><p>{content[1]}</p><Link className="text-link" to="/properties">Explore properties <ArrowUpRight size={17}/></Link></section>
}

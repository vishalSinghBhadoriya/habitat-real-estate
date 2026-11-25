import {ArrowUpRight,BedDouble,Heart,Maximize,Scale} from 'lucide-react'
import {Link} from 'react-router-dom'
import {useDispatch,useSelector} from 'react-redux'
import {compare,save,type State} from '@/app/store'
import {useAccountFavourites} from '@/features/favourites/account'
import {shortPrice,type Property} from './model'
export function PropertyActions({property}:{property:Property}){
 const {saved,compared}=useSelector((state:State)=>state.selection)
 const dispatch=useDispatch()
 const account=useAccountFavourites()
 const isSaved=(account.isAccount?account.query.data??[]:saved).includes(property.id)
 const selected=compared.includes(property.id)
 return <div className="property-actions"><button className="icon" aria-label="Save property" aria-pressed={isSaved} disabled={account.isAccount&&(!account.query.isSuccess||account.mutation.isPending)} onClick={()=>account.isAccount?account.mutation.mutate({propertyId:property.id,remove:isSaved}):dispatch(save(property.id))}><Heart size={18} fill={isSaved?'currentColor':'none'}/></button><button className="icon" aria-label={compared.length>=4&&!selected?'Comparison is full':'Compare property'} aria-pressed={selected} disabled={compared.length>=4&&!selected} onClick={()=>dispatch(compare(property.id))}><Scale size={18}/></button>{account.mutation.isError&&<span className="property-tag" role="alert">Could not update favourites.</span>}</div>
}
export default function Card({property:p}:{property:Property}){
 return <article className="property-card"><div className="property-media"><Link to={'/property/'+p.slug} viewTransition aria-label={p.title}>{p.images[0]?<img loading="lazy" src={p.images[0]} alt={p.demo?'Illustrative '+p.category:p.title} style={{viewTransitionName:'property-'+p.slug}}/>:<div className="image-fallback">{p.category}</div>}</Link><span className="property-tag">{p.category}</span><PropertyActions property={p}/></div>
 <div className="property-copy"><p className="eyebrow">{p.locality}, {p.city}</p><Link className="property-title" to={'/property/'+p.slug} viewTransition>{p.title} <ArrowUpRight size={18}/></Link><div className="property-meta"><strong>{shortPrice(p.price)}{(p.mode==='Rent'||p.mode==='PG')&&<small> / mo</small>}</strong><span>{p.bhk>0&&<><BedDouble size={15}/> {p.bhk} BHK</>} <Maximize size={14}/> {p.area.toLocaleString('en-IN')} sq ft</span></div><small>{p.furnishing}</small></div></article>
}

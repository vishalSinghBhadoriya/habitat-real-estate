import {useState,useEffect} from 'react'
import {Link,useSearchParams} from 'react-router-dom'
import {CircleMarker,MapContainer,Popup,TileLayer,useMap} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {useProperties} from '@/features/properties/api'
import {modes,shortPrice,type Property} from '@/features/properties/model'
function Focus({property}:{property?:Property}){const map=useMap();useEffect(()=>{if(property?.lat!=null&&property.lng!=null)map.setView([property.lat,property.lng],12,{animate:false})},[map,property]);return null}
export default function MapPage(){
 const [params,setParams]=useSearchParams()
 const [id,setId]=useState('')
 const mode=modes.find(m=>m===params.get('mode'))
 const listing=useProperties(params,mode,0,100)
 const items=listing.data?.items.filter(p=>p.lat!=null&&p.lng!=null)??[]
 const selected=items.find(p=>p.id===id)??(params.get('q')?items[0]:undefined)
 return <section className="page-width section subpage"><p className="eyebrow accent">Location discovery</p><h1>Explore the <em>map.</em></h1><p>Markers show approximate locations. Listings without coordinates are omitted.</p><form className="toolbar" onSubmit={event=>{event.preventDefault();const q=String(new FormData(event.currentTarget).get('q')??'');setId('');setParams(old=>{const next=new URLSearchParams(old);if(q)next.set('q',q);else next.delete('q');return next})}}><label>City or locality<input name="q" defaultValue={params.get('q')??''}/></label><button className="button">Search map</button></form><div className="map-grid"><div className="map-list" aria-label="Properties on map">{listing.isPending?<p>Loading listings…</p>:listing.isError?<p role="alert">Listings could not be loaded.</p>:items.length===0?<p>No mapped listings found.</p>:items.map(p=><button key={p.id} aria-pressed={selected?.id===p.id} onClick={()=>setId(p.id)}><strong>{p.title}</strong><span>{p.city} · {shortPrice(p.price)}</span></button>)}</div>
 <MapContainer center={[22.2,79]} zoom={5} className="map-canvas" scrollWheelZoom={false}><TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/><Focus property={selected}/>{items.map(p=><CircleMarker key={p.id} center={[p.lat!,p.lng!]} radius={selected?.id===p.id?10:7} pathOptions={{color:'#a64c34',fillColor:'#bd6246',fillOpacity:.8}} eventHandlers={{click:()=>setId(p.id)}}><Popup><Link to={'/property/'+p.slug}>{p.title} · {shortPrice(p.price)}</Link></Popup></CircleMarker>)}</MapContainer></div>{selected&&<Link className="text-link" to={'/property/'+selected.slug}>Open {selected.title}</Link>}</section>
}

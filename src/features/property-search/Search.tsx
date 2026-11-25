import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ArrowUpRight,MapPin} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {modes,types,shortPrice,type Mode} from '@/features/properties/model'
export const budgets=[10000,25000,50000,2500000,5000000,7500000,10000000,20000000]
export default function Search(){
 const [mode,setMode]=useState<Mode>('Buy')
 const {t}=useTranslation()
 const navigate=useNavigate()
 return <div className="search-box"><div className="search-tabs" role="group" aria-label="Listing purpose">{modes.map(value=><button key={value} type="button" aria-pressed={mode===value} onClick={()=>setMode(value)}>{t(value)}</button>)}</div>
 <form key={mode} onSubmit={event=>{event.preventDefault();const params=new URLSearchParams();new FormData(event.currentTarget).forEach((value,key)=>{if(String(value).trim())params.set(key,String(value).trim())});void navigate('/'+mode.toLowerCase()+(params.size?'?'+params:''))}}>
 <label><span>{t('Location')}</span><div className="search-location"><MapPin size={16}/><input name="q" placeholder="Indore, Vijay Nagar"/></div></label>
 <label><span>{t('Type')}</span><select name="type"><option value="">Any property</option>{types.filter((_,index)=>mode==='Plots'?index===4||index===5:mode==='Commercial'?index>=6&&index<=8:mode==='PG'?index>=9:index<4).map(value=><option key={value}>{value}</option>)}</select></label>
 <label><span>{t('Budget')}</span><select name="budget"><option value="">Any budget</option>{budgets.filter(value=>mode==='Rent'||mode==='PG'?value<1e6:value>=1e6).map(value=><option key={value} value={value}>Up to {shortPrice(value)}</option>)}</select></label>
 <button className="button" type="submit">{t('Search')} <ArrowUpRight size={18}/></button>
 </form></div>
}

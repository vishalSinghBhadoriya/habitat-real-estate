import {useState} from 'react'
import {Link,useLocation} from 'react-router-dom'
import {useSession} from '@/features/auth/session'
import {absoluteAppUrl} from '@/lib/paths'
import {supabase} from '@/lib/supabase'
import {money,type Property} from '@/features/properties/model'
export function Enquiry({property}:{property:Property}){
 const {session}=useSession()
 const {pathname}=useLocation()
 const [mode,setMode]=useState<'enquiries'|'visits'>('enquiries')
 const [status,setStatus]=useState('')
 const [pending,setPending]=useState(false)
 const [copy,setCopy]=useState('')
 if(property.demo)return <p className="card-surface">Demonstration listing. Enquiries and visits are unavailable.</p>
 const message='I’m interested in '+property.title+' in '+property.locality+', '+property.city+' ('+money(property.price)+'). Reference '+property.id+'. '+absoluteAppUrl(pathname)
 return <div className="card-surface"><h3>Talk to the owner.</h3><div className="segmented"><button aria-pressed={mode==='enquiries'} onClick={()=>{setMode('enquiries');setStatus('')}}>Enquire</button><button aria-pressed={mode==='visits'} onClick={()=>{setMode('visits');setStatus('')}}>Request a visit</button></div>
 {!supabase?<p>Enquiries and visits are unavailable for this listing.</p>:!session?<Link className="text-link" to={'/login?next='+encodeURIComponent(pathname)}>Log in to contact the owner</Link>:<form key={mode} className="stack" onSubmit={async event=>{
 event.preventDefault();if(!supabase||pending)return
 const form=event.currentTarget
 const data=Object.fromEntries(new FormData(form))
 if(mode==='visits'&&String(data.date)<new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Kolkata'})){setStatus('Choose today or a later date.');return}
 setPending(true);setStatus('')
 const {error}=await supabase.from(mode).insert({...data,property_id:property.id,requester_id:session.user.id})
 setPending(false)
 if(error){setStatus('Your request could not be sent. Please try again later.');return}
 form.reset();setStatus(mode==='visits'?'Visit requested. The owner can review it in their dashboard.':'Your enquiry was sent.')
 }}><label>Name<input name="name" required minLength={2} maxLength={100}/></label><label>Contact email or mobile number<input name="contact" required maxLength={100}/></label><label>Preferred contact method<select name="method"><option>Email</option><option>Phone</option></select></label>{mode==='visits'&&<div className="fields"><label>Preferred date<input name="date" type="date" required min={new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Kolkata'})}/></label><label>Preferred time (IST)<input name="time" type="time" required/></label></div>}<label>{mode==='visits'?'Additional notes':'Message'}<textarea name="message" maxLength={2000} required={mode==='enquiries'}/></label><button className="button" disabled={pending}>{pending?'Sending…':mode==='visits'?'Request visit':'Send enquiry'}</button><p role="status">{status}</p></form>}
 {property.whatsapp&&/^91[6-9][0-9]{9}$/.test(property.whatsapp)&&<a className="text-link" href={'https://wa.me/'+property.whatsapp+'?text='+encodeURIComponent(message)} target="_blank" rel="noreferrer">Enquire on WhatsApp</a>}
 <button className="text-link" onClick={async()=>{try{await navigator.clipboard.writeText(message);setCopy('Property message copied.')}catch{setCopy(message)}}}>Copy property message</button>{copy&&<p role="status">{copy}</p>}</div>
}

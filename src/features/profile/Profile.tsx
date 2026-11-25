import {useState} from 'react'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {supabase} from '@/lib/supabase'

export default function Profile({id,email}:{id:string;email?:string}){
 const client=useQueryClient()
 const [status,setStatus]=useState('')
 const [pending,setPending]=useState(false)
 const profile=useQuery({
  queryKey:['profile',id],
  queryFn:async()=>{
   const {data,error}=await supabase!.from('profiles').select('name').eq('id',id).maybeSingle()
   if(error)throw error
   return data
  }
 })
 return <div className="stack">
  <p>{email}</p>
  {profile.isPending?<p>Loading profile…</p>:profile.isError?<p role="alert">Profile could not be loaded.</p>:<form className="stack" onSubmit={async event=>{
   event.preventDefault()
   if(pending)return
   const name=String(new FormData(event.currentTarget).get('name')??'').trim()
   if(name.length<2){setStatus('Enter at least two characters.');return}
   setPending(true)
   const {error}=profile.data?await supabase!.from('profiles').update({name}).eq('id',id):await supabase!.from('profiles').insert({id,name})
   setStatus(error?'Profile could not be saved.':'Profile updated.')
   setPending(false)
   if(!error)void client.invalidateQueries({queryKey:['profile',id]})
  }}>
   <label>Display name<input name="name" autoComplete="name" minLength={2} maxLength={100} required defaultValue={profile.data?.name??''}/></label>
   <button className="button" disabled={pending}>{pending?'Saving…':'Save profile'}</button>
  </form>}
  <button className="button secondary" onClick={async()=>{const {error}=await supabase!.auth.signOut();if(error)setStatus('Sign out failed. Please try again.');else client.clear()}}>Sign out</button>
  <p role="status">{status}</p>
 </div>
}
